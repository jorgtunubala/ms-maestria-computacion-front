import { Component, Input, OnInit } from '@angular/core';
import { RadicarService } from '../../../../../services/radicar.service';

@Component({
    selector: 'app-asignaturahomologar',
    templateUrl: './asignaturahomologar.component.html',
    styleUrls: ['./asignaturahomologar.component.scss'],
})
export class AsignaturahomologarComponent implements OnInit {
    @Input() indice: number;
    asignatura: string = '';
    creditos: number = null;
    intensidad: number = null;
    calificacion: number = null;
    contenidos: File;

    constructor(public radicar: RadicarService) {}

    ngOnInit(): void {
        if (this.radicar.datosAsignaturasAHomologar[this.indice]) {
            this.asignatura =
                this.radicar.datosAsignaturasAHomologar[this.indice].asignatura;
            this.creditos =
                this.radicar.datosAsignaturasAHomologar[this.indice].creditos;
            this.intensidad =
                this.radicar.datosAsignaturasAHomologar[this.indice].intensidad;
            this.calificacion =
                this.radicar.datosAsignaturasAHomologar[
                    this.indice
                ].calificacion;
            this.contenidos =
                this.radicar.datosAsignaturasAHomologar[this.indice].contenidos;
        }
    }

    actualizarDatos() {
        const datos: {
            asignatura: string;
            creditos: number;
            intensidad: number;
            calificacion: number;
            contenidos: File;
        } = {
            asignatura: this.asignatura,
            creditos: this.creditos,
            intensidad: this.intensidad,
            calificacion: this.calificacion,
            contenidos: this.contenidos,
        };

        this.radicar.datosAsignaturasAHomologar[this.indice] = datos;
    }

    onUpload(event, fubauto) {
        for (let contenido of event.files) {
            this.contenidos = contenido;
        }

        this.actualizarDatos();
        fubauto.clear();
    }
}
