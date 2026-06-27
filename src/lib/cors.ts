import { NextResponse } from "next/server";

export function corsResponse(data: unknown, status: number = 200) {
  const validStatus = status >= 200 && status <= 599 ? status : 500;
  return NextResponse.json(data, {
    status: validStatus,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
