import { Component, OnInit } from '@angular/core';
import { Solicitud } from '../../../models/solicitudes/solicitud.model';
import { DialogService } from 'primeng/dynamicdialog';
import { GestorService } from '../../../services/gestor.service';
import { VisoravalComponent } from '../visoraval/visoraval.component';
import {
    SolicitudPendienteAval,
    TipoSolicitud,
} from '../../../models/indiceModelos';
import { HttpService } from '../../../services/http.service';
import { RadicarService } from '../../../services/radicar.service';

@Component({
    selector: 'app-pendientesaval',
    templateUrl: './pendientesaval.component.html',
    styleUrls: ['./pendientesaval.component.scss'],
    providers: [DialogService],
})
export class PendientesavalComponent implements OnInit {
    correoUsuario: string = 'clopez@unicauca.edu.co';
    solicitudes: SolicitudPendienteAval[] = [];
    solicitudSeleccionada: SolicitudPendienteAval = {
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
        public dialogService: DialogService,
        public http: HttpService
    ) {}

    ngOnInit(): void {
        this.cargarSolicitudes();

        this.gestor.cargarSolicitudes$.subscribe(() => {
            this.cargarSolicitudes();
        });
    }

    cargarSolicitudes() {
        this.http.obtenerListaSolPendientesAval(this.correoUsuario).subscribe(
            (solicitudes: SolicitudPendienteAval[]) => {
                this.solicitudes = solicitudes;
            },
            (error) => {
                console.error('Error al cargar las solicitudes:', error);
            }
        );
    }

    mostrarDetalles(event) {
        this.gestor.setSolicitudSeleccionada(this.solicitudSeleccionada);

        const tipoSolicitud: TipoSolicitud = {
            idSolicitud: this.solicitudSeleccionada.idSolicitud,
            codigoSolicitud: this.solicitudSeleccionada.codigoSolicitud,
            nombreSolicitud: this.solicitudSeleccionada.nombreTipoSolicitud,
        };

        this.radicar.tipoSolicitudEscogida = tipoSolicitud;

        const ref = this.dialogService.open(VisoravalComponent, {
            data: {
                id: '51gF4',
            },
            header: 'Detalles de la solicitud',
            width: '80%',
        });

        ref.onClose.subscribe(() => {
            this.radicar.restrablecerValores();
        });
    }
}
