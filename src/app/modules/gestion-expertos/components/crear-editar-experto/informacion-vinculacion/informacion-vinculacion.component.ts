import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { getRandomNumber } from 'src/app/core/utils/util';

@Component({
  selector: 'app-informacion-vinculacion',
  templateUrl: './informacion-vinculacion.component.html',
  styleUrls: ['./informacion-vinculacion.component.scss']
})
export class InformacionVinculacionComponent implements OnInit {

  @Output() formReady = new EventEmitter<FormGroup>();
  vinculacionForm: FormGroup;
  
  constructor(private fb:FormBuilder) { }

  ngOnInit():void {
    this.initForm();
  }
  initForm():void {
    this.vinculacionForm = this.fb.group({
      codigo: [getRandomNumber().toString()],
      universidadexp: [''],
      facultadexp: [''],
      observacionexp: [''],
      grupoinvexp: [''],
      idLineasInvestigacion: [''],
    });
    this.formReady.emit(this.vinculacionForm);
  }

  getFormControl(formControlName: string): FormControl {
    return this.vinculacionForm.get(formControlName) as FormControl;
  }
  

}
