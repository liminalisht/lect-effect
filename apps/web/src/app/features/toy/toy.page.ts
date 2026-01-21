import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ToyStore} from './toy.store.js';

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
  constructor(readonly store: ToyStore) {}

  get state() {
    return this.store.state;
  }
}
