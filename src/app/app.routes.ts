import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full'
    },

    {
        path: 'admin',
        loadComponent: () =>
            import('./layout/admin-layout/admin-layout.component')
                .then(m => m.AdminLayoutComponent),

        children: [
            {
                path: 'products',
                loadComponent: () =>
                    import('./features/products/product-list/product-list.component')
                        .then(m => m.ProductListComponent)
            },

            {
                path: 'products/edit/:id',
                loadComponent: () =>
                    import('./features/products/edit-product/edit-product.component')
                        .then(m => m.EditProductComponent)
            },

            {
                path: '',
                redirectTo: 'products',
                pathMatch: 'full'
            },
        ]
    },

    { path: '**', redirectTo: 'admin' }
];
