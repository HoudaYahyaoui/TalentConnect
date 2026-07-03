import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { RhFacade } from '../rh.facade';

@Component({
  selector: 'app-candidates-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
  ],
  templateUrl: './candidates-list.component.html',
  styleUrls: ['./candidates-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidatesListComponent {
  private readonly rhFacade = inject(RhFacade);
  protected readonly candidates = this.rhFacade.candidates;
}
