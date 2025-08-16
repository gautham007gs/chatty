
'use server';

import { generateOfflineMessageFlow } from '@/ai/flows/offline-message-generation';
import type { OfflineMessageInput, OfflineMessageOutput } from '@/ai/flows/offline-message-generation';

export async function generateOfflineMessage(input: OfflineMessageInput): Promise<OfflineMessageOutput> {
  return generateOfflineMessageFlow(input);
}
