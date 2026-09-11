import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateSessionSchema, GetSessionSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = checkRateLimit(ip, 'POST /api/sessions', 30, 60_000);
  const rlHeaders = getRateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rlHeaders });
  }

  try {
    const body = await request.json();
    const parsed = CreateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: rlHeaders }
      );
    }

    const { anonymous_id, scan_type } = parsed.data;

    const referer = request.headers.get('referer') || '';
    const utm_params: Record<string, string> = {};

    if (referer) {
      try {
        const url = new URL(referer);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
          const value = url.searchParams.get(key);
          if (value) utm_params[key] = value;
        });
      } catch { /* skip */ }
    }

    const userAgent = request.headers.get('user-agent') || '';
    utm_params.device = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? 'mobile' : 'desktop';

    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert({ anonymous_id, scan_type, utm_params })
      .select()
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500, headers: rlHeaders });
    }

    return NextResponse.json({ session: data }, { headers: rlHeaders });
  } catch (err) {
    console.error('Session API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rlHeaders });
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = checkRateLimit(ip, 'GET /api/sessions', 60, 60_000);
  const rlHeaders = getRateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rlHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = GetSessionSchema.safeParse({ session_id: searchParams.get('session_id') });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: rlHeaders }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', parsed.data.session_id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404, headers: rlHeaders });
    }

    return NextResponse.json({ session: data }, { headers: rlHeaders });
  } catch (err) {
    console.error('Session fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rlHeaders });
  }
}
