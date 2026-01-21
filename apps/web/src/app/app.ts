import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Schema } from "effect";
import { Domain } from 'domain';

void Schema;
void Domain;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // this is important for zoneless change detection
})
export class App {
  protected readonly title = signal('web');
}
