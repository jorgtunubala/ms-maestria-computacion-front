import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-prueba',
    templateUrl: './prueba.component.html',
    styleUrls: ['./prueba.component.scss'],
})
export class PruebaComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}
}
