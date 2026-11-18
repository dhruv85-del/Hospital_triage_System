/**
 * Clinical Form Validation Utilities
 */

export function validatePhone(phone) {
  if (!phone) return 'Phone number is required';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 10) return 'Please enter a valid 10-digit phone number';
  return null;
}

export function validateEmail(email) {
  if (!email) return null; // optional in some forms
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateAge(age) {
  const num = parseInt(age, 10);
  if (isNaN(num) || num < 0 || num > 130) {
    return 'Please enter a valid age between 0 and 130';
  }
  return null;
}
