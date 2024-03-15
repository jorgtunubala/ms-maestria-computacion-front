import { InfoAdicionCancelacion } from './infoAdicionCancelacion';

export class DatosSolicitudAdicionCancelacionAsignatura {
    static nuevoDatosSolicitudAdicionCancelacionAsignatura(obj: Object) {
        return new DatosSolicitudAdicionCancelacionAsignatura(
            obj['listaAsignaturas'],
            obj['motivo']
        );
    }

    constructor(
        public listaAsignaturas: InfoAdicionCancelacion[],
        public motivo: string
    ) {}
}
