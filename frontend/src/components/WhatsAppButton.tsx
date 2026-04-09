import { useSiteConfig } from '../context/SiteConfigContext';

export default function WhatsAppButton() {
  const { config } = useSiteConfig();
  const phone = config?.phone?.replace(/\D/g, '') || '';

  if (!phone) return null;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent('Hola, tengo una consulta.')}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 animate-pulse hover:animate-none"
    >
      <svg viewBox="0 0 32 32" width="32" height="32" fill="white">
        <path d="M16.004 0C7.164 0 0 7.163 0 16.004c0 2.822.737 5.58 2.137 8.012L.073 32l8.174-2.044A15.94 15.94 0 0 0 16.004 32C24.836 32 32 24.836 32 16.004S24.836 0 16.004 0Zm0 29.29a13.24 13.24 0 0 1-6.753-1.85l-.484-.288-5.024 1.258 1.34-4.876-.316-.502A13.2 13.2 0 0 1 2.71 16.004c0-7.33 5.964-13.294 13.294-13.294S29.29 8.674 29.29 16.004 23.334 29.29 16.004 29.29Zm7.288-9.954c-.4-.2-2.366-1.167-2.732-1.3-.366-.134-.632-.2-.898.2s-1.032 1.3-1.264 1.566c-.232.268-.466.3-.866.1s-1.688-.622-3.216-1.984c-1.188-1.06-1.99-2.37-2.224-2.77-.232-.4-.024-.616.176-.816.18-.18.4-.466.6-.7.2-.232.266-.4.4-.666.132-.266.066-.5-.034-.7-.1-.2-.898-2.166-1.232-2.966-.324-.778-.654-.672-.898-.686l-.764-.012c-.266 0-.698.1-1.064.5s-1.398 1.366-1.398 3.332 1.432 3.866 1.632 4.132c.2.268 2.82 4.306 6.832 6.038.954.412 1.698.658 2.28.842.958.304 1.83.262 2.52.158.768-.114 2.366-.968 2.698-1.902.334-.934.334-1.734.234-1.902-.1-.166-.366-.266-.766-.466Z" />
      </svg>
    </a>
  );
}
