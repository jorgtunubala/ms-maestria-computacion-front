export class DatosComunesSolicitudGuardada {
    static nuevoDatosComunesSolicitudGuardada(obj: Object) {
        return new DatosComunesSolicitudGuardada(
            obj['tipoSolicitud'],
            obj['nombreEstudiante'],
            obj['codEstudiante'],
            obj['emailEstudiante'],
            obj['celular'],
            obj['nombreTutor']
        );
    }

    constructor(
        public tipoSolicitud: string,
        public nombreEstudiante: string,
        public codEstudiante: string,
        public emailEstudiante: string,
        public celular: string,
        public nombreTutor: string
    ) {}
}
