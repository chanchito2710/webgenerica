import { useEffect, useRef } from 'react';
import { useGuideOverlay } from '../../context/GuideOverlayContext';

export default function GuideSpotlight() {
  const { enabled, activeSectionId } = useGuideOverlay();
  const scrolledRef = useRef(false);

  useEffect(() => {
    if (!enabled || !activeSectionId) { scrolledRef.current = false; return; }

    const el = document.querySelector(`[data-guide-section="${activeSectionId}"]`);
    if (el && !scrolledRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      scrolledRef.current = true;
    }
  }, [enabled, activeSectionId]);

  useEffect(() => {
    scrolledRef.current = false;
  }, [activeSectionId]);

  if (!enabled || !activeSectionId) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 pointer-events-none transition-opacity duration-300"
      aria-hidden="true"
    />
  );
}
