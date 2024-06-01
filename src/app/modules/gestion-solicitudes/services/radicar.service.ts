import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import {
    DatosAsignaturaAdicion,
    DatosSolicitante,
    InfoActividadesReCreditos,
    InfoPersonal,
    RequisitosSolicitud,
    TipoSolicitud,
    TutorYDirector,
} from '../models/indiceModelos';
import { DatosSolicitudRequest } from '../models/solicitudes/datosSolicitudRequest';
import { InfoAsingAdicionCancelacion } from '../models/solicitudes/solicitud-adic-cancel-asig/infoAsignAdicionCancelacion';
import { NullVisitor } from '@angular/compiler/src/render3/r3_ast';

interface actividadCreditos {
    nombre: string;
    abreviacion: string;
    multiplicativo: number;
    codigo: string;
    docs: string[];
    enlaces: string[];
}

@Injectable({
    providedIn: 'root',
})
export class RadicarService {
    private clickSubject = new Subject<void>();
    listadoTutoresYDirectores: TutorYDirector[];

    fechaEnvio: Date = null;
    tipoSolicitudEscogida: TipoSolicitud;
    actividadesReCreditos: InfoActividadesReCreditos[];
    actividadesSeleccionadas: InfoActividadesReCreditos[];
    requisitosSolicitudEscogida: RequisitosSolicitud;
    datosSolicitante: InfoPersonal = new InfoPersonal(
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    );

    oficioDeSolicitud: File = null;
    documentosAdjuntos: File[] = [];
    motivoDeSolicitud: string = '';
    tutor: TutorYDirector;
    director: TutorYDirector;
    firmaSolicitante: File = null;
    firmaSolicitanteUrl: SafeUrl = '';
    firmaTutor: File = null;
    firmaTutorUrl: string = '';
    firmaDirector: File = null;
    firmaDirectorUrl: string = '';

    fechasEstancia: Date[] = [];
    lugarEstancia: string = '';

    nombreCongreso: string = '';
    tipoCongreso: string = 'Seleccione una opción';
    tituloPublicacion: string = '';

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
    semestreAplazamiento: string;
    estadoSolicitud: string = '';
    esperando: boolean = false;

    enlaceMaterialAudiovisual = '';

    constructor(private sanitizer: DomSanitizer) {}

    restrablecerValores() {
        this.datosSolicitante = new InfoPersonal(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );
        this.tipoSolicitudEscogida = null;
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
        this.semestreAplazamiento = '';
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
        //Datos del Solicitante
        this.datosSolicitante = {
            id: '',
            nombres: infoSolicitud.datosComunSolicitud.nombreSolicitante,
            apellidos: infoSolicitud.datosComunSolicitud.apellidoSolicitante,
            correo: infoSolicitud.datosComunSolicitud.emailSolicitante,
            celular: infoSolicitud.datosComunSolicitud.celularSolicitante,
            codigoAcademico:
                infoSolicitud.datosComunSolicitud.codigoSolicitante,
            tipoDocumento:
                infoSolicitud.datosComunSolicitud.tipoIdentSolicitante,
            numeroDocumento:
                infoSolicitud.datosComunSolicitud.numeroIdentSolicitante,
        };

        //Datos Tutor
        this.tutor = {
            id: 'ID TUT PROVISIONAL',
            codigoTutor: 'COD TUT PROVISIONAL',
            nombreTutor: infoSolicitud.datosComunSolicitud.nombreTutor,
        };

        //Estado de solicitud
        this.estadoSolicitud =
            infoSolicitud.datosComunSolicitud.estadoSolicitud;

        //Fecha de radicado
        this.fechaEnvio = infoSolicitud.datosComunSolicitud.fechaEnvioSolicitud;

        //Firma Solicitante
        this.firmaSolicitante = this.convertirBase64AFile(
            infoSolicitud.datosComunSolicitud.firmaSolicitante
        );

        // Convertir la firma del solicitante a URL segura
        if (this.firmaSolicitante) {
            this.firmaSolicitanteUrl = this.sanitizer.bypassSecurityTrustUrl(
                URL.createObjectURL(this.firmaSolicitante)
            );
        }

        switch (this.tipoSolicitudEscogida.codigoSolicitud) {
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
            case 'HO_ASIG_POS':
            case 'HO_ASIG_ESP':
                //Datos institucion externa
                this.datosInstitucionHomologar = {
                    institucion:
                        infoSolicitud.datosSolicitudHomologacion
                            .institutoProcedencia,
                    programa:
                        infoSolicitud.datosSolicitudHomologacion
                            .programaProcedencia,
                };

                //Datos asignaturas a homologar
                infoSolicitud.datosSolicitudHomologacion.datosAsignatura.forEach(
                    (asignatura: any) => {
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

                //Docs Adjuntos
                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosSolicitudHomologacion.documentosAdjuntos
                );

                break;

            case 'AP_SEME':
                this.semestreAplazamiento =
                    infoSolicitud.datosSolicitudAplazarSemestre.semestre;
                this,
                    (this.motivoDeSolicitud =
                        infoSolicitud.datosSolicitudAplazarSemestre.motivo);

                break;

            case 'CU_ASIG':
                this.motivoDeSolicitud =
                    infoSolicitud.datosSolicitudCursarAsignaturas.motivo;

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
                this.lugarEstancia =
                    infoSolicitud.datoAvalPasantiaInv.lugarPasantia;
                this.fechasEstancia[0] = this.parseFecha(
                    infoSolicitud.datoAvalPasantiaInv.fechaInicio
                );
                this.fechasEstancia[1] = this.parseFecha(
                    infoSolicitud.datoAvalPasantiaInv.fechaFin
                );
                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datoAvalPasantiaInv.documentosAdjuntos
                );

                break;

            case 'AP_ECON_INV':
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

                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosApoyoEconomico.documentosAdjuntos
                );

                break;

            case 'AP_ECON_ASI':
                this.nombreCongreso =
                    infoSolicitud.datosApoyoEconomicoCongreso.nombreCongreso;
                this.tipoCongreso =
                    infoSolicitud.datosApoyoEconomicoCongreso.tipoCongreso;
                this.fechasEstancia[0] = this.parseFecha(
                    infoSolicitud.datosApoyoEconomicoCongreso.fechaInicio
                );
                this.fechasEstancia[1] = this.parseFecha(
                    infoSolicitud.datosApoyoEconomicoCongreso.fechaFin
                );
                this.tituloPublicacion =
                    infoSolicitud.datosApoyoEconomicoCongreso.tituloPublicacion;
                this.director = {
                    id: infoSolicitud.datosApoyoEconomicoCongreso
                        .idDirectorGrupo,
                    codigoTutor: 'COD DIR PROVISIONAL',
                    nombreTutor:
                        infoSolicitud.datosApoyoEconomicoCongreso
                            .nombreDirectorGrupo,
                };

                this.valorApoyoEcon =
                    infoSolicitud.datosApoyoEconomicoCongreso.valorApoyo;
                this.banco =
                    infoSolicitud.datosApoyoEconomicoCongreso.entidadBancaria;
                this.tipoCuenta =
                    infoSolicitud.datosApoyoEconomicoCongreso.tipoCuenta;
                this.numeroCuenta =
                    infoSolicitud.datosApoyoEconomicoCongreso.numeroCuenta;
                this.cedulaCuentaBanco =
                    infoSolicitud.datosApoyoEconomicoCongreso.numeroCedulaAsociada;
                this.direccion =
                    infoSolicitud.datosApoyoEconomicoCongreso.direccionResidencia;

                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosApoyoEconomicoCongreso.documentosAdjuntos
                );

