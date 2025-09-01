import { config } from 'dotenv';
config();

import '@/ai/flows/moderate-chat-message.ts';
import '@/ai/flows/detect-suspected-minor.ts';