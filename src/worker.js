const MAILERLITE_API_URL = "https://connect.mailerlite.com/api";

const GROUP_NAME_BY_PERSONA = {
  brand: "real-brand",
  creator: "real-creator",
};

async function getGroupId(apiKey, groupName, fallbackGroupId) {
  try {
    const res = await fetch(`${MAILERLITE_API_URL}/groups`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });
    const json = await res.json();
    const groups = Array.isArray(json) ? json : json?.data ?? [];
    const found = groups.find(
      (g) => (g?.name ?? g?.attributes?.name) === groupName
    );
    const id = found?.id ?? found?.attributes?.id;
    return id ?? fallbackGroupId;
  } catch {
    return fallbackGroupId;
  }
}

async function handleSubscribe(request, env) {
  const apiKey = env.MAILERLITE_API_KEY;
  const fallbackGroupId = env.MAILERLITE_GROUP_ID ?? "173612830070670438";

  if (!apiKey) {
    return Response.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, name, persona } = body ?? {};

  if (!email || !name) {
    return Response.json({ error: "Email and name are required." }, { status: 400 });
  }

  const validPersona = persona === "creator" ? "creator" : "brand";
  const groupName = GROUP_NAME_BY_PERSONA[validPersona];
  const groupId = await getGroupId(apiKey, groupName, fallbackGroupId);

  const subRes = await fetch(`${MAILERLITE_API_URL}/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      fields: { name, persona: validPersona },
      groups: [groupId],
    }),
  });

  const subData = await subRes.json().catch(() => null);

  if (!subRes.ok) {
    const msg = subData?.message ?? subData?.error ?? "Failed to subscribe.";
    return Response.json({ error: msg }, { status: subRes.status });
  }

  const subscriberId = subData?.data?.id ?? subData?.id;
  if (subscriberId && groupId) {
    await fetch(
      `${MAILERLITE_API_URL}/subscribers/${encodeURIComponent(subscriberId)}/groups/${encodeURIComponent(groupId)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );
  }

  return Response.json({ success: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleSubscribe(request, env);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404) {
      const notFound = await env.ASSETS.fetch(new Request(new URL("/404.html", request.url)));
      return new Response(notFound.body, {
        status: 404,
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }
    return assetResponse;
  },
};
