import { z } from 'zod';
import { Role } from '../../types/erp';

/**
 * Regex for detecting HTML tags, script injections, and dangerous protocol handlers.
 * Any input matching these patterns in free-text fields will be strictly rejected.
 */
export const SCRIPT_OR_HTML_TAG_REGEX = /<[^>]*>|javascript:|data:text\/html|vbscript:|onload\s*=|onerror\s*=|onclick\s*=|onmouseover\s*=/i;

/**
 * Regex for detecting basic SQL injection patterns / comment probes
 */
export const SQL_INJECTION_PROBE_REGEX = /('(\s|%20)*(or|and|union|select|insert|delete|drop|update|exec|declare)(\s|%20)+)|(--)|(\/\*)/i;

/**
 * Checks if a string contains any malicious script, HTML tag, or injection payloads.
 */
export function containsMaliciousPayload(val: string): { isMalicious: boolean; reason?: string } {
  if (!val || typeof val !== 'string') return { isMalicious: false };

  // Check for null bytes (poison null byte attack)
  if (val.includes('\0') || val.includes('\\x00') || val.includes('%00')) {
    return { isMalicious: true, reason: 'NULL_BYTE_INJECTION' };
  }

  // Check for script tags or HTML tags
  if (SCRIPT_OR_HTML_TAG_REGEX.test(val)) {
    return { isMalicious: true, reason: 'HTML_SCRIPT_TAG_DETECTED' };
  }

  // Check for SQL injection probes
  if (SQL_INJECTION_PROBE_REGEX.test(val)) {
    return { isMalicious: true, reason: 'SQLI_PROBE_DETECTED' };
  }

  // Check for carriage return line feed (CRLF) in non-multiline fields
  if (/[\r\n]/.test(val)) {
    return { isMalicious: true, reason: 'CRLF_INJECTION' };
  }

  return { isMalicious: false };
}

/**
 * Field-by-Field Strict Validation Schemas
 */

// 1. Email Field
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .trim()
  .min(3, 'Email too short')
  .max(254, 'Email exceeds RFC 5321 maximum length of 254 characters')
  .email('Invalid email address format')
  .refine((val) => !containsMaliciousPayload(val).isMalicious, {
    message: 'Malformed email address format or forbidden characters',
  })
  .transform((val) => val.toLowerCase());

// 2. Password Field
export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must not exceed 128 characters')
  .refine((val) => !val.includes('\0'), {
    message: 'Password contains invalid control characters',
  })
  .refine((val) => !SCRIPT_OR_HTML_TAG_REGEX.test(val), {
    message: 'Password contains forbidden tag payload',
  });

// 3. Username / Identifier Field
export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must not exceed 50 characters')
  .regex(/^[a-zA-Z0-9._@-]+$/, 'Username must only contain alphanumeric characters, dots, hyphens, and underscores')
  .refine((val) => !containsMaliciousPayload(val).isMalicious, {
    message: 'Username contains forbidden characters or scripts',
  });

// 4. Name / Full Name Field
export const nameSchema = z
  .string()
  .min(1, 'Full name is required')
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .refine((val) => !containsMaliciousPayload(val).isMalicious, {
    message: 'Name contains disallowed HTML/script tags or control characters',
  });

// 5. School Campus ID
export const schoolIdSchema = z
  .string()
  .trim()
  .min(3, 'Invalid school campus identifier')
  .max(100, 'School campus identifier too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid school ID characters')
  .optional()
  .default('school-sharda-rajkot');

// 6. Role Enum & Signup Allowed Roles
export const roleSchema = z.enum([
  'SUPER_ADMIN',
  'PRINCIPAL',
  'TEACHER',
  'STUDENT',
  'PARENT',
]);

// Self-registration is strictly restricted to Students and Parents only
// Principals and Teachers are provisioned exclusively by the Super Admin
export const publicSignupRoleSchema = z.enum(['STUDENT', 'PARENT'], {
  message: 'Faculty and Principal accounts cannot be self-registered. They are provisioned exclusively by the Super Admin.',
});

// 7. TOTP MFA Code
export const totpCodeSchema = z
  .string()
  .min(1, 'TOTP code is required')
  .trim()
  .regex(/^\d{6}$/, 'TOTP verification code must be exactly 6 numeric digits');

/**
 * Composite Auth Request Schemas
 */

// Login Request Schema
export const serverLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  schoolId: schoolIdSchema,
});

export type ServerLoginInput = z.infer<typeof serverLoginSchema>;

// Signup / User Registration Request Schema (Strict Public Self-Registration)
export const serverSignupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  username: usernameSchema.optional(),
  password: passwordSchema,
  role: publicSignupRoleSchema.default('STUDENT'),
  schoolId: schoolIdSchema,
  phone: z
    .string()
    .trim()
    .max(20, 'Phone number too long')
    .regex(/^[\d\s+\-()]+$/, 'Invalid phone number format')
    .optional(),
});

export type ServerSignupInput = z.infer<typeof serverSignupSchema>;

// MFA Verification Request Schema
export const serverMfaVerifySchema = z.object({
  totpCode: totpCodeSchema,
  email: emailSchema.optional(),
  userId: z.string().trim().max(100).optional(),
});

export type ServerMfaVerifyInput = z.infer<typeof serverMfaVerifySchema>;

/**
 * Standard Generic Error Message
 * Prevents field enumeration, timing leaks, or username discovery attacks.
 */
export const GENERIC_AUTH_ERROR = 'Invalid authentication credentials or malformed request format. Please verify your input and try again.';
export const GENERIC_AUTH_ERROR_GU = 'અમાન્ય ઓળખપત્રો અથવા અયોગ્ય વિનંતી ફોર્મેટ. કૃપા કરીને તમારી વિગતો ચકાસી ફરી પ્રયાસ કરો.';
