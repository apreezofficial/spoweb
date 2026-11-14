import { NextResponse } from 'next/server';

export function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Reads JSON body; returns {} for bad input so handlers can validate fields. */
export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
