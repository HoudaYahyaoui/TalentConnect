import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SessionStore } from '../../../core/state/session.store';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="forbidden-page">
      <div class="forbidden-card">
        <!-- Orb d\u00e9coratif -->
        <div class="orb" aria-hidden="true">
          <div class="orb-ring r1"></div>
          <div class="orb-ring r2"></div>
          <div class="orb-ring r3"></div>
          <span class="orb-code">403</span>
        </div>

        <div class="forbidden-body">
          <p class="forbidden-eyebrow">Erreur 403 &mdash; Acc&egrave;s refus&eacute;</p>
          <h1>Vous n&apos;&ecirc;tes pas autoris&eacute; ici</h1>
          <p class="forbidden-desc">
            Votre r&ocirc;le <strong>{{ role() }}</strong> ne dispose pas des permissions
            n&eacute;cessaires pour acc&eacute;der &agrave; cette section.
            Contactez un administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
          </p>

          <div class="forbidden-actions">
            <button mat-flat-button type="button" class="btn-home" (click)="goHome()">
              <mat-icon>home</mat-icon>
              Retour &agrave; l&apos;accueil
            </button>
            <button mat-stroked-button type="button" class="btn-back" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Page pr&eacute;c&eacute;dente
            </button>
          </div>

          <div class="forbidden-hint">
            <mat-icon>info_outline</mat-icon>
            Si vous avez besoin d&apos;un acc&egrave;s &eacute;largi, ouvrez un ticket aupr&egrave;s du service IT.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forbidden-page {
      min-height: calc(100dvh - 60px);
      display: grid;
      place-items: center;
      padding: 32px 16px;
    }

    .forbidden-card {
      display: flex;
      gap: 64px;
      align-items: center;
      max-width: 820px;
      width: 100%;
    }

    /* ── Orb 3D ── */
    .orb {
      flex-shrink: 0;
      position: relative;
      width: 160px;
      height: 160px;
      display: grid;
      place-items: center;
    }

    .orb-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid var(--danger-500);
    }

    .r1 { inset: 0; opacity: 0.15; animation: spin 25s linear infinite; }
    .r2 { inset: 18px; opacity: 0.25; animation: spin 18s linear infinite reverse; border-style: dashed; }
    .r3 { inset: 36px; opacity: 0.40; animation: spin 12s linear infinite; }

    .orb-code {
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--danger-500);
      letter-spacing: -0.03em;
      z-index: 1;
      font-family: var(--font-mono, monospace);
    }

    /* ── Body ── */
    .forbidden-body { flex: 1; }

    .forbidden-eyebrow {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--danger-500);
      margin-bottom: 10px;
    }

    h1 {
      font-size: 1.75rem;
      margin-bottom: 14px;
      color: var(--text-primary);
    }

    .forbidden-desc {
      color: var(--text-muted);
      font-size: 0.938rem;
      line-height: 1.65;
      margin-bottom: 28px;
      max-width: 440px;
    }

    .forbidden-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }

    .btn-home {
      background: var(--brand-500) !important;
      color: #fff !important;
      border-radius: 10px !important;
      height: 42px !important;
    }

    .btn-back {
      border-radius: 10px !important;
      color: var(--text-muted) !important;
      height: 42px !important;
    }

    .forbidden-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      color: var(--text-soft);
      background: var(--surface-muted);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 10px 14px;
      max-width: 480px;
    }

    .forbidden-hint mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--brand-500);
      flex-shrink: 0;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 700px) {
      .forbidden-card {
        flex-direction: column;
        text-align: center;
        gap: 32px;
      }
      .forbidden-desc { max-width: 100%; }
      .forbidden-actions { justify-content: center; }
      .forbidden-hint { text-align: left; }
    }

    @media (prefers-reduced-motion: reduce) {
      .orb-ring { animation: none; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenPageComponent {
  private readonly router = inject(Router);
  protected readonly role = inject(SessionStore).role;

  protected goHome(): void {
    this.router.navigateByUrl('/app');
  }

  protected goBack(): void {
    history.back();
  }
}