import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtrasolictudComponent } from './otrasolictud.component';

describe('OtrasolictudComponent', () => {
  let component: OtrasolictudComponent;
  let fixture: ComponentFixture<OtrasolictudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtrasolictudComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtrasolictudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
