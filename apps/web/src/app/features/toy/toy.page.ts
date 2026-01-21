import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ToyStore} from './toy.store.js';

@Component({
  selector: 'app-toy-page',
  standalone: true,
  imports: [CommonModule],
  providers: [ToyStore],
  template: `
    <main class="toy-page">
      <header>
        <h1>Phase 2 toy store</h1>
        <p>Runs an Effect via UiRuntime and updates a Signal.</p>
      </header>

      <section class="state">
        <ng-container *ngIf="state() as current">
          <p *ngIf="current._tag === 'Initial'">Initial</p>
          <p *ngIf="current._tag === 'Loading'">Loading…</p>
          <p *ngIf="current._tag === 'Success'">Result: {{ current.value }}</p>
          <p *ngIf="current._tag === 'Failure'">Failed: {{ current.error | json }}</p>
        </ng-container>
      </section>

      <button type="button" (click)="store.run()">Run effect</button>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 1.5rem;
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      }

      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.5rem;
      }

      p {
        margin: 0 0 0.5rem;
      }

      button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        border: 1px solid #0f172a;
        background: #0f172a;
        color: #fff;
        cursor: pointer;
      }

      button:hover {
        background: #111827;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToyPage {
  constructor(readonly store: ToyStore) {}

  get state() {
    return this.store.state;
  }
}
