import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';
import { FaLinkedin, FaInstagram, FaGithub, FaTelegram } from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md';
import { FaPaw, FaDog, FaCat, FaChevronRight } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Footer Top Section */}
        <div className={styles.footerTop}>
          {/* Column 1: Logo and About */}
          <div className={styles.footerColumn}>
            <Link to="/" className={styles.footerLogo}>
              <FaPaw className={styles.footerLogoIcon} />
              <span>Woof</span>
            </Link>
            <p className={styles.footerAbout}>
              {t('footer.about')}
            </p>
            <div className={styles.socialIcons}>
              <a href="https://www.linkedin.com/in/x%C9%99yal-h%C3%BCseynli-3487b91ba/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                <FaLinkedin />
              </a>
              <a href="https://instagram.com/morphy2314" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                <FaInstagram />
              </a>
              <a href="https://github.com/Mister2314" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                <FaGithub />
              </a>
              <a href="https://t.me/morpheus2314" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                <FaTelegram/>
              </a>
            </div>
            <div className={styles.petCategories}>
              <Link to="/shop/dogs" className={styles.petCategory}>
                <FaDog className={styles.petCategoryIcon} />
                <span>{t('footer.petCategories.dogs')}</span>
              </Link>
              <Link to="/shop/cats" className={styles.petCategory}>
                <FaCat className={styles.petCategoryIcon} />
                <span>{t('footer.petCategories.cats')}</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.footerColumn}>
            <h3 className={styles.footerTitle}>{t('footer.quickLinks')}</h3>
            <div className={styles.footerLinks}>
              <Link to="/" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('navigation.home')}</span>
              </Link>
              <Link to="/about-us" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('navigation.aboutUs')}</span>
              </Link>
              <Link to="/shop" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('navigation.shop')}</span>
              </Link>
              <Link to="/blog" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('navigation.blog')}</span>
              </Link>
              <Link to="/contact" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('navigation.contact')}</span>
              </Link>
              <Link to="/FAQ" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>FAQ</span>
              </Link>
            </div>
          </div>

          {/* Column 3: Pet Accessories Categories */}
          <div className={styles.footerColumn}>
            <h3 className={styles.footerTitle}>{t('footer.categories')}</h3>
            <div className={styles.footerLinks}>
              <Link to="/shop/collars" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.productCategories.collars')}</span>
              </Link>
              <Link to="/shop/beds" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.productCategories.beds')}</span>
              </Link>
              <Link to="/shop/toys" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.productCategories.toys')}</span>
              </Link>
              <Link to="/shop/food-bowls" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.productCategories.foodBowls')}</span>
              </Link>
              <Link to="/shop/clothes" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.productCategories.clothes')}</span>
              </Link>
              <Link to="/shop/grooming" className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.productCategories.grooming')}</span>
              </Link>
            </div>
          </div>

          {/* Column 4: Contact Info and Newsletter */}
          <div className={styles.footerColumn}>
            <h3 className={styles.footerTitle}>{t('footer.contactInfo')}</h3>
            <div className={styles.contactItem}>
              <MdLocationOn className={styles.contactIcon} />
              <span>{t('contact.address')}</span>
            </div>
            <div className={styles.contactItem}>
              <MdPhone className={styles.contactIcon} />
              <span>{t('footer.phone')}</span>
            </div>
            <div className={styles.contactItem}>
              <MdEmail className={styles.contactIcon} />
              <span>{t('contact.email')}</span>
            </div>
            <div className={styles.newsletter}>
              <h3 className={styles.footerTitle}>{t('footer.newsletter')}</h3>
              <p className={styles.newsletterText}>
                {t('footer.newsletterText')}
              </p>
              <form className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  className={styles.newsletterInput}
                  required
                />
                <button type="submit" className={styles.newsletterButton}>
                  {t('footer.subscribe')}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © {currentYear} Woof. {t('footer.copyright')}
          </div>
          <div className={styles.footerNav}>
            <Link to="/privacy-policy" className={styles.footerNavLink}>
              {t('footer.privacyPolicy')}
            </Link>
            <Link to="/terms" className={styles.footerNavLink}>
              {t('footer.terms')}
            </Link>
            <Link to="/shipping" className={styles.footerNavLink}>
              {t('footer.shipping')}
            </Link>
            <Link to="/returns" className={styles.footerNavLink}>
              {t('footer.returnsPolicy')}
            </Link>
          </div>
          <div className={styles.paymentMethods}>
            <span className={styles.paymentMethod}>Visa</span>
            <span className={styles.paymentMethod}>MasterCard</span>
            <span className={styles.paymentMethod}>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;