export class InfoAsingSimple {
    static nuevoInfoAsingSimple(obj: Object) {
        return new InfoAsingSimple(obj['listaAsignaturas'], obj['motivo']);
    }

    constructor(
        public listaAsignaturas: {
            nombreAsignatura: string;
            docenteAsignatura: string;
        }[],
        public motivo: string
    ) {}
}
