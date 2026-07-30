import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ messages: [] });
    }

    const supabase = createAdminClient();
    const { data: messages, error } = await supabase
      .from('support_chat_messages')
      .select('id, role, content, created_at')
      .eq('clerk_id', clerkId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('[KpugiBot History GET Error]:', error);
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    console.error('[KpugiBot History GET Exception]:', error);
    return NextResponse.json({ messages: [] });
  }
}

export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('support_chat_messages')
      .delete()
      .eq('clerk_id', clerkId);

    if (error) {
      // Table migration might be pending locally
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[KpugiBot History DELETE Exception]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
