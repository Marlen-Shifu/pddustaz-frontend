import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'ru' | 'kz';

interface LanguageStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: 'ru',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'pdd-lang' }
  )
);
