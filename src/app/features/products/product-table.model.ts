export interface ProductTableModel {
    name: string;
    category: string;
    price: number;
    stock: number;
    status: 'in' | 'low' | 'out';
    raw: any;
}
