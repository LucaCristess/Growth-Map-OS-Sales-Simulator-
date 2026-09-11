import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { CreateLeadSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = checkRateLimit(ip, 'POST /api/leads', 10, 60_000);
  const rlHeaders = getRateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rlHeaders });
  }

  try {
    const body = await request.json();
    const parsed = CreateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: rlHeaders }
      );
    }

    const { session_id, name, email, phone, qualification_score, qualification_tier } = parsed.data;

    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('session_id', session_id)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('leads')
        .update({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone || null,
          qualification_score: qualification_score ?? null,
          qualification_tier: qualification_tier ?? null,
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Lead update error:', error);
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500, headers: rlHeaders });
      }

      return NextResponse.json({ success: true, lead_id: existing.id }, { headers: rlHeaders });
    }

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert({
        session_id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
        qualification_score: qualification_score ?? null,
        qualification_tier: qualification_tier ?? null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Lead insert error:', error);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500, headers: rlHeaders });
    }

    return NextResponse.json({ success: true, lead_id: data.id }, { headers: rlHeaders });
  } catch (err) {
    console.error('Lead API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rlHeaders });
  }
}
