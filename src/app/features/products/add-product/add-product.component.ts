import { Component, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProductService } from '../products.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit, DoCheck {

  // -----------------------------
  // BACKEND + FALLBACK SETTINGS
  // -----------------------------
  private fallbackEnabled = true;  // JSON SERVER MODE
  private fallbackImagePath = 'assets/images/admin-avatar.jpg';

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
  formProgress = 0;
  images: string[] = [];  // NOW STORES PATHS ONLY
  previewImages: string[] = []; // UI PREVIEW (BASE64)
  finalPrice = 0;
  stockLabel = '—';
  stockClass = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snack: MatSnackBar,
    public dialogRef: MatDialogRef<AddProductComponent>
  ) { }

  ngOnInit(): void {
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

  ngDoCheck(): void {
    const total = Object.keys(this.form.controls).length;
    const filled = Object.values(this.form.controls).filter(c => c.value && c.valid).length;
    this.formProgress = Math.round((filled / total) * 100);
  }

  // -----------------------------
  // IMAGE HANDLING (COMPRESSION + UPLOAD)
  // -----------------------------
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer?.files) return;
    this.handleFiles(event.dataTransfer.files);
  }

  onFilesSelected(event: any) {
    this.handleFiles(event.target.files);
  }

  private handleFiles(files: FileList): void {
    Array.from(files).forEach(file => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.resizeImage(e.target.result, 300, 300, (compressedBase64: string) => {

          // Store BASE64 for preview ONLY
          this.previewImages.push(compressedBase64);

          // Try backend upload 
          this.uploadImage(compressedBase64).subscribe({
            next: (res: any) => {
              if (res?.path) {
                this.images.push(res.path); // REAL BACKEND PATH
              } else {
                this.images.push(this.fallbackImagePath); // FAILSAFE
              }
            },
            error: () => {
              this.images.push(this.fallbackImagePath); // JSON SERVER MODE
            }
          });

        });
      };

      reader.readAsDataURL(file);
    });
  }

  private resizeImage(src: string, maxWidth: number, maxHeight: number, callback: (result: string) => void) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");

      const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressed = canvas.toDataURL("image/jpeg", 0.6);
      callback(compressed);
    };
    img.src = src;
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  // -----------------------------
  // TEMP: BACKEND UPLOAD OR FALLBACK
  // -----------------------------
  uploadImage(base64: string) {
    if (this.fallbackEnabled) {
      return {
        subscribe: (handlers: any) => {
          handlers.error('JSON Server cannot upload'); // TRIGGER FALLBACK
        }
      };
    }

    return this.productService.uploadImage({ image: base64 });
  }

  // -----------------------------
  // SUBMIT PRODUCT
  // -----------------------------

  submit(): void {
    if (this.form.invalid) return;

    const raw = this.form.value;
    const name = raw.name ?? '';
    const brand = raw.brand ?? '';
    const price = Number(raw.price ?? 0);
    const stock = Number(raw.stock ?? 0);
    const discount = Number(raw.discount ?? 0);

    const sku = raw.sku?.trim()?.length
      ? raw.sku.trim()
      : this.generateSku(name, brand);

    const thumbnail = raw.thumbnail?.trim()?.length
      ? raw.thumbnail.trim()
      : this.fallbackImagePath;

    const status =
      stock === 0 ? 'out-stock' :
        stock <= 5 ? 'low-stock' :
          'in-stock';

    const newProduct: any = {
      id: Date.now(),
      sku,
      title: name,
      slug: this.slugify(name),
      category: raw.category,
      subcategory: raw.subcategory || null,
      brand: raw.brand || null,
      price,
      discount,
      quantity: stock,
      status,
      thumbnail,

      // FINAL: ALWAYS STORE PATHS
      images: this.images.length
        ? this.images.map((path, i) => ({ label: `Image ${i + 1}`, img: path }))
        : [{ label: 'Main', img: thumbnail }],

      description: raw.description || '',
      additionalInformation: [],
      featured: !!raw.featured,
      tags: [],
      rating: 0,
      reviews: 0,
      sellCount: 0,

      name,
      stock
    };

    this.productService.addProduct(newProduct).subscribe(() => {
      this.snack.open('Product added successfully', 'Close', { duration: 2000 });
      this.dialogRef.close('saved');
    });
  }

  // -----------------------------
  // UTILITIES
  // -----------------------------
  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private generateSku(name: string, brand: string | null): string {
    const base = (brand ? brand + ' ' + name : name)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${base}-${randomPart}`;
  }
}
