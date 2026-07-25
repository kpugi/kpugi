import { Knock } from '@knocklabs/node';

const knockApiKey = process.env.KNOCK_API_KEY;
export const knock = knockApiKey ? new Knock(knockApiKey) : null;

export async function triggerNotification({
  workflowKey,
  recipients,
  data,
}: {
  workflowKey: string;
  recipients: string[];
  data: Record<string, unknown>;
}) {
  if (!knock) {
    console.warn('[Knock] KNOCK_API_KEY is not configured. Notification skipped:', { workflowKey, recipients });
    return { success: false, reason: 'missing_api_key' };
  }

  try {
    const result = await knock.workflows.trigger(workflowKey, {
      recipients,
      data,
    });
    return { success: true, result };
  } catch (error) {
    console.error('[Knock] Error triggering workflow:', error);
    return { success: false, error };
  }
}
