import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonType } from '../button/button.component';


@Component({
  selector: 'app-error-alert',
  templateUrl: './error-alert.component.html',
  styleUrls: [ './error-alert.component.scss' ]
})
export class ErrorAlertComponent {

  @Input() alertLabel: string = 'Warning!';
  @Input() fileName!: string;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  buttonType: typeof ButtonType = ButtonType;

  closeAlert(): void {
    this.onClose.emit();
  }
}
