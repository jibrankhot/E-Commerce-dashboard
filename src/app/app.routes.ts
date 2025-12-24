import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

export const routes: Routes = [
    /**
     * Public routes
     */
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },

    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login.component')
                .then(m => m.LoginComponent),
    },

    /**
     * Admin (protected)
     */
    {
        path: 'admin',
        canActivate: [adminAuthGuard],
        loadComponent: () =>
            import('./layout/admin-layout/admin-layout.component')
                .then(m => m.AdminLayoutComponent),

        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },

            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent),
            },

            {
                path: 'products',
                loadComponent: () =>
                    import('./features/products/product-list/product-list.component')
                        .then(m => m.ProductListComponent),
            },

            {
                path: 'products/add',
                loadComponent: () =>
                    import('./features/products/add-product/add-product.component')
                        .then(m => m.AddProductComponent),
            },

            {
                path: 'products/edit/:id',
                loadComponent: () =>
                    import('./features/products/edit-product/edit-product.component')
                        .then(m => m.EditProductComponent),
            },

            {
                path: 'categories',
                loadComponent: () =>
                    import('./features/categories/category-list/category-list.component')
                        .then(m => m.CategoryListComponent),
            },

            {
                path: 'orders',
                loadComponent: () =>
                    import('./features/orders/order-list/order-list.component')
                        .then(m => m.OrderListComponent),
            },

            {
                path: 'users',
                loadComponent: () =>
                    import('./features/users/user-list/user-list.component')
                        .then(m => m.UserListComponent),
            },
        ],
    },

    /**
     * Fallback
     */
    {
        path: '**',
        redirectTo: 'login',
    },
];
