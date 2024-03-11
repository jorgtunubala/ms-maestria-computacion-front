import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import {
    DatosAsignaturaAdicion,
    DatosSolicitante,
    InfoPersonal,
    RequisitosSolicitud,
    TipoSolicitud,
    TutorYDirector,
} from '../models';
import { DatosSolicitudRequest } from '../models/solicitudes/datosSolicitudRequest';

@Injectable({
    providedIn: 'root',
})
export class RadicarService {
    private clickSubject = new Subject<void>();
    fechaEnvio: Date = null;
    tipoSolicitudEscogida: TipoSolicitud;
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
    director: any;
    firmaSolicitante: File = null;
    firmaSolicitanteUrl: SafeUrl = '';
    firmaTutor: File = null;
    firmaTutorUrl: string = '';
    firmaDirector: File = null;
    firmaDirectorUrl: string = '';

    fechasEstancia: Date[] = [];
    lugarEstancia: string = '';

    grupoInvestigacion: string = '';
    valorApoyoEcon: number = null;
    banco: string = '';
    tipoCuenta: string = null;
    numeroCuenta: number = null;
    cedulaCuentaBanco: string = null;
    direccion: string = '';

    asignaturasAdicCancel: DatosAsignaturaAdicion[] = [];

    numeroInstanciasAsignExterna: number = 1;
    instanciasAsignExterna: any[] = [{}];
    datosAsignaturasExternas: {
        nombre: string;
        programa: string;
        institucion: string;
        creditos: number;
        intensidad: number;
        codigo: number;
        grupo: string;
        docente: string;
        tituloDocente: string;
        contenidos: File[];
        cartaAceptacion: File[];
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
        this.numeroInstanciasAsignExterna = 1;
        this.instanciasAsignExterna = [{}];
        this.datosAsignaturasExternas = [];
        this.fechasEstancia = [];
        this.lugarEstancia = '';
        this.grupoInvestigacion = '';
        this.valorApoyoEcon = null;
        this.banco = '';
        this.tipoCuenta = null;
        this.numeroCuenta = null;
        this.cedulaCuentaBanco = '';
        this.direccion = '';
        this.firmaSolicitante = null;
        this.firmaSolicitanteUrl = '';
        this.firmaTutor = null;
        this.firmaTutorUrl = '';
        this.firmaDirector = null;
        this.firmaDirectorUrl = '';
        this.esperando = false;
        this.fechaEnvio = null;
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
                for (
                    let index = 0;
                    index <
                    infoSolicitud.dadicionCancelacionAsignatura.listaAsignaturas
                        .length;
                    index++
                ) {
                    const asignatura: DatosAsignaturaAdicion = {
                        id: null,
                        nombreAsignatura:
                            infoSolicitud.dadicionCancelacionAsignatura
                                .listaAsignaturas[index].nombreAsignatura,
                        codigoAsignatura:
                            infoSolicitud.dadicionCancelacionAsignatura
                                .listaAsignaturas[index].grupo,
                        nombreDocente: null,
                        infoAsignatura: null,
                    };

                    this.asignaturasAdicCancel.push(asignatura);
                }

                break;
            case 'HO_ASIG_POS':
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

            case 'CA_ASIG':
                break;

            case 'AP_SEME':
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
}
