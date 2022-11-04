import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTopTextComponent } from './form-top-text.component';

describe('FormTopTextComponent', () => {
  let component: FormTopTextComponent;
  let fixture: ComponentFixture<FormTopTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormTopTextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTopTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
