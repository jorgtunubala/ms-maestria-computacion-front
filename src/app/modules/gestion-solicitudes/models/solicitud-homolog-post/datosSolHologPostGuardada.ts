import { DatosAsigHomologPost } from '../datosAsigHomologPost';
import { DatosComunesSolicitudGuardada } from '../datosComunesSolicitudGuardada';

export class DatosSolHomologPostGuardada {
    static nuevoDatosSolHomologPostGuardada(obj: Object) {
        return new DatosSolHomologPostGuardada(
            obj['programaProcedencia'],
            obj['institutoProcedencia'],
            obj['datosAsignatura'],
            obj['documentosAdjuntos'],
            obj['datosComunSolicitud'],
            obj['estadoSolicitud']
        );
    }

    constructor(
        public programaProcedencia: string,
        public institutoProcedencia: string,
        public datosAsignatura: DatosAsigHomologPost[],
        public documentosAdjuntos: string[],
        public datosComunSolicitud: DatosComunesSolicitudGuardada,
        public estadoSolicitud: string
    ) {}
}
