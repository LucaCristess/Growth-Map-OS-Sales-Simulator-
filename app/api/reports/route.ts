import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, result_json } = body;

    if (!session_id || !result_json) {
      return NextResponse.json(
        { error: 'session_id and result_json are required' },
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

    // Check if report already exists for this session
    const { data: existing } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('session_id', session_id)
      .single();

    if (existing) {
      // Update existing report
      const { error } = await supabaseAdmin
        .from('reports')
        .update({ result_json })
        .eq('id', existing.id);

      if (error) {
        console.error('Report update error:', error);
        return NextResponse.json(
          { error: 'Failed to update report' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, report_id: existing.id });
    }

    // Insert new report
    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert({
        session_id,
        result_json,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Report insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, report_id: data.id });
  } catch (err) {
    console.error('Report API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('id, session_id, result_json, created_at')
      .eq('session_id', sessionId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Report GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
