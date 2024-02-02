import { Component, Input, OnInit } from '@angular/core';
import { RadicarService } from '../../services/radicar.service';

@Component({
    selector: 'app-asignaturaexterna',
    templateUrl: './asignaturaexterna.component.html',
    styleUrls: ['./asignaturaexterna.component.scss'],
})
export class AsignaturaexternaComponent implements OnInit {
    @Input() indice: number;

    nombre: string = '';
    institucion: string = '';
    programa: string = '';
    creditos: number = null;
    intensidad: number = null;
    codigo: number = null;
    grupo: string = '';
    docente: string = '';
    tituloDocente: string = '';
    contenidos: File[] = [];
    cartaAceptacion: File[] = [];

    constructor(public radicar: RadicarService) {}

    ngOnInit(): void {
        if (this.radicar.datosAsignaturasExternas[this.indice]) {
            this.nombre =
                this.radicar.datosAsignaturasExternas[this.indice].nombre;
            this.programa =
                this.radicar.datosAsignaturasExternas[this.indice].programa;
            this.institucion =
                this.radicar.datosAsignaturasExternas[this.indice].institucion;
            this.creditos =
                this.radicar.datosAsignaturasExternas[this.indice].creditos;
            this.intensidad =
                this.radicar.datosAsignaturasExternas[this.indice].intensidad;
            this.codigo =
                this.radicar.datosAsignaturasExternas[this.indice].codigo;
            this.grupo =
                this.radicar.datosAsignaturasExternas[this.indice].grupo;
            this.docente =
                this.radicar.datosAsignaturasExternas[this.indice].docente;
            this.tituloDocente =
                this.radicar.datosAsignaturasExternas[
                    this.indice
                ].tituloDocente;
            this.contenidos =
                this.radicar.datosAsignaturasExternas[this.indice].contenidos;
            this.cartaAceptacion =
                this.radicar.datosAsignaturasExternas[
                    this.indice
                ].cartaAceptacion;
        }
    }

    actualizarDatos() {
        const datos: {
            nombre: string;
            institucion: string;
            programa: string;
            creditos: number;
            intensidad: number;
            codigo: number;
            grupo: string;
            docente: string;
            tituloDocente: string;
            contenidos: File[];
            cartaAceptacion: File[];
        } = {
            nombre: this.nombre,
            institucion: this.institucion,
            programa: this.programa,
            creditos: this.creditos,
            intensidad: this.intensidad,
            codigo: this.codigo,
            grupo: this.grupo,
            docente: this.docente,
            tituloDocente: this.tituloDocente,
            contenidos: this.contenidos,
            cartaAceptacion: this.cartaAceptacion,
        };

        this.radicar.datosAsignaturasExternas[this.indice] = datos;
    }

    onUpload(event, fubauto) {
        for (let contenido of event.files) {
            this.contenidos.push(contenido);
        }

        this.actualizarDatos();
        fubauto.clear();
    }
}
