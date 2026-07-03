import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

const TYPE_KEYWORDS: Record<string, RegExp> = {
  error:
    /impossible|erreur|échoué|échec|invalide|ne peut|problème|introuvable|interdit|accès refusé/i,
  success:
    /succès|réussi|créé|mis à jour|enregistré|envoyé|joint|téléchargé|activé|réactivé|supprim|retiré|ajouté|planifié|sauvegardé/i,
  warning: /session|expiré|attention|déconnect|expire/i,
};

const SEVERITY_MAP: Record<ToastType, string> = {
  success: 'success',
  error: 'error',
  warning: 'warn',
  info: 'info',
};

const SUMMARY_MAP: Record<ToastType, string> = {
  success: 'Succès',
  error: 'Erreur',
  warning: 'Attention',
  info: 'Information',
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly msg = inject(MessageService);

  /** Backward-compatible with MatSnackBar.open() — type is auto-inferred from message */
  open(message: string, _action?: string, config?: { duration?: number }): void {
    const type = this.inferType(message);
    this.show(type, message, undefined, config?.duration ?? 4000);
  }

  success(title: string, message?: string, duration = 4000): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration = 5000): void {
    this.show('error', title, message, duration);
  }

  warning(title: string, message?: string, duration = 5000): void {
    this.show('warning', title, message, duration);
  }

  info(title: string, message?: string, duration = 4000): void {
    this.show('info', title, message, duration);
  }

  private show(type: ToastType, title: string, message?: string, duration = 4000): void {
    this.msg.add({
      severity: SEVERITY_MAP[type],
      summary: title,
      detail: message,
      life: duration,
      closable: true,
    });
  }

  private inferType(msg: string): ToastType {
    for (const [type, rx] of Object.entries(TYPE_KEYWORDS)) {
      if (rx.test(msg)) return type as ToastType;
    }
    return 'info';
  }
}
