import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const useTitle = () => {
    const { i18n } = useTranslation();
    useEffect(() => {
        const currentLang = i18n.language;
        const title = currentLang === "az" ? "Pawsome - Ev" : "Pawsome - Home";
        document.title = title;
    }, [i18n.language]);
    return i18n.language;
};

export default useTitle;