import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import {
    DatosComunSolicitud,
    InfoActividadesReCreditos,
    InfoPersonal,
    RequisitosSolicitud,
    TipoSolicitud,
    TutorYDirector,
} from '../models/indiceModelos';
import { DatosSolicitudRequest } from '../models/solicitudes/datosSolicitudRequest';
import { InfoAsingAdicionCancelacion } from '../models/solicitudes/solicitud-adic-cancel-asig/infoAsignAdicionCancelacion';
import { HttpService } from './http.service';
import { UtilidadesService } from './utilidades.service';
import { FormBuilder, FormGroup } from '@angular/forms';

interface AdjuntosActividad {
    archivos: File[];
    enlaces: string[];
}
interface AdjuntosDeActividades {
    [actividadId: number]: AdjuntosActividad;
}

@Injectable({
    providedIn: 'root',
})
export class RadicarService {
    private clickSubject = new Subject<void>();
    listadoTutoresYDirectores: TutorYDirector[];

    formInfoDePrueba: FormGroup = new FormGroup({});
    formInfoPersonal: FormGroup = new FormGroup({});
    //formSolicitudAdiCancel: FormGroup = new FormGroup({});
    formSemestreAplazar: FormGroup = new FormGroup({});
    formApoyoAsistEvento: FormGroup = new FormGroup({});
    formSolicitudBecaDescuento: FormGroup = new FormGroup({});

    fechaEnvio: Date = null;
    tipoSolicitudEscogida: TipoSolicitud;
    radicadoAsignado: string = '';
    actividadesReCreditos: InfoActividadesReCreditos[];
    actividadesSeleccionadas: InfoActividadesReCreditos[];
    requisitosSolicitudEscogida: RequisitosSolicitud;

    oficioDeSolicitud: File = null;
    documentosAdjuntos: File[] = [];
    motivoDeSolicitud: string = '';
    tutor: TutorYDirector;
    director: TutorYDirector;
    firmaSolicitante: File = null;
    firmaSolicitanteUrl: SafeUrl = '';
    firmaTutor: File = null;
    firmaTutorUrl: SafeUrl = '';
    firmaTutorPag: number = 0;
    firmaTutorX: number = 0;
    firmaTutorY: number = 0;
    firmaDirector: File = null;
    firmaDirectorUrl: SafeUrl = '';
    firmaDirectorPag: number = 0;
    firmaDirectorX: number = 0;
    firmaDirectorY: number = 0;

    fechasEstancia: Date[] = [];
    lugarEstancia: string = '';

    nombreCongreso: string = '';
    tipoCongreso: string = 'Seleccione una opción';
    tituloPublicacion: string = '';

    horasIngresadas: number[] = [];
    horasAsignables: number[] = [];
    adjuntosDeActividades: AdjuntosDeActividades = {};

    grupoInvestigacion: string = 'Seleccione una opción';
    valorApoyoEcon: number = 0;
    banco: string = '';
    tipoCuenta: string = 'Seleccione una opción';
    numeroCuenta: string = '';
    cedulaCuentaBanco: string = null;
    direccion: string = '';

    asignaturasAdicCancel: InfoAsingAdicionCancelacion[] = [];

    numeroInstanciasAsignExterna: number = 1;
    instanciasAsignExterna: any[] = [{}];
    datosAsignaturasExternas: {
        nombre: string;
        programa: string;
        institucion: string;
        creditos: number;
        intensidad: number;
        codigo: string;
        grupo: string;
        docente: string;
        tituloDocente: string;
        contenidos: File;
        cartaAceptacion: File;
    }[] = [];

    numeroInstanciasAsignAdiCancel: number = 1;
    instanciasAsignAdiCancel: any[] = [{}];
    datosAsignAdiCancel: {
        nombreAsignatura: string;
        docente: TutorYDirector;
    }[] = [];

