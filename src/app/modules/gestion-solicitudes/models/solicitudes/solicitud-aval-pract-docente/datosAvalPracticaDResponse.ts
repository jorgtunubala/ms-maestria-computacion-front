export class DatosAvalPracticaDResponse {
    static nuevoDatosAvalPracticaDResponse(obj: Object) {
        return new DatosAvalPracticaDResponse(
            obj['nombreActividad'],
            obj['horasReconocer']
        );
    }

    constructor(
        public nombreActividad: string,
        public horasReconocer: number
    ) {}
}
