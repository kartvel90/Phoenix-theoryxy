// دریافت متغیر محیطی با استاندارد سراسری
const TARGET_NODE = (typeof process !== 'undefined' && process.env ? process.env.API_REMOTE_SERVER : "") || "";
const CLEAN_TARGET = TARGET_NODE.replace(/\/$/, "");

const STRIP_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
  "x-nf-client-connection-ip",
  "x-client-ip",
  "x-netlify-id",
  "via"
]);

// تعریف Listener استاندارد WinterCG برای Wasmer Edge
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(req) {
  if (!CLEAN_TARGET) {
    return new Response("Asset synchronization pending. Core modules loading...", { 
      status: 200, 
      headers: { "Content-Type": "text/plain" } 
    });
  }

  try {
    const urlContext = new URL(req.url);
    const path = urlContext.pathname;

    if (path === "/favicon.ico" || path === "/robots.txt" || path === "/") {
      return new Response("/* Academic Asset Cache */", { 
        status: 200, 
        headers: { "Content-Type": "application/javascript" } 
      });
    }

    const destination = CLEAN_TARGET + path + urlContext.search;
    const outboundHeaders = new Headers();
    let clientIpSource = "1.1.1.1";

    for (const [key, value] of req.headers) {
      const lowerKey = key.toLowerCase();
      
      if (STRIP_HEADERS.has(lowerKey) || lowerKey.startsWith("x-nf-") || lowerKey.startsWith("x-netlify-")) {
        continue;
      }
      
      if (lowerKey === "x-real-ip" || lowerKey === "x-forwarded-for") {
        clientIpSource = value.split(",")[0].trim();
        continue;
      }
      
      outboundHeaders.set(lowerKey, value);
    }

    outboundHeaders.set("X-Forwarded-For", clientIpSource);
    outboundHeaders.set("CF-Connecting-IP", clientIpSource);

    outboundHeaders.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
    outboundHeaders.set("accept", "application/json, text/plain, */*");
    outboundHeaders.set("accept-language", "en-US,en;q=0.9");
    outboundHeaders.set("sec-ch-ua", '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"');
    outboundHeaders.set("sec-ch-ua-mobile", "?0");
    outboundHeaders.set("sec-ch-ua-platform", '"Windows"');
    outboundHeaders.set("sec-fetch-dest", "empty");
    outboundHeaders.set("sec-fetch-mode", "cors");
    outboundHeaders.set("sec-fetch-site", "same-origin");

    const method = req.method;
    const fetchOptions = {
      method: method,
      headers: outboundHeaders,
      redirect: "manual"
    };

    if (method !== "GET" && method !== "HEAD") {
      fetchOptions.body = req.body;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    fetchOptions.signal = controller.signal;

    const originResponse = await fetch(destination, fetchOptions);
    clearTimeout(timeoutId);

    const cleanResponseHeaders = new Headers();
    for (const [key, value] of originResponse.headers) {
      const lowerKey = key.toLowerCase();
      
      if (
        lowerKey === "transfer-encoding" || 
        lowerKey === "server" || 
        lowerKey === "connection" ||
        lowerKey.startsWith("x-powered-") ||
        lowerKey.startsWith("x-vless")
      ) {
        continue;
      }
      cleanResponseHeaders.set(key, value);
    }

    cleanResponseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    cleanResponseHeaders.set("X-Content-Type-Options", "nosniff");

    return new Response(originResponse.body, {
      status: originResponse.status,
      headers: cleanResponseHeaders,
    });

  } catch (err) {
    return new Response("/* Asset chunk resolved locally */", { 
      status: 200, 
      headers: { "Content-Type": "application/javascript" } 
    });
  }
}
