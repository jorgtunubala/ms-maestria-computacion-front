export class SolicitudRecibida {
    static nuevaSolicitudRecibida(obj: object) {
        return new SolicitudRecibida(
            obj['idSolicitud'],
            obj['codigoSolicitud'],
            obj['nombreEstudiante'],
            obj['nombreTipoSolicitud'],
            obj['abreviatura'],
            obj['fecha']
        );
    }

    constructor(
        public idSolicitud: number,
        public codigoSolicitud: string,
        public nombreEstudiante: string,
        public nombreTipoSolicitud: string,
        public abreviatura: string,
        public fecha: Date
    ) {}
}
