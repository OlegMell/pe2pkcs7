import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonType } from '../button/button.component';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-error-alert',
  templateUrl: './error-alert.component.html',
  styleUrls: [ './error-alert.component.scss' ]
})
export class ErrorAlertComponent {

  @Input() alertLabel: string = 'Warning!';
  @Input() fileName!: string;
  @Input() error!: string;
  @Input() isActive!: boolean;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  buttonType: typeof ButtonType = ButtonType;

  constructor() {
  }

  closeAlert(): void {
    this.onClose.emit();
  }
}
