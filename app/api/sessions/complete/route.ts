import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { GetSessionSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = checkRateLimit(ip, 'POST /api/sessions/complete', 30, 60_000);
  const rlHeaders = getRateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rlHeaders });
  }

  try {
    const body = await request.json();
    const parsed = GetSessionSchema.safeParse({ session_id: body.session_id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: rlHeaders }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('sessions')
      .update({ completed: true })
      .eq('id', parsed.data.session_id)
      .select('id')
      .single();

    if (error) {
      console.error('Session complete error:', error);
      return NextResponse.json({ error: 'Failed to mark session complete' }, { status: 500, headers: rlHeaders });
    }

    if (!data) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404, headers: rlHeaders });
    }

    return NextResponse.json({ success: true }, { headers: rlHeaders });
  } catch (err) {
    console.error('Session complete API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rlHeaders });
  }
}
