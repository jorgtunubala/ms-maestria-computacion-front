import { Injectable } from '@angular/core';
import {
    AsignaturaExterna,
    AsignaturaHomologPost,
    DatosApoyoCongreso,
    DatosApoyoPasantia,
    DatosApoyoPublicacion,
    DatosCursarAsignaturaDto,
    DatosReconoCreditos,
    DatosSolHomologPostSave,
    DatosSolicitudAplazamiento,
    DatosSolicitudAvalPasantia,
    DatosSolicitudCancelacionAsignatura,
    DatosSolicitudCursarAsignatura,
    FormHomologPost,
    SolicitudSave,
} from '../models/indiceModelos';
import { HttpService } from './http.service';
import { RadicarService } from './radicar.service';
import { HttpClient } from '@angular/common/http';
import { InfoAsingAdicionCancelacion } from '../models/solicitudes/solicitud-adic-cancel-asig/infoAsignAdicionCancelacion';

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

    async almacenarSolicitudEnBD(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            let resultado: boolean = false;

            this.firmaSolicitante = await this.convertirABase64(
                this.radicar.firmaSolicitante
            );

            switch (this.radicar.tipoSolicitudEscogida.codigoSolicitud) {
                case 'AD_ASIG':
                    this.http
                        .guardarSolicitud(await this.reunirDatosSolAdicion())
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });

                    break;

                case 'CA_ASIG':
                    this.http
                        .guardarSolicitud(await this.reunirDatosSolCancelAsig())
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });

                    break;

                case 'HO_ASIG_POS':
                case 'HO_ASIG_ESP':
                    this.http
                        .guardarSolicitud(await this.reunirDatosSolHomolog())
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'AP_SEME':
                    this.http
                        .guardarSolicitud(
                            await this.reunirDatosSolAplazamiento()
                        )
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'CU_ASIG':
                    this.http
                        .guardarSolicitud(
                            await this.reunirDatosSolCurAsigExternas()
                        )
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'AV_PASA_INV':
                    this.http
                        .guardarSolicitud(await this.reunirDatosSolAvalPasant())
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'AP_ECON_INV':
                    this.http
                        .guardarSolicitud(
                            await this.reunirDatosSolApoyoPasantia()
                        )
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'AP_ECON_ASI':
                    this.http
                        .guardarSolicitud(
                            await this.reunirDatosSolApoyoCongreso()
                        )
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'PA_PUBL_EVE':
                    this.http
                        .guardarSolicitud(
                            await this.reunirDatosSolApoyoPublicacion()
                        )
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'RE_CRED_PAS':
                case 'RE_CRED_DIS':
                case 'PR_CURS_TEO':
                case 'AS_CRED_MAT':
                    this.http
                        .guardarSolicitud(
                            await this.reunirDatosSolRecCreditosConLink()
                        )
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
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
                    this.http
                        .guardarSolicitud(
                            await this.reunirDatosSolRecCreditosSinLink()
                        )
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'AV_SEMI_ACT':
                    this.http
                        .guardarSolicitud(
                            await this.reunirDatosSolAvalSeminario()
                        )
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                default:
                    resolve(resultado);
                    break;
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
            requiereFirmaDirector:
                tipo === 'AP_ECON_INV' || tipo === 'ApoyoEconomico'
                    ? true
                    : false,
            firmaEstudiante: this.firmaSolicitante,
        };

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
