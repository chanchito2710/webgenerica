import { Helmet } from 'react-helmet-async';
import { useSiteConfig } from '../context/SiteConfigContext';

interface Props {
  title?: string;
  description?: string;
  image?: string;
}

export default function SEO({ title, description, image }: Props) {
  const { config } = useSiteConfig();
  const siteName = config?.siteName || 'WebGenerica';
  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDesc = description || `${siteName} - Tu tienda online de confianza`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDesc} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
