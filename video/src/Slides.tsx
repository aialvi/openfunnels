import type { ReactNode } from 'react';
import { Backdrop, Copy, Crop, Logo, Phone, popShadow, rect, Shot, type Theme, Window } from './ui';

function Side({ theme, shot, children, light, ...copy }: { theme: Theme; pill: string; title: string; text: string; shot: string; children?: ReactNode; light?: boolean }) {
    return (
        <Backdrop theme={theme}>
            <Copy theme={theme} {...copy} style={{ left: 64, top: 200, width: 380 }} />
            <Window x={486} y={92} width={940} light={light}>
                <Shot name={shot} />
            </Window>
            {children}
        </Backdrop>
    );
}

function Center({ theme, shot, children, ...copy }: { theme: Theme; pill: string; title: string; text: string; shot: string; children?: ReactNode }) {
    return (
        <Backdrop theme={theme}>
            <Copy theme={theme} {...copy} align="center" style={{ left: 135, top: 42, width: 1000 }} />
            <Window x={145} y={244} width={980}>
                <Shot name={shot} />
            </Window>
            {children}
        </Backdrop>
    );
}

export const Hero = () => (
    <Backdrop theme="ember">
        <Logo size={40} style={{ position: 'absolute', left: 64, top: 54 }} />
        <Copy
            theme="ember"
            pill="Open-source funnel builder"
            size={66}
            title={
                <>
                    Build funnels.
                    <br />
                    Own the data.
                </>
            }
            text="A visual editor, CRM, automation, and analytics you host yourself."
            style={{ left: 64, top: 150, width: 440 }}
        />
        <Window x={548} y={96} width={930} transform="perspective(2200px) rotateY(-9deg) rotateX(3deg)">
            <Shot name="editor" />
        </Window>
        <Phone x={470} y={400} width={188} name="public-mobile" light />
    </Backdrop>
);

/** Same artwork reflowed to GitHub's 2:1 social preview. */
export const Social = () => (
    <Backdrop theme="ember">
        <Logo size={44} style={{ position: 'absolute', left: 72, top: 62 }} />
        <Copy
            theme="ember"
            pill="Open source · Self-hosted · MIT"
            size={64}
            title={
                <>
                    Build funnels.
                    <br />
                    Own the data.
                </>
            }
            text="A visual editor, CRM, automation, and analytics you host yourself."
            style={{ left: 72, top: 162, width: 430 }}
        />
        <Window x={570} y={86} width={880} transform="perspective(2200px) rotateY(-9deg) rotateX(3deg)">
            <Shot name="editor" />
        </Window>
    </Backdrop>
);

export const slides: Record<string, () => ReactNode> = {
    'visual-funnel-editor': () => (
        <Side theme="sand" pill="Visual editor" title="Drag, drop, done" text="Sections, columns, and 18 block types with undo, autosave, and offline recovery." shot="editor-dropped" />
    ),
    'funnel-starter-options': () => (
        <Center theme="night" pill="Templates" title="Start from 15 layouts" text="Lead capture, sales, events, services, and industry pages. Or import your own." shot="templates" />
    ),
    'responsive-funnel-preview': () => (
        <Backdrop theme="ember">
            <Copy theme="ember" pill="Publishing" title="Right on every screen" text="Preview devices, then publish to a slug or your own domain." style={{ left: 64, top: 200, width: 320 }} />
            <Window x={520} y={100} width={900} light>
                <Shot name="public-success" />
            </Window>
            <Phone x={424} y={250} width={212} name="public-mobile" light />
        </Backdrop>
    ),
    'form-responses': () => <Side theme="night" pill="Lead capture" title="Every lead, every answer" text="Each submission is kept with its fields, source, and timeline." shot="responses" />,
    'opportunities-pipeline': () => (
        <Center theme="ember" pill="Opportunities CRM" title="Turn leads into deals" text="Drag deals between stages and watch the weighted forecast update." shot="pipeline-drag-16" />
    ),
    'automation-workflow-builder': () => (
        <Side theme="sand" pill="Automation Studio" title="Follow up on autopilot" text="Emails, waits, branches, and webhooks, with a dry run before you publish." shot="workflow-simulated">
            <Crop name="workflow-simulated" region={{ ...rect('workflow-simulated.panel'), height: Math.min(rect('workflow-simulated.panel').height, 900 - rect('workflow-simulated.panel').y) }} width={330} style={{ ...popShadow, left: 910, top: 250 }} />
        </Side>
    ),
    'dashboard-analytics': () => (
        <Backdrop theme="night">
            <Copy theme="night" pill="Analytics" title="See what converts" text="Views, conversions, and sources without third-party trackers." style={{ left: 64, top: 200, width: 360 }} />
            <Window x={486} y={92} width={940}>
                <Shot name="dashboard" />
            </Window>
            <Crop name="dashboard-full" region={{ ...rect('dashboard-full.chart'), width: rect('dashboard-full.chart').width * 0.685 }} width={690} style={{ ...popShadow, left: 548, top: 342 }} />
        </Backdrop>
    ),
    'ab-experiments': () => (
        <Backdrop theme="ember">
            <Copy theme="ember" pill="A/B experiments" title="Test before you guess" text="Snapshot a variant, split traffic, and compare conversions." style={{ left: 64, top: 200, width: 360 }} />
            <Window x={500} y={92} width={920}>
                <Shot name="editor" />
            </Window>
            <Crop name="experiments" region={{ x: 384, y: 238, width: 672, height: 424 }} width={640} style={{ ...popShadow, left: 560, top: 190 }} />
        </Backdrop>
    ),
    'multi-platform-funnel-export': () => (
        <Center theme="sand" pill="Export" title="Take your code with you" text="HTML, React, Vue, WordPress, Laravel, Shopify, or WooCommerce." shot="export" />
    ),
};
