export class DatosAvalPracticaDocente {
    static nuevoDatosAvalPracticaDocente(obj: Object) {
        return new DatosAvalPracticaDocente(
            obj['codigoSubtipo'],
            obj['intensidadHoraria'],
            obj['horasReconocer']
        );
    }

    constructor(
        public codigoSubtipo: string,
        public intensidadHoraria: number,
        public horasReconocer: number
    ) {}
}
