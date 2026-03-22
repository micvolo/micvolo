// HMAC-SHA-256 signed session tokens + SHA-256 password hashing
// Uses only crypto.subtle — available in Cloudflare Workers and modern browsers

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  return bufferToHex(buffer);
}

export async function verifyPassword(input: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashPassword(input);
  return timingSafeEqual(inputHash, storedHash);
}

// Token format: base64(slug:timestamp).base64(hmac_signature)
export async function createSession(slug: string, secret: string): Promise<string> {
  const payload = btoa(`${slug}:${Date.now()}`);
  const sig = await hmacSign(payload, secret);
  return `${payload}.${sig}`;
}

export async function verifySession(token: string, slug: string, secret: string): Promise<boolean> {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return false;

  const payload = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  const expectedSig = await hmacSign(payload, secret);
  if (!timingSafeEqual(sig, expectedSig)) return false;

  try {
    const decoded = atob(payload);
    const [tokenSlug] = decoded.split(':');
    return tokenSlug === slug;
  } catch {
    return false;
  }
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return bufferToBase64(sig);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
