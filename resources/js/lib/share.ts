export interface ShareLinkOptions {
    url: string;
    title: string;
    text?: string;
}

export type ShareLinkResult = 'shared' | 'copied' | 'cancelled' | 'manual';

export async function shareLink({ url, title, text }: ShareLinkOptions): Promise<ShareLinkResult> {
    if (typeof navigator.share === 'function') {
        try {
            await navigator.share({ title, text, url });
            return 'shared';
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return 'cancelled';
            }
        }
    }

    if (window.isSecureContext && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(url);
            return 'copied';
        } catch {
            // Continue to the browser-compatible fallback below.
        }
    }

    const input = document.createElement('textarea');
    input.value = url;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();

    try {
        if (document.execCommand('copy')) {
            return 'copied';
        }
    } finally {
        document.body.removeChild(input);
    }

    window.prompt('Copy this public funnel link:', url);
    return 'manual';
}
