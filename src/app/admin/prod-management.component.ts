import { Component, OnInit, Inject, signal, computed } from "@angular/core";
import { data } from "../app.data";
import { CommonModule, DOCUMENT } from '@angular/common';
import { AmzProduct } from "../shared/interfaces/blog-interface";
import { AppService } from "../app.service";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "product-management",
    templateUrl: "./prod-management.component.html",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
    ]
})
export class ProductManagementComponent implements OnInit {
    title = data.aboutData.title;

    productIds = "";
    savedProducts = signal<Array<AmzProduct>>([]);
    filteredProducts = computed(() => {
        return this.savedProducts().filter((p) => 
            p?.title?.toLowerCase().includes(this.filter().toLowerCase()) ||
            p.asin.toLowerCase().includes(this.filter().toLowerCase())
        );
    });
    filter = signal("");

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private appService: AppService,
    ) { }

    ngOnInit(): void { }

    saveProduct() {
        const ids = this.productIds.replace(/\s/g, "").split(",");
        this.appService.saveAmazonProducts(ids)?.subscribe(
            item => console.log(item)
        );
    }

    getProducts() {
        this.appService.getAmazonProducts().subscribe({
            next: prods => {
                this.savedProducts.set(prods);
            }
        });
    }
}
