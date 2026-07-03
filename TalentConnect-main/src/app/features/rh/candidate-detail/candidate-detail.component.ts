import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [CommonModule],
  template:
    '<div class="container"><h1>Détail du candidat</h1><p>Fonctionnalité à implémenter</p></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateDetailComponent {}
