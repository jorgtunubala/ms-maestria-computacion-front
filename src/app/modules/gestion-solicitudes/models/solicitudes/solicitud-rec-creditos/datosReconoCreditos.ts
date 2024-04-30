export class DatosReconoCreditos {
    static nuevoDatosReconoCreditos(obj: Object) {
        return new DatosReconoCreditos(obj['documentosAdjuntos']);
    }

    constructor(public documentosAdjuntos: string[]) {}
}
