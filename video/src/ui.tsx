import { loadFont } from '@remotion/google-fonts/InstrumentSans';
import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import rects from '../public/captures/rects.json';

export const { fontFamily } = loadFont('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });

/** CSS pixels of every desktop capture. */
export const VIEW = { width: 1440, height: 900 };
export const BAR = 40;

export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };

export const rect = (name: string) => (rects as unknown as Record<string, Rect>)[name];
export const path = (name: string) => (rects as unknown as Record<string, Point[]>)[name];
export const center = (r: Rect): Point => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
export const capture = (name: string) => staticFile(`captures/${name}.png`);

export const orange = '#f54a00';

const backdrops = {
    ember: `radial-gradient(60% 80% at 88% 0%, #ff8a3d 0%, transparent 60%), radial-gradient(60% 80% at 0% 100%, #7a1d00 0%, transparent 65%), #d63f00`,
    night: `radial-gradient(55% 70% at 80% 0%, #5a1c00 0%, transparent 70%), radial-gradient(50% 60% at 0% 100%, #2a0f02 0%, transparent 70%), #090706`,
    sand: `radial-gradient(60% 75% at 100% 0%, #ffd9b8 0%, transparent 65%), radial-gradient(55% 70% at 0% 100%, #ffe9c9 0%, transparent 65%), #faf5ee`,
};
export type Theme = keyof typeof backdrops;
const ink: Record<Theme, { title: string; text: string; pill: string; pillText: string }> = {
    ember: { title: '#fff', text: '#ffe3d1', pill: 'rgba(255,255,255,.18)', pillText: '#fff' },
    night: { title: '#fff', text: '#c9bdb5', pill: 'rgba(245,74,0,.2)', pillText: '#ff9b66' },
    sand: { title: '#1a0f08', text: '#6d5a4c', pill: '#ffdcc2', pillText: '#8a2f00' },
};

export function Backdrop({ theme, children }: { theme: Theme; children: ReactNode }) {
    return (
        <AbsoluteFill style={{ background: backdrops[theme], fontFamily, color: ink[theme].title, overflow: 'hidden' }}>
            <AbsoluteFill
                style={{
                    backgroundImage: 'radial-gradient(currentColor 1px, transparent 1.3px)',
                    backgroundSize: '24px 24px',
                    opacity: 0.08,
                    maskImage: 'linear-gradient(120deg, #000, transparent 60%)',
                }}
            />
            {children}
        </AbsoluteFill>
    );
}

export function Logo({ size = 36, color, style }: { size?: number; color?: string; style?: CSSProperties }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32, color, fontWeight: 700, fontSize: size * 0.62, letterSpacing: '-0.02em', ...style }}>
            <svg width={size} height={size} viewBox="0 0 64 64">
                <rect width="64" height="64" rx="15" fill={orange} stroke="rgba(255,255,255,.35)" strokeWidth="2" />
                <path d="M16 18h32L32 48z" fill="#ffb02e" stroke="#1a0800" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            OpenFunnels
        </div>
    );
}

export function Copy({
    theme,
    pill,
    title,
    text,
    size = 54,
    textSize = 20,
    align = 'left',
    style,
}: {
    theme: Theme;
    pill?: string;
    title: ReactNode;
    text: string;
    size?: number;
    textSize?: number;
    align?: 'left' | 'center';
    style: CSSProperties;
}) {
    const c = ink[theme];
    return (
        <div style={{ position: 'absolute', zIndex: 3, textAlign: align, ...style }}>
            {pill && (
                <span
                    style={{ display: 'inline-block', padding: '7px 14px', borderRadius: 99, background: c.pill, color: c.pillText, fontSize: 14, fontWeight: 600 }}
                >
                    {pill}
                </span>
            )}
            <div style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.03, margin: pill ? '18px 0 14px' : '0 0 12px', textWrap: 'balance' }}>
                {title}
            </div>
            <div style={{ fontSize: textSize, lineHeight: 1.45, color: c.text, textWrap: 'pretty' }}>{text}</div>
        </div>
    );
}

export function Window({ x, y, width, children, transform, light = false }: { x: number; y: number; width: number; children: ReactNode; transform?: string; light?: boolean }) {
    const bar = (BAR * width) / VIEW.width;
    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width,
                height: bar + (VIEW.height * width) / VIEW.width,
                borderRadius: 16,
                overflow: 'hidden',
                background: light ? '#fff' : '#0b0b0b',
                transform,
                boxShadow: '0 0 0 1px rgba(255,255,255,.14), 0 60px 110px -24px rgba(20,6,0,.75), 0 20px 44px -16px rgba(20,6,0,.5)',
            }}
        >
            <div style={{ height: bar, display: 'flex', alignItems: 'center', gap: bar * 0.2, padding: `0 ${bar * 0.4}px`, background: light ? '#efeae4' : '#1c1a19' }}>
                {['#ff6258', '#ffbe2f', '#2aca44'].map((color) => (
                    <i key={color} style={{ width: bar * 0.3, height: bar * 0.3, borderRadius: '50%', background: color }} />
                ))}
            </div>
            <div style={{ position: 'relative', width, height: (VIEW.height * width) / VIEW.width, overflow: 'hidden' }}>
                {/* Children use capture coordinates. */}
                <div style={{ position: 'absolute', width: VIEW.width, height: VIEW.height, transform: `scale(${width / VIEW.width})`, transformOrigin: '0 0' }}>{children}</div>
            </div>
        </div>
    );
}

export function Shot({ name, style }: { name: string; style?: CSSProperties }) {
    return <Img src={capture(name)} style={{ position: 'absolute', left: 0, top: 0, width: VIEW.width, ...style }} />;
}

export function Phone({ x, y, width, name, transform, light = false }: { x: number; y: number; width: number; name: string; transform?: string; light?: boolean }) {
    const pad = width * 0.04;
    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width,
                padding: pad,
                borderRadius: width * 0.18,
                background: '#0c0908',
                transform,
                boxShadow: '0 0 0 1.5px #4a3a31, 0 50px 90px -20px rgba(20,6,0,.8)',
            }}
        >
            <div style={{ borderRadius: width * 0.145, overflow: 'hidden', background: light ? '#fff' : '#000', paddingTop: width * 0.11 }}>
                <Img src={capture(name)} style={{ display: 'block', width: '100%' }} />
            </div>
            <div style={{ position: 'absolute', top: pad + width * 0.03, left: '50%', width: width * 0.28, height: width * 0.07, marginLeft: -width * 0.14, borderRadius: 99, background: '#0c0908' }} />
        </div>
    );
}

/** A region of a capture, enlarged. */
export function Crop({ name, region, width, style }: { name: string; region: Rect; width: number; style?: CSSProperties }) {
    const scale = width / region.width;
    return (
        <div style={{ position: 'absolute', width, height: region.height * scale, overflow: 'hidden', borderRadius: 14, ...style }}>
            <Img src={capture(name)} style={{ position: 'absolute', width: VIEW.width * scale, left: -region.x * scale, top: -region.y * scale, maxWidth: 'none' }} />
        </div>
    );
}

export const popShadow: CSSProperties = {
    zIndex: 4,
    boxShadow: '0 0 0 1px rgba(255,255,255,.18), 0 0 0 7px rgba(255,255,255,.12), 0 40px 70px -18px rgba(20,6,0,.8)',
};
