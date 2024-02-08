import { DatosComunSolicitud } from '../datosComunSolicitud';
import { DatosSolHomologPostRequest } from '../solicitud-homolog-post/datosSolHomologPostRequest';

export class DatosSolicitudRequest {
    static nuevoDatosSolicitudRequest(obj: Object) {
        return new DatosSolicitudRequest(
            obj['datosComunSolicitud'],
            obj['datosSolicitudHomologacion'],
            obj['datosSolicitudAplazarSemestre'],
            obj['dadicionCancelacionAsignatura']
        );
    }

    constructor(
        public datosComunSolicitud: DatosComunSolicitud,
        public datosSolicitudHomologacion: DatosSolHomologPostRequest,
        public datosSolicitudAplazarSemestre: any,
        public dadicionCancelacionAsignatura: any
    ) {}
}
