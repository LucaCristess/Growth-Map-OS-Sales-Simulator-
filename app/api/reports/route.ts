import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateReportSchema, GetReportSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = checkRateLimit(ip, 'POST /api/reports', 20, 60_000);
  const rlHeaders = getRateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rlHeaders });
  }

  try {
    const body = await request.json();
    const parsed = CreateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: rlHeaders }
      );
    }

    const { session_id, result_json } = parsed.data;

    const { data: existing } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('session_id', session_id)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('reports')
        .update({ result_json })
        .eq('id', existing.id);

      if (error) {
        console.error('Report update error:', error);
        return NextResponse.json({ error: 'Failed to update report' }, { status: 500, headers: rlHeaders });
      }

      return NextResponse.json({ success: true, report_id: existing.id }, { headers: rlHeaders });
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert({ session_id, result_json })
      .select('id')
      .single();

    if (error) {
      console.error('Report insert error:', error);
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500, headers: rlHeaders });
    }

    return NextResponse.json({ success: true, report_id: data.id }, { headers: rlHeaders });
  } catch (err) {
    console.error('Report API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rlHeaders });
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = checkRateLimit(ip, 'GET /api/reports', 60, 60_000);
  const rlHeaders = getRateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rlHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = GetReportSchema.safeParse({ session_id: searchParams.get('session_id') });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: rlHeaders }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('id, session_id, result_json, created_at')
      .eq('session_id', parsed.data.session_id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404, headers: rlHeaders });
    }

    return NextResponse.json(data, { headers: rlHeaders });
  } catch (err) {
    console.error('Report GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rlHeaders });
  }
}
