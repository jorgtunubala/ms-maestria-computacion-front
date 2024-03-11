import { DatosComunSolicitud } from '../datosComunSolicitud';
import { DatosSolicitudAdicionCancelacionAsignatura } from '../solicitud-adic-cancel-asig/datosSolicitudAdicionCancelacionAsignatura';
import { DatosSolHomologPostRequest } from '../solicitud-homolog-post/datosSolHomologPostRequest';

export class DatosSolicitudRequest {
    static nuevoDatosSolicitudRequest(obj: Object) {
        return new DatosSolicitudRequest(
            obj['datosComunSolicitud'],
            obj['datosSolicitudHomologacion'],
            obj['dadicionCancelacionAsignatura'],
            obj['datosSolicitudAplazarSemestre']
        );
    }

    constructor(
        public datosComunSolicitud: DatosComunSolicitud,
        public datosSolicitudHomologacion: DatosSolHomologPostRequest,
        public dadicionCancelacionAsignatura: DatosSolicitudAdicionCancelacionAsignatura,
        public datosSolicitudAplazarSemestre: any
    ) {}
}
