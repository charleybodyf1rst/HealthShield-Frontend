import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    version: process.env.BUILD_ID || 'dev',
  });
}
