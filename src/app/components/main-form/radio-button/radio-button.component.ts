import { Component, Input, OnInit } from '@angular/core';
import { ConvertFileType } from '../../../enums/convert-file-type.enum';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: [ './radio-button.component.scss' ]
})
export class RadioButtonComponent implements OnInit {

  @Input() exportFileTypes!: ConvertFileType;
  @Input() label!: string;
  @Input() control!: FormControl;

  constructor() {
  }

  ngOnInit(): void {
  }

}
