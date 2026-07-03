import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthFacade } from './core/services/auth.facade';
import { SessionStore } from './core/state/session.store';
import { ChatbotWidgetComponent } from './features/chatbot/widget/chatbot-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChatbotWidgetComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly authFacade = inject(AuthFacade);
  private readonly sessionStore = inject(SessionStore);

  constructor() {
    this.authFacade.hydrate();

    effect(() => {
      document.body.dataset['theme'] = this.sessionStore.theme();
    });
  }
}
