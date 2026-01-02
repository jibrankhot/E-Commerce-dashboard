import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
    FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProductService } from '../products.service';
import { Product } from '../product.model';

interface UiImage {
    id: string;
    type: 'existing' | 'new';
    url: string;
    file?: File;
}

@Component({
    selector: 'app-edit-product',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './edit-product.component.html',
    styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {

    productId!: string;
    loading = true;

    images: UiImage[] = [];

    form = this.fb.group({
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        price: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
        stock: new FormControl<number | null>(null),
        category_id: new FormControl<string | null>(null),
        description: new FormControl<string | null>(null)
    });

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private snack: MatSnackBar,
        private route: ActivatedRoute,
        public router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.productId = this.route.snapshot.paramMap.get('id')!;

        this.productService.getProductById(this.productId)
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.markForCheck();
            }))
            .subscribe({
                next: (product: Product) => {
                    this.form.patchValue({
                        name: product.name,
                        price: product.price,
                        stock: product.stock,
                        category_id: product.category_id,
                        description: product.description
                    });

                    this.images = (product.images ?? []).map(url => ({
                        id: crypto.randomUUID(),
                        type: 'existing',
                        url
                    }));
                },
                error: () => {
                    this.snack.open('Failed to load product', 'Close', { duration: 3000 });
                    this.router.navigate(['/admin/products']);
                }
            });
    }

    onImageSelect(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;

        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                this.images.push({
                    id: crypto.randomUUID(),
                    type: 'new',
                    url: reader.result as string,
                    file
                });
                this.cdr.markForCheck();
            };
            reader.readAsDataURL(file);
        });

        input.value = '';
    }

    removeImage(image: UiImage): void {
        this.images = this.images.filter(i => i.id !== image.id);
    }

    submit(): void {
        if (this.form.invalid) return;

        const existingImages = this.images
            .filter(i => i.type === 'existing')
            .map(i => i.url);

        const newImages = this.images.filter(i => i.type === 'new');

        // 🔥 ALWAYS use FormData (simpler + consistent)
        const formData = new FormData();

        Object.entries(this.form.value).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value as any);
            }
        });

        // ✅ EXISTING images → BODY (JSON)
        formData.append('imagesJson', JSON.stringify(existingImages));

        // ✅ NEW images → FILES
        newImages.forEach(img => {
            if (img.file) {
                formData.append('images', img.file);
            }
        });

        this.productService.updateProductFormData(this.productId, formData).subscribe({
            next: () => {
                this.snack.open('Product updated successfully', 'Close', { duration: 2000 });
                this.router.navigate(['/admin/products']);
            },
            error: () => {
                this.snack.open('Failed to update product', 'Close', { duration: 3000 });
            }
        });
    }
}
