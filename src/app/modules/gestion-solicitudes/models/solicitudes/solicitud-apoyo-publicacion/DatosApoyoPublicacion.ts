export class DatosApoyoPublicacion {
    static nuevoDatosApoyoPublicacion(obj: Object) {
        return new DatosApoyoPublicacion(
            obj['nombreEvento'],
            obj['tipoEvento'],
            obj['fechaInicio'],
            obj['fechaFin'],
            obj['idDirectorGrupo'],
            obj['nombreDirectorGrupo'],
            obj['tituloPublicacion'],
            obj['valorApoyo'],
            obj['entidadBancaria'],
            obj['tipoCuenta'],
            obj['numeroCuenta'],
            obj['numeroCedulaAsociada'],
            obj['direccionResidencia'],
            obj['documentosAdjuntos']
        );
    }

    constructor(
        public nombreEvento: string,
        public tipoEvento: string,
        public fechaInicio: string,
        public fechaFin: string,
        public idDirectorGrupo: string,
        public nombreDirectorGrupo: string,
        public tituloPublicacion: string,
        public valorApoyo: number,
        public entidadBancaria: string,
        public tipoCuenta: string,
        public numeroCuenta: string,
        public numeroCedulaAsociada: string,
        public direccionResidencia: string,
        public documentosAdjuntos: string[]
    ) {}
}
