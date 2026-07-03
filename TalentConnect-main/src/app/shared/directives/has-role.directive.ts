import { Directive, TemplateRef, ViewContainerRef, inject, input, effect } from '@angular/core';
import { SessionStore } from '../../core/state/session.store';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly sessionStore = inject(SessionStore);

  readonly appHasRole = input<string | string[]>('');

  private rendered = false;

  constructor() {
    effect(() => {
      const expected = this.appHasRole();
      const currentRole = this.sessionStore.role();
      const roles = Array.isArray(expected) ? expected : [expected];
      const allowed = roles.includes(currentRole ?? '');

      if (allowed && !this.rendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.rendered = true;
      } else if (!allowed && this.rendered) {
        this.viewContainer.clear();
        this.rendered = false;
      }
    });
  }
}
