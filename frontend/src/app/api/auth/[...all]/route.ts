import { auth } from "@/lib/auth"; // import the auth server instance
import { toNodeHandler } from "better-auth/node"; // conversion from standard request

export const runtime = "nodejs";

export const GET = auth.handler;
export const POST = auth.handler;
