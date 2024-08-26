import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RadicarService } from '../../../services/radicar.service';
import { HttpService } from '../../../services/http.service';
import {
    TipoSolicitud,
    RequisitosSolicitud,
    InfoPersonal,
} from '../../../models/indiceModelos';

@Component({
    selector: 'app-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss'],
})
export class SelectorComponent implements OnInit {
    tiposDeSolicitud: TipoSolicitud[];
    tipoSolicitudEscogida: TipoSolicitud;
    requisitosSolicitudEscogida: RequisitosSolicitud;

    constructor(
        public radicar: RadicarService,
        private gestorHttp: HttpService,
        private router: Router
    ) {}

    // Al iniciar el componente, se obtienen los tipos de solicitud
    ngOnInit(): void {
        this.obtenerTipos();
    }

    // Obtiene los tipos de solicitud y selecciona el primero por defecto
    obtenerTipos() {
        this.gestorHttp.obtenerTiposDeSolicitud().subscribe((respuesta) => {
            this.tiposDeSolicitud = respuesta;
            this.recuperarTipoEscogido();
        });
    }

    // Verifica en el servicio radicar si ya hay un tipo escogido y lo recupera
    recuperarTipoEscogido() {
        this.tipoSolicitudEscogida =
            this.radicar.tipoSolicitudEscogida || this.tiposDeSolicitud[0];

        this.obtenerRequisitosDeSolicitud();
    }

    // Obtiene los requisitos del tipo de solicitud escogida
    obtenerRequisitosDeSolicitud() {
        if (this.tipoSolicitudEscogida) {
            this.gestorHttp
                .obtenerRequisitosDeSolicitud(
                    this.tipoSolicitudEscogida.codigoSolicitud
                )
                .subscribe((respuesta) => {
                    this.requisitosSolicitudEscogida = respuesta;
                });
        }
    }

    // Guarda en el servicio la información actual y navega al siguiente componente
    navigateToNext() {
        this.radicar.tipoSolicitudEscogida = this.tipoSolicitudEscogida;
        this.radicar.requisitosSolicitudEscogida =
            this.requisitosSolicitudEscogida;
        this.router.navigate([
            '/gestionsolicitudes/portafolio/radicar/formulario',
        ]);
    }
}
