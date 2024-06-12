import { Component, OnInit } from '@angular/core';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-avalpracticadocente',
    templateUrl: './avalpracticadocente.component.html',
    styleUrls: ['./avalpracticadocente.component.scss'],
})
export class AvalpracticadocenteComponent implements OnInit {
    constructor(public radicar: RadicarService) {}

    ngOnInit(): void {}
}
