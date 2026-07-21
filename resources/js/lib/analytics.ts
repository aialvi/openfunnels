export type FunnelEventType = 'view' | 'cta_click' | 'form_start' | 'form_step';

export function funnelSessionId(): string {
    const key = 'openfunnels:analytics-session';
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(key, sessionId);
    return sessionId;
}

export function currentAttribution(): Record<string, string> {
    const search = new URLSearchParams(window.location.search);
    const attribution: Record<string, string> = {};
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
        const value = search.get(key);
        if (value) attribution[key] = value;
    }
    if (document.referrer) attribution.referrer = document.referrer;
    return attribution;
}

export function trackFunnelEvent(
    funnelId: number,
    eventType: FunnelEventType,
    options: { formId?: string; metadata?: Record<string, string> } = {},
    variantId?: number | null,
): void {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    void fetch(`/funnels/${funnelId}/events`, {
        method: 'POST',
        credentials: 'same-origin',
        keepalive: true,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token ?? '' },
        body: JSON.stringify({
            event_type: eventType,
            session_id: funnelSessionId(),
            form_id: options.formId,
            variant_id: variantId,
            attribution: currentAttribution(),
            metadata: options.metadata,
        }),
    }).catch(() => undefined);
}
