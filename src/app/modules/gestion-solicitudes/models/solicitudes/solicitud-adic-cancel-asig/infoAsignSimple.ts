export class InfoAsingSimple {
    static nuevoInfoAsingSimple(obj: Object) {
        return new InfoAsingSimple(obj['listaAsignaturas'], obj['motivo']);
    }

    constructor(
        public listaAsignaturas: {
            nombreAsignatura: string;
            docenteAsignatura: string;
            grupo: string;
        }[],
        public motivo: string
    ) {}
}
