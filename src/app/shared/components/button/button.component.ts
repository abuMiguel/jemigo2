import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'jmg-btn',
    templateUrl: './button.component.html',
  standalone: true,
  imports: [
        FontAwesomeModule,
        CommonModule,
    ]
})
export class ButtonComponent {
  @Output() onClick = new EventEmitter<any>();
  @Input() color = "orange";
  faLongArrowAltRight = faLongArrowAltRight;

  onClickButton(event: Event) {
    this.onClick.emit(event);
  }
}