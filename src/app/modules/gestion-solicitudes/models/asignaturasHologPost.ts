import { DatosAsigHomologPost } from './datosAsigHomologPost';

export class AsignaturasHologPost {
    static nuevoAsignaturasHomologPost(obj: Object) {
        return new AsignaturasHologPost(
            obj['programaProcedencia'],
            obj['institucionProcedencia'],
            obj['listaAsignaturas']
        );
    }

    constructor(
        public programaProcedencia: string,
        public institucionProcedencia: string,
        public listaAsignaturas: DatosAsigHomologPost[]
    ) {}
}
