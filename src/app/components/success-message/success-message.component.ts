import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-success-message',
  templateUrl: './success-message.component.html',
  styleUrls: [ './success-message.component.scss' ]
})
export class SuccessMessageComponent implements OnInit {

  @Input() text: string = 'Your file have been converted!';
  @Input() withButton: boolean = true;
  @Input() buttonLabel!: string;

  @Output() buttonClicked: EventEmitter<void> = new EventEmitter<void>();

  constructor() {
  }

  ngOnInit(): void {
  }

  buttonClickHandler(): void {
    this.buttonClicked.emit();
  }
}
