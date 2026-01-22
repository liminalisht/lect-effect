import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelloStore } from './hello.store.js';

@Component({
  selector: 'app-hello-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hello.page.html',
  // styleUrl: './hello.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelloPage {
  protected readonly store = inject(HelloStore);

  protected onNameInput(ev: Event): void {
    const {value} = (ev.target as HTMLInputElement);
    this.store.setName(value);
  }
}
