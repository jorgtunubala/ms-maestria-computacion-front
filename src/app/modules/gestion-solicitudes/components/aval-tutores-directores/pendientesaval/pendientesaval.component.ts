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
    correoUsuario: string = 'lsierra@unicauca.edu.co';
    //correoUsuario: string = 'luz123@unicauca.edu.co';
    solicitudes: SolicitudRecibida[] = [];
    seleccionada: SolicitudRecibida;
    cargando: boolean = true;
    buzonVacio: boolean = false;
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
        this.gestor.restablecerValores();
        this.cargarSolicitudes();

        /*
        this.gestor.cargarSolicitudes$.subscribe(() => {
            this.cargarSolicitudes();
        });
        */
        this.gestor.restablecerValores();
    }

    cargarSolicitudes() {
        this.gestor
            .obtenerSolicitudesTutorDirector(this.correoUsuario)
            .subscribe(
                (solicitudes: SolicitudRecibida[]) => {
                    //this.solicitudes = solicitudes;
                    this.cargando = false;
                    this.buzonVacio = solicitudes.length === 0;
                },
                (error) => {
                    console.error('Error al cargar las solicitudes:', error);
                }
            );
    }

    // Limpia los filtros de la tabla
    limpiarFiltros(table: any): void {
        table.clear();
    }

    mostrarDetalles() {
        console.log(this.seleccionada);
        localStorage.setItem(
            'solicitudSeleccionadaTutorDirector',
            JSON.stringify(this.seleccionada)
        );

        // Navega a VistaComponent pasando la ID de la solicitud seleccionada como parámetro de ruta
        this.router.navigate([
            '/gestionsolicitudes/avales/pendientes/detalles',
        ]);
    }
}
