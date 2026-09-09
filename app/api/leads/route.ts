import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, name, email, phone } = body;

    if (!session_id || !name || !email) {
      return NextResponse.json(
        { error: 'session_id, name, and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if lead already exists for this session
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('session_id', session_id)
      .single();

    if (existing) {
      // Update existing lead
      const { error } = await supabaseAdmin
        .from('leads')
        .update({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone || null,
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Lead update error:', error);
        return NextResponse.json(
          { error: 'Failed to update lead' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, lead_id: existing.id });
    }

    // Insert new lead
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert({
        session_id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Lead insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead_id: data.id });
  } catch (err) {
    console.error('Lead API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
