import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  serverLoginSchema,
  serverSignupSchema,
  serverMfaVerifySchema,
  containsMaliciousPayload,
  GENERIC_AUTH_ERROR,
} from './src/lib/validation/authSchemas';
import { logSecurityAttack, getSecurityLogs } from './src/server/securityLog';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Strict JSON payload body limit to prevent oversized request DoS
  app.use(express.json({ limit: '100kb' }));

  // Helper to extract client IP safely
  const getClientIp = (req: express.Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || '127.0.0.1';
  };

  // Helper to safely sanitize snippets before logging (strip passwords!)
  const sanitizeSnippet = (key: string, val: any): string => {
    if (key.toLowerCase().includes('password')) {
      return '[REDACTED_PASSWORD_PAYLOAD]';
    }
    if (typeof val === 'string') {
      return val.substring(0, 80);
    }
    return String(val).substring(0, 80);
  };

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ClassSec Gujarat School ERP Server',
      timestamp: new Date().toISOString(),
      security: 'Zod Server-Side Validation & Threat Guard Active',
    });
  });

  // ==========================================
  // 1. Server-Side Login Endpoint
  // Re-checks every field (email, password, schoolId) with strict Zod schema
  // ==========================================
  app.post('/api/auth/login', (req, res) => {
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const body = req.body || {};

    // 1. Deep scan for malicious payloads / XSS script tags in raw body keys & values
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        const check = containsMaliciousPayload(value);
        if (check.isMalicious) {
          logSecurityAttack({
            ip_address: clientIp,
            user_agent: userAgent,
            endpoint: '/api/auth/login',
            attack_type:
              check.reason === 'HTML_SCRIPT_TAG_DETECTED'
                ? 'XSS_HTML_INJECTION'
                : check.reason === 'SQLI_PROBE_DETECTED'
                ? 'SQLI_PROBE'
                : 'MALFORMED_INPUT',
            offending_field: key,
            sanitized_snippet: sanitizeSnippet(key, value),
            reason: `Malicious payload (${check.reason}) intercepted in field '${key}' before schema validation`,
            school_id: body.schoolId,
          });

          // Return strictly generic error without revealing attack details or field specifics
          return res.status(400).json({
            success: false,
            error: GENERIC_AUTH_ERROR,
          });
        }
      }
    }

    // 2. Strict Zod Schema Parse (Type, format, length, domain)
    const parseResult = serverLoginSchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      const failedField = firstIssue?.path?.join('.') || 'unknown_field';

      logSecurityAttack({
        ip_address: clientIp,
        user_agent: userAgent,
        endpoint: '/api/auth/login',
        attack_type: 'INVALID_SCHEMA_STRUCTURE',
        offending_field: failedField,
        sanitized_snippet: sanitizeSnippet(failedField, (body as any)[failedField]),
        reason: `Zod validation failure on field '${failedField}': ${firstIssue?.message}`,
        school_id: body.schoolId,
      });

      return res.status(400).json({
        success: false,
        error: GENERIC_AUTH_ERROR,
      });
    }

    const { email, password, schoolId } = parseResult.data;

    // Simulated / validated response (Client AuthContext reconciles with session storage)
    return res.json({
      success: true,
      validatedEmail: email,
      schoolId: schoolId,
      message: 'Server-side input validation passed successfully',
    });
  });

  // ==========================================
  // 2. Server-Side User Registration / Signup Endpoint
  // Re-checks every field (name, email, password, username, role, schoolId)
  // ==========================================
  app.post('/api/auth/register', (req, res) => {
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const body = req.body || {};

    // 1. Check for malicious payloads in free-text fields (name, username, email)
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        const check = containsMaliciousPayload(value);
        if (check.isMalicious) {
          logSecurityAttack({
            ip_address: clientIp,
            user_agent: userAgent,
            endpoint: '/api/auth/register',
            attack_type: 'XSS_HTML_INJECTION',
            offending_field: key,
            sanitized_snippet: sanitizeSnippet(key, value),
            reason: `Malicious payload (${check.reason}) detected in registration field '${key}'`,
            school_id: body.schoolId,
          });

          return res.status(400).json({
            success: false,
            error: GENERIC_AUTH_ERROR,
          });
        }
      }
    }

    // 2. Strict Zod Schema Parse
    const parseResult = serverSignupSchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      const failedField = firstIssue?.path?.join('.') || 'unknown_field';

      logSecurityAttack({
        ip_address: clientIp,
        user_agent: userAgent,
        endpoint: '/api/auth/register',
        attack_type: 'MALFORMED_INPUT',
        offending_field: failedField,
        sanitized_snippet: sanitizeSnippet(failedField, (body as any)[failedField]),
        reason: `Registration validation failed on '${failedField}': ${firstIssue?.message}`,
        school_id: body.schoolId,
      });

      return res.status(400).json({
        success: false,
        error: firstIssue?.message || GENERIC_AUTH_ERROR,
      });
    }

    const validData = parseResult.data;

    // Reject self-registration for administrative/faculty roles
    if (validData.role !== 'STUDENT' && validData.role !== 'PARENT') {
      return res.status(403).json({
        success: false,
        error: 'Faculty and Principal accounts cannot be self-registered. Only the Super Admin can issue staff access.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registration validated server-side successfully',
      user: {
        name: validData.name,
        email: validData.email,
        username: validData.username || validData.email.split('@')[0],
        role: validData.role,
        school_id: validData.schoolId,
      },
    });
  });

  // ==========================================
  // 3. Server-Side TOTP MFA Verification Endpoint
  // ==========================================
  app.post('/api/auth/verify-mfa', (req, res) => {
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const body = req.body || {};

    const parseResult = serverMfaVerifySchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      logSecurityAttack({
        ip_address: clientIp,
        user_agent: userAgent,
        endpoint: '/api/auth/verify-mfa',
        attack_type: 'TOTP_BRUTE_FORCE_PROBE',
        offending_field: 'totpCode',
        sanitized_snippet: sanitizeSnippet('totpCode', body.totpCode),
        reason: `Invalid TOTP format: ${firstIssue?.message}`,
      });

      return res.status(400).json({
        success: false,
        error: 'Invalid 2FA security token format.',
      });
    }

    return res.json({
      success: true,
      message: 'MFA format validated server-side',
    });
  });

  // ==========================================
  // 4. Server-Side Security & Threat Logs Query Endpoint
  // Used by Admin Security Audit Trail to monitor attack attempts
  // ==========================================
  app.get('/api/auth/security-logs', (req, res) => {
    const limit = Math.min(parseInt(String(req.query.limit || '100'), 10), 200);
    const logs = getSecurityLogs(limit);
    res.json({
      success: true,
      total: logs.length,
      logs: logs,
    });
  });

  // Vite middleware for development & static assets for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClassSec School ERP Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
