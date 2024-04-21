import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RadicarService } from '../../services/radicar.service';

@Component({
    selector: 'app-opciones',
    templateUrl: './opciones.component.html',
    styleUrls: ['./opciones.component.scss'],
})
export class OpcionesComponent implements OnInit {
    constructor(private router: Router, public radicar: RadicarService) {}

    ngOnInit(): void {
        this.radicar.restrablecerValores();
    }

    cargarPagina() {
        this.router.navigate([
            '/gestionsolicitudes/portafolio/radicar/selector',
        ]);
    }

    buscarSolicitud() {
        this.router.navigate([
            '/gestionsolicitudes/portafolio/seguimiento/historial',
        ]);
    }
}
