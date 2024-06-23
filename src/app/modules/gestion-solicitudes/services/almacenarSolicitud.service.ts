import { Injectable } from '@angular/core';
import {
    AsignaturaExterna,
    AsignaturaHomologPost,
    DatosApoyoCongreso,
    DatosApoyoPasantia,
    DatosApoyoPublicacion,
    DatosActividadPracticaDocente,
    DatosCursarAsignaturaDto,
    DatosReconoCreditos,
    DatosSolHomologPostSave,
    DatosSolicitudAplazamiento,
    DatosSolicitudAvalPasantia,
    DatosSolicitudCancelacionAsignatura,
    DatosSolicitudCursarAsignatura,
    FormHomologPost,
    InfoActividadesReCreditos,
    SolicitudSave,
    DatosAvalPracticaDocente,
} from '../models/indiceModelos';
import { HttpService } from './http.service';
import { RadicarService } from './radicar.service';
import { HttpClient } from '@angular/common/http';
import { InfoAsingAdicionCancelacion } from '../models/solicitudes/solicitud-adic-cancel-asig/infoAsignAdicionCancelacion';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AlmacenarSolicitudService {
    firmaSolicitante: string;

    constructor(
        public radicar: RadicarService,
        public http: HttpService,
        public httpService: HttpClient
    ) {}

    async almacenarSolicitudEnBD(): Promise<string> {
        // Crear una nueva promesa que resuelve una cadena
        return new Promise<string>(async (resolver, rechazar) => {
            let resultado: string = null;

            // Convertir la firma del solicitante a Base64
            this.firmaSolicitante = await this.convertirABase64(
                this.radicar.firmaSolicitante
            );

            // Función para manejar la respuesta del observable
            const manejarRespuesta = (observable) => {
                observable
                    .pipe(
                        map((respuesta: any) => {
                            return typeof respuesta === 'string'
                                ? respuesta
                                : JSON.stringify(respuesta);
                        }),
                        catchError((error: any) => {
                            if (error.error.text) {
                                // Devuelve la cadena de texto en caso de que no sea un JSON
                                return [error.error.text];
                            }
                            return throwError(error);
                        })
                    )
                    .subscribe({
                        next: (respuesta: string) => {
                            resultado = respuesta;
                            resolver(resultado);
                        },
                        error: (error) => {
                            rechazar(error);
                        },
                    });
            };

            // Función para manejar diferentes tipos de solicitudes
            const manejarSolicitud = async (
                codigoSolicitud: string,
                reunirDatosFn: () => Promise<any>
            ) => {
                const datosSolicitud = await reunirDatosFn();
                const observable = this.http.guardarSolicitud(datosSolicitud);
                manejarRespuesta(observable);
            };

            // Diccionario para mapear códigos de solicitud a funciones de datos
            const mapaSolicitudes = {
                AD_ASIG: this.reunirDatosSolAdicion,
                CA_ASIG: this.reunirDatosSolCancelAsig,
                HO_ASIG_POS: this.reunirDatosSolHomolog,
                HO_ASIG_ESP: this.reunirDatosSolHomolog,
                AP_SEME: this.reunirDatosSolAplazamiento,
                CU_ASIG: this.reunirDatosSolCurAsigExternas,
                AV_PASA_INV: this.reunirDatosSolAvalPasant,
                AP_ECON_INV: this.reunirDatosSolApoyoPasantia,
                AP_ECON_ASI: this.reunirDatosSolApoyoCongreso,
                PA_PUBL_EVE: this.reunirDatosSolApoyoPublicacion,
                RE_CRED_PAS: this.reunirDatosSolRecCredPracticaDocente,
                RE_CRED_DIS: this.reunirDatosSolRecCreditosConLink,
                PR_CURS_TEO: this.reunirDatosSolRecCreditosConLink,
                AS_CRED_MAT: this.reunirDatosSolRecCreditosConLink,
                AS_CRED_DO: this.reunirDatosSolRecCreditosSinLink,
                RE_CRED_SEM: this.reunirDatosSolRecCreditosSinLink,
                AS_CRED_MON: this.reunirDatosSolRecCreditosSinLink,
                TG_PREG_POS: this.reunirDatosSolRecCreditosSinLink,
                JU_PREG_POS: this.reunirDatosSolRecCreditosSinLink,
                EV_ANTE_PRE: this.reunirDatosSolRecCreditosSinLink,
                EV_PROD_INT: this.reunirDatosSolRecCreditosSinLink,
                EV_INFO_SAB: this.reunirDatosSolRecCreditosSinLink,
                PA_COMI_PRO: this.reunirDatosSolRecCreditosSinLink,
                OT_ACTI_APO: this.reunirDatosSolRecCreditosSinLink,
                RE_CRED_PUB: this.reunirDatosSolRecCreditosSinLink,
                AV_SEMI_ACT: this.reunirDatosSolAvalSeminario,
                AV_COMI_PR: this.reunirDatosAvalPractDocente,
            };

            // Obtener el código de solicitud actual
            const codigoSolicitud =
                this.radicar.tipoSolicitudEscogida.codigoSolicitud;

            // Si el código de solicitud existe en el mapa, manejar la solicitud correspondiente
            if (mapaSolicitudes[codigoSolicitud]) {
                await manejarSolicitud(
                    codigoSolicitud,
                    mapaSolicitudes[codigoSolicitud].bind(this)
                );
            } else {
                resolver(resultado);
            }
        });
    }

    async reunirDatosSolAdicion(): Promise<SolicitudSave> {
        const asignaturasParaAdicionar: InfoAsingAdicionCancelacion[] =
            this.radicar.datosAsignAdiCancel.map((item) => ({
                nombreAsignatura: item.nombreAsignatura,
                idDocente: item.docente.id,
            }));

        return this.construirObjAGuardar('AD_ASIG', asignaturasParaAdicionar);
    }

    async reunirDatosSolCancelAsig(): Promise<SolicitudSave> {
        const asignaturas: InfoAsingAdicionCancelacion[] =
            this.radicar.datosAsignAdiCancel.map((item) => ({
                nombreAsignatura: item.nombreAsignatura,
                idDocente: item.docente.id,
            }));

        const infoCancelacion: DatosSolicitudCancelacionAsignatura = {
            listaAsignaturas: asignaturas,
            motivo: this.radicar.motivoDeSolicitud,
        };

        return this.construirObjAGuardar('CA_ASIG', infoCancelacion);
    }

    async reunirDatosSolCurAsigExternas(): Promise<SolicitudSave> {
        const asignaturasExternas: AsignaturaExterna[] = [];

        for (
            let index = 0;
            index < this.radicar.datosAsignaturasExternas.length;
            index++
        ) {
            const datosAsignatura: AsignaturaExterna = {
                programaProcedencia:
                    this.radicar.datosAsignaturasExternas[index].programa,
                institutoProcedencia:
                    this.radicar.datosAsignaturasExternas[index].institucion,
                nombreAsignatura:
                    this.radicar.datosAsignaturasExternas[index].nombre,
                numeroCreditos:
                    this.radicar.datosAsignaturasExternas[index].creditos,
                intensidadHoraria:
                    this.radicar.datosAsignaturasExternas[index].intensidad,
                contenidoProgramatico: await this.convertirABase64(
                    this.radicar.datosAsignaturasExternas[index].contenidos
                ),
                codigoAsignatura:
                    this.radicar.datosAsignaturasExternas[index].codigo,
                grupo: this.radicar.datosAsignaturasExternas[index].grupo,
                nombreDocente:
                    this.radicar.datosAsignaturasExternas[index].docente,
                tituloDocente:
                    this.radicar.datosAsignaturasExternas[index].tituloDocente,
                cartaAceptacion: await this.convertirABase64(
                    this.radicar.datosAsignaturasExternas[index].cartaAceptacion
                ),
            };

            asignaturasExternas.push(datosAsignatura);
        }

        const datos: DatosCursarAsignaturaDto = {
            motivo: this.radicar.motivoDeSolicitud,
            listaAsignaturasCursar: asignaturasExternas,
        };

        const infoSolicitada: DatosSolicitudCursarAsignatura = {
            datosCursarAsignaturaDto: datos,
        };

        return this.construirObjAGuardar('CU_ASIG', infoSolicitada);
    }

    async reunirDatosSolAplazamiento(): Promise<SolicitudSave> {
        const datos: DatosSolicitudAplazamiento = {
            semestre: this.radicar.semestreAplazamiento,
            motivo: this.radicar.motivoDeSolicitud,
        };

        return this.construirObjAGuardar('AP_SEME', datos);
    }

    async reunirDatosSolAvalPasant(): Promise<SolicitudSave> {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const datos: DatosSolicitudAvalPasantia = {
            lugarPasantia: this.radicar.lugarEstancia,
            fechaInicio: this.formatearDate(this.radicar.fechasEstancia[0]),
            fechaFin: this.formatearDate(this.radicar.fechasEstancia[1]),
            documentosAdjuntos: docsAdjuntos,
        };

        return this.construirObjAGuardar('AV_PASA_INV', datos);
    }

    async reunirDatosSolApoyoPasantia() {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const datos: DatosApoyoPasantia = {
            lugarPasantia: this.radicar.lugarEstancia,
            fechaInicio: this.formatearDate(this.radicar.fechasEstancia[0]),
            fechaFin: this.formatearDate(this.radicar.fechasEstancia[1]),
            idDirectorGrupo: this.radicar.director.id,
            nombreDirectorGrupo: null,
            grupoInvestigacion: this.radicar.grupoInvestigacion,
            valorApoyo: this.radicar.valorApoyoEcon,
            entidadBancaria: this.radicar.banco,
            tipoCuenta: this.radicar.tipoCuenta,
            numeroCuenta: this.radicar.numeroCuenta,
            numeroCedulaAsociada: this.radicar.cedulaCuentaBanco,
            direccionResidencia: this.radicar.direccion,
            documentosAdjuntos: docsAdjuntos,
        };

        return this.construirObjAGuardar('AP_ECON_INV', datos);
    }

    async reunirDatosSolApoyoCongreso() {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const datos: DatosApoyoCongreso = {
            nombreCongreso: this.radicar.nombreCongreso,
            tipoCongreso: this.radicar.tipoCongreso,
            fechaInicio: this.formatearDate(this.radicar.fechasEstancia[0]),
            fechaFin: this.formatearDate(this.radicar.fechasEstancia[1]),
            idDirectorGrupo: this.radicar.director.id,
            nombreDirectorGrupo: null,
            tituloPublicacion: this.radicar.tituloPublicacion,
            valorApoyo: this.radicar.valorApoyoEcon,
            entidadBancaria: this.radicar.banco,
            tipoCuenta: this.radicar.tipoCuenta,
            numeroCuenta: this.radicar.numeroCuenta,
            numeroCedulaAsociada: this.radicar.cedulaCuentaBanco,
            direccionResidencia: this.radicar.direccion,
            documentosAdjuntos: docsAdjuntos,
        };

        return this.construirObjAGuardar('AP_ECON_ASI', datos);
    }

    async reunirDatosSolApoyoPublicacion() {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const datos: DatosApoyoPublicacion = {
            nombreEvento: this.radicar.nombreCongreso,
            tipoEvento: this.radicar.tipoCongreso,
            fechaInicio: this.formatearDate(this.radicar.fechasEstancia[0]),
            fechaFin: this.formatearDate(this.radicar.fechasEstancia[1]),
            idDirectorGrupo: this.radicar.director.id,
            nombreDirectorGrupo: null,
            tituloPublicacion: this.radicar.tituloPublicacion,
            valorApoyo: this.radicar.valorApoyoEcon,
            entidadBancaria: this.radicar.banco,
            tipoCuenta: this.radicar.tipoCuenta,
            numeroCuenta: this.radicar.numeroCuenta,
            numeroCedulaAsociada: this.radicar.cedulaCuentaBanco,
            direccionResidencia: this.radicar.direccion,
            documentosAdjuntos: docsAdjuntos,
        };

        return this.construirObjAGuardar('PA_PUBL_EVE', datos);
    }

    async reunirDatosSolAvalSeminario() {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const datos = {
            documentosAdjuntos: docsAdjuntos,
        };

        return this.construirObjAGuardar('AV_SEMI_ACT', datos);
    }

    async reunirDatosSolRecCreditosSinLink() {
        const docsAdjuntos = await this.convertirDocumentosAdjuntos();

        const datos: DatosReconoCreditos = {
            documentosAdjuntos: docsAdjuntos,
        };

        return this.construirObjAGuardar('RE_CRED', datos);
    }

    async reunirDatosSolRecCreditosConLink() {
        const documentos = await Promise.all(
            this.radicar.documentosAdjuntos.map(
                async (documento: any) => await this.convertirABase64(documento)
            )
        );

        documentos.push(this.radicar.enlaceMaterialAudiovisual);

        const datos: DatosReconoCreditos = {
            documentosAdjuntos: documentos,
        };

        return this.construirObjAGuardar('RE_CRED', datos);
    }

    async reunirDatosAvalPractDocente() {
        const datos: DatosAvalPracticaDocente[] =
            this.radicar.actividadesSeleccionadas.map((actividad, index) => {
                const intensidad = this.radicar.horasIngresadas[index] || 0;

                return {
                    codigoSubtipo: actividad.codigo,
                    intensidadHoraria: intensidad,
                    horasReconocer: this.radicar.horasAsignables[index],
                };
            });

        return this.construirObjAGuardar('AV_COMI_PR', datos);
    }

    async reunirDatosSolRecCredPracticaDocente() {
        const datos: DatosActividadPracticaDocente[] = await Promise.all(
            this.radicar.actividadesSeleccionadas.map(
                async (actividad, index) => {
                    const docsAdjuntos = await Promise.all(
                        this.radicar.adjuntosDeActividades[index].archivos.map(
                            (archivo) => this.convertirABase64(archivo)
                        )
                    );

                    return {
                        codigoSubtipo: actividad.codigo,
                        intensidadHoraria: this.radicar.horasIngresadas[index],
                        horasReconocer: this.radicar.horasAsignables[index],
                        documentosAdjuntos: docsAdjuntos,
                        enlacesAdjuntos:
                            this.radicar.adjuntosDeActividades[index].enlaces,
                    };
                }
            )
        );

        return this.construirObjAGuardar('RE_CRED_PAS', datos);
    }

    async reunirDatosSolHomolog(): Promise<SolicitudSave> {
        const asignaturasAHomologar: AsignaturaHomologPost[] = [];
        const conversionesBase64: Promise<string>[] = [];

        for (const asignatura of this.radicar.datosAsignaturasAHomologar) {
            const contenido = asignatura?.contenidos;
            if (contenido) {
                conversionesBase64.push(
                    this.convertirABase64(contenido)
                        .then((base64String) => base64String?.toString())
                        .catch((error) => {
                            console.error(
                                'Error al convertir a base64:',
                                error
                            );
                            return null;
                        })
                );
            }
        }

        const base64Contents = await Promise.all(conversionesBase64);

        for (
            let index = 0;
            index < this.radicar.datosAsignaturasAHomologar.length;
            index++
        ) {
            const datos: AsignaturaHomologPost = {
                nombreAsignatura:
                    this.radicar.datosAsignaturasAHomologar[index].asignatura,
                numeroCreditos:
                    this.radicar.datosAsignaturasAHomologar[index].creditos,
                intensidadHoraria:
                    this.radicar.datosAsignaturasAHomologar[index].intensidad,
                calificacion:
                    this.radicar.datosAsignaturasAHomologar[index].calificacion,
                contenidoProgramatico: base64Contents[index],
            };
            asignaturasAHomologar.push(datos);
        }

        const datosHomologacion: FormHomologPost = {
            programaProcedencia:
                this.radicar.datosInstitucionHomologar.programa,
            institucionProcedencia:
                this.radicar.datosInstitucionHomologar.institucion,
            listaAsignaturas: asignaturasAHomologar,
        };

        const documentosAdjuntos = await this.convertirDocumentosAdjuntos();

        const datosSolHomologacion: DatosSolHomologPostSave = {
            datosHomologacionDto: datosHomologacion,
            documentosAdjuntos: documentosAdjuntos,
        };

        return this.construirObjAGuardar('HO_ASIG', datosSolHomologacion);
    }

    async convertirABase64(archivo: File): Promise<string | null> {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();

            lector.readAsDataURL(archivo);

            lector.onload = () => {
                if (typeof lector.result === 'string') {
                    const nombre = archivo.name;
                    const contenidoBase64 = lector.result.split(',')[1];
                    const base64ConNombre = `${nombre}:${contenidoBase64}`;
                    resolve(base64ConNombre);
                } else {
                    reject(null);
                }
            };

            lector.onerror = () => {
                reject(null);
            };
        });
    }

    async construirObjAGuardar(
        tipo: string,
        infoEspecifica: any
    ): Promise<SolicitudSave> {
        const infoSolicitud: SolicitudSave = {
            idTipoSolicitud: this.radicar.tipoSolicitudEscogida.idSolicitud,
            idEstudiante: this.radicar.datosSolicitante.id,
            idTutor: this.radicar.tutor.id,
            datosHomologacion: tipo === 'HO_ASIG' ? infoEspecifica : null,
            datosAdicionAsignatura: tipo === 'AD_ASIG' ? infoEspecifica : null,
            datosCancelarAsignatura: tipo === 'CA_ASIG' ? infoEspecifica : null,
            datosAplazarSemestre: tipo === 'AP_SEME' ? infoEspecifica : null,
            datosCursarAsignatura: tipo === 'CU_ASIG' ? infoEspecifica : null,
            datosAvalPasantiaInv:
                tipo === 'AV_PASA_INV' ? infoEspecifica : null,
            datosApoyoEconomico: tipo === 'AP_ECON_INV' ? infoEspecifica : null,
            datosReconocimientoCreditos:
                tipo === 'RE_CRED' ? infoEspecifica : null,
            datosAvalSeminario: tipo === 'AV_SEMI_ACT' ? infoEspecifica : null,
            datosApoyoEconomicoCongreso:
                tipo === 'AP_ECON_ASI' ? infoEspecifica : null,
            datosApoyoEconomicoPublicacion:
                tipo === 'PA_PUBL_EVE' ? infoEspecifica : null,
            datosActividadDocenteRequest:
                tipo === 'RE_CRED_PAS' ? infoEspecifica : null,
            datosAvalComite: tipo === 'AV_COMI_PR' ? infoEspecifica : null,
            requiereFirmaDirector:
                tipo === 'AP_ECON_INV' || tipo === 'ApoyoEconomico'
                    ? true
                    : false,
            firmaEstudiante: this.firmaSolicitante,
            oficioPdf: await this.convertirABase64(
                this.radicar.oficioDeSolicitud
            ),
        };

        console.log(infoSolicitud);
        return infoSolicitud;
    }

    async convertirDocumentosAdjuntos(): Promise<string[]> {
        const documentosAdjuntosPromises: Promise<string>[] =
            this.radicar.documentosAdjuntos.map(async (adjunto) => {
                if (adjunto instanceof File) {
                    return await this.convertirABase64(adjunto);
                } else {
                    return Promise.resolve(null);
                }
            });

        return Promise.all(documentosAdjuntosPromises);
    }

    formatearDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        return `${year}-${month}-${day}`;
    }
}
