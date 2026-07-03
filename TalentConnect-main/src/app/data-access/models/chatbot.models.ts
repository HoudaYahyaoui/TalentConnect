export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string; // ISO string
  intent?: string; // Optional, if bot identifies an intent
  sources?: string[]; // Optional, if bot provides sources
}

export interface ChatResponse {
  answer: string;
  intent: 'JOB' | 'REFERRAL' | 'STATUS' | 'HELP' | 'UNKNOWN'; // Example intents
  suggestions: string[];
  sources: string[];
  fallbackAction?: string;
  chatMessage?: ChatMessage; // The message saved by the bot, if applicable
}

export interface ChatHistoryPage {
  content: ChatMessage[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page number
}
