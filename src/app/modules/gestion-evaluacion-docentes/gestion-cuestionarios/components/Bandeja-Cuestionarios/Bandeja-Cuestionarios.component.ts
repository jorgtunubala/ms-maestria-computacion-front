import { Component, OnInit } from '@angular/core';
import { Cuestionario } from '../../models/cuestionario';

@Component({
  selector: 'app-bandeja-buestionarios',
  templateUrl: './bandeja-cuestionarios.component.html',
  styleUrls: ['./bandeja-cuestionarios.component.scss']
})
export class BandejaCuestionariosComponent implements OnInit {
  visible: boolean = false;
  loading: boolean;
  cuestionarios: Cuestionario[] = [];

  constructor() { }

  ngOnInit() {
  }

  showDialog() {
    this.visible = true;
  }

}
