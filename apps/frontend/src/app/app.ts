/**
 * Root application shell component.
 * @since 1.0.0
 */
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';

/**
 * Application root component hosting the router.
 * @since 1.0.0
 * @category Components
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /**
   * Application title signal used in the shell.
   * @since 1.0.0
   * @category Signals
   */
  protected readonly title = signal('web');
}
