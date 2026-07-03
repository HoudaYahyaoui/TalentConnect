import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-offers',
  standalone: true,
  imports: [CommonModule],
  template:
    '<div class="container"><h1>Gérer les offres</h1><p>Fonctionnalité à implémenter</p></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageOffersComponent {}
