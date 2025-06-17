import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { RoutePath } from './app.routes';

@Component({
  selector: 'trackr-root',
  imports: [
    MatDivider,
    MatIcon,
    MatListModule,
    MatSidenavModule,
    MatToolbar,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'trackr-root',
  },
})
export class AppComponent {
  readonly title = 'trackr';

  readonly navList: { title: string; path: string; icon: string }[] = [
    { title: 'Dashboard', path: RoutePath.Dashboard, icon: 'dashboard' },
    { title: 'Accounts', path: RoutePath.Accounts, icon: 'account_balance' },
    { title: 'Transactions', path: RoutePath.Transactions, icon: 'payments' },
    { title: 'Settings', path: RoutePath.Settings, icon: 'settings' },
  ];
}
