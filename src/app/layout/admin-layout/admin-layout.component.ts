import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// Components
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  /** Sidebar collapsed state */
  readonly isSidebarCollapsed = signal<boolean>(false);

  /** Responsive */
  private readonly mediaQuery =
    window.matchMedia('(max-width: 900px)');

  private readonly mediaQueryListener = (
    e: MediaQueryListEvent
  ) => this.onMediaChange(e);

  ngOnInit(): void {
    // Initial responsive state
    this.isSidebarCollapsed.set(this.mediaQuery.matches);

    // Listen for viewport changes
    this.mediaQuery.addEventListener(
      'change',
      this.mediaQueryListener
    );
  }

  ngOnDestroy(): void {
    this.mediaQuery.removeEventListener(
      'change',
      this.mediaQueryListener
    );
  }

  /** Triggered by header */
  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }

  private onMediaChange(
    event: MediaQueryListEvent
  ): void {
    // Auto-collapse on mobile
    this.isSidebarCollapsed.set(event.matches);
  }
}
