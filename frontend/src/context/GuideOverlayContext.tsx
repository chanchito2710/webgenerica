import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface GuideOverlayState {
  enabled: boolean;
  activeSectionId: string | null;
  setEnabled: (v: boolean) => void;
  setActiveSection: (id: string | null) => void;
}

const GuideOverlayContext = createContext<GuideOverlayState | null>(null);

const LS_KEY = 'admin_guide_enabled';

export function GuideOverlayProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledRaw] = useState(() => {
    try { return localStorage.getItem(LS_KEY) === '1'; } catch { return false; }
  });
  const [activeSectionId, setActiveSection] = useState<string | null>(null);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledRaw(v);
    try { localStorage.setItem(LS_KEY, v ? '1' : '0'); } catch { /* noop */ }
    if (!v) setActiveSection(null);
  }, []);

  return (
    <GuideOverlayContext.Provider value={{ enabled, activeSectionId, setEnabled, setActiveSection }}>
      {children}
    </GuideOverlayContext.Provider>
  );
}

export function useGuideOverlay() {
  const ctx = useContext(GuideOverlayContext);
  if (!ctx) throw new Error('useGuideOverlay must be used within GuideOverlayProvider');
  return ctx;
}
