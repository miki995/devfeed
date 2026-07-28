import { redactSecrets, containsSecret } from './redact';

/**
 * Fixtures are assembled at runtime rather than written as literals: a contiguous
 * credential-shaped string in this file trips GitHub push protection, which is the
 * exact failure mode redact.ts exists to prevent.
 */
const fake = (...parts: string[]): string => parts.join('');

const STRIPE = fake('sk', '_live_', '51H8xQyKzABCdefGhIjKlMnOp');
const GITHUB = fake('ghp', '_', '16C7e42F292c6912E7710c838347Ae178B4a');
const GOOGLE = fake('AIza', 'SyD-1234567890abcdefghijklmnopqrstuv');
const AWS = fake('AKIA', 'IOSFODNN7EXAMPLE');
const SLACK = fake('xoxb', '-123456789012-', 'abcdefghijklmnop');
const JWT = fake('eyJhbGciOiJIUzI1NiJ9', '.eyJzdWIiOiIxMjM0NTY3ODkwIn0', '.dBjftJeZ4CVPmB92K27uhbUJU1p1r');

describe('redactSecrets', () => {
  it('strips a Stripe secret key from a code sample', () => {
    expect(redactSecrets(`const stripe = Stripe("${STRIPE}");`)).toBe('const stripe = Stripe("[redacted]");');
  });

  it('strips GitHub, Google, AWS and Slack tokens', () => {
    const text = [GITHUB, GOOGLE, AWS, SLACK].join(' ');
    expect(redactSecrets(text)).toBe('[redacted] [redacted] [redacted] [redacted]');
  });

  it('strips private key blocks', () => {
    const text = '-----BEGIN RSA PRIVATE KEY-----\nMIIEow==\n-----END RSA PRIVATE KEY-----';
    expect(redactSecrets(text)).toBe('[redacted]');
  });

  it('strips JSON web tokens', () => {
    expect(redactSecrets(`Bearer ${JWT}`)).toBe('Bearer [redacted]');
  });

  it('leaves ordinary article prose untouched', () => {
    const text = 'Set STRIPE_SECRET_KEY in your env, then run npm install and deploy to production.';
    expect(redactSecrets(text)).toBe(text);
    expect(containsSecret(text)).toBe(false);
  });

  it('detects secrets repeatably without mutating state', () => {
    expect(containsSecret(`token: ${GITHUB}`)).toBe(true);
    expect(containsSecret(`token: ${GITHUB}`)).toBe(true);
  });
});
