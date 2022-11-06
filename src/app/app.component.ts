import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {

  readonly title: string = 'pe2pkcs7';

  isLoading: boolean = false;

  errorText$: Subject<string> = new Subject<string>();
  isValidFile$: Subject<boolean> = new Subject<boolean>();

  error!: string;

  ngOnInit(): void {
    this.isValidFile$.next(true);
    this.errorText$
      .subscribe(v => {
        this.error = v;
      })
  }

  onLoading(state: boolean): void {
    this.isLoading = state;
  }

  onErrorAlertClose(): void {
    this.error = '';
    this.isValidFile$.next(true);
  }
}
