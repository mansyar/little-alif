import { describe, expect, it } from 'vitest';
import en from './en/index';
import id from './id/index';

const EXPECTED_KEYS = [
  // Auth
  'LOGIN_TITLE',
  'LOGIN_SUBTITLE',
  'LOGIN_EMAIL',
  'LOGIN_PASSWORD',
  'LOGIN_SUBMIT',
  'LOGIN_SUBMITTING',
  'LOGIN_SIGNUP_LINK',
  'REGISTER_TITLE',
  'REGISTER_SUBTITLE',
  'REGISTER_SUBMIT',
  'REGISTER_SUBMITTING',
  'REGISTER_PASSWORD_HINT',
  'REGISTER_SIGNIN_LINK',
  // Dashboard
  'DASHBOARD_TITLE',
  'DASHBOARD_ADD_CHILD',
  'DASHBOARD_NO_CHILDREN',
  // Letters
  'LETTERS_SHOW',
  'LETTERS_HIDE',
  // Child Mode
  'CHILDMODE_ENABLE',
  'CHILDMODE_DISABLE',
  'CHILDMODE_ACTIVE',
  // Profile
  'PROFILE_NAME',
  'PROFILE_AVATAR',
  'PROFILE_SAVE',
  'PROFILE_DELETE',
  'PROFILE_DELETE_CONFIRM',
  // Locale
  'LOCALE_SWITCH',
  // Errors
  'ERROR_GENERIC',
  'ERROR_INVALID_EMAIL',
  'ERROR_SHORT_PASSWORD',
] as const;

describe('English translations (en)', () => {
  it('exports all expected translation keys', () => {
    for (const key of EXPECTED_KEYS) {
      expect(en).toHaveProperty(key);
    }
  });

  it('has non-empty string values for all keys', () => {
    for (const key of EXPECTED_KEYS) {
      expect(en[key]).toBeTruthy();
      expect(typeof en[key]).toBe('string');
    }
  });
});

describe('Indonesian translations (id)', () => {
  it('exports all expected translation keys', () => {
    for (const key of EXPECTED_KEYS) {
      expect(id).toHaveProperty(key);
    }
  });

  it('has non-empty string values for all keys', () => {
    for (const key of EXPECTED_KEYS) {
      expect(id[key]).toBeTruthy();
      expect(typeof id[key]).toBe('string');
    }
  });
});
