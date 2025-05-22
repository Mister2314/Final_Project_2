import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import detector from "i18next-browser-languagedetector";
import az from "./locales/az/translation.json";
import en from "./locales/en/translation.json";

const storedLanguage = localStorage.getItem("i18nextLng") || "en";

i18n
    .use(detector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            az: { translation: az },
        },
        fallbackLng: "en",
        lng: storedLanguage,
        interpolation: { escapeValue: false },
        detection: {
            order: ["localStorage", "cookie", "navigator"],
            caches: ["localStorage", "cookie"],
            lookupLocalStorage: "i18nextLng",
        },
    });

export default i18n;
