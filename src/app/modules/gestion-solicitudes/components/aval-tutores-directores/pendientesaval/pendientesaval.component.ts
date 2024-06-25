import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { GestorService } from '../../../services/gestor.service';
import {
    SolicitudRecibida,
    TipoSolicitud,
} from '../../../models/indiceModelos';
import { HttpService } from '../../../services/http.service';
import { RadicarService } from '../../../services/radicar.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-pendientesaval',
    templateUrl: './pendientesaval.component.html',
    styleUrls: ['./pendientesaval.component.scss'],
    providers: [DialogService],
})
export class PendientesavalComponent implements OnInit {
    correoUsuario: string = 'clopez@unicauca.edu.co';
    solicitudes: SolicitudRecibida[] = [];
    cargando: boolean = true;
    solicitudSeleccionada: SolicitudRecibida = {
        idSolicitud: 0,
        codigoSolicitud: '',
        nombreEstudiante: '',
        nombreTipoSolicitud: '',
        abreviatura: '',
        fecha: undefined,
    };

    constructor(
        public gestor: GestorService,
        public radicar: RadicarService,
        private router: Router,
        public dialogService: DialogService,
        public http: HttpService
    ) {}

    ngOnInit(): void {
        this.radicar.restrablecerValores();
        this.cargarSolicitudes();

        this.gestor.cargarSolicitudes$.subscribe(() => {
            this.cargarSolicitudes();
        });
    }

    cargarSolicitudes() {
        this.http.obtenerListaSolPendientesAval(this.correoUsuario).subscribe(
            (solicitudes: SolicitudRecibida[]) => {
                this.solicitudes = solicitudes;
                this.cargando = false;
            },
            (error) => {
                console.error('Error al cargar las solicitudes:', error);
            }
        );
    }

    mostrarDetalles(event) {
        // Obtiene la solicitud seleccionada
        this.gestor.setSolicitudSeleccionada(this.solicitudSeleccionada);

        const tipoSolicitud: TipoSolicitud = {
            idSolicitud: this.solicitudSeleccionada.idSolicitud,
            codigoSolicitud: this.solicitudSeleccionada.codigoSolicitud,
            nombreSolicitud: this.solicitudSeleccionada.nombreTipoSolicitud,
        };

        this.radicar.tipoSolicitudEscogida = tipoSolicitud;

        // Navega a VistaComponent pasando la ID de la solicitud seleccionada como parámetro de ruta
        this.router.navigate([
            '/gestionsolicitudes/avales/pendientes/detalles',
        ]);
    }
}
