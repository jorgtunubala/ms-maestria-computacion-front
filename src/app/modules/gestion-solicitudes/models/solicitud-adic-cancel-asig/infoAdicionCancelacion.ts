export class InfoAdicionCancelacion {
    static nuevoInfoAdicionCancelacion(obj: Object) {
        return new InfoAdicionCancelacion(
            obj['nombreAsignatura'],
            obj['grupo']
        );
    }

    constructor(public nombreAsignatura: string, public grupo: string) {}
}
