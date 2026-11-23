import { useEffect } from 'react';

/** Calls onEscape when Escape is pressed while active, unless something closer to the key already handled it. */
export function useEscapeKey(active: boolean, onEscape: () => void) {
    useEffect(() => {
        if (!active) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !event.defaultPrevented) onEscape();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [active, onEscape]);
}
