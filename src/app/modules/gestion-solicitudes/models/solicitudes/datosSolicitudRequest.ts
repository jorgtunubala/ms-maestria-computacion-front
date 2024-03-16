import { DatosComunSolicitud } from '../datosComunSolicitud';
import { DatosSolicitudCancelacionAsignatura } from '../solicitud-adic-cancel-asig/datosSolicitudCancelacionAsignatura';
import { InfoAsingSimple } from '../solicitud-adic-cancel-asig/infoAsignSimple';
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
        public dadicionCancelacionAsignatura: InfoAsingSimple,
        public datosSolicitudAplazarSemestre: any
    ) {}
}