    numeroInstAsignHomologar: number = 1;
    instanciasAsignHomologar: any[] = [{}];
    datosInstitucionHomologar: { institucion: string; programa: string } = {
        institucion: '',
        programa: '',
    };
    datosAsignaturasAHomologar: {
        asignatura: string;
        creditos: number;
        intensidad: number;
        calificacion: number;
        contenidos: File;
    }[] = [];
    //semestreAplazamiento: string;
    estadoSolicitud: string = '';
    esperando: boolean = false;

    enlaceMaterialAudiovisual = '';

    descripcionesActividades: string[] = [];

    tipoBeca: string = 'Seleccione una opción';

    constructor(
        private gestorHttp: HttpService,
        private sanitizer: DomSanitizer,
        private utilidades: UtilidadesService,
        private fb: FormBuilder
    ) {}

    restrablecerValores() {
        this.formInfoPersonal = new FormGroup({});
        //this.formSolicitudAdiCancel = new FormGroup({});
        this.formSemestreAplazar = new FormGroup({});
        this.formApoyoAsistEvento = new FormGroup({});
        this.formSolicitudBecaDescuento = new FormGroup({});

        this.tipoSolicitudEscogida = null;
        this.radicadoAsignado = '';
        this.asignaturasAdicCancel = [];
        this.documentosAdjuntos = [];
        this.tutor = null;
        this.director = null;
        this.oficioDeSolicitud = null;
        this.motivoDeSolicitud = '';
        this.numeroInstAsignHomologar = 1;
        this.instanciasAsignHomologar = [{}];
        this.datosAsignaturasAHomologar = [];
        this.datosInstitucionHomologar = { institucion: '', programa: '' };
        //this.semestreAplazamiento = '';
        this.actividadesReCreditos = [];
        this.actividadesSeleccionadas = [];
        this.numeroInstanciasAsignExterna = 1;
        this.instanciasAsignExterna = [{}];
        this.datosAsignaturasExternas = [];
        this.numeroInstanciasAsignAdiCancel = 1;
        this.instanciasAsignAdiCancel = [{}];
        this.datosAsignAdiCancel = [];
        this.fechasEstancia = [];
        this.lugarEstancia = '';
        this.grupoInvestigacion = 'Seleccione una opción';
        this.valorApoyoEcon = 0;
        this.banco = '';
        this.tipoCuenta = 'Seleccione una opción';
        this.numeroCuenta = '';
        this.cedulaCuentaBanco = '';
        this.direccion = '';
        this.nombreCongreso = '';
        this.tipoCongreso = 'Seleccione una opción';
        this.tituloPublicacion = '';
        this.firmaSolicitante = null;
        this.firmaSolicitanteUrl = '';
        this.firmaTutor = null;
        this.firmaTutorUrl = '';
        this.firmaDirector = null;
        this.firmaDirectorUrl = '';
        this.esperando = false;
        this.fechaEnvio = null;
        this.enlaceMaterialAudiovisual = '';
        this.horasIngresadas = [];
        this.horasAsignables = [];
        this.adjuntosDeActividades = {};
        this.tipoBeca = 'Seleccione una opción';
        this.descripcionesActividades = [];
        this.firmaTutorPag = 0;
        this.firmaTutorX = 0;
        this.firmaTutorY = 0;
        this.firmaDirectorPag = 0;
        this.firmaDirectorX = 0;
        this.firmaDirectorY = 0;
    }

    agregarInstancia() {
        this.numeroInstAsignHomologar++;
        this.instanciasAsignHomologar.push({});
    }

    eliminarInstancia(index: number) {
        this.instanciasAsignHomologar.splice(index, 1);
    }

    sendClickEvent() {
        this.clickSubject.next();
    }

    getClickEvent() {
        return this.clickSubject.asObservable();
    }

