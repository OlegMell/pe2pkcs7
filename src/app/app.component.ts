import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent {

  title = 'pe2pkcs7';
  isLoading: boolean = false;

  onLoading(state: boolean): void {
    this.isLoading = state;
  }
}
