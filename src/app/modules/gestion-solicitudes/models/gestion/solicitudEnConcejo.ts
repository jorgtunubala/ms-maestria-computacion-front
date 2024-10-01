export class SolicitudEnConcejoResponse {
    static nuevoSolicitudEnConcejoResponse(obj: Object) {
        return new SolicitudEnConcejoResponse(
            obj['idSolicitud'],
            obj['enConcejo'],
            obj['avaladoConcejo'],
            obj['conceptoConcejo'],
            obj['numeroActa'],
            obj['fechaAval'],
            obj['documentosConcejo']
        );
    }

    constructor(
        public idSolicitud: number,
        public enConcejo: boolean,
        public avaladoConcejo: string,
        public conceptoConcejo: string,
        public numeroActa: string,
        public fechaAval: string,
        public documentosConcejo: string[]
    ) {}
}
