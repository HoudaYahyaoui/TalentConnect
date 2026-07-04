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

// New interface matching the backend's ConversationResponse for history
export interface ConversationResponse {
  userId: string;
  userMessage: string;
  chatbotResponse: string;
  timestamp: string;
}

export interface ChatHistoryPage {
  content: ConversationResponse[]; // Updated to use ConversationResponse
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page number
}
