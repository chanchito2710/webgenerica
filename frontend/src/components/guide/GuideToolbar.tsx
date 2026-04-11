import { useLocation } from 'react-router-dom';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useGuideOverlay } from '../../context/GuideOverlayContext';
import adminGuideSections from '../../config/adminGuideSections';

export default function GuideToolbar() {
  const { enabled, activeSectionId, setEnabled, setActiveSection } = useGuideOverlay();
  const location = useLocation();

  const sections = adminGuideSections[location.pathname] || [];

  return (
    <div className="bg-white border rounded-lg px-4 py-3 mb-4 flex flex-wrap items-center gap-3 shadow-sm">
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          enabled
            ? 'bg-primary text-white hover:bg-primary-dark'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        aria-pressed={enabled}
      >
        {enabled ? <EyeOff size={16} /> : <Eye size={16} />}
        {enabled ? 'Desactivar guía' : 'Modo guía'}
      </button>

      {enabled && sections.length > 0 && (
        <>
          <span className="text-gray-300">|</span>
          <div className="flex flex-wrap items-center gap-2">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(activeSectionId === s.id ? null : s.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeSectionId === s.id
                    ? 'bg-primary/10 text-primary ring-1 ring-primary'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}

      {enabled && activeSectionId && sections.length > 0 && (
        <>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HelpCircle size={14} className="text-primary shrink-0" />
            <span>{sections.find((s) => s.id === activeSectionId)?.description}</span>
          </div>
        </>
      )}

      {enabled && sections.length === 0 && (
        <span className="text-sm text-gray-400">Guía disponible próximamente para esta sección.</span>
      )}
    </div>
  );
}
