import {
    Component,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';

import { Router } from '@angular/router';
import { RadicarService } from '../../../services/radicar.service';
import {
    DatosAsignaturaAdicion,
    InfoPersonal,
    TutorYDirector,
} from '../../../models/indiceModelos';
import { HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
import { HttpService } from '../../../services/http.service';
import { AsignaturadicioncancelComponent } from './complementarios/asignaturadicioncancel/asignaturadicioncancel.component';
import { ListatutoresComponent } from './complementarios/listatutores/listatutores.component';
import { MotivosolicitudComponent } from './complementarios/motivosolicitud/motivosolicitud.component';
import { AsignaturahomologarComponent } from './complementarios/asignaturahomologar/asignaturahomologar.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SemestreaplazarComponent } from './complementarios/semestreaplazar/semestreaplazar.component';
import { AsignaturaexternaComponent } from './complementarios/asignaturaexterna/asignaturaexterna.component';
import { PasantiainvestComponent } from './complementarios/pasantiainvest/pasantiainvest.component';
import { ListadirectoresComponent } from './complementarios/listadirectores/listadirectores.component';
import { ApyeconomicoestanciaComponent } from './complementarios/apyeconomicoestancia/apyeconomicoestancia.component';
import { ApyasistenciaeventoComponent } from './complementarios/apyasistenciaevento/apyasistenciaevento.component';
import { ApypublicacionComponent } from './complementarios/apypublicacion/apypublicacion.component';

@Component({
    selector: 'app-formularios',
    templateUrl: './formularios.component.html',
    styleUrls: ['./formularios.component.scss'],
    providers: [MessageService],
})
export class FormulariosComponent implements OnInit {
    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: Event) {
        event.returnValue = true;
        return '¿Estás seguro de que quieres salir de la página?';
    }
    @ViewChildren(AsignaturadicioncancelComponent)
    formsAsignaturadicioncancel: QueryList<AsignaturadicioncancelComponent>;
    @ViewChild(ListatutoresComponent) formListaTutores: ListatutoresComponent;
    @ViewChild(MotivosolicitudComponent) formMotivo: MotivosolicitudComponent;
    @ViewChildren(AsignaturahomologarComponent)
    formsAsigHomolog: QueryList<AsignaturahomologarComponent>;
    @ViewChild(SemestreaplazarComponent)
    formAplzSemestre: SemestreaplazarComponent;
    @ViewChildren(AsignaturaexternaComponent)
    formsAsigExt: QueryList<AsignaturaexternaComponent>;
    @ViewChild(PasantiainvestComponent)
    formPasInvest: PasantiainvestComponent;
    @ViewChild(ListadirectoresComponent)
    formDirectores: ListadirectoresComponent;
    @ViewChild(ApyeconomicoestanciaComponent)
    formApyEconEst: ApyeconomicoestanciaComponent;
    @ViewChild(ApyasistenciaeventoComponent)
    formApyAsistEvnt: ApyasistenciaeventoComponent;
    @ViewChild(ApypublicacionComponent)
    formApyPagoPublic: ApypublicacionComponent;

    identificadorSolicitante: string = 'ctorres@unicauca.edu.co';
    tiposIdentificacion: string[];

    ofertaAcademicaAdiciones: DatosAsignaturaAdicion[];

    formAsigHomologarCont: FormGroup;

    tutorSeleccionado: any;

    tipoSolicitudEscogida: any;

    variableprovisional: boolean = false;

    constructor(
        public radicar: RadicarService,
        private gestorHttp: HttpService,
        private router: Router,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        try {
            this.tipoSolicitudEscogida = this.radicar.tipoSolicitudEscogida;

            if (
                this.radicar.tipoSolicitudEscogida.codigoSolicitud ===
                'HO_ASIG_ESP'
            ) {
                this.radicar.datosInstitucionHomologar = {
                    institucion: 'Universidad del Cauca',
                    programa:
                        'Especialización en Desarrollo de Soluciones Informáticas',
                };
            }

            if (
                ['HO_ASIG_POS', 'HO_ASIG_ESP'].includes(
                    this.radicar.tipoSolicitudEscogida.codigoSolicitud
                )
            ) {
                this.formAsigHomologarCont = this.fb.group({
                    nombrePrograma: [
                        {
                            value: '',
                            disabled:
                                radicar.tipoSolicitudEscogida
                                    .codigoSolicitud === 'HO_ASIG_ESP',
                        },
                        Validators.required,
                    ],
                    nombreInstitucion: [
                        {
                            value: '',
                            disabled:
                                radicar.tipoSolicitudEscogida
                                    .codigoSolicitud === 'HO_ASIG_ESP',
                        },
                        Validators.required,
                    ],
                });
            }

            if (
                (this.radicar.tipoSolicitudEscogida.codigoSolicitud ===
                    'RE_CRED_PAS',
                'AV_COMI_PR')
            ) {
                this.gestorHttp
                    .obtenerActividadesReCreditos()
                    .subscribe((respuesta) => {
                        this.radicar.actividadesReCreditos = respuesta;
                    });

                /*
                this.radicar.actividades = [
                    {
                        nombre: 'Diseño curricular de curso teórico/práctico nuevo de pregrado',
                        abreviacion: 'Diseño curricular',
                        multiplicativo: 12,
                        codigo: 'RE_CRED_DIS',
                        docs: [
                            'Documentaciónn según especificaciones establecidadas por el consejo de facultad para cursos nuevos',
                            'Aval del comite de programa de la Maestria para la realizacion de la actividad',
                        ],
                        enlaces: ['Material de apoyo (si aplica)'],
                    },
                    {
                        nombre: 'Preparación de curso teórico/práctico nuevo de pregrado',
                        abreviacion: 'Preparación de curso',
                        codigo: 'PR_CURS_TEO',
                        multiplicativo: 36,
                        docs: [
                            'Aval del Comité de programa de la Maestría para la realización de la actividad',
                        ],
                        enlaces: ['Material de apoyo elaborado para el curso'],
                    },
                    {
                        nombre: 'Docencia en pregrado',
                        abreviacion: 'Docencia',
                        codigo: 'AS_CRED_DO',
                        multiplicativo: 2.5,
                        docs: [
                            'Labor docente asignada (descargada de SIMCA) con la descripción de la intensidad horaria total desarrollada',
                        ],
                        enlaces: [],
                    },
                    {
                        nombre: 'Realización de seminario de actualización',
                        abreviacion: 'Seminario',
                        codigo: 'RE_CRED_SEM',
                        multiplicativo: 2.5,
                        docs: [
                            'Carta de aval del Consejo de Facultad',
                            'Listado de asistencia',
                        ],
                        enlaces: [],
                    },
                    {
                        nombre: 'Monitoria de cursos',
                        abreviacion: 'Monitoria',
                        codigo: 'AS_CRED_MON',
                        multiplicativo: null,
                        docs: [
                            'Certificación del profesor de la asignatura (s) indicando intensidad y trabajo realizado, con visto bueno del Jefe de Departamento',
                            'Aval del Comité de programa de la Maestría para la realización de la actividad',
                        ],
                        enlaces: [],
                    },
                    {
                        nombre: 'Elaboración de material de apoyo para pregrado',
                        abreviacion: 'Material de apoyo',
                        codigo: 'AS_CRED_MAT',
                        multiplicativo: null,
                        docs: [],
                        enlaces: [],
                    },
                    {
                        nombre: 'Dirección de trabajo de grado en pregrado',
                        abreviacion: 'Dirección trabajo de grado',
                        codigo: 'TG_PREG_POS',
                        multiplicativo: null,
                        docs: [],
                        enlaces: [],
                    },
                    {
                        nombre: 'Jurado de trabajo de grado de pregrado',
                        abreviacion: 'Jurado trabajo de grado',
                        codigo: 'JU_PREG_POS',
                        multiplicativo: null,
                        docs: [],
                        enlaces: [],
                    },
                    {
                        nombre: 'Evaluación de anteproyecto de pregrado',
                        abreviacion: 'Evaluación anteproyecto',
                        codigo: 'EV_ANTE_PRE',
                        multiplicativo: null,
                        docs: [],
                        enlaces: [],
                    },
                    {
                        nombre: 'Evaluación de productividad intelectual',
                        abreviacion: 'Evaluación productividad intelectual',
                        codigo: 'EV_PROD_INT',
                        multiplicativo: null,
                        docs: [],
                        enlaces: [],
                    },
                    {
                        nombre: 'Evaluación informe sabático',
                        abreviacion: 'Evaluación informe sabático',
                        codigo: 'EV_INFO_SAB',
                        multiplicativo: null,
                        docs: [],
                        enlaces: [],
                    },
                    {
                        nombre: 'Participación en el comité de programa',
                        abreviacion: 'Participación comité',
                        codigo: 'PA_COMI_PRO',
                        multiplicativo: null,
                        docs: [],
                        enlaces: [],
                    },
                    {
                        nombre: 'Realización de otras actividades de apoyo al departamento',
                        abreviacion: 'Otras actividades',
                        codigo: 'OT_ACTI_APO',
                        multiplicativo: null,
                        docs: [],
                        enlaces: [],
                    },
                    {
                        nombre: 'Publicaciones',
                        abreviacion: 'Publicaciones',
                        codigo: 'RE_CRED_PUB',
                        multiplicativo: null,
                        docs: [],
                        enlaces: [],
                    },
                ];
                */
            }
        } catch (error) {
            console.error('Se produjo un error:', error);

            // Verificar si el error es del tipo TypeError y si contiene la cadena 'codigoSolicitud'
            if (
                error instanceof TypeError &&
                error.message.includes('codigoSolicitud')
            ) {
                // Redirigir al usuario a una ruta específica
                this.router.navigate([
                    '/gestionsolicitudes/portafolio/radicar/selector',
                ]);
            } else {
                // Manejar otros errores de manera apropiada
                console.error('Error no esperado:', error);
            }
        }

        this.tiposIdentificacion = [
            'Cédula de ciudadania',
            'Cédula de extrangeria',
            'Tarjeta de identidad',
            'Pasaporte',
            'CC',
        ];
    }

    ngOnInit(): void {
        if (this.radicar.datosSolicitante.nombres == null) {
            this.obtenerInfoDeSolicitante();
        }

        if (
            this.radicar.tipoSolicitudEscogida &&
            ['HO_ASIG_POS', 'HO_ASIG_ESP'].includes(
                this.radicar.tipoSolicitudEscogida.codigoSolicitud
            )
        ) {
            // Verificar si hay texto en las variables del servicio radicar y llenar el formulario
            if (
                this.radicar.datosInstitucionHomologar.institucion.trim() !== ''
            ) {
                this.formAsigHomologarCont.patchValue({
                    nombreInstitucion:
                        this.radicar.datosInstitucionHomologar.institucion,
                });
            }
            if (this.radicar.datosInstitucionHomologar.programa.trim() !== '') {
                this.formAsigHomologarCont.patchValue({
                    nombrePrograma:
                        this.radicar.datosInstitucionHomologar.programa,
                });
            }

            // Escuchar cambios en el formulario y actualizar las variables en radicar
            this.formAsigHomologarCont.valueChanges.subscribe((value) => {
                this.radicar.datosInstitucionHomologar.institucion =
                    value.nombreInstitucion;
                this.radicar.datosInstitucionHomologar.programa =
                    value.nombrePrograma;
            });
        }

        this.recuperarListadoTutores();
    }

    validarDatosFormulario(): boolean {
        let estadoGeneral: boolean = false;

        switch (this.radicar.tipoSolicitudEscogida.codigoSolicitud) {
            case 'AD_ASIG':
                estadoGeneral =
                    this.formsAsignaturadicioncancel.length > 0 &&
                    this.formsAsignaturadicioncancel
                        .toArray()
                        .every((formulario) =>
                            formulario.obtenerEstadoFormulario()
                        ) &&
                    this.formListaTutores.obtenerEstadoFormulario();
                break;

            case 'CA_ASIG':
                estadoGeneral =
                    this.formsAsignaturadicioncancel.length > 0 &&
                    this.formsAsignaturadicioncancel
                        .toArray()
                        .every((formulario) =>
                            formulario.obtenerEstadoFormulario()
                        ) &&
                    this.formMotivo.obtenerEstadoFormulario() &&
                    this.formListaTutores.obtenerEstadoFormulario();
                break;
            case 'AP_SEME':
                estadoGeneral =
                    this.formAplzSemestre.obtenerEstadoFormulario() &&
                    this.formMotivo.obtenerEstadoFormulario() &&
                    this.formListaTutores.obtenerEstadoFormulario();
                break;
            case 'CU_ASIG':
                estadoGeneral =
                    this.formsAsigExt.length > 0 &&
                    this.formsAsigExt
                        .toArray()
                        .every(
                            (formulario) =>
                                formulario.obtenerEstadoFormulario() &&
                                formulario.validarDocumentosCargados()
                        ) &&
                    this.formListaTutores.obtenerEstadoFormulario() &&
                    this.formMotivo.obtenerEstadoFormulario();
                break;
            case 'HO_ASIG_POS':
                estadoGeneral =
                    this.formsAsigHomolog.length > 0 &&
                    this.formsAsigHomolog
                        .toArray()
                        .every(
                            (formulario) =>
                                formulario.obtenerEstadoFormulario() &&
                                formulario.validarDocumentoCargado()
                        ) &&
                    this.formListaTutores.obtenerEstadoFormulario() &&
                    this.obtenerEstadoFormularioHomAsig();
                break;
            case 'HO_ASIG_ESP':
                estadoGeneral =
                    this.formsAsigHomolog.length > 0 &&
                    this.formsAsigHomolog
                        .toArray()
                        .every((formulario) =>
                            formulario.obtenerEstadoFormulario()
                        ) &&
                    this.formListaTutores.obtenerEstadoFormulario();

                break;
            case 'AV_PASA_INV':
                estadoGeneral =
                    this.formPasInvest.obtenerEstadoFormulario() &&
                    this.formPasInvest.validarFechas() &&
                    this.formListaTutores.obtenerEstadoFormulario();
                break;
            case 'AP_ECON_INV':
                estadoGeneral =
                    this.formApyEconEst.obtenerEstadoFormulario() &&
                    this.formApyEconEst.validarFechas() &&
                    this.formListaTutores.obtenerEstadoFormulario() &&
                    this.formDirectores.obtenerEstadoFormulario();
                break;
            case 'AP_ECON_ASI':
                estadoGeneral =
                    this.formApyAsistEvnt.obtenerEstadoFormulario() &&
                    this.formApyAsistEvnt.validarFechas() &&
                    this.formListaTutores.obtenerEstadoFormulario() &&
                    this.formDirectores.obtenerEstadoFormulario();
                break;
            case 'PA_PUBL_EVE':
                estadoGeneral =
                    this.formApyPagoPublic.obtenerEstadoFormulario() &&
                    this.formApyPagoPublic.validarFechas() &&
                    this.formListaTutores.obtenerEstadoFormulario() &&
                    this.formDirectores.obtenerEstadoFormulario();
                break;
            default:
                estadoGeneral = this.formListaTutores.obtenerEstadoFormulario();
                break;
        }

        return estadoGeneral;
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

    agregarInstanciaAsigAdiCancel() {
        this.radicar.numeroInstanciasAsignAdiCancel++;
        this.radicar.instanciasAsignAdiCancel.push({});
    }

    eliminarInstanciaAsigAdiCancel(index: number) {
        this.radicar.datosAsignAdiCancel.splice(index, 1);
        this.radicar.instanciasAsignAdiCancel.splice(index, 1);
    }

    obtenerEstadoFormularioHomAsig(): boolean {
        return this.formAsigHomologarCont.valid;
    }

    recuperarListadoTutores() {
        this.gestorHttp.obtenerTutoresYDirectores().subscribe((respuesta) => {
            // Asignamos la respuesta al arreglo listadoTutoresYDirectores
            this.radicar.listadoTutoresYDirectores = respuesta;

            // Creamos un nuevo tutor
            const nuevoTutor: TutorYDirector = {
                id: '-1',
                codigoTutor: 'codigoNuevoTutor',
                nombreTutor: 'Seleccione un docente',
            };

            // Agregamos el nuevo tutor al inicio del arreglo
            this.radicar.listadoTutoresYDirectores.unshift(nuevoTutor);
        });
    }

    showWarn() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Información Incompleta',
            detail: 'Diligencie todos los campos requeridos',
        });
    }

    navigateToNext() {
        /*
        this.radicar.setDatosSolicitante(this.datosSolicitante);
        this.radicar.setMaterias(this.materiasSeleccionadas);
        */

        if (this.validarDatosFormulario()) {
            if (
                [
                    'AD_ASIG',
                    'CA_ASIG',
                    'AP_SEME',
                    'CU_ASIG',
                    'RE_CRED_PAS',
                    'AV_COMI_PR',
                ].includes(this.radicar.tipoSolicitudEscogida.codigoSolicitud)
            ) {
                this.router.navigate([
                    '/gestionsolicitudes/portafolio/radicar/resumen',
                ]);
            } else {
                this.router.navigate([
                    '/gestionsolicitudes/portafolio/radicar/adjuntos',
                ]);
            }
        } else {
            this.showWarn();
        }
    }

    navigateToBack() {
        /*
        this.radicar.setDatosSolicitante(this.datosSolicitante);
        this.radicar.setMaterias(this.materiasSeleccionadas);
        */
        this.router.navigate([
            '/gestionsolicitudes/portafolio/radicar/selector',
        ]);
    }
}
