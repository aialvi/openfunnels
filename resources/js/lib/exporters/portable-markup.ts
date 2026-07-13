import {
    contentBoolean,
    contentNumber,
    contentString,
    getChartData,
    getSocialLinks,
    getTeamMembers,
    isSafeHttpUrl,
    productCheckoutUrl,
    videoEmbedUrl,
} from '@/lib/block-content';
import type { Block, Funnel } from '@/types/editor';
import { renderFormMarkup } from './form-export';

export type MarkupDialect = 'html' | 'react' | 'vue';

export const portableStyles = `
.of-page{box-sizing:border-box;margin:0;min-height:100vh}.of-page *{box-sizing:border-box}.of-section{width:100%}.of-section-inner{display:flex;flex-wrap:wrap;margin:0 auto}.of-column{min-width:0}.of-block img{max-width:100%}.of-card{overflow:hidden;border:1px solid #e5e7eb;border-radius:12px;background:#fff;color:#111827;box-shadow:0 1px 2px rgba(0,0,0,.05)}.of-card-body{padding:20px}.of-button{display:inline-flex;align-items:center;justify-content:center;border-radius:8px;padding:12px 20px;background:#2563eb;color:#fff;font-weight:600;text-decoration:none}.of-button-secondary{background:#e5e7eb;color:#111827}.of-button-full{width:100%}.of-media{width:100%;border:0;border-radius:8px}.of-empty{padding:24px;border:1px dashed #d1d5db;border-radius:8px;background:#f9fafb;color:#6b7280;text-align:center}.of-team{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}.of-team-member{padding:20px;text-align:center}.of-avatar{width:96px;height:96px;border-radius:999px;object-fit:cover}.of-stars{color:#f59e0b}.of-chart-row{margin-top:12px}.of-chart-label{display:flex;justify-content:space-between;font-size:14px}.of-chart-track{height:10px;margin-top:4px;overflow:hidden;border-radius:999px;background:#f3f4f6}.of-chart-bar{height:100%;border-radius:999px;background:#2563eb}.of-social{display:flex;flex-wrap:wrap;gap:8px}.of-social a{padding:8px 14px;border:1px solid #d1d5db;border-radius:8px;color:#374151;text-decoration:none}.of-countdown{display:flex;flex-wrap:wrap;gap:12px}.of-countdown-unit{min-width:80px;padding:14px;border-radius:8px;background:#111827;color:#fff;text-align:center}.of-product-image{display:block;width:100%;aspect-ratio:1;object-fit:cover}.of-price{font-weight:600}.of-spacer{width:100%}@media(max-width:767px){.of-column{width:100%!important}.of-section{padding-left:16px!important;padding-right:16px!important}}
.space-y-4>*+*{margin-top:16px}.space-y-4 input:not([type=checkbox]),.space-y-4 textarea,.space-y-4 select{display:block;width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px}.space-y-4 button{width:100%;padding:10px;border:0;border-radius:6px;background:#2563eb;color:#fff}.space-y-4 label span{display:block;margin-bottom:4px}.space-y-4 label.flex{display:flex;gap:8px}.space-y-4 label.flex span{display:inline;margin:0}
`.trim();

