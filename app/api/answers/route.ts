import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, question_key, value } = body;

    if (!session_id || !question_key || value === undefined) {
      return NextResponse.json(
        { error: 'session_id, question_key, and value are required' },
        { status: 400 }
      );
    }

    // Try to find existing answer first
    const { data: existing } = await supabaseAdmin
      .from('answers')
      .select('id')
      .eq('session_id', session_id)
      .eq('question_key', question_key)
      .single();

    let data;
    let error;

    if (existing) {
      // Update existing
      const result = await supabaseAdmin
        .from('answers')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new
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
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer: data });
  } catch (err) {
    console.error('Answer API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('answers')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Answers fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      );
    }

    // Convert array to map
    const answerMap: Record<string, unknown> = {};
    data.forEach((answer) => {
      answerMap[answer.question_key] = answer.value;
    });

    return NextResponse.json({ answers: answerMap });
  } catch (err) {
    console.error('Answers API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
