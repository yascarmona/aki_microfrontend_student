import { createContext, useContext } from 'react';
import { translations } from '@/locales/pt-BR';
import type { Translations } from '@/locales/pt-BR';

export const I18nContext = createContext<Translations>(translations);
export const useTranslations = () => useContext(I18nContext);
