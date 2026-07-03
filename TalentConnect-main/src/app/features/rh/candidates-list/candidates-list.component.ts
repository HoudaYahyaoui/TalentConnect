import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidates-list',
  standalone: true,
  imports: [CommonModule],
  template:
    '<div class="container"><h1>Liste des candidats</h1><p>Fonctionnalité à implémenter</p></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidatesListComponent {}
