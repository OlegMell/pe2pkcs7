import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonType } from '../button/button.component';

@Component({
  selector: 'app-error-alert',
  templateUrl: './error-alert.component.html',
  styleUrls: [ './error-alert.component.scss' ]
})
export class ErrorAlertComponent implements OnInit {

  @Input() alertLabel: string = 'Warning!';
  @Input() fileName!: string;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  buttonType: typeof ButtonType = ButtonType;

  constructor() {
  }

  ngOnInit(): void {
  }

  closeAlert(): void {
    console.log('closeAlert');
    this.onClose.emit();
  }
}
