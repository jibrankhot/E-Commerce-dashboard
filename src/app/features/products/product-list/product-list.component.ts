import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Material UI
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

// Dialog & Service
import { AddProductComponent } from '../add-product/add-product.component';
import { ProductService } from '../products.service';

// Mapper
import { mapProductsToTable } from '../product.mapper';

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
    MatProgressSpinnerModule
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
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.loadError = false;

    this.productService.getProducts().subscribe({
      next: (res) => {
        this.dataSource.data = mapProductsToTable(res);
        this.isLoading = false;

        if (this.paginator) this.dataSource.paginator = this.paginator;
        if (this.sort) this.dataSource.sort = this.sort;

        this.cdr.detectChanges();  // forces UI update
      },
      error: () => {
        this.isLoading = false;
        this.loadError = true;
        this.cdr.detectChanges();  // forces UI update
      }
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStockStatus(stock: number): 'out' | 'low' | 'in' {
    if (stock === 0) return 'out';
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'saved') {
        this.loadProducts();
      }
    });
  }

  edit(product: any): void {
    console.log('Edit', product);
  }

  delete(product: any): void {
    console.log('Delete', product);
  }
}
