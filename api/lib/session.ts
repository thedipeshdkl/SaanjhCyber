import * as jose from "jose";
import * as cookie from "cookie";
import { env } from "./env";
import { AuthSession } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { findUserByUnionId } from "../queries/users";

export type SessionPayload = {
  userId: string; // maps to users.unionId
};

const JWT_ALG = "HS256";

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.jwtSecret);
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const userId = payload.userId as string | undefined;
    if (!userId) return null;
    return { userId };
  } catch {
    return null;
  }
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[AuthSession.cookieName];
  if (!token) {
    throw Errors.forbidden("No session found. Please log in.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid or expired session.");
  }
  const user = await findUserByUnionId(claim.userId);
  if (!user) {
    throw Errors.forbidden("User not found. Please log in again.");
  }
  return user;
}
