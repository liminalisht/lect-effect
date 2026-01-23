/**
 * @since 1.0.0
 * @fileoverview Toy feature page rendering remote data from the store.
 * */
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ToyStore} from './toy.store.js';

/**
 * Page component for the toy feature.
 * @since 1.0.0
 * @category Components
 */
@Component({
  selector: 'app-toy-page',
  standalone: true,
  imports: [CommonModule],
  providers: [ToyStore],
  templateUrl: './toy.page.html',
  styleUrls: ['./toy.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToyPage {
  /**
   * Injected store managing toy feature state.
   * @since 1.0.0
   * @category Properties
   */
  constructor(readonly store: ToyStore) {}

  get state() {
    return this.store.state;
  }
}
