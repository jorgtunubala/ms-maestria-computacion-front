import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NombreDelComponente2Component } from './nombre-del-componente2.component';

describe('NombreDelComponente2Component', () => {
  let component: NombreDelComponente2Component;
  let fixture: ComponentFixture<NombreDelComponente2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NombreDelComponente2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NombreDelComponente2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
