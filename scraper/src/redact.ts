/**
 * Scraped articles are committed to a public repo, and tutorials routinely paste
 * live-looking credentials into code samples. GitHub push protection rejects the
 * whole push when it spots one, which silently kills the scrape job. Strip anything
 * that looks like a credential before it ever reaches disk.
 */

const PLACEHOLDER = '[redacted]';

const SECRET_PATTERNS: RegExp[] = [
  // Private key blocks
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
  // Stripe secret / restricted keys
  /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{10,}/g,
  // GitHub tokens
  /\bgh[pousr]_[A-Za-z0-9]{20,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  // Google / Firebase API keys
  /\bAIza[0-9A-Za-z_-]{30,}/g,
  // AWS access key ids
  /\b(?:AKIA|ASIA|ABIA|ACCA|A3T[A-Z0-9])[A-Z0-9]{16}\b/g,
  // Slack tokens
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  // Anthropic / OpenAI style keys
  /\bsk-ant-[A-Za-z0-9_-]{20,}/g,
  /\bsk-proj-[A-Za-z0-9_-]{20,}/g,
  /\bsk-[A-Za-z0-9]{32,}/g,
  // npm tokens
  /\bnpm_[A-Za-z0-9]{30,}/g,
  // SendGrid
  /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/g,
  // Twilio account / api sids
  /\b(?:AC|SK)[0-9a-fA-F]{32}\b/g,
  // JSON web tokens
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
];

export function redactSecrets(text: string): string {
  let result = text;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, PLACEHOLDER);
  }
  return result;
}

export function containsSecret(text: string): boolean {
  return SECRET_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}
