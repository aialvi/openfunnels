import { useFunnelStore } from '@/stores/funnelStore';
import { router } from '@inertiajs/react';
import { useCallback, useEffect } from 'react';

export const useFunnelPersistence = (funnelId?: number) => {
    const { funnel, isDirty, isSaving, setSaving, markClean } = useFunnelStore();

    const saveFunnel = useCallback(async () => {
        try {
            setSaving(true);

            const saveData = {
                name: funnel.name,
                description: funnel.description || '',
                content: JSON.stringify(funnel.content),
                settings: JSON.stringify(funnel.settings),
            };

            if (funnelId) {
                // Update existing funnel
                await new Promise<void>((resolve, reject) => {
                    router.put(`/funnels/${funnelId}`, saveData, {
                        onSuccess: () => {
                            markClean();
                            resolve();
                        },
                        onError: (errors) => {
                            console.error('Save failed:', errors);
                            reject(new Error('Failed to save funnel'));
                        },
                        preserveScroll: true,
                    });
                });
            } else {
                // Create new funnel
                await new Promise<void>((resolve, reject) => {
                    router.post('/funnels', saveData, {
                        onSuccess: () => {
                            markClean();
                            resolve();
                        },
                        onError: (errors) => {
                            console.error('Save failed:', errors);
                            reject(new Error('Failed to create funnel'));
                        },
                    });
                });
            }
        } catch (error) {
            console.error('Validation or save error:', error);
            throw error;
        } finally {
            setSaving(false);
        }
    }, [funnel, funnelId, setSaving, markClean]);

    const autoSave = useCallback(async () => {
        if (isDirty && !isSaving && funnelId) {
            try {
                await saveFunnel();
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    }, [isDirty, isSaving, funnelId, saveFunnel]);

    // Auto-save every 30 seconds if there are changes
    useEffect(() => {
        const interval = setInterval(autoSave, 30000);
        return () => clearInterval(interval);
    }, [autoSave]);

    // Save on beforeunload if there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    return {
        saveFunnel,
        autoSave,
        isSaving,
        isDirty,
    };
};
