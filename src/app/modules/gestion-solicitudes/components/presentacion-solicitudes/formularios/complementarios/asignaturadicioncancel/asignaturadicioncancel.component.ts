import { Component, Input, OnInit } from '@angular/core';
import { TutorYDirector } from 'src/app/modules/gestion-solicitudes/models/tutorYDirector';
import { HttpService } from 'src/app/modules/gestion-solicitudes/services/http.service';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-asignaturadicioncancel',
    templateUrl: './asignaturadicioncancel.component.html',
    styleUrls: ['./asignaturadicioncancel.component.scss'],
})
export class AsignaturadicioncancelComponent implements OnInit {
    @Input() indice: number;
    nombreAsignatura: string = '';
    docente: TutorYDirector = null;
    listadoDocentes: TutorYDirector[];

    constructor(
        public radicar: RadicarService,
        private gestorHttp: HttpService
    ) {}

    ngOnInit(): void {
        if (this.radicar.datosAsignAdiCancel[this.indice]) {
            this.nombreAsignatura =
                this.radicar.datosAsignAdiCancel[this.indice].nombreAsignatura;
            this.docente =
                this.radicar.datosAsignAdiCancel[this.indice].docente;
        }

        this.recuperarListadoDocentes();
    }

    recuperarListadoDocentes() {
        this.gestorHttp.obtenerTutoresYDirectores().subscribe((respuesta) => {
            this.listadoDocentes = respuesta;
        });
    }

    actualizarDatos() {
        const datos: {
            nombreAsignatura: string;
            docente: TutorYDirector;
        } = {
            nombreAsignatura: this.nombreAsignatura,
            docente: this.docente,
        };

        this.radicar.datosAsignAdiCancel[this.indice] = datos;
    }
}
