import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { zhCN } from "./locales/zh-CN";

export const LS_LOCALE_STORAGE_KEY = "label-studio-locale-v2";

i18n.use(initReactI18next).init({
  resources: {
    "zh-CN": { translation: zhCN },
  },
  // Default to Chinese; the user can switch to English from the user menu,
  // which persists the choice in localStorage.
  lng: localStorage.getItem(LS_LOCALE_STORAGE_KEY) || "zh-CN",
  fallbackLng: "en",
  supportedLngs: ["zh-CN", "en"],
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
export { useTranslation, Trans } from "react-i18next";
