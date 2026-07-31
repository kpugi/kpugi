import { Knock } from '@knocklabs/node';
import { createAdminClient } from '@/lib/supabase/server';

const knockApiKey = process.env.KNOCK_API_KEY;
export const knock = knockApiKey ? new Knock(knockApiKey) : null;

export async function triggerNotification({
  workflowKey,
  recipients,
  data,
  profileId,
}: {
  workflowKey: string;
  recipients: (string | { id: string; name?: string; email?: string })[];
  data: Record<string, unknown>;
  profileId?: string;
}) {
  // Always log to Supabase notifications table if profileId is passed
  if (profileId) {
    try {
      const supabase = createAdminClient();
      await supabase.from('notifications').insert({
        profile_id: profileId,
        knock_workflow_key: workflowKey,
        channel: 'in_app',
        payload: data,
      });
    } catch (dbErr) {
      console.error('[Knock] Error logging notification to DB:', dbErr);
    }
  }

  if (!knock) {
    console.warn('[Knock] KNOCK_API_KEY is not configured. Notification skipped:', { workflowKey, recipients });
    return { success: false, reason: 'missing_api_key' };
  }

  try {
    // If profileId is passed, ensure both profileId (UUID) and clerkId (string) are included as targets
    const targetRecipients = [...recipients];
    if (profileId && !targetRecipients.includes(profileId)) {
      targetRecipients.push(profileId);
    }

    const result = await knock.workflows.trigger(workflowKey, {
      recipients: targetRecipients,
      data,
    });

    return { success: true, result };
  } catch (error) {
    console.error('[Knock] Error triggering workflow:', error);
    return { success: false, error };
  }
}
