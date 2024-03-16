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

  lineas = [
    {
      groupName: 'Ingeniería de Software',
      items: [
        { name: 'calidadProcesoProducto', label: 'Calidad de proceso y producto' },
        { name: 'ingenieriaProcesosLineas', label: 'Ingeniería de procesos y líneas de producto' },
        { name: 'ingenieriaColaboracionUsabilidad', label: 'Ingeniería de la Colaboración y la Usabilidad' }
      ]
    },
    {
      groupName: 'Gestión de la Información y Tecnologías de la Información',
      items: [
        { name: 'mineriaDatos', label: 'Minería de datos' },
        { name: 'bodegaDatos', label: 'Bodega de datos' },
        { name: 'recuperacionInfo', label: 'Recuperacion de información' },
        { name: 'busquedaWeb', label: 'Búsqueda web' },
        { name: 'Iot', label: 'Internet de las cosas' },
      ]
    },
    {
      groupName: 'Sistemas Intgeligentes - Inteligencia Computacional',
      items: [
        { name: 'redesNeuronales', label: 'Redes neuronales' },
        { name: 'deepLearning', label: 'Deep Learning' },
        { name: 'metaHeu', label: 'Meta heurísticas' },
        { name: 'aprenSuperv', label: 'Aprendizaje supervisado y no supervisado' },
        { name: 'agentes', label: 'Agentes' },
      ]
    }
  ];
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
      lineainvexp: [''],
    });
    this.formReady.emit(this.vinculacionForm);
  }

  getFormControl(formControlName: string): FormControl {
    return this.vinculacionForm.get(formControlName) as FormControl;
  }
  

}
