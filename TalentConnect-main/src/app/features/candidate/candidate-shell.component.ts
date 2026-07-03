import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-candidate-shell',
  standalone: true,
  imports: [RouterOutlet, MatCardModule, MatIconModule],
  templateUrl: './candidate-shell.component.html',
  styleUrls: ['./candidate-shell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateShellComponent {}
