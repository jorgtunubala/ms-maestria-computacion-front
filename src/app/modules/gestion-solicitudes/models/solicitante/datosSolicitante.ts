export class DatosSolicitante {
    static nuevoDatosSolicitante(obj: Object) {
        return new DatosSolicitante(
            obj['nombres'],
            obj['apellidos'],
            obj['correo'],
            obj['celular'],
            obj['codAcademico'],
            obj['tipoIdentificacion'],
            obj['identificacion']
        );
    }

    constructor(
        public nombres: string = null,
        public apellidos: string = null,
        public correo: string = null,
        public celular: number = null,
        public codAcademico: number = null,
        public tipoIdentificacion: string = null,
        public identificacion: number = null
    ) {}
}
