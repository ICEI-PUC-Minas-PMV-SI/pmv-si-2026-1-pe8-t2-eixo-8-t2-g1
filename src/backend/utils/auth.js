const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN_SECONDS || 86400);
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "auth_token";

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function createJwtSignature(value) {
  return crypto
    .createHmac("sha256", JWT_SECRET)
    .update(value)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, hash] = storedHash.split(":");
  const candidateHash = crypto.scryptSync(String(password), salt, 64);
  const storedHashBuffer = Buffer.from(hash, "hex");

  if (candidateHash.length !== storedHashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateHash, storedHashBuffer);
}

function signJwt(payload) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const body = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRES_IN_SECONDS,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signature = createJwtSignature(`${encodedHeader}.${encodedBody}`);

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyJwt(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Token ausente");
  }

  const tokenParts = token.split(".");

  if (tokenParts.length !== 3) {
    throw new Error("Token invalido");
  }

  const [encodedHeader, encodedBody, signature] = tokenParts;
  const expectedSignature = createJwtSignature(`${encodedHeader}.${encodedBody}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new Error("Assinatura invalida");
  }

  const payload = JSON.parse(base64UrlDecode(encodedBody));
  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp === "number" && payload.exp < now) {
    throw new Error("Token expirado");
  }

  return payload;
}

function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/",
    maxAge: JWT_EXPIRES_IN_SECONDS * 1000,
  };
}

function getClearAuthCookieOptions() {
  const options = getAuthCookieOptions();
  delete options.maxAge;

  return options;
}

module.exports = {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getClearAuthCookieOptions,
  hashPassword,
  signJwt,
  verifyJwt,
  verifyPassword,
};