    async poblarConDatosSolicitudGuardada(
        infoSolicitud: DatosSolicitudRequest
    ) {
        console.log(infoSolicitud);
        //Datos del Solicitante
        const datosSolicitante = DatosComunSolicitud.toDatosSolicitante(
            infoSolicitud.datosComunSolicitud
        );

        this.formInfoPersonal = this.fb.group({
            id: [null],
            nombres: [datosSolicitante.nombres],
            apellidos: [datosSolicitante.apellidos],
            correo: [datosSolicitante.correo],
            celular: [datosSolicitante.celular],
            codigoAcademico: [datosSolicitante.codAcademico],
            tipoDocumento: [datosSolicitante.tipoIdentificacion],
            numeroDocumento: [datosSolicitante.identificacion],
        });

        /*
        //Datos Tutor
        this.tutor = {
            id: 'ID TUT PROVISIONAL',
            codigoTutor: 'COD TUT PROVISIONAL',
            nombreTutor: infoSolicitud.datosComunSolicitud.nombreTutor,
        };
        */

        //Estado de solicitud
        this.estadoSolicitud =
            infoSolicitud.datosComunSolicitud.estadoSolicitud;

        //Fecha de radicado
        this.fechaEnvio = infoSolicitud.datosComunSolicitud.fechaEnvioSolicitud;

        //Número de radicado
        this.radicadoAsignado = infoSolicitud.datosComunSolicitud.radicado;

        /*
        //Firma Solicitante
        this.firmaSolicitante = this.utilidades.convertirBase64AFile(
            infoSolicitud.datosComunSolicitud.firmaSolicitante
        );
        // Convertir la firma del solicitante a URL segura
        if (this.firmaSolicitante) {
            this.firmaSolicitanteUrl = this.sanitizer.bypassSecurityTrustUrl(
                URL.createObjectURL(this.firmaSolicitante)
            );
        }
        //Firma Tutor
        if (infoSolicitud.datosComunSolicitud.firmaTutor) {
            this.firmaTutor = this.utilidades.convertirBase64AFile(
                infoSolicitud.datosComunSolicitud.firmaTutor
            );
        }
        // Convertir la firma del Tutor a URL segura
        if (this.firmaTutor) {
            this.firmaTutorUrl = this.sanitizer.bypassSecurityTrustUrl(
                URL.createObjectURL(this.firmaTutor)
            );
        }
        //Firma Director
        if (infoSolicitud.datosComunSolicitud.firmaDirector) {
            this.firmaDirector = this.utilidades.convertirBase64AFile(
                infoSolicitud.datosComunSolicitud.firmaDirector
            );
        }
        // Convertir la firma del Director a URL segura
        if (this.firmaDirector) {
            this.firmaDirectorUrl = this.sanitizer.bypassSecurityTrustUrl(
                URL.createObjectURL(this.firmaDirector)
            );
        }
            
        */

        switch (this.tipoSolicitudEscogida.codigoSolicitud) {
            /*
            case 'AD_ASIG':
            case 'CA_ASIG':
                this.datosAsignAdiCancel =
                    infoSolicitud.dadicionCancelacionAsignatura.listaAsignaturas.map(
                        (asignatura) => ({
                            nombreAsignatura: asignatura.nombreAsignatura,
                            docente: {
                                id: null,
                                codigoTutor: null,
                                nombreTutor: asignatura.docenteAsignatura,
                            },
                        })
                    );

                if (this.tipoSolicitudEscogida.codigoSolicitud === 'CA_ASIG') {
                    this.motivoDeSolicitud =
                        infoSolicitud.dadicionCancelacionAsignatura.motivo;
                }

                break;
                */
            case 'HO_ASIG_POS':
            case 'HO_ASIG_ESP':
                //console.log(infoSolicitud);
                //Datos institucion externa
                /*
                this.datosInstitucionHomologar = {
                    institucion:
                        infoSolicitud.datosSolicitudHomologacion
                            .institutoProcedencia,
                    programa:
                        infoSolicitud.datosSolicitudHomologacion
                            .programaProcedencia,
                };
*/
                //Datos asignaturas a homologar
                infoSolicitud.datosSolicitudHomologacion.datosAsignatura.forEach(
                    (asignatura: any) => {
                        //console.log(asignatura.contenidoProgramatico);
                        let asignaturaAHomologar = {
                            asignatura: asignatura.nombreAsignatura,
                            creditos: asignatura.creditos,
                            intensidad: asignatura.intensidadHoraria,
                            calificacion: asignatura.calificacion,
                            contenidos: asignatura.contenidoProgramatico,
                        };

                        this.datosAsignaturasAHomologar.push(
                            asignaturaAHomologar
                        );
                    }
                );

                /*
                console.log(
                    infoSolicitud.datosSolicitudHomologacion.documentosAdjuntos
                );
                */

                //Docs Adjuntos
                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosSolicitudHomologacion.documentosAdjuntos
                );

                break;

            /*
            case 'AP_SEME': {
                const { semestre, motivo } =
                    infoSolicitud.datosSolicitudAplazarSemestre;

                this.formSemestreAplazar = this.fb.group({
                    semestre: [semestre],
                    motivo: [motivo],
                });

                break;
            }
            */
            case 'CU_ASIG':
                /*
                this.motivoDeSolicitud =
                    infoSolicitud.datosSolicitudCursarAsignaturas.motivo;
*/
                this.datosAsignaturasExternas =
                    infoSolicitud.datosSolicitudCursarAsignaturas.datosAsignaturaOtroProgramas.map(
                        (asignatura) => ({
                            nombre: asignatura.nombre,
                            programa: asignatura.nombrePrograma,
                            institucion: 'FALTA',
                            creditos: asignatura.creditos,
                            intensidad: asignatura.intensidadHoraria,
                            codigo: asignatura.codigo,
                            grupo: asignatura.grupo,
                            docente: asignatura.nombreDocente,
                            tituloDocente: 'FALTA',
                            contenidos: null,
                            cartaAceptacion: null,
                        })
                    );

                break;

            case 'AV_PASA_INV':
                /*
                this.lugarEstancia =
                    infoSolicitud.datoAvalPasantiaInv.lugarPasantia;
                this.fechasEstancia[0] = this.parseFecha(
                    infoSolicitud.datoAvalPasantiaInv.fechaInicio
                );
                this.fechasEstancia[1] = this.parseFecha(
                    infoSolicitud.datoAvalPasantiaInv.fechaFin
                );
                */
                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datoAvalPasantiaInv.documentosAdjuntos
                );

