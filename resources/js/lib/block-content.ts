import type { Block } from '@/types/editor';

export interface TeamMember {
    name: string;
    position: string;
    photo: string;
    bio: string;
}

export interface ChartDatum {
    label: string;
    value: number;
}

export interface SocialLink {
    platform: string;
    url: string;
}

export function contentString(content: Block['content'], key: string, fallback = ''): string {
    return typeof content[key] === 'string' ? (content[key] as string) : fallback;
}

export function contentBoolean(content: Block['content'], key: string, fallback = false): boolean {
    return typeof content[key] === 'boolean' ? (content[key] as boolean) : fallback;
}

export function contentNumber(content: Block['content'], key: string, fallback = 0): number {
    const value = content[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value);
    return fallback;
}

export function getTeamMembers(content: Block['content']): TeamMember[] {
    if (!Array.isArray(content.members)) return [];

    return content.members.flatMap((member) => {
        if (typeof member !== 'object' || member === null || Array.isArray(member)) return [];
        const record = member as Record<string, unknown>;
        return [
            {
                name: typeof record.name === 'string' ? record.name : 'Team member',
                position: typeof record.position === 'string' ? record.position : '',
                photo: typeof record.photo === 'string' ? record.photo : '',
                bio: typeof record.bio === 'string' ? record.bio : '',
            },
        ];
    });
}

export function getChartData(content: Block['content']): ChartDatum[] {
    if (!Array.isArray(content.data)) return [];

    return content.data.flatMap((datum, index) => {
        if (typeof datum === 'number') return [{ label: `Item ${index + 1}`, value: datum }];
        if (typeof datum !== 'object' || datum === null || Array.isArray(datum)) return [];
        const record = datum as Record<string, unknown>;
        const value = typeof record.value === 'number' ? record.value : Number(record.value);
        if (!Number.isFinite(value)) return [];
        return [{ label: typeof record.label === 'string' ? record.label : `Item ${index + 1}`, value }];
    });
}

export function getSocialLinks(content: Block['content']): SocialLink[] {
    if (Array.isArray(content.links)) {
        return content.links.flatMap((link) => {
            if (typeof link !== 'object' || link === null || Array.isArray(link)) return [];
            const record = link as Record<string, unknown>;
            if (typeof record.platform !== 'string') return [];
            return [{ platform: record.platform, url: typeof record.url === 'string' ? record.url : '' }];
        });
    }

    if (Array.isArray(content.platforms)) {
        return content.platforms.filter((platform): platform is string => typeof platform === 'string').map((platform) => ({ platform, url: '' }));
    }

    return [];
}

export function videoEmbedUrl(source: string): string | null {
    const value = source.trim();
    if (!value) return null;

    try {
        const url = new URL(value);
        if (url.hostname.includes('youtube.com')) {
            const videoId = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1);
            return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : null;
        }
        if (url.hostname === 'youtu.be') {
            const videoId = url.pathname.split('/').filter(Boolean)[0];
            return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : null;
        }
        if (url.hostname.includes('vimeo.com')) {
            const videoId = url.pathname.split('/').filter(Boolean).at(-1);
            return videoId ? `https://player.vimeo.com/video/${encodeURIComponent(videoId)}` : null;
        }
    } catch {
        return null;
    }

    return null;
}

export function isSafeHttpUrl(value: string): boolean {
    if (!value) return false;
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return value.startsWith('/') || value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:');
    }
}

export function productCheckoutUrl(block: Block): string {
    const configuredUrl = contentString(block.content, 'buyUrl') || contentString(block.content, 'productUrl');
    if (configuredUrl && isSafeHttpUrl(configuredUrl)) return configuredUrl;

    if (block.type !== 'shopify-buy-button') return '#';

    const shopDomain = contentString(block.content, 'shopDomain')
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
    const variantId = contentString(block.content, 'productId').trim();
    if (!shopDomain || !variantId || !/^[a-z0-9.-]+$/i.test(shopDomain) || !/^\d+$/.test(variantId)) return '#';

    return `https://${shopDomain}/cart/${variantId}:1`;
}
