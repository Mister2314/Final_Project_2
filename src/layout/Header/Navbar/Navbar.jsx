import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BsSun, BsMoon, BsHeart } from "react-icons/bs";
import { IoBagHandleOutline } from "react-icons/io5";
import { FaAngleDown, FaPaw, FaDog, FaCat } from "react-icons/fa";
import { CgLogIn, CgLogOut } from "react-icons/cg";
import { FiUser, FiShoppingBag } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../redux/hooks/useAuth";
import LanguageSelector from "../components/LanguageSelector/LanguageSelector";
import { useWishlist } from 'react-use-wishlist';
import { toast } from 'react-hot-toast';
import { useSelector } from "react-redux";
import { useCart } from 'react-use-cart';




import styles from "./Navbar.module.css";

const Navbar = () => {
 const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems.length
    const { isAuthenticated } = useSelector((state) => state.user);
    const { items: cartItems } = useCart(); 
const cartCount = cartItems.length; 

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const navbarRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  const getUserDisplayName = () => {
    if (!user) return "";
    
    if (user.username) {
      return user.username;
    }
    
    return "İstifadəçi";
  };
  
  const userDisplayName = getUserDisplayName();

  const isAdmin = user && user.role === "admin";

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
      const mobile = window.innerWidth <= 1024;
      setIsMobileView(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
        setCategoryMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {

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

    document.addEventListener("mousedown", handleClickOutside);
    
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);


  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setCategoryMenuOpen(false);
      setUserMenuOpen(false);
    }
  };


  const toggleCategoryMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.innerWidth <= 1024) {
      setCategoryMenuOpen(!categoryMenuOpen);
    } else {
      setUserMenuOpen(false);
    setCategoryMenuOpen(!categoryMenuOpen);
    }
  };
  
  const toggleUserMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
  };


  const handleNavigation = (page) => {
    setMobileMenuOpen(false);
    if (window.innerWidth <= 1024) {
    setCategoryMenuOpen(false);
    }
    setUserMenuOpen(false);
  };


const handleLogout = async () => {
  try {
    setUserMenuOpen(false); 
    
    const success = await logout();
    
    if (success) {

      navigate('/');
    }
  } catch (error) {
    // console.error("Logout failed:", error);
    toast.error(t('Logout failed'));
  }
};

  const handleDashboardClick = () => {
    navigate('/admin');
    setUserMenuOpen(false);
  };

  const navItems = [
    { path: "/", key: "home", label: t("navbar.0") },
    { path: "/shop", key: "shop", label: t("navbar.store") },
    { key: "categories", label: t("navbar.3"), hasDropdown: true },
    { path: "/blog", key: "blog", label: t("navbar.4") },
    { path: "/faq", key: "faq", label: t("navbar.5") },
    { path: "/about-us", key: "about-us", label: t("navbar.1") },
    { path: "/contact", key: "contact", label: t("navbar.2") },
  ];

      const categoryItems = [
      { path: "/shop/dogs", icon: <FaDog />, label: t("navbar.categories.dogs") },
      { path: "/shop/cats", icon: <FaCat />, label: t("navbar.categories.cats") },
      { path: "/shop/all-products", icon: null, label: t("navbar.categories.allProducts") },
    ];

  const isLinkActive = (key) => {
    if (key === "shop" && location.pathname.startsWith("/shop")) {
      return true;
    }
    return currentPage === key;
  };

  return (
    <header className={styles.header}>
      <nav ref={navbarRef} className={styles.navbar}>
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
                      className={`${styles.navLink} ${isLinkActive(item.key) ? styles.active : ""}`}
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
              {isMobileView && mobileMenuOpen ? (
                <>
                  <div className={styles.mobileLanguageContainer}>
                    <LanguageSelector />
                  </div>
                  
                  <div className={styles.mobileActionGrid}>
                    <Link 
    to="/wishlist" 
    className={styles.actionButton}
    onClick={(e) => {
      if (!isAuthenticated) {
        e.preventDefault();
        toast.error('Wishlist\'ə baxmaq üçün hesabınıza daxil olun!');
      }
    }}
  >
    <div className={styles.iconWithBadge}>
      <BsHeart />
      {wishlistCount > 0 && (
        <span className={styles.badge}>{wishlistCount}</span>
      )}
    </div>
  </Link>
                    <button onClick={toggleTheme} className={styles.actionButton}>
                      {theme === "light" ? <BsMoon /> : <BsSun />}
                    </button>
                 {user && (
  <Link to="/cart" className={styles.actionButton}>
    <div className={styles.iconWithBadge}>
      <IoBagHandleOutline />
      {cartCount > 0 && (
        <span className={styles.badge}>{cartCount}</span>
      )}
    </div>
  </Link>
)}
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.languageSelector}>
                    <LanguageSelector />
                  </div>
                  <Link to="/wishlist" className={styles.actionButton}>
                    <div className={styles.iconWithBadge}>
                      <BsHeart />
                      {wishlistCount > 0 && (
                        <span className={styles.badge}>{wishlistCount}</span>
                      )}
                    </div>
                  </Link>
                  {user && (
                    <Link to="/cart" className={styles.actionButton}>
                      <div className={styles.iconWithBadge}>
                        <IoBagHandleOutline />
                        {cartCount > 0 && (
                          <span className={styles.badge}>{cartCount}</span>
                        )}
                      </div>
                    </Link>
                  )}
                  <button onClick={toggleTheme} className={styles.actionButton}>
                    {theme === "light" ? <BsMoon /> : <BsSun />}
                  </button>
                </>
              )}
              
              {isMobileView ? (
                <>
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
                          
                          {isAdmin && (
                            <button 
                              onClick={handleDashboardClick}
                              className={styles.userMenuItem}
                            >
                              <MdDashboard /> Dashboard
                            </button>
                          )}
                          
                          <div className={styles.userMenuDivider}></div>
                          <button 
                            onClick={handleLogout} 
                            className={styles.userMenuItem}
                          >
                            <CgLogOut /> {t("navbar.logout")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
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
                          
                          {isAdmin && (
                            <button 
                              onClick={handleDashboardClick}
                              className={styles.userMenuItem}
                            >
                              <MdDashboard /> Dashboard
                            </button>
                          )}
                          
                          <div className={styles.userMenuDivider}></div>
                          <button 
                            onClick={handleLogout} 
                            className={styles.userMenuItem}
                          >
                            <CgLogOut /> {t("navbar.logout")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
      
      </nav>
    </header>
  );
};

export default Navbar;