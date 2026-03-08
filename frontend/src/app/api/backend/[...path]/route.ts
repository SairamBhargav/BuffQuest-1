import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  
  // Fallback to NEXT_PUBLIC_API_URL and append /api
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const targetUrl = `${baseUrl}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

  const headers = new Headers(request.headers);
  headers.delete('host'); // Let fetch handle the host header

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
      cache: 'no-store',
    });

    const data = await response.blob();
    return new NextResponse(data, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Backend proxy error:', error);
    return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 502 });
  }
}
