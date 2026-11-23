/** Renders README slides into public/ss and the demo video into public/video. */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia, renderStill } from '@remotion/renderer';
import sharp from 'sharp';

const mode = process.argv[2] || 'all';
const path = (relative) => fileURLToPath(new URL(relative, import.meta.url));
const ss = path('../../public/ss/');
const video = path('../../public/video/');
await mkdir(ss, { recursive: true });
await mkdir(video, { recursive: true });

// Optional: reuse an installed Chrome Headless Shell instead of Remotion's download.
const browserExecutable = process.env.REMOTION_BROWSER || null;
const out = path('../out/');
const master = `${out}master.mp4`;
const ffmpeg = (...args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);

// "mux" reuses the last rendered master, so new audio doesn't need a new render.
const serveUrl = mode === 'mux' ? null : await bundle({ entryPoint: path('../src/index.ts'), publicDir: path('../public') });
const compositions = serveUrl ? await getCompositions(serveUrl, { browserExecutable }) : [];
const demo = compositions.find((composition) => composition.id === 'demo');

if (mode === 'slides' || mode === 'all') {
    for (const composition of compositions.filter((item) => item.id !== 'demo')) {
        const social = composition.id === 'social-preview';
        await renderStill({
            composition,
            serveUrl,
            browserExecutable,
            output: social ? path('../../docs/social-preview.jpg') : `${ss}${composition.id}.webp`,
            imageFormat: social ? 'jpeg' : 'webp',
            ...(social ? { jpegQuality: 92 } : {}),
            scale: social ? 1 : 2,
        });
        console.log(`slide ${composition.id}`);
    }
}

if (mode === 'video' || mode === 'all') {
    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });
    await renderMedia({ composition: demo, serveUrl, browserExecutable, codec: 'h264', crf: 16, jpegQuality: 95, muted: true, outputLocation: master });
    await renderStill({ composition: demo, serveUrl, browserExecutable, frame: 72, output: `${video}openfunnels-demo-poster.webp`, imageFormat: 'webp' });

    // GitHub READMEs can't play repository MP4s inline, so ship a light looping preview.
    await mkdir(`${out}frames`);
    ffmpeg('-i', master, '-vf', 'setpts=PTS/1.5,fps=8,scale=800:-2:flags=lanczos', `${out}frames/%04d.png`);
    const frames = (await readdir(`${out}frames`)).sort().map((name) => `${out}frames/${name}`);
    await sharp(frames, { join: { animated: true } }).webp({ quality: 60, effort: 5, loop: 0, delay: frames.map(() => 125) }).toFile(`${video}openfunnels-demo-preview.webp`);
}

if (mode !== 'slides') {
    const music = path('../assets/music.mp3');
    const voiceDirectory = path('../assets/voice/');
    const lines = JSON.parse(await readFile(`${voiceDirectory}manifest.json`, 'utf8'));
    const seconds = JSON.parse(await readFile(path('../src/timeline.json'), 'utf8')).reduce((sum, line) => sum + line.frames, 0) / 30;

    // Voice in front; music sits low and ducks further whenever someone is speaking.
    const inputs = [master, music, ...lines.map((line) => voiceDirectory + line.file)].flatMap((file) => ['-i', file]);
    const delayed = lines.map((line, index) => `[${index + 2}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(line.start * 1000)}:all=1[v${index}]`);
    const graph = [
        ...delayed,
        `${lines.map((_, index) => `[v${index}]`).join('')}amix=inputs=${lines.length}:normalize=0,apad,atrim=0:${seconds},loudnorm=I=-16:TP=-2:LRA=9,aresample=48000,asplit=2[voice][key]`,
        `[1:a]atrim=start=10:duration=${seconds},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-24:TP=-6:LRA=9,aresample=48000,afade=t=in:d=0.8,afade=t=out:st=${seconds - 3}:d=3[bed]`,
        '[bed][key]sidechaincompress=threshold=0.03:ratio=5:attack=60:release=600[ducked]',
        '[voice][ducked]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false[mix]',
    ].join(';');

    // Compact, broadly compatible delivery file that starts playing before it finishes loading.
    ffmpeg(...inputs, '-filter_complex', graph, '-map', '0:v', '-map', '[mix]', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-t', String(seconds), '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', '25', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', `${video}openfunnels-demo.mp4`);
    console.log(`video ${seconds}s with ${lines.length} narrated lines`);
}
