import {
    DatosSolicitudAplazamiento,
    DatosSolHomologPostRequest,
    InfoAsingSimple,
    DatosComunSolicitud,
    DatosSolicitudCursarAsignatura,
    DatosAsignaturaProgramasExt,
} from '../indiceModelos';

export class DatosSolicitudRequest {
    static nuevoDatosSolicitudRequest(obj: Object) {
        return new DatosSolicitudRequest(
            obj['datosComunSolicitud'],
            obj['datosSolicitudHomologacion'],
            obj['datosSolicitudAplazarSemestre'],
            obj['datosSolicitudCursarAsignaturas'],
            obj['dadicionCancelacionAsignatura']
        );
    }

    constructor(
        public datosComunSolicitud: DatosComunSolicitud,
        public datosSolicitudHomologacion: DatosSolHomologPostRequest,
        public datosSolicitudAplazarSemestre: DatosSolicitudAplazamiento,
        public datosSolicitudCursarAsignaturas: DatosAsignaturaProgramasExt,
        public dadicionCancelacionAsignatura: InfoAsingSimple
    ) {}
}
