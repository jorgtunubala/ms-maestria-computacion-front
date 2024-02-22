import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-informacion-usuario',
  templateUrl: './informacion-usuario.component.html',
  styleUrls: ['./informacion-usuario.component.scss']
})
export class InformacionUsuarioComponent implements OnInit {

  personalForm: FormGroup;
  constructor() { }

  ngOnInit() {
  }

  

  getFormControl(formControlName: string): FormControl {
    return this.personalForm.get(formControlName) as FormControl;
  }

}
