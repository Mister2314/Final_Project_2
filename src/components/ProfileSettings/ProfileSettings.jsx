import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import { FiUser, FiMail, FiLock, FiCheckCircle, FiAlertCircle, FiEdit2 } from "react-icons/fi";
import { FaPaw } from "react-icons/fa";
import toast from "react-hot-toast";
import styles from "./ProfileSettings.module.css";
import { supabase } from "../../supabaseClient";

const ProfileSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user, updateUser } = useUser();
  
  const previousPath = location.state?.from || '/';
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ password: false });
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          setLoading(true);
                    let usernameToSet = "";
          if (user.user_metadata && user.user_metadata.username) {
            usernameToSet = user.user_metadata.username;
          } else if (user.user_metadata && user.user_metadata.full_name) {
            usernameToSet = user.user_metadata.full_name;
          } else {
            const { data, error } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', user.id)
              .single();
            
            if (data && data.username) {
              usernameToSet = data.username;
            }
          }
          
          setUsername(usernameToSet || "");
          setEmail(user.email || "");
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error(t("profileSettings.errors.fetchFailed"));
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login", { state: { from: "/profile-settings" } });
      }
    };

    fetchUserProfile();
  }, [user, navigate, t]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    
    if (!currentPassword) {
      newErrors.currentPassword = t("profileSettings.errors.currentPasswordRequired");
    }
    
    if (!newPassword) {
      newErrors.newPassword = t("profileSettings.errors.newPasswordRequired");
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t("profileSettings.errors.passwordMinLength");
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t("profileSettings.errors.confirmPasswordRequired");
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("profileSettings.errors.passwordMismatch");
    }
    
    if (newErrors.currentPassword || newErrors.newPassword || newErrors.confirmPassword) {
      setErrors({ ...errors, ...newErrors });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
      
      setSuccess({ ...success, password: true });
      toast.success(t("profileSettings.passwordUpdateSuccess"));
      
      setTimeout(() => {
        setSuccess({ ...success, password: false });
      }, 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setErrors({
        ...errors,
        currentPassword: t("profileSettings.errors.incorrectPassword"),
      });
      toast.error(t("profileSettings.errors.passwordUpdateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({
      ...errors,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleBackButton = () => {
    navigate(previousPath);
  };

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.pawLoaderContainer}>
          <div className={styles.pawLoader}>
            <div className={styles.pawPrint}></div>
            <div className={styles.pawPrint}></div>
            <div className={styles.pawPrint}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileSettingsContainer}>
      <div className={styles.profileSettingsCard}>
        <div className={styles.backButtonContainer}>
          <button className={styles.backButton} onClick={handleBackButton}>
            <span className={styles.backIcon}>&#8592;</span>
            <span>{t('profileSettings.back')}</span>
          </button>
        </div>
        
        <div className={styles.profileHeader}>
          <FaPaw className={styles.profileIcon} />
          <h1 className={styles.profileTitle}>{t("profileSettings.title")}</h1>
        </div>

        <div className={styles.settingsSections}>
          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <FiUser className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>{t("profileSettings.usernameSection")}</h2>
              </div>
            </div>
            <div className={styles.displayField}>
              <span className={styles.fieldValue}>{username || t("profileSettings.noUsername")}</span>
              <span className={styles.readOnlyBadge}>{t("profileSettings.readOnly")}</span>
            </div>
          </div>

          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <FiMail className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>{t("profileSettings.emailSection")}</h2>
              </div>
            </div>
            <div className={styles.displayField}>
              <span className={styles.fieldValue}>{email}</span>
              <span className={styles.readOnlyBadge}>{t("profileSettings.readOnly")}</span>
            </div>
          </div>

          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <FiLock className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>{t("profileSettings.passwordSection")}</h2>
              </div>
              {!changingPassword && (
                <button 
                  className={styles.editButton} 
                  onClick={() => setChangingPassword(true)}
                  aria-label={t("profileSettings.changePassword")}
                >
                  <FiEdit2 />
                </button>
              )}
            </div>

            {changingPassword ? (
              <form onSubmit={handlePasswordSubmit} className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>{t("profileSettings.currentPassword")}</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (errors.currentPassword) 
                        setErrors({ ...errors, currentPassword: "" });
                    }}
                    className={`${styles.settingsInput} ${
                      errors.currentPassword ? styles.inputError : ""
                    }`}
                    placeholder={t("profileSettings.currentPasswordPlaceholder")}
                    disabled={loading}
                  />
                  {errors.currentPassword && (
                    <div className={styles.errorMessage}>
                      <FiAlertCircle />
                      {errors.currentPassword}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>{t("profileSettings.newPassword")}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.newPassword) 
                        setErrors({ ...errors, newPassword: "" });
                    }}
                    className={`${styles.settingsInput} ${
                      errors.newPassword ? styles.inputError : ""
                    }`}
                    placeholder={t("profileSettings.newPasswordPlaceholder")}
                    disabled={loading}
                  />
                  {errors.newPassword && (
                    <div className={styles.errorMessage}>
                      <FiAlertCircle />
                      {errors.newPassword}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>{t("profileSettings.confirmPassword")}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) 
                        setErrors({ ...errors, confirmPassword: "" });
                    }}
                    className={`${styles.settingsInput} ${
                      errors.confirmPassword ? styles.inputError : ""
                    }`}
                    placeholder={t("profileSettings.confirmPasswordPlaceholder")}
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <div className={styles.errorMessage}>
                      <FiAlertCircle />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    {t("profileSettings.cancel")}
                  </button>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className={styles.pawLoaderContainer}>
                        <div className={styles.pawLoader}>
                          <div className={styles.pawPrint}></div>
                          <div className={styles.pawPrint}></div>
                          <div className={styles.pawPrint}></div>
                        </div>
                      </div>
                    ) : (
                      t("profileSettings.save")
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.displayField}>
                <span className={styles.fieldValue}>••••••••</span>
                {success.password && (
                  <span className={styles.successMessage}>
                    <FiCheckCircle />
                    {t("profileSettings.updated")}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;