import { Injectable } from '@angular/core';

import {
    AsignaturasHologPost,
    DatosAsigHomologPost,
    DatosSolHomologPostSave,
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
                case 'HO_ASIG_POS':
                    this.http
                        .guardarSolHomologPost(
                            await this.reunirDatosSolHomologPost()
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

    async reunirDatosSolHomologPost(): Promise<DatosSolHomologPostSave> {
        const asignaturasAHomologar: DatosAsigHomologPost[] = [];
        const conversionesBase64: Promise<string>[] = [];

        for (
            let index = 0;
            index < this.radicar.datosAsignaturasAHomologar.length;
            index++
        ) {
            const conversionPromise = this.convertirABase64(
                this.radicar.datosAsignaturasAHomologar[index].contenidos
            ).then((base64String) => base64String.toString());

            conversionesBase64.push(conversionPromise);
        }

        // Esperar a que todas las conversiones se completen
        const base64Contents = await Promise.all(conversionesBase64);

        for (
            let index = 0;
            index < this.radicar.datosAsignaturasAHomologar.length;
            index++
        ) {
            const datos: DatosAsigHomologPost = {
                nombreAsignatura:
                    this.radicar.datosAsignaturasAHomologar[index].asignatura,
                numeroCreditos:
                    this.radicar.datosAsignaturasAHomologar[index].creditos,
                intensidadHoraria:
                    this.radicar.datosAsignaturasAHomologar[index].intensidad,
                calificacion:
                    this.radicar.datosAsignaturasAHomologar[index].calificacion,
                contenidoProgramatico: base64Contents[index], // Usar el contenido ya convertido
            };
            asignaturasAHomologar.push(datos);
        }

        const datosHomologacion: AsignaturasHologPost = {
            programaProcedencia:
                this.radicar.datosInstitucionHomologar.programa,
            institucionProcedencia:
                this.radicar.datosInstitucionHomologar.institucion,
            listaAsignaturas: asignaturasAHomologar,
        };

        const documentosAdjuntos = await this.convertirDocumentosAdjuntos();

        const infoSolicitud: DatosSolHomologPostSave = {
            idSolicitud: this.radicar.tipoSolicitudEscogida.idSolicitud,
            idEstudiante: this.radicar.datosSolicitante.id,
            datosHomologacionDto: datosHomologacion,
            idTutor: this.radicar.tutor.id,
            documentosAdjuntos: documentosAdjuntos,
        };

        return infoSolicitud;
    }

    async convertirABase64(archivo: File): Promise<string | null> {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();

            lector.readAsDataURL(archivo);

            lector.onload = () => {
                if (typeof lector.result === 'string') {
                    resolve(lector.result);
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
                return await this.convertirABase64(adjunto);
            });

        return Promise.all(documentosAdjuntosPromises);
    }
}