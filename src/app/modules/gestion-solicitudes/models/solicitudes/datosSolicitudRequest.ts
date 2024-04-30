import {
    DatosSolicitudAplazamiento,
    DatosSolHomologPostRequest,
    InfoAsingSimple,
    DatosComunSolicitud,
    DatosSolicitudCursarAsignatura,
    DatosAsignaturaProgramasExt,
    DatosSolicitudAvalPasantia,
    DatosApoyoPasantia,
    DatosReconoCreditos,
} from '../indiceModelos';

export class DatosSolicitudRequest {
    static nuevoDatosSolicitudRequest(obj: Object) {
        return new DatosSolicitudRequest(
            obj['datosComunSolicitud'],
            obj['datosSolicitudHomologacion'],
            obj['datosSolicitudAplazarSemestre'],
            obj['datosSolicitudCursarAsignaturas'],
            obj['dadicionCancelacionAsignatura'],
            obj['datoAvalPasantiaInv'],
            obj['datosApoyoEconomico'],
            obj['datosRecCreditosPasantia']
        );
    }

    constructor(
        public datosComunSolicitud: DatosComunSolicitud,
        public datosSolicitudHomologacion: DatosSolHomologPostRequest,
        public datosSolicitudAplazarSemestre: DatosSolicitudAplazamiento,
        public datosSolicitudCursarAsignaturas: DatosAsignaturaProgramasExt,
        public dadicionCancelacionAsignatura: InfoAsingSimple,
        public datoAvalPasantiaInv: DatosSolicitudAvalPasantia,
        public datosApoyoEconomico: DatosApoyoPasantia,
        public datosReconocimientoCreditos: DatosReconoCreditos
    ) {}
}
