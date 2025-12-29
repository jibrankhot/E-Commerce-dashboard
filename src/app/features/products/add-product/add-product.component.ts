import { Component, OnInit, DoCheck } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select'; // ✅ FIX

import { ProductService } from '../products.service';
import { HttpClient } from '@angular/common/http';

interface Category {
  id: string;
  name: string;
}

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
    MatSnackBarModule,
    MatSelectModule // ✅ FIX
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit, DoCheck {

  form = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    description: ['']
  });

  categories: Category[] = [];

  formProgress = 0;

  files: File[] = [];
  previewImages: string[] = [];

  stockLabel = '—';
  stockClass = '';

  private readonly categoriesUrl = 'http://localhost:5000/api/categories';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private productService: ProductService,
    private snack: MatSnackBar,
    public dialogRef: MatDialogRef<AddProductComponent>
  ) { }

  ngOnInit(): void {
    this.loadCategories();

    this.form.get('stock')!.valueChanges.subscribe(stock => {
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

  private loadCategories(): void {
    this.http
      .get<{ success: boolean; data: Category[] }>(this.categoriesUrl)
      .subscribe({
        next: res => {
          this.categories = res.data;
        },
        error: () => {
          this.snack.open('Failed to load categories', 'Close', { duration: 3000 });
        }
      });
  }

  ngDoCheck(): void {
    const total = Object.keys(this.form.controls).length;
    const filled = Object.values(this.form.controls).filter(
      c => c.valid && c.value !== ''
    ).length;

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

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.handleFiles(input.files);
  }

  private handleFiles(fileList: FileList): void {
    Array.from(fileList).forEach(file => {
      this.files.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImages.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.files.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  submit(): void {
    if (this.form.invalid) {
      this.snack.open('All required fields are mandatory', 'Close', { duration: 2500 });
      return;
    }

    if (this.files.length === 0) {
      this.snack.open('At least one product image is required', 'Close', { duration: 2500 });
      return;
    }

    const { name, price, stock, categoryId, description } = this.form.value;

    const formData = new FormData();

    this.files.forEach(file => {
      formData.append('images', file);
    });

    formData.append('name', name!.trim());
    formData.append('price', String(price));
    formData.append('stock', String(stock));
    formData.append('status', stock! > 0 ? 'ACTIVE' : 'INACTIVE');
    formData.append('categoryId', categoryId!);

    if (description && description.trim()) {
      formData.append('description', description.trim());
    }

    this.productService.addProduct(formData).subscribe({
      next: () => {
        this.snack.open('Product added successfully', 'Close', { duration: 2000 });
        this.dialogRef.close('saved');
      },
      error: err => {
        console.error('ADD PRODUCT ERROR', err?.error?.message || err);
        this.snack.open(
          err?.error?.message || 'Failed to add product',
          'Close',
          { duration: 4000 }
        );
      }
    });
  }
}
