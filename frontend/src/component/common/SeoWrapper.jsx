import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoByPageName } from '../../services/publicService';

function setMetaTag(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setPropertyTag(property, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(url) {
  if (!url) return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function derivePageName(pathname) {
  if (!pathname || pathname === '/') return 'home';
  const clean = pathname.toLowerCase().replace(/\/$/, '');
  if (clean === '/about') return 'about-us';
  if (clean === '/contact') return 'contact';
  if (clean === '/products') return 'products';
  if (clean === '/collection') return 'collection';
  if (clean === '/store') return 'store';
  // For dynamic routes, return last segment as a potential page key
  const parts = clean.split('/').filter(Boolean);
  return parts[parts.length - 1] || 'home';
}

const SeoWrapper = ({ overrides }) => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || '/';
    const pageName = derivePageName(path);

    const applySeo = (dataObj) => {
      const data = { ...(dataObj || {}), ...(overrides || {}) };
      const title = data.meta_title || data.title;
      const description = data.meta_description || data.description;
      const keywords = data.meta_keywords || data.keywords;
      const ogImage = data.meta_image || data.og_image;
      const robots = typeof data.noindex === 'boolean' ? (data.noindex ? 'noindex, nofollow' : 'index, follow') : 'index, follow';
      const canonical = data.canonical_url || `${window.location.origin}${location.pathname}`;

      if (title) document.title = title;
      setMetaTag('description', description);
      setMetaTag('keywords', keywords);
      setMetaTag('robots', robots);
      setCanonical(canonical);

      setPropertyTag('og:title', title);
      setPropertyTag('og:description', description);
      setPropertyTag('og:url', canonical);
      setPropertyTag('og:type', 'website');
      if (ogImage) setPropertyTag('og:image', ogImage);

      setPropertyTag('twitter:card', 'summary_large_image');
      setMetaTag('twitter:title', title);
      setMetaTag('twitter:description', description);
      if (ogImage) setMetaTag('twitter:image', ogImage);
    };

    getSeoByPageName(pageName)
      .then((resp) => applySeo(resp))
      .catch(() => {});
  }, [location.pathname, overrides]);

  return null;
};

export default SeoWrapper;


