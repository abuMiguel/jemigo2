
import { Component, Input } from '@angular/core';

@Component({
    selector: 'quote',
    templateUrl: './quote.component.html',
         standalone: true,
         imports: []
})
export class QuoteComponent {
    @Input() text = "";
    @Input() url = "";
    @Input() author = "";
}