                break;

            case 'AP_ECON_INV':
                /*
                this.lugarEstancia =
                    infoSolicitud.datosApoyoEconomico.lugarPasantia;
                this.fechasEstancia[0] = this.parseFecha(
                    infoSolicitud.datosApoyoEconomico.fechaInicio
                );
                this.fechasEstancia[1] = this.parseFecha(
                    infoSolicitud.datosApoyoEconomico.fechaFin
                );
                this.director = {
                    id: infoSolicitud.datosApoyoEconomico.idDirectorGrupo,
                    codigoTutor: 'COD DIR PROVISIONAL',
                    nombreTutor:
                        infoSolicitud.datosApoyoEconomico.nombreDirectorGrupo,
                };

                this.grupoInvestigacion =
                    infoSolicitud.datosApoyoEconomico.grupoInvestigacion;
                this.valorApoyoEcon =
                    infoSolicitud.datosApoyoEconomico.valorApoyo;
                this.banco = infoSolicitud.datosApoyoEconomico.entidadBancaria;
                this.tipoCuenta = infoSolicitud.datosApoyoEconomico.tipoCuenta;
                this.numeroCuenta =
                    infoSolicitud.datosApoyoEconomico.numeroCuenta;
                this.cedulaCuentaBanco =
                    infoSolicitud.datosApoyoEconomico.numeroCedulaAsociada;
                this.direccion =
                    infoSolicitud.datosApoyoEconomico.direccionResidencia;

                    */
                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosApoyoEconomico.documentosAdjuntos
                );

                break;

            case 'AP_ECON_ASI': {
                /*
                const {
                    nombreCongreso,
                    tipoCongreso,
                    fechaInicio,
                    fechaFin,
                    tituloPublicacion,
                    valorApoyo,
                    entidadBancaria,
                    tipoCuenta,
                    numeroCuenta,
                    numeroCedulaAsociada,
                    direccionResidencia,
                } = infoSolicitud.datosApoyoEconomicoCongreso;

                const fechaI = this.convertirFecha(fechaInicio);
                const fechaF = this.convertirFecha(fechaFin);
                this.formApoyoAsistEvento = this.fb.group({
                    nombreCongreso: [nombreCongreso],
                    tipoCongreso: [tipoCongreso],
                    tituloPublicacion: [tituloPublicacion],
                    fechas: [[fechaI, fechaF]],
                    valorApoyo: [valorApoyo],
                    entidadBancaria: [entidadBancaria],
                    tipoCuenta: [tipoCuenta],
                    numeroCuenta: [numeroCuenta],
                    numeroCedulaAsociada: [numeroCedulaAsociada],
                    direccionResidencia: [direccionResidencia],
                });

                this.director = {
                    id: infoSolicitud.datosApoyoEconomicoCongreso
                        .idDirectorGrupo,
                    codigoTutor: 'COD DIR PROVISIONAL',
                    nombreTutor:
                        infoSolicitud.datosApoyoEconomicoCongreso
                            .nombreDirectorGrupo,
                };
*/
                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosApoyoEconomicoCongreso.documentosAdjuntos
                );

                break;
            }

            case 'PA_PUBL_EVE':
                /*
                this.nombreCongreso =
                    infoSolicitud.datosApoyoEconomicoPublicacion.nombreEvento;
                this.tipoCongreso =
                    infoSolicitud.datosApoyoEconomicoPublicacion.tipoEvento;
                this.fechasEstancia[0] = this.parseFecha(
                    infoSolicitud.datosApoyoEconomicoPublicacion.fechaInicio
                );
                this.fechasEstancia[1] = this.parseFecha(
                    infoSolicitud.datosApoyoEconomicoPublicacion.fechaFin
                );
                this.tituloPublicacion =
                    infoSolicitud.datosApoyoEconomicoPublicacion.tituloPublicacion;
                this.director = {
                    id: infoSolicitud.datosApoyoEconomicoPublicacion
                        .idDirectorGrupo,
                    codigoTutor: 'COD DIR PROVISIONAL',
                    nombreTutor:
                        infoSolicitud.datosApoyoEconomicoPublicacion
                            .nombreDirectorGrupo,
                };

                this.valorApoyoEcon =
                    infoSolicitud.datosApoyoEconomicoPublicacion.valorApoyo;
                this.banco =
                    infoSolicitud.datosApoyoEconomicoPublicacion.entidadBancaria;
                this.tipoCuenta =
                    infoSolicitud.datosApoyoEconomicoPublicacion.tipoCuenta;
                this.numeroCuenta =
                    infoSolicitud.datosApoyoEconomicoPublicacion.numeroCuenta;
                this.cedulaCuentaBanco =
                    infoSolicitud.datosApoyoEconomicoPublicacion.numeroCedulaAsociada;
                this.direccion =
                    infoSolicitud.datosApoyoEconomicoPublicacion.direccionResidencia;
*/
                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosApoyoEconomicoPublicacion
                        .documentosAdjuntos
                );

                break;

            /*
            case 'AV_COMI_PR':
                try {
                    const actividadesReCreditos = await this.gestorHttp
                        .obtenerActividadesDePracticaDocente()
                        .toPromise();

                    this.actividadesReCreditos = actividadesReCreditos;

                    for (
                        let index = 0;
                        index < infoSolicitud.datosAvalComite.length;
                        index++
                    ) {
                        for (
                            let j = 0;
                            j < this.actividadesReCreditos.length;
                            j++
                        ) {
                            if (
                                this.actividadesReCreditos[j].nombre ==
                                infoSolicitud.datosAvalComite[index]
                                    .nombreActividad
                            ) {
                                this.actividadesSeleccionadas.push(
                                    this.actividadesReCreditos[j]
                                );
                            }

                            if (
                                infoSolicitud.datosAvalComite[index]
                                    .horasReconocer != 0
                            ) {
                                this.horasAsignables.push(
                                    infoSolicitud.datosAvalComite[index]
                                        .horasReconocer
                                );
                            }
                        }
                    }
                } catch (error) {
                    console.error(
                        'Error al cargar actividades de reconocimiento de créditos:',
                        error
                    );
                }
                break;

                */
            case 'RE_CRED_PAS':
                /*
                
                try {
                    const actividadesReCreditos = await this.gestorHttp
                        .obtenerActividadesDePracticaDocente()
                        .toPromise();
                    this.actividadesReCreditos = actividadesReCreditos;

                    infoSolicitud.datosActividadDocente.forEach(
                        (actividad, index) => {
                            const actividadSeleccionada =
                                this.actividadesReCreditos.find(
                                    (reCredito) =>
                                        reCredito.nombre ===
                                        actividad.nombreActividad
                                );

                            if (actividadSeleccionada) {
                                this.actividadesSeleccionadas.push(
                                    actividadSeleccionada
                                );
                            }

                            this.horasAsignables.push(actividad.horasReconocer);

                            const docs = actividad.documentos.map((doc) =>
                                this.utilidades.convertirBase64AFile(doc)
                            );

                            this.adjuntosDeActividades[index] = {
                                archivos: docs,
                                enlaces: actividad.enlaces,
                            };
                        }
                    );
                } catch (error) {
                    console.error(
                        'Error al cargar actividades de reconocimiento de créditos:',
                        error
                    );
                }
                    */
                break;

            case 'SO_BECA': {
                /*
                const { tipo, motivo, formatoSolicitudBeca } =
                    infoSolicitud.datoSolicitudBeca;

                this.formSolicitudBecaDescuento = this.fb.group({
                    tipoBeca: [tipo],
                    justificacion: [motivo],
                });
                */

                // Verificación y conversión de documento adjunto
                if (infoSolicitud.datoSolicitudBeca.formatoSolicitudBeca) {
                    this.documentosAdjuntos[0] =
                        await this.utilidades.convertirBase64AFile(
                            infoSolicitud.datoSolicitudBeca.formatoSolicitudBeca
                        );
                }
                break;
            }

            case 'AV_SEMI_ACT':
                this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosAvalSeminario.documentosAdjuntos
                );
                break;

            default:
                break;
        }
    }

    async asignarDocumentosAdjuntos(docs: string[]): Promise<void> {
        console.log(docs);
        this.documentosAdjuntos = await Promise.all(
            docs.map(async (cadenaBase64) => {
                const archivo =
                    this.utilidades.convertirBase64AFile(cadenaBase64);
                if (archivo) {
                    return archivo;
                } else {
                    throw new Error(
                        'Error al convertir la cadena base64 a archivo.'
                    );
                }
            })
        );

        console.log(this.documentosAdjuntos);
    }

    obtenerNombreArchivosAdjuntos(): string {
        const adjuntos: string[] = [];

        const agregarNombre = (nombre: string | undefined) => {
            if (nombre) {
                adjuntos.push(nombre);
            }
        };

        // Procesar datosAsignaturasExternas
        this.datosAsignaturasExternas?.forEach((asignatura) => {
            agregarNombre(asignatura.contenidos?.name);
            agregarNombre(asignatura.cartaAceptacion?.name);
        });

        // Procesar datosAsignaturasAHomologar
        this.datosAsignaturasAHomologar?.forEach((asignatura) => {
            agregarNombre(asignatura.contenidos?.name);
        });

        // Procesar documentosAdjuntos
        this.documentosAdjuntos?.forEach((doc) => {
            agregarNombre(doc.name);
        });

        // Procesar adjuntosDeActividades
        if (this.adjuntosDeActividades) {
            Object.keys(this.adjuntosDeActividades).forEach((actividadId) => {
                const adjuntosActividad =
                    this.adjuntosDeActividades[Number(actividadId)];
                if (adjuntosActividad) {
                    adjuntos.push(`Actividad ${Number(actividadId) + 1}`);
                    adjuntosActividad.archivos?.forEach((archivo) => {
                        agregarNombre(`- ${archivo.name}`);
                    });
                    adjuntosActividad.enlaces?.forEach((enlace) => {
                        agregarNombre(`- Enlace: ${enlace}`);
                    });
                }
            });
        }

        // Unir los nombres con salto de línea
        return adjuntos.join('\n');
    }

    /*
    obtenerNombreArchivosAdjuntos() {
        let adjuntos = '';

        if (
            this.datosAsignaturasExternas &&
            this.datosAsignaturasExternas.length > 0
        ) {
            // Recorre cada elemento de datosAsignaturasExternas
            this.datosAsignaturasExternas.forEach((asignatura) => {
                // Verifica si hay información en 'contenidos'
                if (asignatura.contenidos) {
                    // Si hay información, extrae el nombre y guárdalo en el arreglo nombresArchivos

                    adjuntos = adjuntos + asignatura.contenidos.name + '\n';
                }
                // Verifica si hay información en 'cartaAceptacion'
                if (asignatura.cartaAceptacion) {
                    // Si hay información, extrae el nombre y guárdalo en el arreglo nombresArchivos

                    adjuntos =
                        adjuntos + asignatura.cartaAceptacion.name + '\n';
                }
            });
        }

        if (
            this.datosAsignaturasAHomologar &&
            this.datosAsignaturasAHomologar.length > 0
        ) {
            // Recorre cada elemento de datosAsignaturasAHomologar
            this.datosAsignaturasAHomologar.forEach((asignatura) => {
                // Verifica si hay información en 'contenidos'
                if (asignatura.contenidos) {
                    // Si hay información, extrae el nombre y guárdalo en el arreglo nombresArchivos

                    adjuntos = adjuntos + asignatura.contenidos.name + '\n';
                }
            });
        }

        if (this.documentosAdjuntos && this.documentosAdjuntos.length > 0) {
            this.documentosAdjuntos.forEach((doc) => {
                adjuntos = adjuntos + doc.name + '\n';
            });
        }

        // Verificar adjuntosDeActividades
        if (this.adjuntosDeActividades) {
            Object.keys(this.adjuntosDeActividades).forEach((actividadId) => {
                const adjuntosActividad =
                    this.adjuntosDeActividades[Number(actividadId)];
                if (adjuntosActividad) {
                    adjuntos =
                        adjuntos +
                        `Actividad ${Number(actividadId) + 1}  + '\n'`;
                    if (
                        adjuntosActividad.archivos &&
                        adjuntosActividad.archivos.length > 0
                    ) {
                        adjuntosActividad.archivos.forEach((archivo) => {
                            adjuntos = adjuntos + `- ${archivo.name}  + '\n'`;
                        });
                    }
                    if (
                        adjuntosActividad.enlaces &&
                        adjuntosActividad.enlaces.length > 0
                    ) {
                        adjuntosActividad.enlaces.forEach((enlace) => {
                            adjuntos = adjuntos + `- Enlace: ${enlace}  + '\n'`;
                        });
                    }
                }
            });
        }

        // Elimina el último carácter de nueva línea si existe
        if (adjuntos.endsWith('\n')) {
            adjuntos = adjuntos.slice(0, -1);
        }

        return adjuntos;
    }
    */

    parseFecha(fechaString) {
        const [day, month, year] = fechaString.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    convertirFecha(fechaStr) {
        const [dia, mes, anio] = fechaStr.split('/').map(Number);
        return new Date(anio, mes - 1, dia); // Los meses en JavaScript son 0-indexados (0 = enero, 1 = febrero, etc.)
    }
}
