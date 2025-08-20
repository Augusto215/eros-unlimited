export const locales = ['pt-BR', 'en', 'es', 'zh'] as const;
export const defaultLocale = 'pt-BR' as const;
export type Locale = typeof locales[number];

export const localeNames = {
  'pt-BR': 'Português',
  'en': 'English',
  'es': 'Español',
  'zh': '中文'
} as const;
