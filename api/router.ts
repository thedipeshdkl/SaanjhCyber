import { authRouter } from "./auth-router";
import { reportRouter } from "./report-router";
import { entityRouter } from "./entity-router";
import { notificationRouter } from "./notification-router";
import { bookmarkRouter } from "./bookmark-router";
import { searchRouter } from "./search-router";
import { appealRouter } from "./appeal-router";
import { feedbackRouter } from "./feedback-router";
import { researchRouter } from "./research-router";
import { adminRouter } from "./admin-router";
import { articleRouter } from "./article-router";
import { chatRouter } from "./chat-router";
import { messageRouter } from "./message-router";
import { watchlistRouter } from "./watchlist-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  report: reportRouter,
  entity: entityRouter,
  notification: notificationRouter,
  bookmark: bookmarkRouter,
  search: searchRouter,
  appeal: appealRouter,
  feedback: feedbackRouter,
  research: researchRouter,
  admin: adminRouter,
  article: articleRouter,
  chat: chatRouter,
  message: messageRouter,
  watchlist: watchlistRouter,
});

export type AppRouter = typeof appRouter;
