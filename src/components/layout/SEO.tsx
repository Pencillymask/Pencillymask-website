import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schema?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

const DEFAULT_TITLE = "Dhruvi's Portfolio — pencillymask | Original Paintings & Fine Art";
const DEFAULT_DESCRIPTION =
  "Explore original 1-of-1 contemporary fine art paintings, textured canvases, gold leaf works, and private collector pieces by artist Dhruvi (pencillymask).";
const DEFAULT_IMAGE = '/hero-koi.jpg';
const DEFAULT_KEYWORDS =
  'Dhruvi, pencillymask, original paintings, fine art, contemporary artist, textured art, gold leaf painting, modern oil paintings, Indian artist, art studio';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  schema,
  noindex = false,
}) => {
  const fullTitle = title
    ? `${title} | Dhruvi's Art Studio • pencillymask`
    : DEFAULT_TITLE;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to set or create a <meta> tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set or create a <link> tag (e.g. canonical)
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const absoluteImage = image.startsWith('http')
      ? image
      : typeof window !== 'undefined'
      ? `${window.location.origin}${image.startsWith('/') ? image : `/${image}`}`
      : image;

    // Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'author', 'Dhruvi (pencillymask)');
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Canonical Tag
    if (currentUrl) {
      setLinkTag('canonical', currentUrl.split('?')[0]);
    }

    // Open Graph Tags
    setMetaTag('property', 'og:site_name', "pencillymask — Dhruvi's Art Studio");
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    if (currentUrl) setMetaTag('property', 'og:url', currentUrl);
    if (absoluteImage) setMetaTag('property', 'og:image', absoluteImage);

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    if (absoluteImage) setMetaTag('name', 'twitter:image', absoluteImage);

    // Structured Data (JSON-LD)
    const scriptId = 'seo-structured-data-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Optional cleanup if component unmounts
    };
  }, [fullTitle, description, keywords, image, url, type, schema, noindex]);

  return null;
};
