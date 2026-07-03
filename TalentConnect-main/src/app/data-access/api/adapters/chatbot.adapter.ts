import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiHttpService } from '../http/api-http.service';
import { ChatResponse, ChatHistoryPage, ChatMessage } from '../../models/chatbot.models';

@Injectable({ providedIn: 'root' })
export class ChatbotAdapter {
  private readonly api = inject(ApiHttpService);
  private readonly chatbotBaseUrl = 'chatbot'; // Base path for chatbot API

  /**
   * Sends a message to the chatbot and receives a response.
   * @param message The user's message.
   * @returns An Observable of ChatResponse.
   */
  ask(message: string): Observable<ChatResponse> {
    return this.api.postTo<ChatResponse>(this.api.chatbotBase, `${this.chatbotBaseUrl}/ask`, { message });
  }

  /**
   * Retrieves the chat history for a given user.
   * @param userId The ID of the user.
   * @param page The page number for pagination (0-indexed).
   * @param size The number of messages per page.
   * @returns An Observable of ChatHistoryPage.
   */
  getHistory(userId: string, page: number = 0, size: number = 20): Observable<ChatHistoryPage> {
    const params = { page: page.toString(), size: size.toString() };
    return this.api.getFrom<ChatHistoryPage>(this.api.chatbotBase, `${this.chatbotBaseUrl}/history/${userId}`, params);
  }
}
