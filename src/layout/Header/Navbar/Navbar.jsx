import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BsSun, BsMoon, BsHeart, BsSearch } from "react-icons/bs";
import { IoBagHandleOutline } from "react-icons/io5";
import { FaAngleDown, FaPaw, FaDog, FaCat } from "react-icons/fa";
import { CgLogIn, CgLogOut } from "react-icons/cg";
import { FiUser, FiShoppingBag, FiSettings } from "react-icons/fi";
import { useTheme } from "../../../context/ThemeContext";
import { useUser } from "../../../context/UserContext";
import LanguageSelector from "../components/LanguageSelector/LanguageSelector";
import toast from 'react-hot-toast';

import styles from "./Navbar.module.css";

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const getUserDisplayName = () => {
    if (!user) return "";
    
    // Qeydiyyat zamanı təyin edilən tam ad
    if (user.user_metadata && user.user_metadata.full_name) {
      return user.user_metadata.full_name;
    }
    return "İstifadəçi";
  };
  const userDisplayName = getUserDisplayName();

  // Set current page based on location pathname when component mounts or location changes
  useEffect(() => {
    const path = location.pathname;
    
    if (path === "/") {
      setCurrentPage("home");
    } else if (path.startsWith("/shop")) {
      setCurrentPage("shop");
    } else if (path === "/blog") {
      setCurrentPage("blog");
    } else if (path === "/faq") {
      setCurrentPage("faq");
    } else if (path === "/about-us") {
      setCurrentPage("about-us");
    } else if (path === "/contact") {
      setCurrentPage("contact");
    } else {
      setCurrentPage(path.substring(1));
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) {
        setMobileMenuOpen(false);
        setSearchVisible(false);
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (
        categoryMenuRef.current && 
        !categoryMenuRef.current.contains(event.target) && 
        !event.target.closest(`.${styles.categoryTrigger}`)
      ) {
        setCategoryMenuOpen(false);
      }
      
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target) && 
        !event.target.closest(`.${styles.userButton}`)
      ) {
        setUserMenuOpen(false);
      }
      
      if (
        mobileMenuOpen && 
        navbarRef.current && 
        !navbarRef.current.contains(event.target) && 
        !event.target.closest(`.${styles.hamburger}`)
      ) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    
    handleResize();
    handleScroll();
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (searchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchVisible]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setSearchVisible(false);
      setCategoryMenuOpen(false);
      setUserMenuOpen(false);
    }
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) setSearchTerm("");
  };

  const toggleCategoryMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCategoryMenuOpen(!categoryMenuOpen);
  };
  
  const toggleUserMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setSearchVisible(false);
      setSearchTerm("");
    }
  };

  const handleNavigation = (page) => {
    setMobileMenuOpen(false);
    setCategoryMenuOpen(false);
    setSearchVisible(false);
    setUserMenuOpen(false);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    setIsLoggingOut(true);
    
    try {
      console.log("Starting logout process...");
      
      // Close user menu immediately
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      
      // Call logout function
      const result = await logout();
      
      console.log("Logout result:", result);
      
      // Show success message
      toast.success("Uğurla çıxış edildi");
      
      // Navigate to home page
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Çıxış zamanı xəta baş verdi");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { path: "/", key: "home", label: t("navbar.0") },
    { key: "shop", label: t("navbar.3"), hasDropdown: true },
    { path: "/blog", key: "blog", label: t("navbar.4") },
    { path: "/faq", key: "faq", label: t("navbar.5") },
    { path: "/about-us", key: "about-us", label: t("navbar.1") },
    { path: "/contact", key: "contact", label: t("navbar.2") },
  ];

  const categoryItems = [
    { path: "/shop/dogs", icon: <FaDog />, label: "Dogs" },
    { path: "/shop/cats", icon: <FaCat />, label: "Cats" },
    { path: "/shop", icon: null, label: "All Products" },
  ];

  return (
    <header className={styles.header}>
      <nav ref={navbarRef} className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.navbarContainer}>
          <div className={styles.logoContainer}>
            <Link to="/" onClick={() => handleNavigation("home")} className={styles.logo}>
              <FaPaw className={styles.logoIcon} />
              <span className={styles.logoText}>Pawsome</span>
            </Link>
          </div>
          
          <button
            className={`${styles.hamburger} ${mobileMenuOpen ? styles.active : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <div className={`${styles.navContent} ${mobileMenuOpen ? styles.open : ""}`}>
            <ul className={styles.navLinks}>
              {navItems.map((item, index) => (
                <li key={index} className={item.hasDropdown ? styles.categoryDropdownContainer : ''}>
                  {item.hasDropdown ? (
                    <a 
                      href="#" 
                      className={`${styles.categoryTrigger} 
                        ${currentPage.startsWith("shop") ? styles.active : ""} 
                        ${categoryMenuOpen ? styles.open : ""}`} 
                      onClick={toggleCategoryMenu}
                    >
                      {item.label}
                      <FaAngleDown className={`${styles.dropdownIcon} ${categoryMenuOpen ? styles.rotated : ""}`} />
                    </a>
                  ) : (
                    <Link 
                      to={item.path} 
                      className={currentPage === item.key ? styles.active : ""} 
                      onClick={() => handleNavigation(item.key)}
                    >
                      {item.label}
                    </Link>
                  )}
                  
                  {item.hasDropdown && categoryMenuOpen && (
                    <div 
                      className={styles.categoryMenu} 
                      ref={categoryMenuRef}
                    >
                      <div className={styles.categoryGrid}>
                        {categoryItems.map((catItem, catIndex) => (
                          <Link
                            key={catIndex}
                            to={catItem.path}
                            className={styles.categoryItem}
                            onClick={() => handleNavigation(`shop-${catItem.path.split('/').pop()}`)}
                          >
                            {catItem.icon && <span className={styles.categoryIcon}>{catItem.icon}</span>}
                            <span>{catItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            
            <div className={styles.actionButtons}>
              <div className={styles.languageSelector}>
                <LanguageSelector />
              </div>
              <button className={styles.actionButton} onClick={toggleSearch}>
                <BsSearch />
              </button>
              <Link to="/wishlist" className={styles.actionButton}>
                <BsHeart />
              </Link>
              {user && (
                <Link to="/cart" className={styles.actionButton}>
                  <IoBagHandleOutline />
                </Link>
              )}
              <button onClick={toggleTheme} className={styles.actionButton}>
                {theme === "light" ? <BsMoon /> : <BsSun />}
              </button>
              
              {!user ? (
                <Link to="/login" className={styles.loginButton}>
                  <CgLogIn className={styles.loginIcon} />
                  <span className={styles.loginText}>{t("auth.login")}</span>
                </Link>
              ) : (
                <div className={styles.userMenuContainer}>
                  <button 
                    className={`${styles.userButton} ${userMenuOpen ? styles.active : ""}`} 
                    onClick={toggleUserMenu}
                  >
                    <FiUser className={styles.userIcon} />
                    <span className={styles.userName}>{userDisplayName}</span>
                    <FaAngleDown className={`${styles.dropdownIcon} ${userMenuOpen ? styles.rotated : ""}`} />
                  </button>
                  
                  {userMenuOpen && (
                    <div className={styles.userMenu} ref={userMenuRef}>
                      <div className={styles.userMenuHeader}>
                        <FiUser className={styles.userMenuIcon} />
                        <span className={styles.userMenuName}>{userDisplayName}</span>
                      </div>
                      <div className={styles.userMenuDivider}></div>
                      <Link 
                        to="/profile" 
                        className={styles.userMenuItem} 
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiUser /> {t("navbar.profile")}
                      </Link>
                      <Link 
                        to="/orders" 
                        className={styles.userMenuItem} 
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiShoppingBag /> {t("navbar.orders")}
                      </Link>
                      <Link 
                        to="/settings" 
                        className={styles.userMenuItem} 
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FiSettings /> {t("navbar.settings")}
                      </Link>
                      
                      <div className={styles.userMenuDivider}></div>
                      <button 
                        onClick={handleLogout} 
                        className={`${styles.userMenuItem} ${isLoggingOut ? styles.loading : ""}`}
                        disabled={isLoggingOut}
                      >
                        <CgLogOut /> 
                        {isLoggingOut ? "Çıxış edilir..." : t("navbar.logout")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={`${styles.searchOverlay} ${searchVisible ? styles.visible : ""}`}>
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <BsSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder={t("navbar.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
                className={styles.searchInput}
              />
              <button 
                type="button" 
                className={styles.closeSearch} 
                onClick={toggleSearch}
              >
                ×
              </button>
            </form>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;