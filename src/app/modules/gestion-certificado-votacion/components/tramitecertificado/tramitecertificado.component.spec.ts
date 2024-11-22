import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TramitecertificadoComponent } from './tramitecertificado.component';

describe('TramitecertificadoComponent', () => {
  let component: TramitecertificadoComponent;
  let fixture: ComponentFixture<TramitecertificadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TramitecertificadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TramitecertificadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
