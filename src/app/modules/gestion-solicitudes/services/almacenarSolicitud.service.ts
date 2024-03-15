import { Injectable } from '@angular/core';

import {
    AsignaturaHomologPost,
    DatosSolHomologPostSave,
    FormHomologPost,
    SolicitudSave,
} from '../models';
import { HttpService } from './http.service';
import { RadicarService } from './radicar.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class AlmacenarSolicitudService {
    constructor(
        public radicar: RadicarService,
        public http: HttpService,
        public httpService: HttpClient
    ) {}

    async almacenarSolicitudEnBD(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            let resultado: boolean = false;

            switch (this.radicar.tipoSolicitudEscogida.codigoSolicitud) {
                case 'AD_ASIG':
                    this.http
                        .guardarSolicitud(await this.reunirDatosSolAdicion())
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'HO_ASIG_POS':
                    this.http
                        .guardarSolicitud(await this.reunirDatosSolHomolog())
                        .subscribe((respuesta) => {
                            resultado = respuesta;
                            resolve(resultado);
                        });
                    break;

                case 'HO_ASIG_ESP':
                    this.http
                        .guardarSolicitud(await this.reunirDatosSolHomolog())
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
        const firmaSolicitante = await this.convertirABase64(
            this.radicar.firmaSolicitante
        );

        const asignaturasParaAdicionar = this.radicar.asignaturasAdicCancel.map(
            (asignatura) => asignatura.id
        );

        const infoSolicitud: SolicitudSave = {
            idTipoSolicitud: this.radicar.tipoSolicitudEscogida.idSolicitud,
            idEstudiante: this.radicar.datosSolicitante.id,
            idTutor: this.radicar.tutor.id,
            datosHomologacion: null,
            datosAdicionAsignatura: asignaturasParaAdicionar,
            requiereFirmaDirector: false,
            firmaEstudiante: firmaSolicitante,
        };

        console.log(asignaturasParaAdicionar);

        return infoSolicitud;
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

        // Esperar a que todas las conversiones se completen
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

        const firmaSolicitante = await this.convertirABase64(
            this.radicar.firmaSolicitante
        );

        const datosSolHomologPost: DatosSolHomologPostSave = {
            datosHomologacionDto: datosHomologacion,
            documentosAdjuntos: documentosAdjuntos,
        };

        const infoSolicitud: SolicitudSave = {
            idTipoSolicitud: this.radicar.tipoSolicitudEscogida.idSolicitud,
            idEstudiante: this.radicar.datosSolicitante.id,
            idTutor: this.radicar.tutor.id,
            datosHomologacion: datosSolHomologPost,
            datosAdicionAsignatura: null,
            requiereFirmaDirector: false,
            firmaEstudiante: firmaSolicitante,
        };

        return infoSolicitud;
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
}
