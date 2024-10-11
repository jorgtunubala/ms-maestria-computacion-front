import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NombreDelComponente1Component } from './nombre-del-componente1.component';

describe('NombreDelComponente1Component', () => {
  let component: NombreDelComponente1Component;
  let fixture: ComponentFixture<NombreDelComponente1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NombreDelComponente1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NombreDelComponente1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
