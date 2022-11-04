import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MainFormComponent } from './components/main-form/main-form.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoaderComponent } from './components/loader/loader.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormTopTextComponent } from './components/main-form/form-top-text/form-top-text.component';
import { RadioButtonComponent } from './components/main-form/radio-button/radio-button.component';
import { DndDirective } from './directives/dnd.directive';
import { ErrorAlertComponent } from './components/error-alert/error-alert.component';
import { ButtonComponent } from './components/button/button.component';
import { SuccessMessageComponent } from './components/success-message/success-message.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainFormComponent,
    FooterComponent,
    LoaderComponent,
    FormTopTextComponent,
    RadioButtonComponent,
    DndDirective,
    ErrorAlertComponent,
    ButtonComponent,
    SuccessMessageComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
