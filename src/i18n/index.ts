import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getStoredLanguage } from '../store/storage';
import en from './locales/en.json';

// We can add other languages gradually
const resources = {
  en: { translation: en },
  hi: { translation: en }, // Placeholder for Hindi
  mr: { translation: en }, // Placeholder for Marathi
  gu: { translation: en }, // Placeholder for Gujarati
  pa: { translation: en }, // Placeholder for Punjabi
  bn: { translation: en }, // Placeholder for Bengali
  ta: { translation: en }, // Placeholder for Tamil
  te: { translation: en }, // Placeholder for Telugu
  kn: { translation: en }, // Placeholder for Kannada
  ml: { translation: en }, // Placeholder for Malayalam
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
];

export const initI18n = async () => {
  const storedLang = await getStoredLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: storedLang || 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });
};

export default i18n;
