import { Directive, HostListener, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommandPaletteDialogComponent } from './command-palette-dialog.component';

@Directive({
  selector: '[appCommandPalette]',
  standalone: true,
})
export class CommandPaletteDirective {
  private readonly dialog = inject(MatDialog);

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      if (this.dialog.openDialogs.length === 0) {
        this.dialog.open(CommandPaletteDialogComponent, {
          panelClass: 'palette-dialog',
          backdropClass: 'palette-backdrop',
          position: { top: '10vh' },
          maxWidth: '100vw',
        });
      }
    }
  }
}
