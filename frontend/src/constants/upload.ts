/**
 * Debe coincidir con backend/src/middleware/upload.ts (limits.fileSize).
 */
export const UPLOAD_MAX_MB = 5;

export const UPLOAD_MAX_BYTES = UPLOAD_MAX_MB * 1024 * 1024;

/** Texto corto reutilizable en ayudas de subida */
export const UPLOAD_MAX_WEIGHT = `Peso máximo: ${UPLOAD_MAX_MB} MB`;

/** Formatos que acepta el servidor (incl. GIF; SVG donde el input lo permita). */
export const UPLOAD_FORMATS_RASTER = 'JPG, PNG, WebP o GIF';

export const uploadHints = {
  productPhotos: `Formato: ${UPLOAD_FORMATS_RASTER} · Tamaño sugerido: 800 × 800 px (cuadrado, misma altura y ancho) · ${UPLOAD_MAX_WEIGHT} por imagen · La primera será la principal.`,
  siteLogo: `Formato: JPG, PNG, WebP o GIF · Logo horizontal sugerido: 240 × 80 px aprox. (proporción ancha; fondo transparente si usás PNG/WebP) · ${UPLOAD_MAX_WEIGHT}.`,
  aboutImage: `Formato: ${UPLOAD_FORMATS_RASTER} · Imagen sugerida: 1200 × 800 px o similar (horizontal) · ${UPLOAD_MAX_WEIGHT}.`,
  heroDesktop: `1920 × 600 px aprox. (panorámico horizontal) · ${UPLOAD_FORMATS_RASTER} · ${UPLOAD_MAX_WEIGHT}.`,
  heroMobile: `750 × 1000 px aprox. (vertical) · ${UPLOAD_FORMATS_RASTER} · ${UPLOAD_MAX_WEIGHT}.`,
  promoBanner: `Banner ancho sugerido: 1920 × 400 px aprox. (horizontal; el texto se superpone) · ${UPLOAD_FORMATS_RASTER} · ${UPLOAD_MAX_WEIGHT}.`,
  benefitIcon: `64 × 64 px · PNG, SVG, WebP o JPG · Fondo transparente recomendado (PNG/SVG) · ${UPLOAD_MAX_WEIGHT}.`,
} as const;
