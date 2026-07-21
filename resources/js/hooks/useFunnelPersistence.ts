import { useFunnelStore } from '@/stores/funnelStore';
import type { Funnel } from '@/types/editor';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'saved' | 'saving' | 'offline' | 'error' | 'conflict';

interface Backup {
    savedAt: string;
    funnel: Funnel;
}

interface AutosaveResponse {
    revision: number;
    updated_at: string;
}

export function useFunnelPersistence(funnelId?: number, initialRevision = 1, serverUpdatedAt?: string) {
    const { funnel, isDirty, isSaving, setSaving, markClean, setFunnel } = useFunnelStore();
    const [status, setStatus] = useState<SaveStatus>('saved');
    const [lastSaved, setLastSaved] = useState<Date | null>(serverUpdatedAt ? new Date(serverUpdatedAt) : null);
    const [hasRecovery, setHasRecovery] = useState(false);
    const revisionRef = useRef(initialRevision);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const storageKey = `openfunnels:recovery:${funnelId ?? 'new'}`;

    useEffect(() => {
        revisionRef.current = initialRevision;
    }, [initialRevision, funnelId]);

    useEffect(() => {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return;

        try {
            const backup = JSON.parse(raw) as Backup;
            const serverTime = serverUpdatedAt ? new Date(serverUpdatedAt).getTime() : 0;
            setHasRecovery(new Date(backup.savedAt).getTime() > serverTime);
        } catch {
            window.localStorage.removeItem(storageKey);
        }
    }, [serverUpdatedAt, storageKey]);

    useEffect(() => {
        if (!isDirty) return;
        const backup: Backup = { savedAt: new Date().toISOString(), funnel };
        window.localStorage.setItem(storageKey, JSON.stringify(backup));
    }, [funnel, isDirty, storageKey]);

    const saveFunnel = useCallback(async () => {
        if (isSaving) return;
        setSaving(true);
        setStatus('saving');

        if (!funnelId) {
            router.post(
                '/funnels',
                {
                    name: funnel.name,
                    description: funnel.description || '',
                    content: JSON.stringify(funnel.content),
                    settings: JSON.stringify(funnel.settings),
                },
                {
                    onSuccess: () => {
                        markClean();
                        setStatus('saved');
                        window.localStorage.removeItem(storageKey);
                    },
                    onError: () => setStatus('error'),
                    onFinish: () => setSaving(false),
                },
            );
            return;
        }

        try {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch(`/funnels/${funnelId}/autosave`, {
                method: 'PUT',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token ?? '',
                },
                body: JSON.stringify({
                    revision: revisionRef.current,
                    name: funnel.name,
                    description: funnel.description || null,
                    content: funnel.content,
                    settings: funnel.settings,
                }),
            });

            if (response.status === 409) {
                setStatus('conflict');
                return;
            }

            if (!response.ok) throw new Error('Unable to save funnel');

            const result = (await response.json()) as AutosaveResponse;
            revisionRef.current = result.revision;
            setLastSaved(new Date(result.updated_at));
            markClean();
            setStatus('saved');
            setHasRecovery(false);
            window.localStorage.removeItem(storageKey);
        } catch {
            setStatus(navigator.onLine ? 'error' : 'offline');
        } finally {
            setSaving(false);
        }
    }, [funnel, funnelId, isSaving, markClean, setSaving, storageKey]);

    useEffect(() => {
        if (!isDirty || !funnelId || status === 'conflict') return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => void saveFunnel(), 2000);
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [funnel, funnelId, isDirty, saveFunnel, status]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                void saveFunnel();
            }
        };
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) event.preventDefault();
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty, saveFunnel]);

    const restoreRecovery = () => {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return;
        const backup = JSON.parse(raw) as Backup;
        setFunnel(backup.funnel);
        useFunnelStore.getState().markDirty();
        setHasRecovery(false);
    };

    const discardRecovery = () => {
        window.localStorage.removeItem(storageKey);
        setHasRecovery(false);
    };

    const downloadRecovery = () => {
        const blob = new Blob([JSON.stringify(funnel, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${funnel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'funnel'}-recovery.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    return {
        saveFunnel,
        status,
        lastSaved,
        hasRecovery,
        restoreRecovery,
        discardRecovery,
        downloadRecovery,
    };
}
