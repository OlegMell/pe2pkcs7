import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: [ './splash.component.scss' ]
})
export class SplashComponent implements OnInit {

  @Input() isActiveSplash!: boolean;

  constructor() {
  }

  ngOnInit(): void {
  }

}
