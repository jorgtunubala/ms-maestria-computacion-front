export class AprobarAsignaturas {
    static nuevoAprobarAsignaturas(obj: Object) {
        return new AprobarAsignaturas(obj['idAsignatura'], obj['nombre'], obj['aprobado']);
    }

    constructor(public idAsignatura: number, public nombre: string, public aprobado: boolean) {}
}
