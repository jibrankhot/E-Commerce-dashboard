import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// RxJS
import { BehaviorSubject } from 'rxjs';

interface AdminNavItem {
  label: string;
  icon: string;
  route: string;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Products', icon: 'inventory_2', route: '/products' },
  { label: 'Users', icon: 'group', route: '/users' },
  { label: 'Orders', icon: 'receipt_long', route: '/orders' }
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    AsyncPipe,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent implements OnInit {
  // Navigation items displayed in sidebar
  readonly navItems = ADMIN_NAV_ITEMS;

  // Sidebar expanded/collapsed
  private readonly _isSidebarCollapsed = new BehaviorSubject<boolean>(false);
  readonly isSidebarCollapsed$ = this._isSidebarCollapsed.asObservable();

  // Search term typed in topbar
  private readonly _searchTerm = new BehaviorSubject<string>('');
  readonly searchTerm$ = this._searchTerm.asObservable();

  // To determine if device is mobile/tablet
  isMobile = false;

  ngOnInit(): void {
    // Determine initial device width
    this.isMobile = window.matchMedia('(max-width: 900px)').matches;

    // Update when screen size changes
    window.matchMedia('(max-width: 900px)').addEventListener('change', (e) => {
      this.isMobile = e.matches;
      if (!this.isMobile) {
        // On large screens: sidebar always open
        this._isSidebarCollapsed.next(false);
      }
    });
  }

  toggleSidebar(): void {
    this._isSidebarCollapsed.next(!this._isSidebarCollapsed.value);
  }

  onSearchChange(value: string): void {
    this._searchTerm.next(value.trim());
    // Later we can send this value to a search service or global store
  }
}
