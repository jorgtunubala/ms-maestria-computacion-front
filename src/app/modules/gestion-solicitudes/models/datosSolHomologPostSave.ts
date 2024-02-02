import { AsignaturasHologPost } from './asignaturasHologPost';

export class DatosSolHomologPostSave {
    static nuevoDatosSolHomologPostSave(obj: Object) {
        return new DatosSolHomologPostSave(
            obj['idSolicitud'],
            obj['idEstudiante'],
            obj['datosHomologacionDto'],
            obj['idTutor'],
            obj['documentosAdjuntos']
        );
    }

    constructor(
        public idSolicitud: number,
        public idEstudiante: string,
        public datosHomologacionDto: AsignaturasHologPost,
        public idTutor: string,
        public documentosAdjuntos: string[]
    ) {}
}
