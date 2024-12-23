import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { product } from '../data-type';
import { ProductService } from '../services/product.service';
import { Subject } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: false
})
export class HeaderComponent implements OnInit {
  menuType: string = 'default';
  sellerName: string = "";
  userName: string = "";
  searchResult: undefined | product[];
  cartItems = 0;
  private searchSubject = new Subject<string>();

  constructor(private route: Router, private product: ProductService) {}

  ngOnInit(): void {
    this.route.events.pipe(
      filter(event => !!(event as any)?.url),
      map(() => this.route.url)
    ).subscribe(url => {
      if (localStorage.getItem('seller') && url.includes('seller')) {
        const sellerStore = localStorage.getItem('seller');
        const sellerData = sellerStore && JSON.parse(sellerStore)[0];
        this.sellerName = sellerData?.name || '';        
        this.menuType = 'seller';
      } else if (localStorage.getItem('user')) {
        const userStore = localStorage.getItem('user');
        const userData = userStore && JSON.parse(userStore);
        this.userName = userData?.name || '';        
        this.menuType = 'user';
        this.product.getCartList(userData.id);
      } else {
        this.menuType = 'default';
      }
    });

    // Initialize cart items count
    const cartData = localStorage.getItem('localCart');
    if (cartData) {
      this.cartItems = JSON.parse(cartData).length;
    }
    this.product.cartData.subscribe((items) => {
      this.cartItems = items.length;
    });

    this.searchSubject.pipe(debounceTime(300)).subscribe((query) => {
      this.product.searchProduct(query).subscribe((result) => {
        this.searchResult = result.length > 5 ? result.slice(0, 5) : result;
      });
    });
  }

  logout(): void {
    localStorage.removeItem('seller');
    this.route.navigate(['/']);
  }

  userLogout(): void {
    localStorage.removeItem('user');
    this.route.navigate(['/user-auth']);
    this.product.cartData.emit([]);
  }

  searchProduct(query: KeyboardEvent): void {
    const element = query.target as HTMLInputElement;
    if (element?.value.trim()) {
      this.searchSubject.next(element.value.trim());
    }
  }

  hideSearch(): void {
    setTimeout(() => {
      this.searchResult = undefined;
    }, 200); // Delay to allow for result clicks
  }

  redirectToDetails(id: number, searchInput: HTMLInputElement): void {
    this.route.navigate(['/details/' + id]).then(() => {
      searchInput.value = ''; 
    });
  }
  

  submitSearch(val: string, searchInput: HTMLInputElement): void {
    const trimmedValue = val.trim();
    if (trimmedValue) {
      this.route.navigate([`search/${trimmedValue}`]).then(() => {
        searchInput.value = '';
      });
    }
  }
  
}
