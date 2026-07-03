import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rh-shell',
  standalone: true,
  imports: [RouterOutlet, MatIconModule],
  templateUrl: './rh-shell.component.html',
  styleUrls: ['./rh-shell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RhShellComponent {}
