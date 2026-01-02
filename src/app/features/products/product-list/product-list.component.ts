import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { AddProductComponent } from '../add-product/add-product.component';
import { ProductService } from '../products.service';
import { mapProductsToTable } from '../product.mapper';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {

  displayedColumns = ['name', 'category', 'price', 'stock', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;
  loadError = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.loadError = false;

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.dataSource.data = mapProductsToTable(products);
        this.isLoading = false;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }

        if (this.sort) {
          this.dataSource.sort = this.sort;
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.loadError = true;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStockStatus(stock: number | null): 'out' | 'low' | 'in' {
    if (!stock || stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'in';
  }

  openAddProductDialog(): void {
    const dialogRef = this.dialog.open(AddProductComponent, {
      width: '1080px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '95vh',
      disableClose: true,
      autoFocus: false,
      panelClass: 'add-product-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
        this.loadProducts();
      }
    });
  }

  edit(product: { id: string }): void {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  /**
   * DELETE PRODUCT (CONFIRMATION DIALOG + OPTIMISTIC UI)
   */
  delete(product: { id: string; name?: string }): void {
    const dialogRef = this.dialog.open<
      ConfirmationDialogComponent,
      any,
      boolean
    >(ConfirmationDialogComponent, {
      width: '420px',
      disableClose: true,
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name ?? 'this product'}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      // Optimistic UI update
      const previousData = [...this.dataSource.data];
      this.dataSource.data = previousData.filter(p => p.id !== product.id);
      this.cdr.detectChanges();

      this.productService.deleteProduct(product.id).subscribe({
        error: () => {
          // Rollback on failure
          this.dataSource.data = previousData;
          this.cdr.detectChanges();
          alert('Failed to delete product. Please try again.');
        }
      });
    });
  }
}
