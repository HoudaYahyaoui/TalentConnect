import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

interface BackendChatResponse {
  response?: string;
  reply?: string;
  message?: string;
  answer?: string;
  content?: string;
  text?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly chatbotBase = environment.services.chatbot;

  ask(message: string): Observable<string> {
    const raw = localStorage.getItem('tc_user');
    const userId: string = raw ? `user-${(JSON.parse(raw) as { id?: string }).id ?? '0'}` : 'user-0';

    return this.http
      .post<BackendChatResponse>(`${this.chatbotBase}/chatbot/messages`, { userId, message })
      .pipe(
        map(
          (res) =>
            res.response ??
            res.reply ??
            res.answer ??
            res.message ??
            res.text ??
            res.content ??
            "Je n'ai pas de reponse a cette question.",
        ),
        catchError(() =>
          of("Je n'ai pas pu contacter l'assistant. Veuillez reessayer."),
        ),
      );
  }
}
