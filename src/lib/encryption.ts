import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    // Fallback development key if not configured in .env.local
    return crypto.createHash("sha256").update("dj-platform-default-dev-encryption-key").digest();
  }
  // If secret is hex or base64 or plain string, ensure 32 bytes
  if (secret.length === 64) {
    return Buffer.from(secret, "hex");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a sensitive token using AES-256-GCM.
 * Returns a hex string containing iv:authTag:ciphertext
 */
export function encryptToken(plainText: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt a token encrypted with encryptToken.
 */
export function decryptToken(encryptedData: string): string {
  const key = getKey();
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = Buffer.from(parts[2], "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
