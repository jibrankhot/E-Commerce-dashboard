export interface ProductImage {
    label: string;
    img: string;
}

export interface AdditionalInformation {
    key: string;
    value: string;
}

export interface Product {
    id: number;
    sku: string;
    thumbnail: string;
    title: string;
    slug: string;
    category: string;
    subcategory: string | null;
    brand: string | null;
    price: number;
    discount: number;
    quantity: number;
    status: 'in-stock' | 'low-stock' | 'out-stock';
    images: ProductImage[];
    description: string;
    additionalInformation: AdditionalInformation[];
    featured: boolean;
    tags: string[];
    rating: number;
    reviews: number;
    sellCount: number;
}
