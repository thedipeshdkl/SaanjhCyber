import { describe, it, expect } from "vitest";
import { env } from "./env";

describe("env", () => {
  it("should export env object with required fields", () => {
    expect(env).toHaveProperty("jwtSecret");
    expect(env).toHaveProperty("databaseUrl");
    expect(env).toHaveProperty("isProduction");
    expect(env).toHaveProperty("adminEmail");
  });

  it("should not be in production mode during tests", () => {
    expect(env.isProduction).toBe(false);
  });
});
