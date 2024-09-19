export class SolicitudEnComiteResponse {
    static nuevoSolicitudEnComiteResponse(obj: Object) {
        return new SolicitudEnComiteResponse(
            obj['idSolicitud'],
            obj['enComite'],
            obj['avaladoComite'],
            obj['conceptoComite'],
            obj['numeroActa'],
            obj['fechaAval']
        );
    }

    constructor(
        public idSolicitud: number,
        public solicitudEnComite: boolean,
        public aval: string,
        public concepto: string,
        public numActa: string,
        public fecha: string
    ) {}
}
