import { AprobarAsignaturas } from './aprobarAsignaturas';

export class SolicitudEnComiteResponse {
    static nuevoSolicitudEnComiteResponse(obj: Object) {
        return new SolicitudEnComiteResponse(
            obj['idSolicitud'],
            obj['enComite'],
            obj['avaladoComite'],
            obj['conceptoComite'],
            obj['numeroActa'],
            obj['fechaAval'],
            obj['asignaturasAprobadas']
        );
    }

    constructor(
        public idSolicitud: number,
        public enComite: boolean,
        public avaladoComite: string,
        public conceptoComite: string,
        public numeroActa: string,
        public fechaAval: string,
        public asignaturasAprobadas: AprobarAsignaturas[]
    ) {}
}
