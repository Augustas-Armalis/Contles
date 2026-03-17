import { onRequestPost as handleSubscribe } from "../functions/api/subscribe.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe") {
      if (request.method === "POST") {
        return handleSubscribe({
          request,
          env,
          waitUntil: ctx.waitUntil.bind(ctx),
          params: {},
        });
      }
      return new Response("Method Not Allowed", { status: 405 });
    }

    // All other paths: Cloudflare serves static assets from ./dist automatically
    return new Response("Not Found", { status: 404 });
  },
};
