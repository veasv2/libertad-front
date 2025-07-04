import type { LangCode } from './locales-config';

import { cache } from 'react';
import { createInstance } from 'i18next';
import acceptLanguage from 'accept-language';
import { cookies, headers } from 'next/headers';
import { initReactI18next } from 'react-i18next/initReactI18next';

import {
  defaultNS,
  i18nOptions,
  fallbackLng,
  storageConfig,
  supportedLngs,
  i18nResourceLoader,
} from './locales-config';

// ----------------------------------------------------------------------

/**
 * Internationalization configuration for Next.js server-side.
 *
 * Supports two approaches for language handling:
 *
 * 1. URL-based routing (Next.js default)
 *    - Languages are part of the URL path
 *    - Example: /en/about, /fr/about
 *    - @see {@link https://nextjs.org/docs/pages/building-your-application/routing/internationalization}
 *
 * 2. Cookie-based routing
 *    - Language preference stored in cookies
 *    - No URL modification required
 *    - @see {@link https://github.com/i18next/next-app-dir-i18next-example/issues/12#issuecomment-1500917570}
 *
 * Current implementation uses approach #2 (Cookie-based)
 */

acceptLanguage.languages([...supportedLngs]);

export async function detectLanguage() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  // 1. Try cookie
  const cookieLang = cookieStore.get(storageConfig.cookie.key)?.value;
  const fromCookie = cookieLang && acceptLanguage.get(cookieLang);

  // 2. Try Accept-Language header
  const headerLang = headerStore.get('accept-language') ?? undefined;
  const fromHeader =
    headerLang && storageConfig.cookie.autoDetection && acceptLanguage.get(headerLang);

  // 3. Fallback
  const lang = fromCookie || fromHeader || fallbackLng;

  return lang as LangCode;
}

// ----------------------------------------------------------------------

export async function initServerI18next(lang: LangCode, namespace: string) {
  const i18nInstance = createInstance();
  const initOptions = i18nOptions(lang, namespace);

  await i18nInstance.use(initReactI18next).use(i18nResourceLoader).init(initOptions);

  return i18nInstance;
}

// ----------------------------------------------------------------------

type Options = Record<string, unknown> & {
  keyPrefix?: string;
};

export const getServerTranslations = cache(async (namespace = defaultNS, options: Options = {}) => {
  const lang = await detectLanguage();
  const i18nextInstance = await initServerI18next(lang, namespace);

  return {
    t: i18nextInstance.getFixedT(
      lang,
      Array.isArray(namespace) ? namespace[0] : namespace,
      options?.keyPrefix
    ),
    i18n: i18nextInstance,
  };
});
