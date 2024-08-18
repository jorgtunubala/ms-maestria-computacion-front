import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { GestorService } from '../../../services/gestor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { SolicitudRecibida } from '../../../models/indiceModelos';
import { SeguimientoService } from '../../../services/seguimiento.service';

@Component({
    selector: 'app-buzon',
    templateUrl: './buzon.component.html',
    styleUrls: ['./buzon.component.scss'],
    providers: [DialogService],
})
export class BuzonComponent implements OnInit {
    solicitudes: SolicitudRecibida[];
    seleccionada: SolicitudRecibida;

    cargandoSolicitudes: boolean = true;

    constructor(
        public gestor: GestorService,
        private router: Router,
        private route: ActivatedRoute,
        public seguimiento: SeguimientoService,
        public http: HttpService,
        public dialogService: DialogService
    ) {}

    ngOnInit(): void {
        const rutaCompleta = this.route.snapshot.url.join('/');
        const filtro = rutaCompleta.split('/').pop();

        if (filtro) {
            this.cargarSolicitudes(this.proporcionarEstado(filtro));
        }

        this.seguimiento.restablecerValores();
    }

    cargarSolicitudes(prmFiltro: string) {
        this.http.consultarSolicitudesCoordinacion(prmFiltro).subscribe(
            (solicitudes: SolicitudRecibida[]) => {
                this.solicitudes = solicitudes;
                this.cargandoSolicitudes = false;
            },
            (error) => {
                console.error('Error al cargar las solicitudes:', error);
            }
        );
    }

    proporcionarEstado(cadena: string): string {
        const estados: { [key: string]: string } = {
            nuevas: 'AVALADA',
            rechazadas: 'RECHAZADA',
        };

        return estados[cadena] || '';
    }

    mostrarDetalles() {
        this.gestor.solicitudSeleccionada = this.seleccionada;
        this.gestor.rutaPrevia = this.router.url;
        this.router.navigate(['/gestionsolicitudes/visor']);
    }
}
