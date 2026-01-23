/**
 * @fileoverview Hello feature page renders greeting form and results.
 * @since 1.0.0
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelloStore } from './hello.store.js';

/**
 * Hello feature page component.
 * @since 1.0.0
 */
@Component({
  selector: 'app-hello-page',
  standalone: true,
  imports: [CommonModule],
  providers: [HelloStore],
  templateUrl: './hello.page.html',
  styleUrl: './hello.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelloPage {
  /**
   * Injected store backing the Hello feature.
   * @since 1.0.0
   */
  protected readonly store = inject(HelloStore);

  /**
   * Handles input changes and updates the store name.
   * @since 1.0.0
   */
  protected onNameInput(ev: Event): void {
    const {value} = (ev.target as HTMLInputElement);
    this.store.setName(value);
  }
}
