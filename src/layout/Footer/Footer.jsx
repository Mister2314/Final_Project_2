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
        name_id: "",
        email_id: email,
        subject: "",
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
              <Link to={t('petCategories.categories.dogs.route')} className={styles.petCategory}>
                <FaDog className={styles.petCategoryIcon} />
                <span>{t('petCategories.categories.dogs.name')}</span>
              </Link>
              <Link to={t('petCategories.categories.cats.route')} className={styles.petCategory}>
                <FaCat className={styles.petCategoryIcon} />
                <span>{t('petCategories.categories.cats.name')}</span>
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
            <h3 className={styles.footerTitle}>{t('footer.categories.title')}</h3>
            <div className={styles.footerLinks}>
              <Link to={t('footer.categories.items.dogFood.route')} className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.categories.items.dogFood.name')}</span>
              </Link>
              <Link to={t('footer.categories.items.dogToys.route')} className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.categories.items.dogToys.name')}</span>
              </Link>
              <Link to={t('footer.categories.items.dogBeds.route')} className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.categories.items.dogBeds.name')}</span>
              </Link>
              <Link to={t('footer.categories.items.catFood.route')} className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.categories.items.catFood.name')}</span>
              </Link>
              <Link to={t('footer.categories.items.catLitter.route')} className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.categories.items.catLitter.name')}</span>
              </Link>
              <Link to={t('footer.categories.items.catBeds.route')} className={styles.footerLink}>
                <FaChevronRight className={styles.footerLinkIcon} />
                <span>{t('footer.categories.items.catBeds.name')}</span>
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
          <nav className={styles.footerNav}>
            <Link to="/privacy-policy" className={styles.footerNavLink}>
              {t('footer.privacyPolicy')}
            </Link>
            <Link to="/terms-of-service" className={styles.footerNavLink}>
              {t('footer.termsOfService')}
            </Link>
            <Link to="/shipping-policy" className={styles.footerNavLink}>
              {t('footer.shippingPolicy')}
            </Link>
          </nav>
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