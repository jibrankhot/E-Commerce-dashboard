import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SidebarItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  /** Controlled by AdminLayout */
  @Input() collapsed = false;

  /** Single source of truth for sidebar navigation */
  readonly menuItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard',
    },
    {
      label: 'Products',
      icon: 'inventory_2',
      route: '/admin/products',
    },
    {
      label: 'Users',
      icon: 'people',
      route: '/admin/users',
    },
    {
      label: 'Orders',
      icon: 'receipt_long',
      route: '/admin/orders',
    },
  ];
}
