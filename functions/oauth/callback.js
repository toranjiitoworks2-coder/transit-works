export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookieState = cookieHeader.match(/(?:^|;\s*)oauth_state=([^;]+)/)?.[1];

  if (!code) return errorPage("missing_code");
  if (!state || state !== cookieState) return errorPage("invalid_state");

  const clientId = env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return errorPage("oauth_not_configured");

  const redirectUri = `${url.origin}/oauth/callback`;

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "transit-works-decap-oauth",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await tokenRes.json();
  if (data.error || !data.access_token) {
    return errorPage(data.error || "token_exchange_failed");
  }

  const payload = JSON.stringify({ token: data.access_token, provider: "github" });
  const payloadJs = JSON.stringify(payload);

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Authorizing…</title></head>
<body>
<p>認証中…このウィンドウは自動で閉じます。</p>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage('authorization:github:success:' + ${payloadJs}, e.origin);
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener && window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Set-Cookie": "oauth_state=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
}

function errorPage(message) {
  const safe = String(message).replace(/[^a-zA-Z0-9_\- ]/g, "");
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Authorization Error</title></head>
<body>
<p>認証エラー: ${safe}</p>
<script>
window.opener && window.opener.postMessage('authorization:github:error:' + ${JSON.stringify(JSON.stringify({ message: safe }))}, "*");
</script>
</body></html>`;
  return new Response(html, {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
