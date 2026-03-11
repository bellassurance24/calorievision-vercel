import { useEffect, useRef, useState, useCallback } from 'react';

interface AutoSaveOptions {
  key: string;
  data: any;
  interval?: number; // in milliseconds
  onRestore?: (data: any) => void;
}

export function useAutoSaveDraft({ key, data, interval = 30000, onRestore }: AutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const previousDataRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `blog_draft_${key}`;

  // Check for existing draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.data && parsed.timestamp) {
          setHasDraft(true);
          setLastSaved(new Date(parsed.timestamp));
        }
      } catch (e) {
        console.error('Error parsing saved draft:', e);
      }
    }
  }, [storageKey]);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    const currentData = JSON.stringify(data);
    
    // Only save if data has changed
    if (currentData !== previousDataRef.current && currentData !== '{}') {
      const saveData = {
        data,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      previousDataRef.current = currentData;
      setLastSaved(new Date());
      setHasDraft(true);
      return true;
    }
    return false;
  }, [data, storageKey]);

  // Set up auto-save interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      saveDraft();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [saveDraft, interval]);

  // Restore draft
  const restoreDraft = useCallback(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.data && onRestore) {
          onRestore(parsed.data);
          return true;
        }
      } catch (e) {
        console.error('Error restoring draft:', e);
      }
    }
    return false;
  }, [storageKey, onRestore]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setHasDraft(false);
    setLastSaved(null);
    previousDataRef.current = '';
  }, [storageKey]);

  // Format last saved time
  const getLastSavedText = useCallback(() => {
    if (!lastSaved) return null;
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diff < 60) return 'Saved just now';
    if (diff < 120) return 'Saved 1 minute ago';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} minutes ago`;
    
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  }, [lastSaved]);

  return {
    saveDraft,
    restoreDraft,
    clearDraft,
    lastSaved,
    hasDraft,
    getLastSavedText
  };
}
