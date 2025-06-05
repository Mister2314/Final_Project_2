import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  loginUser,
  loginAdmin,
  registerUser,
  logoutUser,
  checkAuth,
  updateUserProfile,
  clearError
} from '../slices/userSlice';
import { validateEmail, validatePassword, validateUsername, getValidationError } from '../../utils/validation';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error, isAuthenticated } = useSelector(state => state.user);

  const login = async (credentials) => {
    try {
      if (!validateEmail(credentials.email)) {
        toast.error('Email formatı düzgün deyil');
        return { success: false, error: 'Invalid email format' };
      }

      const result = await dispatch(loginUser(credentials));
      
      if (loginUser.fulfilled.match(result)) {
        toast.success('Uğurla daxil oldunuz!');
        return { success: true, data: result.payload };
      } else if (loginUser.rejected.match(result)) {
        let errorMessage = result.payload || 'Daxil olma uğursuz';
        
        if (errorMessage.includes('password')) {
          errorMessage = 'Parol səhvdir';
        } else if (errorMessage.includes('email') || errorMessage.includes('user')) {
          errorMessage = 'Bu email ilə istifadəçi tapılmadı';
        }
        
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error?.message || 'Daxil olma uğursuz';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const adminLogin = async (credentials) => {
    try {
      if (!validateEmail(credentials.email)) {
        toast.error('Email formatı düzgün deyil');
        return { success: false, error: 'Invalid email format' };
      }

      const result = await dispatch(loginAdmin(credentials));
      
      if (loginAdmin.fulfilled.match(result)) {
        toast.success('Admin daxil olma uğurlu!');
        return { success: true, data: result.payload };
      } else if (loginAdmin.rejected.match(result)) {
        const errorMessage = result.payload;
        if (errorMessage === 'You are not an admin') {
          toast.error('Siz admin deyilsiniz');
        } else {
          toast.error('Email və ya parol səhvdir');
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error?.message || 'Daxil olma uğursuz';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const emailError = getValidationError('email', userData.email);
      if (emailError) {
        toast.error(emailError);
        return { success: false, error: emailError };
      }

      const passwordError = getValidationError('password', userData.password);
      if (passwordError) {
        toast.error(passwordError);
        return { success: false, error: passwordError };
      }

      const usernameError = getValidationError('username', userData.username);
      if (usernameError) {
        toast.error(usernameError);
        return { success: false, error: usernameError };
      }

      const result = await dispatch(registerUser(userData));
      
      if (registerUser.fulfilled.match(result)) {
        toast.success('Qeydiyyat uğurla tamamlandı!');
        return { success: true, data: result.payload };
      } else if (registerUser.rejected.match(result)) {
        let errorMessage = result.payload || 'Qeydiyyat uğursuz oldu';
        
        if (errorMessage.includes('email')) {
          errorMessage = 'Bu email artıq istifadə olunur';
        } else if (errorMessage.includes('username')) {
          errorMessage = 'Bu istifadəçi adı artıq mövcuddur';
        } else if (errorMessage.includes('password')) {
          errorMessage = 'Parol tələblərə uyğun deyil';
        }
        
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error?.message || 'Qeydiyyat uğursuz oldu';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const result = await dispatch(logoutUser());
      
      if (logoutUser.fulfilled.match(result)) {
        toast.success('Uğurla çıxış etdiniz');
        return { success: true };
      } else {
        toast.error('Çıxış etmə uğursuz');
        return { success: false };
      }
    } catch (error) {
      const errorMessage = error?.message || 'Çıxış etmə uğursuz';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (id, userData) => {
    try {
      if (userData.email && !validateEmail(userData.email)) {
        toast.error('Email formatı düzgün deyil');
        return { success: false, error: 'Invalid email format' };
      }

      if (userData.username && !validateUsername(userData.username)) {
        const usernameError = getValidationError('username', userData.username);
        toast.error(usernameError);
        return { success: false, error: usernameError };
      }

      if (userData.password && !validatePassword(userData.password)) {
        const passwordError = getValidationError('password', userData.password);
        toast.error(passwordError);
        return { success: false, error: passwordError };
      }

      const result = await dispatch(updateUserProfile({ id, userData })).unwrap();
      
      toast.success('Profil uğurla yeniləndi!');
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error?.message || error || 'Yeniləmə uğursuz';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const checkUserAuth = async () => {
    try {
      const result = await dispatch(checkAuth());
      return { success: true, data: result.payload };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
    checkAuth: checkUserAuth,
    clearError: clearAuthError
  };
};