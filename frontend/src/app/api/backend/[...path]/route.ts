import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_BASE = (
  process.env.BACKEND_API_URL?.trim() || "http://127.0.0.1:8001/api"
).replace(/\/$/, "");

function buildBackendUrl(pathSegments: string[], search: string) {
  const joinedPath = pathSegments.join("/");
  return `${BACKEND_API_BASE}/${joinedPath}${search}`;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetUrl = buildBackendUrl(path, request.nextUrl.search);

  const headers = new Headers();
  const cookieHeader = request.headers.get("cookie");
  const authorizationHeader = request.headers.get("authorization");
  const contentTypeHeader = request.headers.get("content-type");
  const acceptHeader = request.headers.get("accept");

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }
  if (authorizationHeader) {
    headers.set("authorization", authorizationHeader);
  }
  if (contentTypeHeader) {
    headers.set("content-type", contentTypeHeader);
  }
  if (acceptHeader) {
    headers.set("accept", acceptHeader);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers();
    const responseContentType = response.headers.get("content-type");

    if (responseContentType) {
      responseHeaders.set("content-type", responseContentType);
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail: "Backend API proxy request failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
