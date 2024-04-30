export class DatosSolicitudAvalPasantia {
    static nuevoDatosSolicitudAvalPasantia(obj: Object) {
        return new DatosSolicitudAvalPasantia(
            obj['lugarPasantia'],
            obj['fechaInicio'],
            obj['fechaFin'],
            obj['documentosAdjuntos']
        );
    }

    constructor(
        public lugarPasantia: string,
        public fechaInicio: string,
        public fechaFin: string,
        public documentosAdjuntos: string[]
    ) {}
}
