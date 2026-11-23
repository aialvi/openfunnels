import type { ReactNode } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import script from './timeline.json';
import { Backdrop, capture, center, Copy, Crop, Logo, orange, path, Phone, type Point, rect, Shot, type Theme, VIEW, Window } from './ui';

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const OVERLAP = 9;

type Key<T> = [frame: number, value: T];

function track(frame: number, keys: Key<number>[]) {
    if (keys.length === 1) return keys[0][1];
    return interpolate(
        frame,
        keys.map((key) => key[0]),
        keys.map((key) => key[1]),
        { ...clamp, easing: ease },
    );
}
const trackPoint = (frame: number, keys: Key<Point>[]): Point => ({
    x: track(frame, keys.map(([f, p]) => [f, p.x])),
    y: track(frame, keys.map(([f, p]) => [f, p.y])),
});

/** Zooms into a focal point given in capture coordinates, without showing past the edges. */
function Camera({ zoom, focus, children }: { zoom: Key<number>[]; focus: Key<Point>[]; children: ReactNode }) {
    const frame = useCurrentFrame();
    const scale = track(frame, zoom);
    const point = trackPoint(frame, focus);
    const limit = (value: number, size: number) => Math.min(0, Math.max(size - size * scale, value));
    const x = limit(VIEW.width / 2 - point.x * scale, VIEW.width);
    const y = limit(VIEW.height / 2 - point.y * scale, VIEW.height);
    return <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${scale})` }}>{children}</div>;
}

function Cursor({ keys, clicks = [] }: { keys: Key<Point>[]; clicks?: number[] }) {
    const frame = useCurrentFrame();
    const at = trackPoint(frame, keys);
    const press = clicks.some((click) => frame >= click - 3 && frame <= click + 4);
    return (
        <>
            {clicks.map((click) => {
                const progress = interpolate(frame, [click, click + 18], [0, 1], clamp);
                if (progress <= 0 || progress >= 1) return null;
                return (
                    <div
                        key={click}
                        style={{
                            position: 'absolute',
                            left: at.x - 34,
                            top: at.y - 34,
                            width: 68,
                            height: 68,
                            borderRadius: '50%',
                            border: `4px solid ${orange}`,
                            opacity: 1 - progress,
                            transform: `scale(${0.3 + progress})`,
                        }}
                    />
                );
            })}
            <svg width="38" height="38" viewBox="0 0 24 24" style={{ position: 'absolute', left: at.x - 6, top: at.y - 3, transform: `scale(${press ? 0.82 : 1})`, transformOrigin: '6px 3px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.55))' }}>
                <path d="M4 2l15.5 9.2-6.9 1.7-3.3 6.6z" fill="#fff" stroke="#14100d" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
        </>
    );
}

/** Cross-fades between captured states at the given frames. */
function Shots({ states, fade = 6 }: { states: Key<string>[]; fade?: number }) {
    const frame = useCurrentFrame();
    return (
        <>
            {states.map(([at, name], index) => {
                const next = states[index + 1]?.[0];
                if (frame < at || (next !== undefined && frame > next + fade)) return null;
                return <Shot key={`${name}-${at}`} name={name} style={{ opacity: index === 0 ? 1 : interpolate(frame, [at, at + fade], [0, 1], clamp) }} />;
            })}
        </>
    );
}

function Scene({ theme, title, text, children, light, tail }: { theme: Theme; title: string; text: string; children: ReactNode; light?: boolean; tail?: ReactNode }) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 26 });
    const head = spring({ frame: frame - 4, fps, config: { damping: 200 }, durationInFrames: 24 });
    return (
        <AbsoluteFill style={{ opacity: interpolate(frame, [0, OVERLAP], [0, 1], clamp) }}>
            <Backdrop theme={theme}>
                <div style={{ opacity: head, transform: `translateY(${(1 - head) * 24}px)` }}>
                    <Copy theme={theme} title={title} text={text} size={68} textSize={30} align="center" style={{ left: 160, top: 46, width: 1600 }} />
                </div>
                <div style={{ transform: `translateY(${(1 - enter) * 120}px)` }}>
                    <Window x={300} y={214} width={1320} light={light}>
                        {children}
                    </Window>
                </div>
                {tail}
            </Backdrop>
        </AbsoluteFill>
    );
}

function Intro() {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const mark = spring({ frame, fps, config: { damping: 14, mass: 0.7 } });
    const words = ['Build funnels.', 'Own the data.'];
    return (
        <Backdrop theme="ember">
            <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ transform: `scale(${mark})` }}>
                    <Logo size={92} />
                </div>
                <div style={{ marginTop: 40, textAlign: 'center', fontWeight: 700, fontSize: 138, lineHeight: 1.02, letterSpacing: '-0.05em' }}>
                    {words.map((word, index) => {
                        const p = spring({ frame: frame - 14 - index * 12, fps, config: { damping: 200 }, durationInFrames: 24 });
                        return (
                            <div key={word} style={{ opacity: p, transform: `translateY(${(1 - p) * 50}px)` }}>
                                {word}
                            </div>
                        );
                    })}
                </div>
                <div style={{ marginTop: 34, fontSize: 36, color: '#ffe3d1', opacity: interpolate(frame, [44, 60], [0, 1], clamp) }}>The open-source, self-hosted funnel builder</div>
            </AbsoluteFill>
        </Backdrop>
    );
}

function Templates() {
    const target = center(rect('templates.webinar'));
    return (
        <Scene theme="night" title="Start from 15 layouts" text="Or a blank canvas. Or your own imported template.">
            <Camera zoom={[[0, 1], [30, 1], [80, 1.35]]} focus={[[0, { x: 720, y: 450 }], [80, target]]}>
                <Shots states={[[0, 'templates']]} />
                <Cursor keys={[[0, { x: 1180, y: 800 }], [34, { x: 1180, y: 800 }], [72, target]]} clicks={[84]} />
            </Camera>
        </Scene>
    );
}

function Editor() {
    const frame = useCurrentFrame();
    const card = rect('editor-search.card');
    const drop = rect('editor-search.drop');
    const from = center(card);
    const to = { x: drop.x + 170, y: drop.y + 50 };
    const grab = 46;
    const release = 104;
    const hand = trackPoint(frame, [[grab, from], [release - 8, to]]);
    const lifted = frame >= grab && frame < release;
    return (
        <Scene theme="sand" title="Drag, drop, done" text="Eighteen block types, live on the canvas">
            <Camera zoom={[[0, 1], [112, 1], [146, 1.5], [196, 1.5]]} focus={[[0, { x: 720, y: 450 }], [112, { x: 720, y: 450 }], [146, { x: 540, y: 500 }]]}>
                <Shots states={[[0, 'editor-search'], [release, 'editor-dropped']]} />
                {lifted && (
                    <>
                        <div style={{ position: 'absolute', left: drop.x - 6, top: drop.y + drop.height + 6, width: drop.width + 12, height: 5, borderRadius: 9, background: orange, opacity: interpolate(frame, [grab + 24, grab + 36], [0, 1], clamp) }} />
                        <Crop name="editor-search" region={card} width={card.width} style={{ left: hand.x - card.width / 2, top: hand.y - card.height / 2, transform: 'rotate(-2deg) scale(1.04)', boxShadow: `0 0 0 2px ${orange}, 0 24px 50px rgba(0,0,0,.6)`, opacity: 0.96 }} />
                    </>
                )}
                <Cursor keys={[[0, { x: 900, y: 760 }], [14, { x: 900, y: 760 }], [grab - 6, from], [grab, from], [release - 8, to], [release + 14, { x: to.x + 60, y: to.y + 190 }]]} clicks={[grab, release]} />
            </Camera>
        </Scene>
    );
}

function Capture() {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const name = center(rect('public-empty.name'));
    const email = center(rect('public-name.email'));
    const company = center(rect('public-email.company'));
    const submit = center(rect('public-empty.submit'));
    const phone = spring({ frame: frame - 24, fps, config: { damping: 200 }, durationInFrames: 30 });
    return (
        <Scene
            theme="ember"
            light
            title="Publish and capture leads"
            text="On your slug or your own domain, on every screen"
            tail={
                <div style={{ opacity: phone, transform: `translateY(${(1 - phone) * 160}px)` }}>
                    <Phone x={128} y={430} width={300} name="public-mobile" light />
                </div>
            }
        >
            <Camera zoom={[[0, 1], [30, 1], [62, 1.5], [150, 1.5]]} focus={[[0, { x: 720, y: 450 }], [30, { x: 720, y: 450 }], [62, { x: 960, y: 330 }]]}>
                <Shots
                    states={[
                        [0, 'public-empty'],
                        [66, 'public-name'],
                        [88, 'public-email'],
                        [110, 'public-filled'],
                        [140, 'public-success'],
                    ]}
                />
                <Cursor
                    keys={[[0, { x: 1300, y: 780 }], [24, { x: 1300, y: 780 }], [56, name], [70, name], [82, email], [94, email], [104, company], [116, company], [130, submit], [160, { x: submit.x + 60, y: submit.y + 110 }]]}
                    clicks={[60, 84, 106, 134]}
                />
            </Camera>
        </Scene>
    );
}

function Pipeline() {
    const frame = useCurrentFrame();
    const points = path('pipeline-drag.path');
    const begin = 52;
    const perStep = 3;
    const end = begin + points.length * perStep;
    const index = Math.min(points.length - 1, Math.max(0, Math.floor((frame - begin) / perStep)));
    const within = Math.min(1, Math.max(0, (frame - begin) / perStep - index));
    const next = points[Math.min(points.length - 1, index + 1)];
    const hand = { x: points[index].x + (next.x - points[index].x) * within, y: points[index].y + (next.y - points[index].y) * within };
    const dragging = frame >= begin && frame < end;
    return (
        <Scene theme="night" title="Turn leads into deals" text="Drag a deal and the weighted forecast updates">
            <Camera zoom={[[0, 1], [20, 1], [52, 1.22], [end + 6, 1.22], [end + 34, 1.45], [end + 70, 1.45]]} focus={[[0, { x: 720, y: 450 }], [52, { x: 1040, y: 470 }], [end + 6, { x: 1040, y: 470 }], [end + 34, { x: 700, y: 120 }]]}>
                {frame < begin ? <Shot name="pipeline-before" /> : dragging ? <Shot name={`pipeline-drag-${String(index).padStart(2, '0')}`} /> : <Shots states={[[begin, `pipeline-drag-${points.length - 1}`], [end, 'pipeline-after']]} fade={5} />}
                {frame < begin ? (
                    <Cursor keys={[[0, { x: 620, y: 780 }], [12, { x: 620, y: 780 }], [44, points[0]]]} clicks={[50]} />
                ) : dragging ? (
                    <Cursor keys={[[0, hand]]} />
                ) : (
                    <Cursor keys={[[end, points[points.length - 1]], [end + 34, { x: 820, y: 300 }]]} clicks={[end + 1]} />
                )}
            </Camera>
        </Scene>
    );
}

function Automation() {
    const simulate = center(rect('workflow.simulate'));
    return (
        <Scene theme="sand" title="Follow up on autopilot" text="Dry-run every step before a single email goes out">
            <Camera zoom={[[0, 1], [24, 1], [64, 1.35], [100, 1.35], [128, 1.75], [170, 1.75]]} focus={[[0, { x: 720, y: 450 }], [64, { x: 720, y: 560 }], [86, { x: 1100, y: 620 }], [128, { x: 1240, y: 700 }]]}>
                <Shots states={[[0, 'workflow'], [112, 'workflow-simulated']]} />
                <Cursor keys={[[0, { x: 560, y: 820 }], [60, { x: 620, y: 640 }], [98, simulate]]} clicks={[106]} />
            </Camera>
        </Scene>
    );
}

function Analytics() {
    const frame = useCurrentFrame();
    const scroll = interpolate(frame, [30, 80], [0, -226], { ...clamp, easing: ease });
    return (
        <Scene theme="night" title="See what converts" text="Privacy-conscious analytics, no third-party trackers">
            <Camera zoom={[[0, 1], [84, 1], [116, 1.3], [150, 1.3]]} focus={[[0, { x: 720, y: 450 }], [84, { x: 720, y: 450 }], [116, { x: 760, y: 640 }]]}>
                <Img src={capture('dashboard-full')} style={{ position: 'absolute', width: VIEW.width, top: scroll }} />
            </Camera>
        </Scene>
    );
}

function Experiments() {
    return (
        <Scene theme="ember" title="Test before you guess" text="Split traffic between variants and compare results">
            <Camera zoom={[[0, 1], [40, 1], [82, 1.55]]} focus={[[0, { x: 720, y: 450 }], [82, { x: 720, y: 470 }]]}>
                <Shots states={[[0, 'editor'], [38, 'experiments']]} fade={10} />
                <Cursor keys={[[0, { x: 900, y: 600 }], [8, { x: 900, y: 600 }], [30, center(rect('editor.experiments'))], [80, { x: 980, y: 720 }]]} clicks={[34]} />
            </Camera>
        </Scene>
    );
}

function ExportScene() {
    const react = center(rect('export.react'));
    return (
        <Scene theme="sand" title="Take your code with you" text="HTML, React, Vue, WordPress, Laravel, Shopify, WooCommerce">
            <Camera zoom={[[0, 1], [20, 1], [70, 1.4]]} focus={[[0, { x: 720, y: 450 }], [70, { x: 620, y: 380 }]]}>
                <Shots states={[[0, 'export']]} />
                <Cursor keys={[[0, { x: 800, y: 700 }], [10, { x: 800, y: 700 }], [44, react], [58, react], [92, center(rect('export.shopify'))]]} clicks={[48]} />
            </Camera>
        </Scene>
    );
}

function Outro() {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const rise = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 24 });
    const command = 'docker compose up --build';
    const typed = command.slice(0, Math.floor(interpolate(frame, [34, 72], [0, command.length], clamp)));
    return (
        <AbsoluteFill style={{ opacity: interpolate(frame, [0, OVERLAP], [0, 1], clamp) }}>
            <Backdrop theme="ember">
                <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ opacity: rise(2) }}>
                        <Logo size={84} />
                    </div>
                    <div style={{ marginTop: 34, fontWeight: 700, fontSize: 112, letterSpacing: '-0.05em', lineHeight: 1.04, opacity: rise(8), transform: `translateY(${(1 - rise(8)) * 40}px)` }}>
                        Yours to run.
                    </div>
                    <div style={{ marginTop: 20, fontSize: 34, color: '#ffe3d1', opacity: rise(16) }}>Open source under the MIT License</div>
                    <div style={{ marginTop: 48, width: 760, padding: '26px 34px', borderRadius: 20, background: '#140a06', color: '#ffd9c2', fontFamily: 'Menlo, monospace', fontSize: 34, textAlign: 'left', opacity: rise(24), boxShadow: '0 30px 60px -20px rgba(40,8,0,.7)' }}>
                        <span style={{ color: '#ff8a4c' }}>$ </span>
                        {typed}
                        <span style={{ opacity: frame % 24 < 12 ? 1 : 0 }}>▌</span>
                    </div>
                    <div style={{ marginTop: 40, fontSize: 36, fontWeight: 600, opacity: rise(74) }}>github.com/aialvi/openfunnels</div>
                </AbsoluteFill>
            </Backdrop>
        </AbsoluteFill>
    );
}

const scenes: Record<string, () => ReactNode> = { Intro, Templates, Editor, Capture, Pipeline, Automation, Analytics, Experiments, ExportScene, Outro };

/** Scene lengths and narration share one file so the voiceover stays in sync. */
const timeline = script.map(({ scene, frames }): [number, () => ReactNode] => [frames, scenes[scene]]);

export const DEMO_DURATION = timeline.reduce((sum, [duration]) => sum + duration, 0);

export function Demo() {
    let start = 0;
    return (
        <AbsoluteFill style={{ background: '#090706' }}>
            {timeline.map(([duration, Component], index) => {
                const from = start;
                start += duration;
                // Each scene stays up underneath while the next one fades in.
                const hold = index === timeline.length - 1 ? 0 : OVERLAP;
                return (
                    <Sequence key={index} from={from} durationInFrames={duration + hold}>
                        <Component />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
}
