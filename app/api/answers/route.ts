import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { UpsertAnswersSchema, GetAnswersSchema } from '@/lib/validation';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = checkRateLimit(ip, 'POST /api/answers', 60, 60_000);
  const rlHeaders = getRateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rlHeaders });
  }

  try {
    const body = await request.json();
    const { session_id, question_key, value } = body;

    if (!session_id || !question_key || value === undefined) {
      return NextResponse.json(
        { error: 'session_id, question_key, and value are required' },
        { status: 400, headers: rlHeaders }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from('answers')
      .select('id')
      .eq('session_id', session_id)
      .eq('question_key', question_key)
      .single();

    let data;
    let error;

    if (existing) {
      const result = await supabaseAdmin
        .from('answers')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabaseAdmin
        .from('answers')
        .insert({ session_id, question_key, value })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Answer upsert error:', error);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500, headers: rlHeaders });
    }

    return NextResponse.json({ answer: data }, { headers: rlHeaders });
  } catch (err) {
    console.error('Answer API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rlHeaders });
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = checkRateLimit(ip, 'GET /api/answers', 60, 60_000);
  const rlHeaders = getRateLimitHeaders(rl);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rlHeaders });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = GetAnswersSchema.safeParse({ session_id: searchParams.get('session_id') });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: rlHeaders }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('answers')
      .select('*')
      .eq('session_id', parsed.data.session_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Answers fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500, headers: rlHeaders });
    }

    const answerMap: Record<string, unknown> = {};
    data.forEach((answer) => {
      answerMap[answer.question_key] = answer.value;
    });

    return NextResponse.json({ answers: answerMap }, { headers: rlHeaders });
  } catch (err) {
    console.error('Answers API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rlHeaders });
  }
}
