import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../redux/hooks/useAuth";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../redux/slices/userSlice";
import { FiUser, FiMail, FiLock, FiCheckCircle, FiAlertCircle, FiEdit2, FiSave, FiX } from "react-icons/fi";
import { FaPaw } from "react-icons/fa";
import { errorToast, successToast } from '../../utils/toast';
import { supabase } from "../../supabaseClient";
import styles from "./ProfileSettings.module.css";

const ProfileSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const previousPath = location.state?.from || '/';
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  
  const [tempUsername, setTempUsername] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ username: false, email: false, password: false });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) {
        navigate("/login", { state: { from: "/profile-settings" } });
        return;
      }

      if (user) {
        try {
          setLoading(true);
          let usernameToSet = "";
          
          if (user.username) {
            usernameToSet = user.username;
          } else if (user.user_metadata && user.user_metadata.username) {
            usernameToSet = user.user_metadata.username;
          } else if (user.user_metadata && user.user_metadata.full_name) {
            usernameToSet = user.user_metadata.full_name;
          }
          
          setUsername(usernameToSet || "");
          setTempUsername(usernameToSet || "");
          setEmail(user.email || "");
          setTempEmail(user.email || "");
        } catch (error) {
          errorToast('profileSettings.errors.fetchFailed');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user, isAuthenticated, navigate, t]);

  const handleUsernameSubmit = async () => {
    if (!tempUsername.trim()) {
      setErrors({ ...errors, username: t("profileSettings.errors.usernameRequired") });
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(updateUserProfile({
        id: user.id,
        userData: { username: tempUsername.trim() }
      }));

      if (updateUserProfile.fulfilled.match(result)) {
        setUsername(tempUsername);
        setEditingUsername(false);
        setSuccess({ ...success, username: true });
        successToast('profileSettings.usernameUpdateSuccess');
        
        setTimeout(() => {
          setSuccess({ ...success, username: false });
        }, 3000);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      setErrors({ ...errors, username: t("profileSettings.errors.usernameUpdateFailed") });
      errorToast('profileSettings.errors.usernameUpdateFailed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!tempEmail.trim()) {
      setErrors({ ...errors, email: t("profileSettings.errors.emailRequired") });
      return;
    }
    
    if (!emailRegex.test(tempEmail)) {
      setErrors({ ...errors, email: t("profileSettings.errors.emailInvalid") });
      return;
    }

    setLoading(true);
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', tempEmail.trim())
        .neq('id', user.id)
        .single();

      if (existingUser) {
        setErrors({ ...errors, email: t("profileSettings.errors.emailExists") });
        setLoading(false);
        return;
      }

      const result = await dispatch(updateUserProfile({
        id: user.id,
        userData: { email: tempEmail.trim() }
      }));

      if (updateUserProfile.fulfilled.match(result)) {
        setEmail(tempEmail);
        setEditingEmail(false);
        setSuccess({ ...success, email: true });
        successToast('profileSettings.emailUpdateSuccess');
        
        setTimeout(() => {
          setSuccess({ ...success, email: false });
        }, 3000);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      setErrors({ ...errors, email: t("profileSettings.errors.emailUpdateFailed") });
      errorToast('profileSettings.errors.emailUpdateFailed');
    } finally {
      setLoading(false);
    }
  };

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
      const { data: userData, error: verifyError } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .eq('password', currentPassword)
        .single();

      if (verifyError || !userData) {
        setErrors({
          ...errors,
          currentPassword: t("profileSettings.errors.incorrectPassword"),
        });
        setLoading(false);
        return;
      }

      const result = await dispatch(updateUserProfile({
        id: user.id,
        userData: { password: newPassword }
      }));

      if (updateUserProfile.fulfilled.match(result)) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setEditingPassword(false);
        
        setSuccess({ ...success, password: true });
        successToast('profileSettings.passwordUpdateSuccess');
        
        setTimeout(() => {
          setSuccess({ ...success, password: false });
        }, 3000);
      } else {
        throw new Error('Password update failed');
      }
    } catch (error) {
      errorToast('profileSettings.errors.passwordUpdateFailed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUsernameEdit = () => {
    setEditingUsername(false);
    setTempUsername(username);
    setErrors({ ...errors, username: "" });
  };

  const handleCancelEmailEdit = () => {
    setEditingEmail(false);
    setTempEmail(email);
    setErrors({ ...errors, email: "" });
  };

  const handleCancelPasswordEdit = () => {
    setEditingPassword(false);
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

  if (authLoading || (!user && isAuthenticated)) {
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.profileSettingsContainer}>
      <div className={styles.profileSettingsCard}>
        <div className={styles.backButtonContainer}>
          <button className={styles.backButton} onClick={handleBackButton}>
            <span className={styles.backIcon}>&#8592;</span>
            <span className={styles.backText}>{t('profileSettings.back')}</span>
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
              {!editingUsername && (
                <button 
                  className={styles.editButton} 
                  onClick={() => setEditingUsername(true)}
                  aria-label={t("profileSettings.editUsername")}
                >
                  <FiEdit2 />
                </button>
              )}
            </div>

            {editingUsername ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>{t("profileSettings.username")}</label>
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => {
                      setTempUsername(e.target.value);
                      if (errors.username) 
                        setErrors({ ...errors, username: "" });
                    }}
                    className={`${styles.settingsInput} ${
                      errors.username ? styles.inputError : ""
                    }`}
                    placeholder={t("profileSettings.usernamePlaceholder")}
                    disabled={loading}
                  />
                  {errors.username && (
                    <div className={styles.errorMessage}>
                      <FiAlertCircle />
                      {errors.username}
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelUsernameEdit}
                    disabled={loading}
                  >
                    <FiX />
                  </button>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handleUsernameSubmit}
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
                      <FiSave />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.displayField}>
                <span className={styles.fieldValue}>{username || t("profileSettings.noUsername")}</span>
                {success.username && (
                  <span className={styles.successMessage}>
                    <FiCheckCircle />
                    {t("profileSettings.updated")}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <FiMail className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>{t("profileSettings.emailSection")}</h2>
              </div>
              {!editingEmail && (
                <button 
                  className={styles.editButton} 
                  onClick={() => setEditingEmail(true)}
                  aria-label={t("profileSettings.editEmail")}
                >
                  <FiEdit2 />
                </button>
              )}
            </div>

            {editingEmail ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>{t("profileSettings.email")}</label>
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => {
                      setTempEmail(e.target.value);
                      if (errors.email) 
                        setErrors({ ...errors, email: "" });
                    }}
                    className={`${styles.settingsInput} ${
                      errors.email ? styles.inputError : ""
                    }`}
                    placeholder={t("profileSettings.emailPlaceholder")}
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className={styles.errorMessage}>
                      <FiAlertCircle />
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelEmailEdit}
                    disabled={loading}
                  >
                    <FiX />
                  </button>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handleEmailSubmit}
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
                      <FiSave />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.displayField}>
                <span className={styles.fieldValue}>{email}</span>
                {success.email && (
                  <span className={styles.successMessage}>
                    <FiCheckCircle />
                    {t("profileSettings.updated")}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <FiLock className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>{t("profileSettings.passwordSection")}</h2>
              </div>
              {!editingPassword && (
                <button 
                  className={styles.editButton} 
                  onClick={() => setEditingPassword(true)}
                  aria-label={t("profileSettings.changePassword")}
                >
                  <FiEdit2 />
                </button>
              )}
            </div>

            {editingPassword ? (
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
                    onClick={handleCancelPasswordEdit}
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