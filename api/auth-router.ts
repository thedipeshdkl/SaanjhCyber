import * as crypto from "crypto";
import { z } from "zod";
import * as cookie from "cookie";
import { AuthSession } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { signSessionToken } from "./lib/session";
import { env } from "./lib/env";

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return resolve(false);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString("hex"));
    });
  });
}

export const authRouter = createRouter({
  register: publicQuery
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const existingUser = await db.select().from(users).where(eq(users.email, input.email));
      if (existingUser.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email is already registered" });
      }

      const hashedPassword = await hashPassword(input.password);
      const unionId = crypto.randomUUID();

      // Determine role: first user with ADMIN_EMAIL becomes superadmin
      let role: "user" | "superadmin" = "user";
      if (env.adminEmail && input.email.toLowerCase() === env.adminEmail.toLowerCase()) {
        // Check if superadmin already exists
        const existingSuperadmin = await db.select({ count: sql<number>`count(*)` })
          .from(users).where(eq(users.role, "superadmin"));
        if ((existingSuperadmin[0]?.count || 0) === 0) {
          role = "superadmin";
        }
      }

      await db.insert(users).values({
        unionId,
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role,
        lastSignInAt: new Date(),
      });

      const token = await signSessionToken({ userId: unionId });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(AuthSession.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: AuthSession.maxAgeMs / 1000,
        }),
      );

      return { success: true, role };
    }),

  login: publicQuery
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [user] = await db.select().from(users).where(eq(users.email, input.email));

      if (!user || !user.password) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const isValid = await verifyPassword(input.password, user.password);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      await db.update(users).set({ lastSignInAt: new Date() }).where(eq(users.id, user.id));

      const token = await signSessionToken({ userId: user.unionId });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(AuthSession.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: AuthSession.maxAgeMs / 1000,
        }),
      );

      return { success: true };
    }),

  me: authedQuery.query((opts) => {
    const { password: _, ...user } = opts.ctx.user;
    return user;
  }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(AuthSession.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),

  updateProfile: authedQuery
    .input(z.object({
      name: z.string().min(1).optional(),
      phone: z.string().optional(),
      province: z.string().optional(),
      district: z.string().optional(),
      municipality: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const updateData: Record<string, string> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.province !== undefined) updateData.province = input.province;
      if (input.district !== undefined) updateData.district = input.district;
      if (input.municipality !== undefined) updateData.municipality = input.municipality;

      if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));
      }
      return { success: true };
    }),
});
