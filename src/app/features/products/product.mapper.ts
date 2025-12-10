import { ProductTableModel } from "./product-table.model";
import { Product } from "./product.model";

/**
 * Converts backend Product object (db.json) → UI table model
 */
export const mapProductToTable = (p: Product): ProductTableModel => ({
    id: p.id,                                     // <-- REQUIRED for edit
    name: p.title,                                // UI expects name
    category: p.category,
    price: p.price,
    stock: p.quantity,
    status:
        p.status === 'in-stock' ? 'in' :
            p.status === 'low-stock' ? 'low' :
                'out',
    raw: p                                        // full object for edit/delete later
});

/**
 * Converts an array of Product objects to UI table models
 */
export const mapProductsToTable = (products: Product[]): ProductTableModel[] =>
    products.map(mapProductToTable);
