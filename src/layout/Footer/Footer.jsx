import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import styles from './Footer.module.css';
import { FaLinkedin, FaInstagram, FaGithub, FaTelegram } from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md';
import { FaPaw, FaDog, FaCat, FaChevronRight } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t('footer.emailRequired'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('footer.invalidEmail'));
      return;
    }

    setIsSubmitting(true);

    try {
      const templateParams = {
        from_name: "Website Newsletter",
        name_id: "", // Leave empty as requested
        email_id: email, // This will now populate the email field
        subject: "", // Leave empty as requested
        message: "Yeni biri abunə oldu!"
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams
      );

      toast.success(t('toast.success.newsletter.subscribeSuccess'));
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(t('toast.error.newsletter.subscribeError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerTop}>
          <div className={styles.footerColumn}>
            <Link to="/" className={styles.footerLogo}>
              <FaPaw className={styles.footerLogoIcon} />
              <span>Pawsome</span>
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
                <span>{t('navigation.faq')}</span>
              </Link>
            </div>
          </div>

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

          <div className={styles.footerColumn}>
            <h3 className={styles.footerTitle}>{t('footer.contactInfo')}</h3>
            <div className={styles.contactItem}>
              <MdLocationOn className={styles.contactIcon} />
              <span>{t('contact.info.address')}</span>
            </div>
            <div className={styles.contactItem}>
              <MdPhone className={styles.contactIcon} />
              <span>{t('contact.info.phone')}</span>
            </div>
            <div className={styles.contactItem}>
              <MdEmail className={styles.contactIcon} />
              <span>{t('contact.info.email')}</span>
            </div>
            <div className={styles.newsletter}>
              <h3 className={styles.footerTitle}>{t('footer.newsletter')}</h3>
              <p className={styles.newsletterText}>
                {t('footer.newsletterText')}
              </p>
              <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  className={styles.newsletterInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className={`${styles.newsletterButton} ${isSubmitting ? styles.submitting : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('footer.subscribing') : t('footer.subscribe')}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © {currentYear} Pawsome. {t('footer.copyright')}
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
            <span className={styles.paymentMethod}>{t('footer.paymentMethods.visa')}</span>
            <span className={styles.paymentMethod}>{t('footer.paymentMethods.mastercard')}</span>
            <span className={styles.paymentMethod}>{t('footer.paymentMethods.paypal')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;