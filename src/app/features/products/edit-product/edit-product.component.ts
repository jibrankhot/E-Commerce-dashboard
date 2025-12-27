import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductService } from '../products.service';
import { UpdateProductPayload, Product } from '../product.model';

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

    private fallbackEnabled = true;
    private fallbackImagePath = 'assets/images/admin-avatar.jpg';

    form = this.fb.group({
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
        stock: new FormControl<number | null>(0, [Validators.min(0)]),
        category_id: new FormControl<string | null>(null),
        description: new FormControl<string | null>(null)
    });

    productId = '';
    images: string[] = [];
    previewImages: string[] = [];
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

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.productId = params.get('id') ?? '';
            if (!this.productId) return;

            this.loading = true;
            this.productService.getProduct(this.productId).subscribe({
                next: product => {
                    this.loading = false;
                    this.patchProduct(product);
                },
                error: () => {
                    this.loading = false;
                    this.snack.open('Failed to load product', 'Close', { duration: 2000 });
                }
            });
        });

        this.form.valueChanges.subscribe(v => {
            const stock = Number(v.stock ?? 0);
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

    private patchProduct(product: Product): void {
        this.form.patchValue({
            name: product.name,
            price: product.price,
            stock: product.stock,
            category_id: product.category_id,
            description: product.description
        });

        this.images = product.images ?? [];
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
    }

    onFileDropped(event: DragEvent): void {
        event.preventDefault();
        if (!event.dataTransfer?.files) return;
        this.processFiles(event.dataTransfer.files);
    }

    onFilesSelected(event: any): void {
        this.processFiles(event.target.files);
    }

    private processFiles(files: FileList): void {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                this.resize(e.target?.result as string, 300, 300, compressed => {
                    this.previewImages.push(compressed);
                    this.uploadImage(compressed).subscribe({
                        next: res => {
                            this.images.push(res?.url || this.fallbackImagePath);
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

    private resize(src: string, maxW: number, maxH: number, cb: (r: string) => void): void {
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

    removeImage(index: number): void {
        this.images.splice(index, 1);
        this.previewImages.splice(index, 1);
    }

    uploadImage(base64: string): any {
        if (this.fallbackEnabled) {
            return { subscribe: (h: any) => h.error('fallback') };
        }
        return this.productService.uploadImage({ image: base64 });
    }

    submit(): void {
        if (this.form.invalid) return;

        const v = this.form.value;

        const payload: UpdateProductPayload = {
            name: v.name,
            price: v.price!,
            stock: v.stock,
            status:
                !v.stock || v.stock === 0
                    ? 'INACTIVE'
                    : 'ACTIVE',
            images: this.images.length ? this.images : [this.fallbackImagePath],
            category_id: v.category_id,
            description: v.description
        };

        this.productService.updateProduct(this.productId, payload).subscribe({
            next: () => {
                this.snack.open('Product updated', 'Close', { duration: 1500 });
                this.router.navigate(['/admin/products']);
            },
            error: () => {
                this.snack.open('Failed to update', 'Close', { duration: 1500 });
            }
        });
    }
}