                break;

            case 'PA_PUBL_EVE':
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

                await this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosApoyoEconomicoPublicacion
                        .documentosAdjuntos
                );

                break;

            case 'RE_CRED_PAS':
            case 'RE_CRED_DIS':
            case 'PR_CURS_TEO':
            case 'AS_CRED_MAT':
                this.documentosAdjuntos = await Promise.all(
                    infoSolicitud.datosReconocimientoCreditos.documentosAdjuntos
                        .slice(0, -1)
                        .map(
                            async (documento: any) =>
                                await this.convertirBase64AFile(documento)
                        )
                );

                this.enlaceMaterialAudiovisual =
                    infoSolicitud.datosReconocimientoCreditos.documentosAdjuntos[
                        infoSolicitud.datosReconocimientoCreditos
                            .documentosAdjuntos.length - 1
                    ];

                break;

            case 'AS_CRED_DO':
            case 'RE_CRED_SEM':
            case 'AS_CRED_MON':
            case 'TG_PREG_POS':
            case 'JU_PREG_POS':
            case 'EV_ANTE_PRE':
            case 'EV_PROD_INT':
            case 'EV_INFO_SAB':
            case 'PA_COMI_PRO':
            case 'OT_ACTI_APO':
            case 'RE_CRED_PUB':
                this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosReconocimientoCreditos.documentosAdjuntos
                );
                break;
            case 'AV_SEMI_ACT':
                this.asignarDocumentosAdjuntos(
                    infoSolicitud.datosAvalSeminario.documentosAdjuntos
                );
                break;

            default:
                break;
        }
    }

    convertirBase64AFile(base64String: string): File | null {
        // Divide la cadena base64 en nombre y contenido
        const partes = base64String.split(':');
        if (partes.length !== 2) {
            return null; // La cadena base64 no tiene el formato esperado
        }

        const nombre = partes[0];
        const contenidoBase64 = partes[1];

        // Decodifica el contenido base64 en un ArrayBuffer
        const binaryString = window.atob(contenidoBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Crea un nuevo archivo Blob a partir del ArrayBuffer
        const blob = new Blob([bytes]);

        // Crea un nuevo objeto File a partir del Blob y asigna el nombre del archivo
        const archivo = new File([blob], nombre);

        return archivo;
    }

    async asignarDocumentosAdjuntos(docs: string[]): Promise<void> {
        this.documentosAdjuntos = await Promise.all(
            docs.map(async (cadenaBase64) => {
                const archivo = this.convertirBase64AFile(cadenaBase64);
                if (archivo) {
                    return archivo;
                } else {
                    throw new Error(
                        'Error al convertir la cadena base64 a archivo.'
                    );
                }
            })
        );
    }

    parseFecha(fechaString) {
        const [day, month, year] = fechaString.split('/').map(Number);
        return new Date(year, month - 1, day);
    }
}
