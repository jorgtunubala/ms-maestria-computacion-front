import { DatosSolicitudCancelacionAsignatura } from './solicitud-adic-cancel-asig/datosSolicitudCancelacionAsignatura';
import { InfoAsingAdicionCancelacion } from './solicitud-adic-cancel-asig/infoAsignAdicionCancelacion';
import { DatosSolHomologPostSave } from './solicitud-homolog-post/datosSolHomologPostSave';

export class SolicitudSave {
    static nuevoSolicitudSave(obj: Object) {
        return new SolicitudSave(
            obj['idTipoSolicitud'],
            obj['idEstudiante'],
            obj['idTutor'],
            obj['datosHomologacion'],
            obj['datosAdicionAsignatura'],
            obj['datosCancelarAsignatura'],
            obj['requiereFirmaDirector'],
            obj['firmaEstudiante']
        );
    }

    constructor(
        public idTipoSolicitud: number,
        public idEstudiante: string,
        public idTutor: string,
        public datosHomologacion: DatosSolHomologPostSave,
        public datosAdicionAsignatura: InfoAsingAdicionCancelacion[],
        public datosCancelarAsignatura: DatosSolicitudCancelacionAsignatura,
        public requiereFirmaDirector: boolean,
        public firmaEstudiante: string
    ) {}
}
