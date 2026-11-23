/** Narrates src/timeline.json with ElevenLabs. Only lines whose text or voice changed are regenerated. */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const path = (relative) => fileURLToPath(new URL(relative, import.meta.url));
const voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Sarah, a premade voice
const fps = 30;
const lead = 0.3; // seconds of picture before each line
const tail = 0.15; // minimum gap after it

async function apiKey() {
    if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
    const env = await readFile(process.env.ENV_FILE || path('../../.env'), 'utf8').catch(() => '');
    const value = /^\s*(?:export )?ELEVENLABS_API_KEY=(.*)$/m.exec(env)?.[1].trim().replace(/^(['"])(.*)\1$/, '$2');
    if (!value) throw new Error('Set ELEVENLABS_API_KEY in the environment or the root .env file.');
    return value;
}

const seconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }));

const directory = path('../assets/voice/');
await mkdir(directory, { recursive: true });
const manifestPath = `${directory}manifest.json`;
const previous = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '[]'));
const timeline = JSON.parse(await readFile(path('../src/timeline.json'), 'utf8'));
const manifest = [];
let start = 0;
let key;

for (const [index, line] of timeline.entries()) {
    const file = `${String(index + 1).padStart(2, '0')}.mp3`;
    const room = line.frames / fps - lead - tail;
    const cached = previous[index];
    let speed = 1;

    if (cached?.text === line.voice && cached.voiceId === voiceId && cached.seconds <= room) {
        speed = cached.speed;
    } else {
        for (;;) {
            key ??= await apiKey();
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
                method: 'POST',
                headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: line.voice,
                    model_id: 'eleven_multilingual_v2',
                    previous_text: timeline[index - 1]?.voice,
                    next_text: timeline[index + 1]?.voice,
                    voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true, speed },
                }),
            });
            if (!response.ok) throw new Error(`ElevenLabs returned ${response.status}: ${(await response.text()).slice(0, 400)}`);
            await writeFile(`${directory}${file}`, Buffer.from(await response.arrayBuffer()));
            const length = seconds(`${directory}${file}`);
            if (length <= room) break;
            if (speed >= 1.15) throw new Error(`"${line.voice}" runs ${length.toFixed(2)}s but has ${room.toFixed(2)}s. Shorten it or lengthen the scene.`);
            speed = Math.min(1.15, Number(Math.max(speed + 0.05, speed * (length / room) + 0.02).toFixed(2)));
        }
    }

    const length = seconds(`${directory}${file}`);
    manifest.push({ file, text: line.voice, caption: line.caption || line.voice, voiceId, speed, start: Number((start + lead).toFixed(3)), seconds: Number(length.toFixed(3)) });
    console.log(`${file} at ${(start + lead).toFixed(2)}s, ${length.toFixed(2)}s of ${room.toFixed(2)}s, speed ${speed}`);
    start += line.frames / fps;
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 4)}\n`);

const stamp = (value) => new Date(value * 1000).toISOString().slice(11, 23);
const cues = manifest.map((line) => `${stamp(line.start)} --> ${stamp(line.start + line.seconds)}\n${line.caption}`);
await writeFile(path('../../public/video/openfunnels-demo.vtt'), `WEBVTT\n\n${cues.join('\n\n')}\n`);
