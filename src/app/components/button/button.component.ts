import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export enum ButtonType {
  PRIMARY = 'primary',
  ALERT = 'alert',
}

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: [ './button.component.scss' ]
})
export class ButtonComponent implements OnInit {

  @Input() label!: string;
  @Input() type: ButtonType = ButtonType.PRIMARY;
  @Input() disabled: boolean = false;

  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  buttonType: typeof ButtonType = ButtonType;

  constructor() {
  }

  ngOnInit(): void {
  }

}
