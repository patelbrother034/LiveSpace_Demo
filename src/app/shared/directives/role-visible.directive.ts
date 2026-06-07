import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[roleVisible]',
  standalone: true
})
export class RoleVisibleDirective {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private auth = inject(AuthService);

  private hasView = false;

  @Input() set roleVisible(allowedRoles: string[] | string) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const isVisible = this.auth.hasRole(roles);

    if (isVisible && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isVisible && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
