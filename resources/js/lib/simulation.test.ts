import { describe, expect, it } from 'vitest';
import { durationLabel, simulationSummary } from './simulation';

describe('simulation summaries', () => {
    it('pluralizes durations', () => {
        expect(durationLabel(1, 'days')).toBe('1 day');
        expect(durationLabel(3, 'hours')).toBe('3 hours');
    });

    it('describes each action in plain language', () => {
        expect(simulationSummary({ would_send_email: true, purpose: 'marketing', subject: 'Hi' })).toBe('Would send a marketing email: “Hi”');
        expect(simulationSummary({ would_wait: 1, unit: 'days' })).toBe('Would wait 1 day');
        expect(simulationSummary({ would_update_status: 'won', would_add_tags: ['vip'] })).toBe('Would set status to won and add vip');
        expect(simulationSummary({ would_update_status: null, would_add_tags: [] })).toBe('Would leave the contact unchanged');
        expect(simulationSummary({ matched: false })).toBe('Condition not met: takes the no branch');
    });

    it('falls back to the raw output for unknown actions', () => {
        expect(simulationSummary({ custom: 1 })).toBe('{"custom":1}');
    });
});
