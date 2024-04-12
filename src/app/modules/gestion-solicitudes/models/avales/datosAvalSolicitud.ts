export class DatosAvalSolicitud {
    static nuevoDatosAvalSolicitud(obj: object) {
        return new DatosAvalSolicitud(
            obj['idSolicitud'],
            obj['firmaTutor'],
            obj['firmaDirector'],
            obj['documentoPdfSolicitud']
        );
    }

    constructor(
        public idSolicitud: number,
        public firmaTutor: string,
        public firmaDirector: string,
        public documentoPdfSolicitud: string
    ) {}
}
