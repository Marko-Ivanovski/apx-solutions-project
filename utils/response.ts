import { NextResponse } from "next/server";

export function respondSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function respondBadRequest(message: string, init?: ResponseInit) {
  return NextResponse.json({ error: message }, { status: 400, ...init });
}

export function respondServerError(message: string, init?: ResponseInit) {
  return NextResponse.json({ error: message }, { status: 500, ...init });
}