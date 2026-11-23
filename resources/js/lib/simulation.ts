const plural = (amount: number, unit: string) => `${amount} ${amount === 1 ? unit.replace(/s$/, '') : unit}`;

export function durationLabel(amount: unknown, unit: unknown): string {
    return plural(Number(amount) || 0, String(unit || 'minutes'));
}

/** Plain-language result for one dry-run step. Keys come from each action's simulate() output. */
export function simulationSummary(output: Record<string, unknown>): string {
    const subject = typeof output.subject === 'string' && output.subject ? `: “${output.subject}”` : '';

    if ('would_send_email' in output) return `Would send a ${String(output.purpose || 'marketing')} email${subject}`;
    if ('would_notify_owner' in output) return `Would notify you${subject}`;
    if ('would_wait' in output) return `Would wait ${durationLabel(output.would_wait, output.unit)}`;
    if ('would_create_opportunity' in output) return 'Would create an opportunity';
    if ('would_move_opportunity' in output) return 'Would move the opportunity';
    if ('would_send_webhook' in output) return `Would call ${String(output.host || 'the webhook')}`;
    if ('would_update_status' in output) {
        const tags = Array.isArray(output.would_add_tags) ? output.would_add_tags.map(String) : [];
        const changes = [
            output.would_update_status && `set status to ${String(output.would_update_status)}`,
            tags.length && `add ${tags.join(', ')}`,
        ];
        return `Would ${changes.filter(Boolean).join(' and ') || 'leave the contact unchanged'}`;
    }
    if ('matched' in output) return output.matched ? 'Condition met: takes the yes branch' : 'Condition not met: takes the no branch';
    if ('ended' in output) return 'Workflow ends here';

    return JSON.stringify(output);
}
