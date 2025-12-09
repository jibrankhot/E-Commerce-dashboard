export interface ProductType {
    name: string;
    price: number | null;
    category: string;
    subcategory: string | null;
    brand: string | null;
    stock: number | null;
    discount: number | null;
    sku: string | null;
    thumbnail: string | null;
    description: string | null;
    featured: boolean;
}
