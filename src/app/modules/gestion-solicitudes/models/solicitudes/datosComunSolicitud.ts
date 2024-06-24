export class DatosComunSolicitud {
    static nuevoDatosComunSolicitud(obj: Object) {
        return new DatosComunSolicitud(
            obj['tipoSolicitud'],
            obj['fechaEnvioSolicitud'],
            obj['nombreSolicitante'],
            obj['apellidoSolicitante'],
            obj['codigoSolicitante'],
            obj['emailSolicitante'],
            obj['celularSolicitante'],
            obj['tipoIdentSolicitante'],
            obj['numeroIdentSolicitante'],
            obj['nombreTutor'],
            obj['nombreDirector'],
            obj['requiereFirmaDirector'],
            obj['firmaSolicitante'],
            obj['firmaTutor'],
            obj['firmaDirector'],
            obj['estadoSolicitud'],
            obj['oficioPdf']
        );
    }

    constructor(
        public tipoSolicitud: string,
        public fechaEnvioSolicitud: Date,
        public nombreSolicitante: string,
        public apellidoSolicitante: string,
        public codigoSolicitante: string,
        public emailSolicitante: string,
        public celularSolicitante: string,
        public tipoIdentSolicitante: string,
        public numeroIdentSolicitante: string,
        public nombreTutor: string,
        public nombreDirector: string,
        public requiereFirmaDirector: boolean,
        public firmaSolicitante: string,
        public firmaTutor: string,
        public firmaDirector: string,
        public estadoSolicitud: string,
        public oficioPdf: string
    ) {}
}
