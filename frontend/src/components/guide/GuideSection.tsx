import type { ReactNode } from 'react';
import { useGuideOverlay } from '../../context/GuideOverlayContext';

interface Props {
  sectionId: string;
  children: ReactNode;
  className?: string;
}

export default function GuideSection({ sectionId, children, className = '' }: Props) {
  const { enabled, activeSectionId } = useGuideOverlay();
  const isActive = enabled && activeSectionId === sectionId;

  return (
    <div
      data-guide-section={sectionId}
      className={`transition-all duration-300 ${className} ${
        isActive ? 'relative z-[60] ring-2 ring-primary rounded-lg shadow-xl' : ''
      } ${enabled && activeSectionId && !isActive ? 'opacity-40 pointer-events-none' : ''}`}
    >
      {children}
    </div>
  );
}
