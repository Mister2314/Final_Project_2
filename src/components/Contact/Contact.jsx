import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion"; // Added useInView for more reliable animations
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from "react-icons/fi";
import { FaPaw, FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import emailjs from "@emailjs/browser";

import styles from "./Contact.module.css"; // Fixed to match the CSS file name

const Contact = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const formRef = useRef(null);
  const mapRef = useRef(null);
  
  // Create refs for each section to use with useInView
  const heroRef = useRef(null);
  const formSectionRef = useRef(null);
  const mapSectionRef = useRef(null);
  const faqRef = useRef(null);
  
  // Use Framer Motion's useInView hook for more reliable animation triggers
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.2 });
  const isFormInView = useInView(formSectionRef, { once: false, amount: 0.2 });
  const isMapInView = useInView(mapSectionRef, { once: false, amount: 0.2 });
  const isFaqInView = useInView(faqRef, { once: false, amount: 0.2 });
  
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map with a more reliable approach
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize EmailJS with environment variables from Vite
  useEffect(() => {
    // Initialize with proper error handling
    try {
      emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    } catch (error) {
      console.error("EmailJS initialization error:", error);
    }
  }, []);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formState.name.trim()) errors.name = t("contact.errors.nameRequired");
    if (!formState.email.trim()) {
      errors.email = t("contact.errors.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = t("contact.errors.emailInvalid");
    }
    if (!formState.message.trim()) errors.message = t("contact.errors.messageRequired");
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const templateParams = {
        from_name: formState.name,
        name_id: formState.name,
        email_id: formState.email,
        subject: formState.subject || "No Subject",
        message: formState.message,
      };
      
      try {
        const response = await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams
        );
        
        console.log("Email sent successfully:", response);
        setSubmitSuccess(true);
        
        // Reset form
        setFormState({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } catch (error) {
        console.error("Email sending failed:", error);
        setSubmitError("Failed to send your message. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.focus();
      }
    }
  };

  // Animation variants - refined for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Reduced from 0.2 for smoother animation
        delayChildren: 0.1,   // Added small delay
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",  // Using spring for more natural animation
        stiffness: 90,
        damping: 15,
        duration: 0.4,   // Slightly faster
      },
    },
  };

  // Section animations with consistent configuration
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <section className={styles.heroSection} ref={heroRef}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.container}>
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7 }}
          >
            <div className={styles.heroIcon}>
              <FaPaw />
            </div>
            <h1>{t("contact.title")}</h1>
            <p>{t("contact.subtitle")}</p>
            
            <motion.div 
              className={styles.contactCards}
              variants={containerVariants}
              initial="hidden"
              animate={isHeroInView ? "visible" : "hidden"}
            >
              <motion.div className={styles.contactCard} variants={itemVariants}>
                <div className={styles.cardIconWrapper}>
                  <FiPhone className={styles.cardIcon} />
                </div>
                <div className={styles.cardContent}>
                  <h3>{t("contact.phoneTitle")}</h3>
                  <p>{t("contact.phonenumber")}</p>
                  <p>{t("contact.phonenumber")}</p>
                </div>
              </motion.div>
              
              <motion.div className={styles.contactCard} variants={itemVariants}>
                <div className={styles.cardIconWrapper}>
                  <FiMail className={styles.cardIcon} />
                </div>
                <div className={styles.cardContent}>
                  <h3>{t("contact.emailTitle")}</h3>
                  <p>{t("contact.emailaddres1")}</p>
                  <p>{t("contact.emailaddres2")}</p>
                </div>
              </motion.div>
              
              <motion.div className={styles.contactCard} variants={itemVariants}>
                <div className={styles.cardIconWrapper}>
                  <FiMapPin className={styles.cardIcon} />
                </div>
                <div className={styles.cardContent}>
                  <h3>{t("contact.addressTitle")}</h3>
                  <p>{t("contact.address")}</p>
                </div>
              </motion.div>
              
              <motion.div className={styles.contactCard} variants={itemVariants}>
                <div className={styles.cardIconWrapper}>
                  <FiClock className={styles.cardIcon} />
                </div>
                <div className={styles.cardContent}>
                  <h3>{t("contact.hoursTitle")}</h3>
                  <p>Mon-Fri: 9am - 6pm</p>
                  <p>Sat: 10am - 4pm</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        <div className={styles.pawPrints}>
          <motion.span 
            className={`${styles.pawPrint} ${styles.paw1}`}
            animate={{ 
              y: ["0px", "-20px", "0px"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 5,
              ease: "easeInOut" 
            }}
          >
            <FaPaw />
          </motion.span>
          <motion.span 
            className={`${styles.pawPrint} ${styles.paw2}`}
            animate={{ 
              y: ["0px", "-20px", "0px"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 7,
              delay: 1,
              ease: "easeInOut" 
            }}
          >
            <FaPaw />
          </motion.span>
          <motion.span 
            className={`${styles.pawPrint} ${styles.paw3}`}
            animate={{ 
              y: ["0px", "-20px", "0px"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 6,
              delay: 2,
              ease: "easeInOut" 
            }}
          >
            <FaPaw />
          </motion.span>
          <motion.span 
            className={`${styles.pawPrint} ${styles.paw4}`}
            animate={{ 
              y: ["0px", "-20px", "0px"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              delay: 3,
              ease: "easeInOut" 
            }}
          >
            <FaPaw />
          </motion.span>
          <motion.span 
            className={`${styles.pawPrint} ${styles.paw5}`}
            animate={{ 
              y: ["0px", "-20px", "0px"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 9,
              delay: 4,
              ease: "easeInOut" 
            }}
          >
            <FaPaw />
          </motion.span>
        </div>
      </section>
      
      {/* Contact Form Section */}
      <section className={styles.formSection} ref={formSectionRef}>
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <motion.div 
              className={styles.formContent}
              variants={sectionVariants}
              initial="hidden"
              animate={isFormInView ? "visible" : "hidden"}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTag}>
                  <FaPaw className={styles.tagIcon} />
                  {t("contact.getInTouch")}
                </span>
                <h2>{t("contact.formTitle")}</h2>
                <p>{t("contact.formSubtitle")}</p>
              </div>
              
              <form ref={formRef} onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">{t("contact.form.name")}</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formState.name}
                      onChange={handleInputChange}
                      className={formErrors.name ? styles.inputError : ""}
                      placeholder={t("contact.form.namePlaceholder")}
                    />
                    {formErrors.name && <div className={styles.errorMessage}>{formErrors.name}</div>}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email">{t("contact.form.email")}</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formState.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? styles.inputError : ""}
                      placeholder={t("contact.form.emailPlaceholder")}
                    />
                    {formErrors.email && <div className={styles.errorMessage}>{formErrors.email}</div>}
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="subject">{t("contact.form.subject")}</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={formState.subject}
                    onChange={handleInputChange}
                    placeholder={t("contact.form.subjectPlaceholder")}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message">{t("contact.form.message")}</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="5" 
                    value={formState.message}
                    onChange={handleInputChange}
                    className={formErrors.message ? styles.inputError : ""}
                    placeholder={t("contact.form.messagePlaceholder")}
                  ></textarea>
                  {formErrors.message && <div className={styles.errorMessage}>{formErrors.message}</div>}
                </div>
                
                <motion.button 
                  type="submit" 
                  className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ""}`}
                  disabled={isSubmitting}
                  whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(130, 71, 245, 0.25)" }}
                  whileTap={{ y: -2 }}
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner}></span>
                      {t("contact.form.sending")}
                    </>
                  ) : (
                    <>
                      <FiSend />
                      {t("contact.form.send")}
                    </>
                  )}
                </motion.button>
                
                {submitSuccess && (
                  <motion.div 
                    className={styles.successMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <FaPaw className={styles.successIcon} />
                    {t("contact.form.successMessage")}
                  </motion.div>
                )}
                
                {submitError && (
                  <motion.div 
                    className={styles.errorMessageSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {submitError}
                  </motion.div>
                )}
              </form>
            </motion.div>
            
            <motion.div 
              className={styles.formImageWrapper}
              variants={sectionVariants}
              initial="hidden"
              animate={isFormInView ? "visible" : "hidden"}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className={styles.formImage}>
                <img src="https://img.freepik.com/free-photo/cute-pet-collage-isolated_23-2150007407.jpg?ga=GA1.1.2063903997.1746364638&semt=ais_hybrid&w=740" alt="Happy pets" />
                <div className={styles.imageOverlay}>
                  <div className={styles.socialLinks}>
                    <motion.a 
                      href="#twitter" 
                      aria-label="Twitter"
                      whileHover={{ y: -5, backgroundColor: "#8247f5", color: "white" }}
                    >
                      <FaTwitter />
                    </motion.a>
                    <motion.a 
                      href="#facebook" 
                      aria-label="Facebook"
                      whileHover={{ y: -5, backgroundColor: "#8247f5", color: "white" }}
                    >
                      <FaFacebookF />
                    </motion.a>
                    <motion.a 
                      href="#instagram" 
                      aria-label="Instagram"
                      whileHover={{ y: -5, backgroundColor: "#8247f5", color: "white" }}
                    >
                      <FaInstagram />
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className={styles.mapSection} ref={mapSectionRef}>
        <div className={styles.container}>
          <motion.div 
            className={styles.sectionHeader}
            variants={sectionVariants}
            initial="hidden"
            animate={isMapInView ? "visible" : "hidden"}
          >
            <span className={styles.sectionTag}>
              <FiMapPin className={styles.tagIcon} />
              {t("contact.findUs")}
            </span>
            <h2>{t("contact.visitTitle")}</h2>
            <p>{t("contact.visitSubtitle")}</p>
          </motion.div>
          
          <motion.div 
            className={styles.mapWrapper}
            variants={sectionVariants}
            initial="hidden"
            animate={isMapInView ? "visible" : "hidden"}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={styles.mapContainer} ref={mapRef}>
              <motion.div 
                className={`${styles.mapPlaceholder}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: mapLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {mapLoaded ? (
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53477874.34360895!2d-82.39948998399963!3d35.10595136765524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x697654ff1f55be4f%3A0x7b37492a416b52ed!2sThe%20Pawsome%20Co.!5e0!3m2!1str!2saz!4v1746795588194!5m2!1str!2saz" width="100%" height="450" style={{border:0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                ) : (
                  <div className={styles.mapLoading}>
                    <span className={styles.mapSpinner}></span>
                    <p>{t("contact.loadingMap")}</p>
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                className={styles.locationCard}
                variants={itemVariants}
                initial="hidden"
                animate={isMapInView && mapLoaded ? "visible" : "hidden"}
              >
                <h3>{t("contact.storeName")}</h3>
                <div className={styles.locationDetail}>
                  <FiMapPin />
                  <span>{t("contact.address")}</span>
                </div>
                <div className={styles.locationDetail}>
                  <FiPhone />
                  <span>{t("contact.phonenumber")}</span>
                </div>
                <div className={styles.locationDetail}>
                  <FiMail />
                  <span>{t("contact.emailaddres1")}</span>
                </div>
                <motion.a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className={styles.directionsButton}
                  whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(130, 71, 245, 0.2)" }}
                >
                  {t("contact.getDirections")}
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* FAQ Teaser */}
      <section className={styles.faqTeaser} ref={faqRef}>
        <div className={styles.container}>
          <motion.div 
            className={styles.faqContent}
            variants={sectionVariants}
            initial="hidden"
            animate={isFaqInView ? "visible" : "hidden"}
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTag}>
                <FaPaw className={styles.tagIcon} />
                {t("contact.faqTitle")}
              </span>
              <h2>{t("contact.faqHeading")}</h2>
              <p>{t("contact.faqSubtitle")}</p>
            </div>
            
            <div className={styles.faqLink}>
              <motion.a 
                href="/faq" 
                className={styles.viewAllButton}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 20px rgba(130, 71, 245, 0.25)" 
                }}
              >
                {t("contact.viewAllFaq")}
              </motion.a>
            </div>
          </motion.div>
        </div>
        
        <div className={styles.pawPrintsAlt}>
          <motion.span 
            className={`${styles.pawPrintAlt} ${styles.pawAlt1}`}
            animate={{ 
              y: ["0px", "-30px", "0px"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 9,
              ease: "easeInOut" 
            }}
          >
            <FaPaw />
          </motion.span>
          <motion.span 
            className={`${styles.pawPrintAlt} ${styles.pawAlt2}`}
            animate={{ 
              y: ["0px", "-30px", "0px"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 7,
              delay: 2,
              ease: "easeInOut" 
            }}
          >
            <FaPaw />
          </motion.span>
          <motion.span 
            className={`${styles.pawPrintAlt} ${styles.pawAlt3}`}
            animate={{ 
              y: ["0px", "-30px", "0px"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              delay: 1,
              ease: "easeInOut" 
            }}
          >
            <FaPaw />
          </motion.span>
        </div>
      </section>
    </div>
  );
};

export default Contact;