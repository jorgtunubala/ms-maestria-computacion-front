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
    infoSolicitante: InfoPersonal;

    constructor(
        public radicar: RadicarService,
        private gestorHttp: HttpService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.obtenerTipos();
    }

    obtenerTipos() {
        this.gestorHttp.obtenerTiposDeSolicitud().subscribe((respuesta) => {
            this.tiposDeSolicitud = respuesta;
            this.recuperarTipoEscogido();
        });
    }

    recuperarTipoEscogido() {
        if (this.radicar.tipoSolicitudEscogida) {
            this.tipoSolicitudEscogida = this.radicar.tipoSolicitudEscogida;
            this.obtenerRequisitosDeSolicitud();
        } else {
            this.tipoSolicitudEscogida = this.tiposDeSolicitud[0];
            this.obtenerRequisitosDeSolicitud();
        }
    }

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

    navigateToNext() {
        this.radicar.tipoSolicitudEscogida = this.tipoSolicitudEscogida;
        this.radicar.requisitosSolicitudEscogida =
            this.requisitosSolicitudEscogida;
        this.router.navigate(['/gestionsolicitudes/creacion/datos']);
    }
}
