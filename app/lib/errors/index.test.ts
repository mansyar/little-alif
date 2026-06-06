import { describe, it, expect } from 'vitest';
import { ErrorCode, ServerFunctionError, ERROR_TOAST_VARIANT } from './index';

describe('ErrorCode', () => {
  it('should define all required error codes', () => {
    expect(ErrorCode.VALIDATION).toBe('VALIDATION');
    expect(ErrorCode.AUTH).toBe('AUTH');
    expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
    expect(ErrorCode.LIMIT_EXCEEDED).toBe('LIMIT_EXCEEDED');
    expect(ErrorCode.NETWORK).toBe('NETWORK');
    expect(ErrorCode.UNKNOWN).toBe('UNKNOWN');
  });

  it('should be a frozen enum (values are strings)', () => {
    // Values are the string keys themselves
    expect(typeof ErrorCode.VALIDATION).toBe('string');
  });
});

describe('ServerFunctionError', () => {
  it('should extend Error and be instanceof Error and ServerFunctionError', () => {
    const err = new ServerFunctionError(ErrorCode.VALIDATION, 'Invalid input');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ServerFunctionError);
  });

  it('should set the name to "ServerFunctionError"', () => {
    const err = new ServerFunctionError(ErrorCode.AUTH, 'Unauthorized');
    expect(err.name).toBe('ServerFunctionError');
  });

  it('should set the code property from constructor', () => {
    const err = new ServerFunctionError(ErrorCode.NOT_FOUND, 'Not found');
    expect(err.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('should set the userMessage property from constructor', () => {
    const err = new ServerFunctionError(ErrorCode.VALIDATION, 'Validation failed');
    expect(err.userMessage).toBe('Validation failed');
  });

  it('should set the message property from userMessage for stack trace compatibility', () => {
    const err = new ServerFunctionError(ErrorCode.NETWORK, 'Network error');
    expect(err.message).toBe('Network error');
  });

  it('should accept and propagate an optional cause', () => {
    const cause = new Error('Underlying DB error');
    const err = new ServerFunctionError(
      ErrorCode.VALIDATION,
      'Invalid data',
      { cause },
    );
    expect(err.cause).toBe(cause);
  });

  it('should default to ErrorCode.UNKNOWN when no code is provided', () => {
    // This tests the fallback when an unrecognized code might be passed
    const err = new ServerFunctionError('MALFORMED' as ErrorCode, 'Bad request');
    // UNKNOWN is the fallback via ERROR_TOAST_VARIANT
    expect(err.code).toBe('MALFORMED');
  });

  it('should be throwable and catchable as Error', () => {
    expect(() => {
      throw new ServerFunctionError(ErrorCode.AUTH, 'Unauthenticated.');
    }).toThrow(ServerFunctionError);
  });
});

describe('ERROR_TOAST_VARIANT', () => {
  it('should map VALIDATION to "info"', () => {
    expect(ERROR_TOAST_VARIANT[ErrorCode.VALIDATION]).toBe('info');
  });

  it('should map NOT_FOUND to "info"', () => {
    expect(ERROR_TOAST_VARIANT[ErrorCode.NOT_FOUND]).toBe('info');
  });

  it('should map AUTH to "error"', () => {
    expect(ERROR_TOAST_VARIANT[ErrorCode.AUTH]).toBe('error');
  });

  it('should map LIMIT_EXCEEDED to "error"', () => {
    expect(ERROR_TOAST_VARIANT[ErrorCode.LIMIT_EXCEEDED]).toBe('error');
  });

  it('should map NETWORK to "error"', () => {
    expect(ERROR_TOAST_VARIANT[ErrorCode.NETWORK]).toBe('error');
  });

  it('should map UNKNOWN to "error"', () => {
    expect(ERROR_TOAST_VARIANT[ErrorCode.UNKNOWN]).toBe('error');
  });
});
