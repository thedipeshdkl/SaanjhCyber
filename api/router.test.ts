import { describe, it, expect } from "vitest";
import { appRouter } from "./router";

describe("appRouter", () => {
  it("should have all expected sub-routers", () => {
    const routerKeys = Object.keys(appRouter._def.procedures);
    // tRPC v11 flattens procedure keys with dot notation
    expect(routerKeys).toContain("ping");
    expect(routerKeys.some((k) => k.startsWith("auth."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("report."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("entity."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("notification."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("bookmark."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("search."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("appeal."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("feedback."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("research."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("admin."))).toBe(true);
    expect(routerKeys.some((k) => k.startsWith("article."))).toBe(true);
  });

  it("ping should return ok and timestamp", async () => {
    const caller = appRouter.createCaller({
      req: new Request("http://localhost"),
      resHeaders: new Headers(),
    });
    const result = await caller.ping();
    expect(result.ok).toBe(true);
    expect(result.ts).toBeTypeOf("number");
  });
});
