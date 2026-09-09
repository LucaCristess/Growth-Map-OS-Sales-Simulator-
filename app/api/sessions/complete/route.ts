import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(session_id)) {
      return NextResponse.json(
        { error: 'Invalid session_id format' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('sessions')
      .update({ completed: true })
      .eq('id', session_id)
      .select('id')
      .single();

    if (error) {
      console.error('Session complete error:', error);
      return NextResponse.json(
        { error: 'Failed to mark session complete' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Session complete API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
