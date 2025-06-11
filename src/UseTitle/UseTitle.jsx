import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const useTitle = () => {
    const { i18n } = useTranslation();
    const location = useLocation();

    const getTitleByPath = useCallback((path, lang) => {
        const titles = {
            "/": { az: "Pawsome - Ev", en: "Pawsome - Home" },
            "/about-us": { az: "Pawsome - Haqqımızda", en: "Pawsome - About Us" },
            "/faq": { az: "Pawsome - FAQ", en: "Pawsome - FAQ" },
            "/contact": { az: "Pawsome - Əlaqə", en: "Pawsome - Contact" },
            "/blog": { az: "Pawsome - Bloq", en: "Pawsome - Blog" },
            "/shop": { az: "Pawsome - Mağaza", en: "Pawsome - Shop" },
            "/shop/all-products": { az: "Pawsome - Bütün Məhsullar", en: "Pawsome - All Products" },
            "/shop/cats": { az: "Pawsome - Pişiklər", en: "Pawsome - Cats" },
            "/shop/dogs": { az: "Pawsome - İtlər", en: "Pawsome - Dogs" },
            "/wishlist": { az: "Pawsome - İstək Siyahısı", en: "Pawsome - Wishlist" },
            "/cart": { az: "Pawsome - Səbət", en: "Pawsome - Cart" },
            "/login": { az: "Pawsome - Giriş", en: "Pawsome - Login" },
            "/signup": { az: "Pawsome - Qeydiyyat", en: "Pawsome - Sign Up" },
            "/profile": { az: "Pawsome - Profil", en: "Pawsome - Profile" },
            "/checkout": { az: "Pawsome - Sifariş", en: "Pawsome - Checkout" },
            "/orders": { az: "Pawsome - Sifarişlərim", en: "Pawsome - My Orders" },
            "/order-completed": { az: "Pawsome - Sifariş Tamamlandı", en: "Pawsome - Order Completed" },
            "/admin": { az: "Pawsome - Admin Panel", en: "Pawsome - Admin Panel" },
            "/admin/login": { az: "Pawsome - Admin Giriş", en: "Pawsome - Admin Login" },
            "/forgot-password": { az: "Pawsome - Şifrəni Unutdum", en: "Pawsome - Forgot Password" },
            "/reset-password": { az: "Pawsome - Şifrəni Yenilə", en: "Pawsome - Reset Password" }
        };

        // Handle nested routes
        if (path.startsWith("/shop/cats/")) {
            const catTitles = {
                "all-products": { az: "Pawsome - Pişik Məhsulları", en: "Pawsome - Cat Products" },
                "litter": { az: "Pawsome - Pişik Qumu", en: "Pawsome - Cat Litter" },
                "foods": { az: "Pawsome - Pişik Yeməkləri", en: "Pawsome - Cat Food" },
                "beds-and-home": { az: "Pawsome - Pişik Yataqları", en: "Pawsome - Cat Beds & Homes" },
                "carriers": { az: "Pawsome - Pişik Daşıyıcıları", en: "Pawsome - Cat Carriers" },
                "leashes": { az: "Pawsome - Pişik Xaltaları", en: "Pawsome - Cat Leashes" }
            };
            const category = path.split("/").pop();
            return catTitles[category] || titles["/shop/cats"];
        }

        if (path.startsWith("/shop/dogs/")) {
            const dogTitles = {
                "all-products": { az: "Pawsome - İt Məhsulları", en: "Pawsome - Dog Products" },
                "foods": { az: "Pawsome - İt Yeməkləri", en: "Pawsome - Dog Food" },
                "toys": { az: "Pawsome - İt Oyuncaqları", en: "Pawsome - Dog Toys" },
                "beds-and-home": { az: "Pawsome - İt Yataqları", en: "Pawsome - Dog Beds & Homes" },
                "carriers": { az: "Pawsome - İt Daşıyıcıları", en: "Pawsome - Dog Carriers" },
                "leashes": { az: "Pawsome - İt Xaltaları", en: "Pawsome - Dog Leashes" }
            };
            const category = path.split("/").pop();
            return dogTitles[category] || titles["/shop/dogs"];
        }

        // For blog details page
        if (path.startsWith("/blog/")) {
            return {
                az: "Pawsome - Bloq Məqaləsi",
                en: "Pawsome - Blog Post"
            };
        }

        // For product details page
        if (path.startsWith("/product/")) {
            return {
                az: "Pawsome - Məhsul Detalları",
                en: "Pawsome - Product Details"
            };
        }

        // Default title for unknown routes
        return titles[path] || { az: "Pawsome", en: "Pawsome" };
    }, []);

    const updateTitle = useCallback(() => {
        const currentLang = i18n.language;
        const titles = getTitleByPath(location.pathname, currentLang);
        document.title = titles[currentLang] || titles["en"];
    }, [getTitleByPath, i18n.language, location.pathname]);

    useEffect(() => {
        updateTitle();
    }, [updateTitle]);

    // Also update title when pathname changes
    useEffect(() => {
        updateTitle();
    }, [location.pathname, updateTitle]);

    return i18n.language;
};

export default useTitle;