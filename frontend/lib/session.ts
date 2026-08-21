const SESSION_SECRET = process.env.SESSION_SECRET || "devinsight-super-secret-key-1234567890-abcdef";

// HMAC SHA-256 Sign using Web Crypto API (runs on Edge & Node.js)
async function sign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export interface SessionPayload {
  userId: string;
  email: string;
  expiresAt: number;
}

export async function createSessionToken(userId: string, email: string): Promise<string> {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload: SessionPayload = { userId, email, expiresAt };
  const payloadStr = JSON.stringify(payload);
  const b64Payload = btoa(payloadStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const signature = await sign(b64Payload, SESSION_SECRET);
  return `${b64Payload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [b64Payload, signature] = parts;
    if (!b64Payload || !signature) return null;
    
    const expectedSignature = await sign(b64Payload, SESSION_SECRET);
    if (signature !== expectedSignature) return null;
    
    const paddedB64 = b64Payload.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (b64Payload.length % 4)) % 4);
    const payloadStr = atob(paddedB64);
    const payload = JSON.parse(payloadStr) as SessionPayload;
    
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}
