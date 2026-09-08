import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anonymous_id, scan_type } = body;

    if (!anonymous_id || !scan_type) {
      return NextResponse.json(
        { error: 'anonymous_id and scan_type are required' },
        { status: 400 }
      );
    }

    if (!['quick', 'deep'].includes(scan_type)) {
      return NextResponse.json(
        { error: 'scan_type must be "quick" or "deep"' },
        { status: 400 }
      );
    }

    // Extract UTM params from referrer or request headers
    const referer = request.headers.get('referer') || '';
    const utm_params: Record<string, string> = {};

    if (referer) {
      try {
        const url = new URL(referer);
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        utmKeys.forEach(key => {
          const value = url.searchParams.get(key);
          if (value) utm_params[key] = value;
        });
      } catch {
        // Invalid referer URL, skip
      }
    }

    // Detect device type from user agent
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    utm_params.device = isMobile ? 'mobile' : 'desktop';

    // Create session
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        anonymous_id,
        scan_type,
        utm_params,
      })
      .select()
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session: data });
  } catch (err) {
    console.error('Session API error:', err);
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
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: data });
  } catch (err) {
    console.error('Session fetch error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
