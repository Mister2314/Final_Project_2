import { createRegex, Patterns } from "human-regex";

export const ValidationPatterns = {
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/,
  
  email: Patterns.email(),
  
  username: createRegex()
    .startAnchor()
    .anyCharacter()
    .between(4, 20)
    .endAnchor()
    .toRegExp()
};

export const validateEmail = (email) => {
  return ValidationPatterns.email.test(email);
};

export const validatePassword = (password) => {
  return ValidationPatterns.password.test(password);
};

export const validateUsername = (username) => {
  return ValidationPatterns.username.test(username);
};

export const getValidationError = (field, value) => {
  switch (field) {
    case 'email':
      return !validateEmail(value) ? 'Email formatı düzgün deyil (nümunə: user@example.com)' : null;
    case 'password':
      return !validatePassword(value) ? 'Parol ən azı 8 simvol, böyük/kiçik hərf və xüsusi simvol olmalıdır' : null;
    case 'username':
      return !validateUsername(value) ? 'İstifadəçi adı 4-20 xarakter arası olmalıdır' : null;
    default:
      return null;
  }
};