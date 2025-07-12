import { useCallback, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { LayoutSection } from '@/components/editor/LayoutBuilder';

interface UseLayoutPersistenceProps {
  funnelId?: number;
  sections: LayoutSection[];
  isDirty: boolean;
}

interface UseLayoutPersistenceReturn {
  saveLayout: () => Promise<void>;
  isSaving: boolean;
  lastSaved: Date | null;
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
}

export function useLayoutPersistence({
  funnelId,
  sections,
  isDirty
}: UseLayoutPersistenceProps): UseLayoutPersistenceReturn {
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<Date | null>(null);
  const autoSaveRef = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save layout data to the server
  const saveLayout = useCallback(async () => {
    if (!funnelId || isSavingRef.current) {
      return;
    }

    try {
      isSavingRef.current = true;

      // Transform sections to a format suitable for saving
      const layoutData = {
        sections: sections.map(section => ({
          id: section.id,
          type: section.type,
          layout: section.layout,
          settings: section.settings,
          columns: section.columns.map(column => ({
            id: column.id,
            type: column.type,
            width: column.width,
            settings: column.settings,
            blocks: column.blocks.map(block => ({
              id: block.id,
              type: block.type,
              content: block.content,
              settings: block.settings
            }))
          }))
        }))
      };

      // Save via Inertia router to the funnel update endpoint
      await new Promise<void>((resolve, reject) => {
        router.patch(`/funnels/${funnelId}`, {
          content: JSON.stringify(layoutData)
        }, {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            lastSavedRef.current = new Date();
            resolve();
          },
          onError: (errors) => {
            console.error('Failed to save layout:', errors);
            reject(new Error('Failed to save layout'));
          }
        });
      });

    } catch (error) {
      console.error('Error saving layout:', error);
      throw error;
    } finally {
      isSavingRef.current = false;
    }
  }, [funnelId, sections]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveRef.current || !isDirty || !funnelId) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set up auto-save with debouncing (save after 3 seconds of inactivity)
    saveTimeoutRef.current = setTimeout(() => {
      saveLayout().catch(error => {
        console.error('Auto-save failed:', error);
      });
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [sections, isDirty, funnelId, saveLayout]);

  // Manual save shortcut (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveLayout().catch(error => {
          console.error('Manual save failed:', error);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveLayout]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && autoSaveRef.current) {
        // Show warning if there are unsaved changes
        e.preventDefault();
        e.returnValue = '';
        
        // Attempt to save (though this might not complete due to page unload)
        saveLayout().catch(() => {
          // Ignore errors during page unload
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveLayout]);

  const setAutoSave = useCallback((enabled: boolean) => {
    autoSaveRef.current = enabled;
  }, []);

  return {
    saveLayout,
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current,
    autoSave: autoSaveRef.current,
    setAutoSave
  };
}
