import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule],
  template: `<section class="system-page">
    <h1>Page introuvable</h1>
    <p>Le contenu demandé n’existe pas ou a été déplacé.</p>
  </section>`,
  styles: [
    `
      .system-page {
        padding: 2rem;
      }
      p {
        color: var(--text-muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent {}