export function escapeMarkup(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function classAttr(value: string, dialect: MarkupDialect): string {
    return `${dialect === 'react' ? 'className' : 'class'}="${value}"`;
}

function styleAttr(styles: Record<string, string | number | undefined>, dialect: MarkupDialect): string {
    const entries = Object.entries(styles).filter((entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== '');
    if (dialect === 'react') {
        const object = Object.fromEntries(entries);
        return `style={${JSON.stringify(object)}}`;
    }
    const css = entries.map(([key, value]) => `${key.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}:${value}`).join(';');
    return `style="${escapeMarkup(css)}"`;
}

function boolAttr(name: string, enabled: boolean, dialect: MarkupDialect): string {
    if (!enabled) return '';
    return dialect === 'react' ? `${name}={true}` : name;
}

function empty(message: string, dialect: MarkupDialect): string {
    return `<div ${classAttr('of-empty', dialect)}>${escapeMarkup(message)}</div>`;
}

function renderProduct(block: Block, dialect: MarkupDialect): string {
    const name = contentString(
        block.content,
        'name',
        block.type === 'woocommerce-product' ? 'WooCommerce product' : block.type === 'shopify-buy-button' ? 'Shopify product' : 'Product',
    );
    const image = contentString(block.content, 'image');
    const url = productCheckoutUrl(block);
    return `<article ${classAttr('of-card', dialect)}>
${image ? `<img src="${escapeMarkup(image)}" alt="${escapeMarkup(name)}" loading="lazy" ${classAttr('of-product-image', dialect)} />` : ''}
<div ${classAttr('of-card-body', dialect)}><h3>${escapeMarkup(name)}</h3><p ${classAttr('of-price', dialect)}>${escapeMarkup(contentString(block.content, 'price', '$99.00'))}</p><p>${escapeMarkup(contentString(block.content, 'description'))}</p><a href="${escapeMarkup(url)}" ${classAttr('of-button of-button-full', dialect)}>${escapeMarkup(contentString(block.content, 'buttonText', 'Buy now'))}</a></div>
</article>`;
}

export function renderPortableBlock(block: Block, dialect: MarkupDialect): string {
    let content = '';

    switch (block.type) {
        case 'text':
            content = `<div ${styleAttr({ fontSize: contentString(block.content, 'fontSize', '16px'), fontWeight: contentString(block.content, 'fontWeight', 'normal'), textAlign: contentString(block.content, 'textAlign', 'left'), color: contentString(block.content, 'color', '#1f2937'), lineHeight: contentString(block.content, 'lineHeight', '1.6'), whiteSpace: 'pre-wrap' }, dialect)}>${escapeMarkup(contentString(block.content, 'text'))}</div>`;
            break;
        case 'image': {
            const src = contentString(block.content, 'src');
            const image = src
                ? `<img src="${escapeMarkup(src)}" alt="${escapeMarkup(contentString(block.content, 'alt'))}" loading="lazy" ${styleAttr({ width: contentString(block.content, 'width', '100%'), maxHeight: contentString(block.content, 'maxHeight'), objectFit: contentString(block.content, 'objectFit', 'cover'), borderRadius: contentString(block.content, 'imageBorderRadius', '8px') }, dialect)} />`
                : empty('Add an image URL', dialect);
            const link = contentString(block.content, 'linkUrl');
            content =
                link && isSafeHttpUrl(link)
                    ? `<a href="${escapeMarkup(link)}" ${contentBoolean(block.content, 'newTab', true) ? 'target="_blank" rel="noreferrer"' : ''}>${image}</a>`
                    : image;
            break;
        }
        case 'button': {
            const url = contentString(block.content, 'url', '#');
            const classes = `of-button${contentString(block.content, 'variant') === 'secondary' ? ' of-button-secondary' : ''}${contentBoolean(block.content, 'fullWidth') ? ' of-button-full' : ''}`;
            content = `<a href="${escapeMarkup(isSafeHttpUrl(url) ? url : '#')}" ${contentBoolean(block.content, 'newTab') ? 'target="_blank" rel="noreferrer"' : ''} ${classAttr(classes, dialect)}>${escapeMarkup(contentString(block.content, 'text', 'Learn more'))}</a>`;
            break;
        }
        case 'form':
            content = renderFormMarkup(block.content, dialect === 'react');
            break;
        case 'video': {
            const src = contentString(block.content, 'src');
            const embed = videoEmbedUrl(src);
            content = embed
                ? `<iframe src="${escapeMarkup(embed)}" title="${escapeMarkup(contentString(block.content, 'title', 'Video'))}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" ${boolAttr('allowFullScreen', true, dialect)} ${classAttr('of-media', dialect)} ${styleAttr({ aspectRatio: '16/9' }, dialect)}></iframe>`
                : src
                  ? `<video src="${escapeMarkup(src)}" poster="${escapeMarkup(contentString(block.content, 'poster'))}" ${boolAttr('controls', contentBoolean(block.content, 'controls', true), dialect)} ${boolAttr('autoPlay', contentBoolean(block.content, 'autoplay'), dialect)} ${boolAttr('muted', contentBoolean(block.content, 'autoplay'), dialect)} ${classAttr('of-media', dialect)}></video>`
                  : empty('Add a video URL', dialect);
            break;
        }
        case 'code':
            content = contentString(block.content, 'code')
                ? dialect === 'react'
                    ? `<div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(contentString(block.content, 'code'))} }} />`
                    : contentString(block.content, 'code')
                : empty('Add embed code', dialect);
            break;
        case 'map': {
            const address = contentString(block.content, 'address');
            const zoom = Math.min(20, Math.max(1, contentNumber(block.content, 'zoom', 12)));
            content = address
                ? `<iframe title="Map of ${escapeMarkup(address)}" src="https://www.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed" loading="lazy" ${classAttr('of-media', dialect)} ${styleAttr({ height: contentString(block.content, 'height', '300px') }, dialect)}></iframe>`
                : empty('Add a map address', dialect);
            break;
        }
        case 'testimonial': {
            const stars = '★'.repeat(Math.min(5, Math.max(1, contentNumber(block.content, 'rating', 5))));
            const avatar = contentString(block.content, 'avatar');
            content = `<figure ${classAttr('of-card of-card-body', dialect)}><div ${classAttr('of-stars', dialect)}>${stars}</div><blockquote>“${escapeMarkup(contentString(block.content, 'quote'))}”</blockquote><figcaption>${avatar ? `<img src="${escapeMarkup(avatar)}" alt="" ${classAttr('of-avatar', dialect)} />` : ''}<strong>${escapeMarkup(contentString(block.content, 'author', 'Customer'))}</strong><div>${escapeMarkup(contentString(block.content, 'position'))}</div></figcaption></figure>`;
            break;
        }
        case 'calendar': {
            const url = contentString(block.content, 'embedUrl') || contentString(block.content, 'calendarId');
            content =
                url && isSafeHttpUrl(url)
                    ? `<iframe src="${escapeMarkup(url)}" title="${escapeMarkup(contentString(block.content, 'title', 'Book a time'))}" loading="lazy" ${classAttr('of-media', dialect)} ${styleAttr({ height: contentString(block.content, 'height', '650px') }, dialect)}></iframe>`
                    : empty('Add a scheduling embed URL', dialect);
            break;
        }
        case 'ecommerce':
        case 'woocommerce-product':
        case 'shopify-buy-button':
            content = renderProduct(block, dialect);
            break;
        case 'team': {
            const members = getTeamMembers(block.content);
            content = members.length
                ? `<div ${classAttr('of-team', dialect)}>${members.map((member) => `<article ${classAttr('of-card of-team-member', dialect)}>${member.photo ? `<img src="${escapeMarkup(member.photo)}" alt="${escapeMarkup(member.name)}" ${classAttr('of-avatar', dialect)} />` : ''}<h3>${escapeMarkup(member.name)}</h3><p>${escapeMarkup(member.position)}</p><p>${escapeMarkup(member.bio)}</p></article>`).join('')}</div>`
                : empty('Add team members', dialect);
            break;
        }
        case 'chart': {
            const data = getChartData(block.content);
            const max = Math.max(...data.map((datum) => datum.value), 1);
            content = `<div ${classAttr('of-card of-card-body', dialect)}><h3>${escapeMarkup(contentString(block.content, 'title', 'Chart'))}</h3>${data.map((datum) => `<div ${classAttr('of-chart-row', dialect)}><div ${classAttr('of-chart-label', dialect)}><span>${escapeMarkup(datum.label)}</span><strong>${datum.value}</strong></div><div ${classAttr('of-chart-track', dialect)}><div ${classAttr('of-chart-bar', dialect)} ${styleAttr({ width: `${Math.max(2, (datum.value / max) * 100)}%` }, dialect)}></div></div></div>`).join('')}</div>`;
            break;
        }
        case 'audio': {
            const src = contentString(block.content, 'src');
            content = `<div ${classAttr('of-card of-card-body', dialect)}><h3>${escapeMarkup(contentString(block.content, 'title', 'Audio'))}</h3>${src ? `<audio src="${escapeMarkup(src)}" ${boolAttr('controls', contentBoolean(block.content, 'controls', true), dialect)} ${boolAttr('autoPlay', contentBoolean(block.content, 'autoplay'), dialect)} ${styleAttr({ width: '100%' }, dialect)}></audio>` : '<p>Add an audio URL.</p>'}</div>`;
            break;
        }
        case 'countdown': {
            const target = contentString(block.content, 'targetDate');
            const units = [
                ['Days', 'showDays'],
                ['Hours', 'showHours'],
                ['Minutes', 'showMinutes'],
                ['Seconds', 'showSeconds'],
            ].filter((unit) => contentBoolean(block.content, unit[1], true));
            content = `<div><h3>${escapeMarkup(contentString(block.content, 'title', 'Countdown'))}</h3><div ${classAttr('of-countdown', dialect)} data-countdown="${escapeMarkup(target)}">${units.map((unit) => `<div ${classAttr('of-countdown-unit', dialect)} data-countdown-unit="${unit[0].toLowerCase()}"><strong>--</strong><div>${unit[0]}</div></div>`).join('')}</div></div>`;
            break;
        }
        case 'social':
            content = `<div ${classAttr('of-social', dialect)}>${getSocialLinks(block.content)
                .map(
                    (link) =>
                        `<a href="${escapeMarkup(link.url && isSafeHttpUrl(link.url) ? link.url : '#')}" target="_blank" rel="noreferrer">${escapeMarkup(link.platform)}</a>`,
                )
                .join('')}</div>`;
            break;
        case 'spacer':
            content = `<div ${classAttr('of-spacer', dialect)} ${styleAttr({ height: contentString(block.content, 'height', '50px') }, dialect)}></div>`;
            break;
        default:
            content = empty(`Unsupported block: ${block.type}`, dialect);
    }

    return `<div id="${escapeMarkup(block.id)}" ${classAttr('of-block', dialect)} ${styleAttr({ padding: block.settings.padding, margin: block.settings.margin, backgroundColor: block.settings.backgroundColor, borderRadius: block.settings.borderRadius }, dialect)}>${content}</div>`;
}

export function renderPortableFunnel(funnel: Funnel, dialect: MarkupDialect): string {
    return funnel.content.sections
        .map((section) => {
            const columns = section.columns
                .map((column) => {
                    const justifyContent =
                        column.settings.verticalAlign === 'middle'
                            ? 'center'
                            : column.settings.verticalAlign === 'bottom'
                              ? 'flex-end'
                              : 'flex-start';
                    return `<div id="${escapeMarkup(column.id)}" ${classAttr('of-column', dialect)} ${styleAttr({ width: `${column.width}%`, padding: column.settings.padding, backgroundColor: column.settings.backgroundColor, display: 'flex', flexDirection: 'column', justifyContent }, dialect)}>${column.blocks.map((block) => renderPortableBlock(block, dialect)).join('\n')}</div>`;
                })
                .join('\n');
            return `<section id="${escapeMarkup(section.id)}" ${classAttr('of-section', dialect)} ${styleAttr({ padding: section.settings.padding, margin: section.settings.margin, minHeight: section.settings.minHeight, backgroundColor: section.settings.backgroundColor, backgroundImage: section.settings.backgroundImage ? `url(${section.settings.backgroundImage})` : undefined, backgroundSize: section.settings.backgroundImage ? 'cover' : undefined, backgroundPosition: section.settings.backgroundImage ? 'center' : undefined }, dialect)}><div ${classAttr('of-section-inner', dialect)} ${styleAttr({ maxWidth: section.settings.fullWidth ? 'none' : funnel.settings.maxWidth }, dialect)}>${columns}</div></section>`;
        })
        .join('\n');
}

export const countdownScript = `<script>(function(){function tick(){document.querySelectorAll('[data-countdown]').forEach(function(el){var target=new Date(el.dataset.countdown).getTime();var left=Number.isFinite(target)?Math.max(0,target-Date.now()):0;var values={days:Math.floor(left/86400000),hours:Math.floor(left/3600000)%24,minutes:Math.floor(left/60000)%60,seconds:Math.floor(left/1000)%60};el.querySelectorAll('[data-countdown-unit]').forEach(function(unit){var node=unit.querySelector('strong');if(node)node.textContent=String(values[unit.dataset.countdownUnit]||0).padStart(2,'0')})})}tick();setInterval(tick,1000)})();</script>`;
