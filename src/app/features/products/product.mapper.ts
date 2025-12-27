import { Product } from './product.model';
import { ProductTableModel } from './product-table.model';

export const mapProductToTable = (p: Product): ProductTableModel => ({
    id: p.id,
    name: p.name,
    category: p.category_id,
    price: p.price,
    stock: p.stock ?? 0,
    status:
        p.stock === null || p.stock === 0
            ? 'out'
            : p.stock <= 5
                ? 'low'
                : 'in',
    raw: p
});

export const mapProductsToTable = (products: Product[]): ProductTableModel[] =>
    products.map(mapProductToTable);
