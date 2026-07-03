import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * @deprecated Replaced by PrimeNG <p-toast> in portal-shell.component.
 * Kept as an empty stub to avoid breaking any lazy-loaded module that may import it.
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class ToastContainerComponent {}
