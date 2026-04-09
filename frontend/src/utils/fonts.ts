export const FONT_OPTIONS = [
  { value: '', label: 'Por defecto' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
] as const;

const loadedFonts = new Set<string>();

export function loadGoogleFont(fontName: string) {
  if (!fontName || loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
}

export function ensureSlideFonts(styles?: {
  titleFont?: string;
  subtitleFont?: string;
  buttonFont?: string;
}, customTextFont?: string) {
  if (styles) {
    if (styles.titleFont) loadGoogleFont(styles.titleFont);
    if (styles.subtitleFont) loadGoogleFont(styles.subtitleFont);
    if (styles.buttonFont) loadGoogleFont(styles.buttonFont);
  }
  if (customTextFont) loadGoogleFont(customTextFont);
}
