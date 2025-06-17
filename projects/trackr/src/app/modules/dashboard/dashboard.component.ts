import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'trackr-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DashboardComponent {}
