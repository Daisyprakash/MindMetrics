/**
 * Password Validation Utility
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = []
  let strengthScore = 0

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else {
    strengthScore++
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    strengthScore++
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    strengthScore++
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    strengthScore++
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)')
  } else {
    strengthScore++
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (strengthScore >= 4 && password.length >= 10) {
    strength = 'strong'
  } else if (strengthScore >= 3) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

export const getPasswordStrengthColor = (strength: 'weak' | 'medium' | 'strong'): string => {
  switch (strength) {
    case 'strong':
      return 'bg-green-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'weak':
      return 'bg-red-500'
    default:
      return 'bg-gray-300'
  }
}

