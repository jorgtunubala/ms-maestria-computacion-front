import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RadicarService } from '../../../services/radicar.service';
import { InfoPersonal, TutorYDirector } from '../../../models';
import { HttpService } from '../../../services/http.service';

@Component({
    selector: 'app-formularios',
    templateUrl: './formularios.component.html',
    styleUrls: ['./formularios.component.scss'],
})
export class FormulariosComponent implements OnInit {
    identificadorSolicitante: string = 'ctorres@unicauca.edu.co';
    tiposIdentificacion: string[];
    tiposCuentaBancaria: string[];
    ofertaAcademica: any[];
    listadoTutoresYDirectores: TutorYDirector[];
    tutorSeleccionado: any;

    tipoSolicitudEscogida: any;

    variableprovisional: boolean = false;

    constructor(
        public radicar: RadicarService,
        private gestorHttp: HttpService,
        private router: Router
    ) {
        this.tiposIdentificacion = [
            'Cédula de ciudadania',
            'Cédula de extrangeria',
            'Tarjeta de identidad',
            'Pasaporte',
            'CC',
        ];

        this.tiposCuentaBancaria = ['Ahorros', 'Corriente'];

        this.tipoSolicitudEscogida = this.radicar.tipoSolicitudEscogida;

        if (
            this.radicar.tipoSolicitudEscogida.codigoSolicitud === 'HO_ASIG_ESP'
        ) {
            this.radicar.datosInstitucionHomologar = {
                institucion: 'Universidad del Cauca',
                programa:
                    'Especialización en Desarrollo de Soluciones Informáticas',
            };
        }
    }

    ngOnInit(): void {
        if (this.radicar.datosSolicitante.nombres == null) {
            this.obtenerInfoDeSolicitante();
        }

        this.recuperarOfertaAcademica();
        this.recuperarListadoTutores();
    }

    obtenerInfoDeSolicitante() {
        this.gestorHttp
            .obtenerInfoPersonalSolicitante(this.identificadorSolicitante)
            .subscribe((respuesta) => {
                this.radicar.datosSolicitante = respuesta;
            });
    }

    agregarInstancia() {
        this.radicar.numeroInstAsignHomologar++;
        this.radicar.instanciasAsignHomologar.push({});
    }

    agregarInstanciaAsigExt() {
        this.radicar.numeroInstanciasAsignExterna++;
        this.radicar.instanciasAsignExterna.push({});
    }

    eliminarInstancia(index: number) {
        this.radicar.datosAsignaturasAHomologar.splice(index, 1);
        this.radicar.instanciasAsignHomologar.splice(index, 1);
    }

    eliminarInstanciaAsigExt(index: number) {
        this.radicar.datosAsignaturasExternas.splice(index, 1);
        this.radicar.instanciasAsignExterna.splice(index, 1);
    }

    recuperarOfertaAcademica() {
        this.ofertaAcademica = [
            {
                grupo: 'TC34',
                nombre: 'Teoria de la Computación',
                docente: 'Juan Esteban Guarnizo Erazo',
            },
            {
                grupo: 'QC835',
                nombre: 'Computacion Cauntica',
                docente: 'Maria Camila Gomez Barrera',
            },
            {
                grupo: 'ALG546',
                nombre: 'Algoritmia',
                docente: 'Diego Alexander Asprilla Paz',
            },
            {
                grupo: 'TPD342',
                nombre: 'Pedagogia',
                docente: 'Ines Alexandra Muñoz Andrade',
            },
            {
                grupo: 'ESL657',
                nombre: 'Estructura de lenguajes',
                docente: 'Silvana Sarmiento Ramirez',
            },
        ];
    }

    recuperarListadoTutores() {
        this.gestorHttp.obtenerTutoresYDirectores().subscribe((respuesta) => {
            this.listadoTutoresYDirectores = respuesta;
        });
    }

    navigateToNext() {
        /*
        this.radicar.setDatosSolicitante(this.datosSolicitante);
        this.radicar.setMaterias(this.materiasSeleccionadas);
        */
        if (
            ['AD_ASIG', 'CA_ASIG'].includes(
                this.radicar.tipoSolicitudEscogida.codigoSolicitud
            )
        ) {
            this.router.navigate(['/gestionsolicitudes/creacion/resumen']);
        } else {
            this.router.navigate(['/gestionsolicitudes/creacion/documentos']);
        }
    }

    navigateToBack() {
        /*
        this.radicar.setDatosSolicitante(this.datosSolicitante);
        this.radicar.setMaterias(this.materiasSeleccionadas);
        */
        this.router.navigate(['/gestionsolicitudes/creacion/selector']);
    }
}
