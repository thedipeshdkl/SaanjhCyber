import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./router";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { verifySessionToken, signSessionToken } from "./lib/session";
import { createContext } from "./context";
import { AuthSession } from "@contracts/constants";

// Helper to create a tRPC caller with optional cookie header
function createCaller(cookieHeader?: string) {
  const headers = new Headers();
  if (cookieHeader) headers.set("cookie", cookieHeader);
  const resHeaders = new Headers();
  // Use createContext to properly authenticate
  return {
    caller: appRouter.createCaller({
      req: new Request("http://localhost", { headers }),
      resHeaders,
      user: undefined, // will be set by createContext in the real flow
    }),
    resHeaders,
    headers,
  };
}

// Helper that actually runs createContext to authenticate
async function createAuthenticatedCaller(cookieValue: string) {
  const headers = new Headers();
  headers.set("cookie", cookieValue);
  const resHeaders = new Headers();
  const ctx = await createContext({
    req: new Request("http://localhost", { headers }),
    resHeaders,
    info: {} as any,
  });
  return {
    caller: appRouter.createCaller(ctx),
    resHeaders,
  };
}

const TEST_EMAIL = `test-auth-${Date.now()}@example.com`;
const TEST_PASSWORD = "securePassword123";
const TEST_NAME = "Auth Test User";

describe("auth router", () => {
  afterAll(async () => {
    // Cleanup test user
    const db = getDb();
    await db.delete(users).where(eq(users.email, TEST_EMAIL));
  });

  describe("register", () => {
    it("should register a new user and set session cookie", async () => {
      const { caller, resHeaders } = createCaller();
      const result = await caller.auth.register({
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      expect(result.success).toBe(true);
      expect(result.role).toBe("user");
      const setCookie = resHeaders.get("set-cookie");
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain("saanjhcyber_auth_session=");
      expect(setCookie).toContain("HttpOnly");
    });

    it("should reject duplicate email", async () => {
      const { caller } = createCaller();
      await expect(
        caller.auth.register({
          name: "Duplicate",
          email: TEST_EMAIL,
          password: "anotherpassword1",
        }),
      ).rejects.toThrow("Email is already registered");
    });

    it("should reject short password", async () => {
      const { caller } = createCaller();
      await expect(
        caller.auth.register({
          name: "Short Pass",
          email: "short@example.com",
          password: "short",
        }),
      ).rejects.toThrow();
    });

    it("should reject invalid email", async () => {
      const { caller } = createCaller();
      await expect(
        caller.auth.register({
          name: "Invalid",
          email: "not-an-email",
          password: "password123",
        }),
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should login with correct credentials", async () => {
      const { caller, resHeaders } = createCaller();
      const result = await caller.auth.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      expect(result).toEqual({ success: true });

      const setCookie = resHeaders.get("set-cookie");
      expect(setCookie).toContain("saanjhcyber_auth_session=");
    });

    it("should reject wrong password", async () => {
      const { caller } = createCaller();
      await expect(
        caller.auth.login({
          email: TEST_EMAIL,
          password: "wrongpassword",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should reject non-existent email", async () => {
      const { caller } = createCaller();
      await expect(
        caller.auth.login({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("me", () => {
    it("should return user data without password when authenticated", async () => {
      // First login to get a session cookie
      const { caller: loginCaller, resHeaders: loginHeaders } = createCaller();
      await loginCaller.auth.login({ email: TEST_EMAIL, password: TEST_PASSWORD });

      const setCookie = loginHeaders.get("set-cookie")!;
      const cookieValue = setCookie.split(";")[0]; // "saanjhcyber_auth_session=xxx"

      // Call me with proper context authentication
      const { caller: meCaller } = await createAuthenticatedCaller(cookieValue);
      const user = await meCaller.auth.me();

      expect(user.email).toBe(TEST_EMAIL);
      expect(user.name).toBe(TEST_NAME);
      expect(user.role).toBe("user");
      expect(user).not.toHaveProperty("password");
    });

    it("should reject unauthenticated request", async () => {
      const { caller } = createCaller();
      await expect(caller.auth.me()).rejects.toThrow();
    });
  });

  describe("logout", () => {
    it("should clear session cookie", async () => {
      // Login first
      const { caller: loginCaller, resHeaders: loginHeaders } = createCaller();
      await loginCaller.auth.login({ email: TEST_EMAIL, password: TEST_PASSWORD });
      const setCookie = loginHeaders.get("set-cookie")!;
      const cookieValue = setCookie.split(";")[0];

      // Logout with authenticated context
      const { caller: logoutCaller, resHeaders: logoutHeaders } = await createAuthenticatedCaller(cookieValue);
      const result = await logoutCaller.auth.logout();

      expect(result).toEqual({ success: true });

      const logoutCookie = logoutHeaders.get("set-cookie")!;
      expect(logoutCookie).toContain("Max-Age=0");
    });
  });

  describe("session token", () => {
    it("should produce a valid JWT that can be verified", async () => {
      const { caller: loginCaller, resHeaders } = createCaller();
      await loginCaller.auth.login({ email: TEST_EMAIL, password: TEST_PASSWORD });

      const setCookie = resHeaders.get("set-cookie")!;
      const token = setCookie.split("=")[1].split(";")[0];

      const payload = await verifySessionToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.userId).toBeTruthy();
    });
  });
});
