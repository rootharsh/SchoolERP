export interface SecurityAttackLog {
  id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  endpoint: string;
  attack_type:
    | 'XSS_HTML_INJECTION'
    | 'MALFORMED_INPUT'
    | 'SQLI_PROBE'
    | 'NULL_BYTE_EXPLOIT'
    | 'INVALID_SCHEMA_STRUCTURE'
    | 'AUTH_CREDENTIAL_FAILED'
    | 'TOTP_BRUTE_FORCE_PROBE';
  offending_field?: string;
  sanitized_snippet?: string;
  reason: string;
  action_taken: 'REJECTED_WITH_GENERIC_400' | 'BLOCKED_AND_LOGGED';
  school_id?: string;
}

// In-memory persistent buffer of recent security events (last 500 events)
const securityAttackLogs: SecurityAttackLog[] = [
  {
    id: 'sec-init-demo-1',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    ip_address: '203.0.113.42',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    endpoint: '/api/auth/login',
    attack_type: 'XSS_HTML_INJECTION',
    offending_field: 'email',
    sanitized_snippet: '<script>alert("xss")</script>@test.com',
    reason: 'HTML / script tag injection detected during server Zod schema validation',
    action_taken: 'REJECTED_WITH_GENERIC_400',
    school_id: 'school-sharda-rajkot',
  },
  {
    id: 'sec-init-demo-2',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    ip_address: '198.51.100.19',
    user_agent: 'sqlmap/1.7.2#stable (https://sqlmap.org)',
    endpoint: '/api/auth/login',
    attack_type: 'SQLI_PROBE',
    offending_field: 'password',
    sanitized_snippet: "' OR '1'='1' --",
    reason: 'SQL injection signature pattern detected in password payload',
    action_taken: 'REJECTED_WITH_GENERIC_400',
    school_id: 'school-sharda-rajkot',
  },
];

export function logSecurityAttack(
  entry: Omit<SecurityAttackLog, 'id' | 'timestamp' | 'action_taken'> & { action_taken?: SecurityAttackLog['action_taken'] }
): SecurityAttackLog {
  const log: SecurityAttackLog = {
    ...entry,
    id: `sec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action_taken: entry.action_taken || 'REJECTED_WITH_GENERIC_400',
  };

  securityAttackLogs.unshift(log);
  if (securityAttackLogs.length > 500) {
    securityAttackLogs.pop();
  }

  // Server console audit log for SIEM / DevSecOps monitoring
  console.warn(
    `🚨 [SECURITY DEFENSE BLOCKED] Type: ${log.attack_type} | Field: ${log.offending_field || 'UNKNOWN'} | IP: ${log.ip_address} | Reason: ${log.reason}`
  );

  return log;
}

export function getSecurityLogs(limit: number = 100): SecurityAttackLog[] {
  return securityAttackLogs.slice(0, limit);
}

export function clearSecurityLogs(): void {
  securityAttackLogs.length = 0;
}
