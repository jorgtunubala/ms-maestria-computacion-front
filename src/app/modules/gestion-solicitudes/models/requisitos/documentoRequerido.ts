export class DocumentoRequerido {
    static nuevoDocumentoRequerido(obj: Object) {
        return new DocumentoRequerido(obj['nombre'], obj['agregar']);
    }

    constructor(public nombre: string, public adjuntarDocumento: boolean) {}
}
