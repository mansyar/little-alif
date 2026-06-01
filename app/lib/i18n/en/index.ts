import type { BaseTranslation } from '../i18n-types';

const en = {
  // Auth
  LOGIN_TITLE: 'Parent Login',
  LOGIN_SUBTITLE: 'Sign in to manage your child profiles.',
  LOGIN_EMAIL: 'Email',
  LOGIN_PASSWORD: 'Password',
  LOGIN_SUBMIT: 'Sign in',
  LOGIN_SUBMITTING: 'Signing in\u2026',
  LOGIN_SIGNUP_LINK: 'No account? Create one',
  REGISTER_TITLE: 'Create Account',
  REGISTER_SUBTITLE: 'A parent account is the first step in your child\u2019s learning journey.',
  REGISTER_SUBMIT: 'Create account',
  REGISTER_SUBMITTING: 'Creating account\u2026',
  REGISTER_PASSWORD_HINT: 'At least 8 characters.',
  REGISTER_SIGNIN_LINK: 'Already have an account? Sign in',

  // Dashboard
  DASHBOARD_TITLE: 'Dashboard',
  DASHBOARD_ADD_CHILD: 'Add Child',
  DASHBOARD_NO_CHILDREN: 'No child profiles yet. Add one to get started.',
  DASHBOARD_SIGN_OUT: 'Sign out',
  DASHBOARD_SIGNING_OUT: 'Signing out\u2026',

  // Letters
  LETTERS_SHOW: 'Show',
  LETTERS_HIDE: 'Hide',

  // Child Mode
  CHILDMODE_ENABLE: 'Enable Child Mode',
  CHILDMODE_DISABLE: 'Disable Child Mode',
  CHILDMODE_ACTIVE: 'Child Mode is active',

  // Profile
  PROFILE_NAME: 'Name',
  PROFILE_AVATAR: 'Avatar',
  PROFILE_EDIT: 'Edit',
  PROFILE_SAVE: 'Save',
  PROFILE_CANCEL: 'Cancel',
  PROFILE_ADD_TITLE: 'Add Child Profile',
  PROFILE_EDIT_TITLE: 'Edit Child Profile',
  PROFILE_DELETE: 'Delete',
  PROFILE_DELETE_CONFIRM: 'Are you sure you want to delete this profile?',
  PROFILE_MANAGE_LETTERS: 'Manage Letters',
  PROFILE_LETTERS_LABEL: 'introduced',

  // Locale
  LOCALE_SWITCH: 'Bahasa Indonesia',

  // Errors
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_INVALID_EMAIL: 'Please enter a valid email address.',
  ERROR_SHORT_PASSWORD: 'Password must be at least 8 characters.',
} satisfies BaseTranslation;

export default en;
