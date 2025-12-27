import { Component, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ProductService } from '../products.service';
import { CreateProductPayload } from '../product.model';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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

  private fallbackEnabled = true;
  private fallbackImagePath = 'assets/images/admin-avatar.jpg';

  form = this.fb.group({
    name: ['', Validators.required],
    price: [null, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.min(0)]],
    category_id: [null],
    description: ['']
  });

  formProgress = 0;
  images: string[] = [];
  previewImages: string[] = [];
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

  ngDoCheck(): void {
    const total = Object.keys(this.form.controls).length;
    const filled = Object.values(this.form.controls).filter(c => c.valid && c.value !== null && c.value !== '').length;
    this.formProgress = Math.round((filled / total) * 100);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    if (!event.dataTransfer?.files) return;
    this.handleFiles(event.dataTransfer.files);
  }

  onFilesSelected(event: any): void {
    this.handleFiles(event.target.files);
  }

  private handleFiles(files: FileList): void {
    Array.from(files).forEach(file => {
      const reader = new FileReader();

      reader.onload = e => {
        this.resizeImage(e.target?.result as string, 300, 300, compressed => {
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

  private resizeImage(src: string, maxWidth: number, maxHeight: number, callback: (result: string) => void): void {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      callback(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.src = src;
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  uploadImage(base64: string): any {
    if (this.fallbackEnabled) {
      return {
        subscribe: (h: any) => h.error('fallback')
      };
    }
    return this.productService.uploadImage({ image: base64 });
  }

  submit(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    const payload: CreateProductPayload = {
      name: v.name!,
      price: Number(v.price),
      stock: v.stock === null ? null : Number(v.stock),
      status:
        !v.stock || v.stock === 0
          ? 'INACTIVE'
          : 'ACTIVE',
      images: this.images.length ? this.images : [this.fallbackImagePath],
      category_id: v.category_id,
      description: v.description || null
    };

    this.productService.addProduct(payload).subscribe(() => {
      this.snack.open('Product added successfully', 'Close', { duration: 2000 });
      this.dialogRef.close('saved');
    });
  }
}
