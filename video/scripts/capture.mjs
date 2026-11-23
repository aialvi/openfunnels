/**
 * Captures real app states for the README slides and demo video.
 *
 * Needs a running app seeded with ShowcaseSeeder. Interactions (block drag, form
 * submission, deal drag) write to that workspace, so reseed before each run.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const base = process.env.CAPTURE_URL || 'http://localhost:8000';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Capture only supports a local app.');
const out = fileURLToPath(new URL('../public/captures/', import.meta.url));
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const errors = [];
const rects = {};
const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'en-US', colorScheme: 'dark' };
const mobile = { ...desktop, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const browser = await chromium.launch();

async function open(options) {
    const page = await (await browser.newContext(options)).newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => response.status() >= 400 && errors.push(`${response.status()} ${response.url()}`));
    return page;
}

async function settle(page) {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
}

async function shot(page, name, targets = {}, options = {}) {
    await settle(page);
    if (!options.fullPage) {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (overflow > 0) throw new Error(`${name} overflows horizontally by ${overflow}px`);
    }
    for (const [key, locator] of Object.entries(targets)) {
        rects[`${name}.${key}`] = await locator.boundingBox();
        if (!rects[`${name}.${key}`]) throw new Error(`Target ${name}.${key} is not visible`);
    }
    await page.screenshot({ path: `${out}${name}.png`, animations: 'disabled', caret: 'hide', ...options });
}

try {
    const page = await open(desktop);
    await page.goto(`${base}/login`);
    await page.getByLabel('Email address').fill('showcase@example.com');
    await page.getByLabel('Password', { exact: true }).fill('showcase-password');
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('**/dashboard');

    await shot(page, 'dashboard');
    await shot(page, 'dashboard-full', { chart: page.locator('.dashboard-card', { hasText: 'Last 14 days' }) }, { fullPage: true });
    await page.goto(`${base}/funnels`);
    await shot(page, 'funnels');
    const funnelPath = await page.getByRole('link', { name: 'Edit' }).evaluateAll((links) => links.map((link) => new URL(link.href).pathname));

    // Templates
    await page.goto(`${base}/funnel-editor`);
    await page.getByText('Browse templates').click();
    await shot(page, 'templates', { webinar: page.getByText('Webinar Registration', { exact: true }) });

    // Editor: find the workshop funnel among the edit links
    for (const path of funnelPath) {
        await page.goto(base + path);
        await settle(page);
        if (await page.getByText('Growth Workshop', { exact: true }).count()) break;
    }
    const editorUrl = page.url();
    const funnelId = editorUrl.split('/').pop();
    const library = page.getByText('Content Blocks', { exact: true });
    await library.waitFor();
    const block = page.getByText('Countdown', { exact: true });
    await page.getByPlaceholder('Search blocks...').fill('countdown');
    const heroText = page.getByText('A practical 45-minute session', { exact: false });
    await shot(page, 'editor-search', { card: page.locator('[draggable=true]', { hasText: 'Countdown' }).first(), drop: heroText });
    await block.dragTo(heroText, { targetPosition: { x: 120, y: 24 }, steps: 12 });
    await page.getByText('Event Countdown', { exact: true }).waitFor();
    await page.getByPlaceholder('Search blocks...').fill('');
    await shot(page, 'editor-dropped', { countdown: page.getByText('Event Countdown', { exact: true }) });
    await page.getByText('Turn cold traffic', { exact: false }).first().click();
    await shot(page, 'editor-inspect');
    await page.waitForTimeout(3500);
    await settle(page);
    await page.goto(editorUrl);
    await shot(page, 'editor', { export: page.getByRole('button', { name: 'Export' }), experiments: page.getByRole('button', { name: 'Experiments' }) });
    await page.getByRole('button', { name: 'Export' }).click();
    await page.getByRole('button', { name: 'React', exact: true }).click();
    await shot(page, 'export', { react: page.getByRole('button', { name: 'React', exact: true }), shopify: page.getByRole('button', { name: 'Shopify', exact: true }) });
    await page.goto(editorUrl);
    await settle(page);
    await page.getByRole('button', { name: 'Experiments' }).click();
    await shot(page, 'experiments');
    await page.goto(`${base}/funnel/${funnelId}/preview`);
    await shot(page, 'preview');

    // Public funnel. The experiment assigns variants per visitor; keep the control.
    async function control(options) {
        for (let attempt = 0; attempt < 20; attempt++) {
            const visitor = await open(options);
            await visitor.goto(`${base}/f/showcase-growth-workshop`);
            await settle(visitor);
            if (await visitor.getByText('Turn cold traffic', { exact: false }).count()) return visitor;
            await visitor.context().close();
        }
        throw new Error('The control variant was never served');
    }
    const visitor = await control(desktop);
    await shot(visitor, 'public-empty', { name: visitor.getByPlaceholder('Full name'), submit: visitor.getByRole('button', { name: 'Save my seat' }) });
    await visitor.getByPlaceholder('Full name').fill('Riley Stone');
    await shot(visitor, 'public-name', { email: visitor.getByPlaceholder('you@company.com') });
    await visitor.getByPlaceholder('you@company.com').fill('riley.stone@example.com');
    await shot(visitor, 'public-email', { company: visitor.getByPlaceholder('Company name') });
    await visitor.getByPlaceholder('Company name').fill('Lantern Works');
    await shot(visitor, 'public-filled');
    await visitor.getByRole('button', { name: 'Save my seat' }).click();
    await visitor.getByText("You're in.", { exact: false }).waitFor();
    await shot(visitor, 'public-success', { message: visitor.getByText("You're in.", { exact: false }) });
    await shot(await control(mobile), 'public-mobile');

    // CRM
    await page.goto(`${base}/funnels/${funnelId}/responses`);
    await page.getByText('Riley Stone').first().waitFor();
    await shot(page, 'responses', { lead: page.getByText('Riley Stone').first() });
    await page.goto(`${base}/contacts`);
    await shot(page, 'contacts');
    // Collapsing the sidebar fits every stage on one screen.
    await page.goto(`${base}/opportunities`);
    await page.getByRole('button', { name: /toggle sidebar/i }).first().click();
    const deal = page.getByText('Atlas Freight lead program', { exact: true });
    const target = page.getByText('Lumen Dental rollout', { exact: true });
    await shot(page, 'pipeline-before', { deal, target });
    const handle = deal.locator('xpath=ancestor::*[.//button][1]//button').last();
    const from = await handle.boundingBox();
    const to = await target.boundingBox();
    rects['pipeline-before.handle'] = from;
    // Record the real drag frame by frame for the video.
    const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
    const end = { x: to.x + 150, y: to.y + 70 };
    const steps = 24;
    const path = [];
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    for (let step = 0; step <= steps; step++) {
        const progress = step / steps;
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
        const point = { x: start.x + (end.x - start.x) * eased, y: start.y + (end.y - start.y) * eased - Math.sin(progress * Math.PI) * 18 };
        await page.mouse.move(point.x, point.y);
        await page.waitForTimeout(40);
        path.push(point);
        await page.screenshot({ path: `${out}pipeline-drag-${String(step).padStart(2, '0')}.png`, caret: 'hide' });
    }
    rects['pipeline-drag.path'] = path;
    await page.mouse.up();
    await page.waitForTimeout(800);
    await shot(page, 'pipeline-after', { deal: page.getByText('Atlas Freight lead program', { exact: true }) });

    // Automation
    await page.goto(`${base}/automations`);
    await page.getByRole('button', { name: /toggle sidebar/i }).first().click();
    await shot(page, 'automations');
    await page.getByText('New lead welcome', { exact: true }).click();
    await page.getByText('Dry-run test').waitFor();
    await shot(page, 'workflow', { steps: page.getByText('Send Email', { exact: true }), simulate: page.getByRole('button', { name: 'Simulate draft' }) });
    await page.getByText('No contact context').locator('xpath=..').selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Simulate draft' }).click();
    await page.getByText('1. Send Email').waitFor();
    await shot(page, 'workflow-simulated', { panel: page.locator('section', { hasText: 'Dry-run test' }).last() });
    await page.goto(`${base}/automations/runs`);
    await shot(page, 'runs');

    if (errors.length) throw new Error([...new Set(errors)].join('\n'));
    await writeFile(`${out}rects.json`, JSON.stringify(rects, null, 2));
    console.log(`Captured the app at ${base}. No page errors, failed requests, or overflow.`);
} catch (error) {
    console.error([...new Set(errors)]);
    throw error;
} finally {
    await browser.close();
}
