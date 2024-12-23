import { Component, OnInit } from '@angular/core';
import { product } from '../data-type';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnInit {
 popularProducts:undefined|product[];
 trendyProducts:undefined | product[];
  constructor(private product:ProductService, private route:Router) {}

  ngOnInit(): void {
    this.product.popularProducts().subscribe((data)=>{
      this.popularProducts=data;
    })

    this.product.trendyProducts().subscribe((data)=>{
      this.trendyProducts=data;
    })
  }

  redirectToDetails(id: number): void {
    this.route.navigate(['/details/' + id]);
  }
}
