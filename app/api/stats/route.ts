import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const revalidate = 0; // never cache

export async function GET() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return NextResponse.json({ downloads: 0 });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const count = (await redis.get<number>("download_count")) ?? 0;
  return NextResponse.json({ downloads: Number(count) });
}
