export class DatosAsigHomologPost {
    static nuevoDatosAsigHomologPost(obj: Object) {
        return new DatosAsigHomologPost(
            obj['nombreAsignatura'],
            obj['numeroCreditos'],
            obj['intensidadHoraria'],
            obj['calificacion'],
            obj['contenidoProgramatico']
        );
    }

    constructor(
        public nombreAsignatura: string,
        public numeroCreditos: number,
        public intensidadHoraria: number,
        public calificacion: number,
        public contenidoProgramatico: string
    ) {}
}
