import { Component, OnDestroy, OnInit } from '@angular/core';

const SPLASH_SHOW_TIME: number = 2000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, OnDestroy {

  private timeOutDescriptor!: NodeJS.Timeout;
  readonly title: string = 'pe2pkcs7';

  isLoading: boolean = false;
  isShowSplash: boolean = true;

  ngOnInit(): void {
    this.showSplash();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutDescriptor);
  }

  onLoading(state: boolean): void {
    this.isLoading = state;
  }

  private showSplash(): void {
    this.timeOutDescriptor = setTimeout(() => this.isShowSplash = false, SPLASH_SHOW_TIME);
  }
}
