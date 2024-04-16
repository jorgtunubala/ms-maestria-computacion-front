export class DatosSolicitudAplazamiento {
    static nuevoDatosSolicitudAplazamiento(obj: Object) {
        return new DatosSolicitudAplazamiento(obj['semestre'], obj['motivo']);
    }

    constructor(public semestre: string, public motivo: string) {}
}
