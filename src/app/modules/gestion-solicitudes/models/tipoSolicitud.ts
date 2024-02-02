export class TipoSolicitud {
    static nuevoTipoSolicitud(obj: Object) {
        return new TipoSolicitud(
            obj['idSolicitud'],
            obj['codigoSolicitud'],
            obj['nombreSolicitud']
        );
    }

    constructor(
        public idSolicitud: number,
        public codigoSolicitud: string,
        public nombreSolicitud: string
    ) {}
}
