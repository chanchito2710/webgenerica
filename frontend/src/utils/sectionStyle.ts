import type { SectionStyles } from '../types';
import { assetUrl } from '../services/api';
import { loadGoogleFont } from './fonts';
import type { CSSProperties } from 'react';

/** Build inline style from SectionStyles for a hero/section wrapper. */
export function sectionBgStyle(s?: SectionStyles): CSSProperties | undefined {
  if (!s) return undefined;
  if (s.headingFont) loadGoogleFont(s.headingFont);
  if (s.bodyFont) loadGoogleFont(s.bodyFont);
  const style: CSSProperties = {};
  if (s.bgColor) style.backgroundColor = s.bgColor;
  if (s.bgImage) {
    style.backgroundImage = `url(${assetUrl(s.bgImage)})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  }
  if (s.textColor) style.color = s.textColor;
  return Object.keys(style).length ? style : undefined;
}

/** Build inline style for headings inside a styled section. */
export function sectionHeadingStyle(s?: SectionStyles): CSSProperties | undefined {
  if (!s) return undefined;
  const style: CSSProperties = {};
  if (s.headingColor) style.color = s.headingColor;
  if (s.headingFont) style.fontFamily = `"${s.headingFont}", sans-serif`;
  return Object.keys(style).length ? style : undefined;
}

/** Build inline style for body text inside a styled section. */
export function sectionBodyStyle(s?: SectionStyles): CSSProperties | undefined {
  if (!s) return undefined;
  const style: CSSProperties = {};
  if (s.textColor) style.color = s.textColor;
  if (s.bodyFont) style.fontFamily = `"${s.bodyFont}", sans-serif`;
  return Object.keys(style).length ? style : undefined;
}
