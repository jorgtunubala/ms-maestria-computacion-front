export class InfoAsingAdicionCancelacion {
    static nuevoInfoAsignAdicionCancelacion(obj: Object) {
        return new InfoAsingAdicionCancelacion(
            obj['nombreAsignatura'],
            obj['idDocente']
        );
    }

    constructor(public nombreAsignatura: string, public idDocente: string) {}
}
