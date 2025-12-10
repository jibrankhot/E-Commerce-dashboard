import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../products.service';

@Component({
    selector: 'app-edit-product',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './edit-product.component.html',
    styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {

    fallbackEnabled = true;
    fallbackImagePath = 'assets/images/admin-avatar.jpg';

    // FORM
    form = this.fb.group({
        name: ['', Validators.required],
        price: [null, [Validators.required, Validators.min(0)]],
        category: ['', Validators.required],
        subcategory: [''],
        brand: [''],
        stock: [0, [Validators.required, Validators.min(0)]],
        discount: [0, [Validators.min(0), Validators.max(100)]],
        sku: [''],
        thumbnail: [''],
        description: [''],
        featured: [false]
    });

    // UI states
    productId: number | string = '';
    images: string[] = [];
    previewImages: string[] = [];

    finalPrice = 0;
    stockLabel = '—';
    stockClass = '';
    loading = false;

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private snack: MatSnackBar,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    // -----------------------------
    // INIT — LOAD PRODUCT (FIXED)
    // -----------------------------
    ngOnInit(): void {

        // FIXED: using paramMap.subscribe to ensure route loads correctly
        this.route.paramMap.subscribe(params => {
            this.productId = params.get('id') ?? '';

            if (!this.productId) return;

            this.loading = true;
            this.productService.getProduct(this.productId).subscribe({
                next: (product: any) => {
                    this.loading = false;
                    this.patchProduct(product);
                },
                error: () => {
                    this.loading = false;
                    this.snack.open('Failed to load product', 'Close', { duration: 2000 });
                }
            });
        });

        // Update stock + final price
        this.form.valueChanges.subscribe(v => {
            const price = Number(v.price || 0);
            const discount = Number(v.discount || 0);

            this.finalPrice = price - (price * (discount / 100));

            const stock = Number(v.stock || 0);
            if (stock === 0) {
                this.stockLabel = 'Out of Stock';
                this.stockClass = 'out';
            } else if (stock <= 5) {
                this.stockLabel = 'Low Stock';
                this.stockClass = 'low';
            } else {
                this.stockLabel = 'In Stock';
                this.stockClass = 'in';
            }
        });
    }

    private patchProduct(product: any) {
        this.form.patchValue({
            name: product.title,
            price: product.price,
            category: product.category,
            subcategory: product.subcategory,
            brand: product.brand,
            stock: product.quantity,
            discount: product.discount,
            sku: product.sku,
            thumbnail: product.thumbnail,
            description: product.description,
            featured: product.featured
        });

        this.images = product.images?.map((i: any) => i.img) ?? [];
    }

    onDragOver(e: DragEvent) {
        e.preventDefault();
    }

    onFileDropped(e: DragEvent) {
        e.preventDefault();
        if (!e.dataTransfer?.files) return;
        this.processFiles(e.dataTransfer.files);
    }

    onFilesSelected(e: any) {
        this.processFiles(e.target.files);
    }

    private processFiles(files: FileList) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev: any) => {
                this.resize(ev.target.result, 300, 300, (compressed: string) => {

                    this.previewImages.push(compressed);

                    this.uploadImage(compressed).subscribe({
                        next: (res: any) => {
                            if (res?.path) {
                                this.images.push(res.path);
                            } else {
                                this.images.push(this.fallbackImagePath);
                            }
                        },
                        error: () => {
                            this.images.push(this.fallbackImagePath);
                        }
                    });

                });
            };
            reader.readAsDataURL(file);
        });
    }

    private resize(src: string, maxW: number, maxH: number, cb: (r: string) => void) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxW / img.width, maxH / img.height);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            cb(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = src;
    }

    removeImage(i: number) {
        this.images.splice(i, 1);
        this.previewImages.splice(i, 1);
    }

    uploadImage(base64: string) {
        if (this.fallbackEnabled) {
            return {
                subscribe: (handler: any) => handler.error('Fallback active')
            };
        }
        return this.productService.uploadImage({ image: base64 });
    }

    submit() {
        if (this.form.invalid) return;

        const raw = this.form.value;
        const updated = {
            title: raw.name,
            slug: this.slugify(raw.name || ''),
            price: Number(raw.price),
            discount: Number(raw.discount),
            quantity: Number(raw.stock),
            category: raw.category,
            subcategory: raw.subcategory,
            brand: raw.brand,
            sku: raw.sku,
            thumbnail: raw.thumbnail || this.fallbackImagePath,
            description: raw.description,
            featured: raw.featured,
            images: this.images.map((path, i) => ({
                label: `Image ${i + 1}`,
                img: path
            }))
        };

        this.productService.updateProduct(this.productId, updated).subscribe({
            next: () => {
                this.snack.open('Product updated', 'Close', { duration: 1500 });
                this.router.navigate(['/admin/products']);
            },
            error: () =>
                this.snack.open('Failed to update', 'Close', { duration: 1500 })
        });
    }

    private slugify(v: string) {
        return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
}
