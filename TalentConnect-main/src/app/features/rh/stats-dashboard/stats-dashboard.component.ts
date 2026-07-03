import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule],
  template:
    '<div class="container"><h1>Tableau de bord statistiques</h1><p>Fonctionnalité à implémenter</p></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsDashboardComponent {}
