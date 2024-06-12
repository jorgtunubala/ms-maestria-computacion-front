import {
    DatosSolicitudCancelacionAsignatura,
    InfoAsingAdicionCancelacion,
    DatosSolicitudAplazamiento,
    DatosSolHomologPostSave,
    DatosSolicitudCursarAsignatura,
    DatosSolicitudAvalPasantia,
    DatosApoyoPasantia,
    DatosReconoCreditos,
    DatosApoyoCongreso,
    DatosApoyoPublicacion,
    DatosActividadPracticaDocente,
} from '../indiceModelos';

export class SolicitudSave {
    static nuevoSolicitudSave(obj: Object) {
        return new SolicitudSave(
            obj['idTipoSolicitud'],
            obj['idEstudiante'],
            obj['idTutor'],
            obj['datosHomologacion'],
            obj['datosAdicionAsignatura'],
            obj['datosCancelarAsignatura'],
            obj['datosAplazarSemestre'],
            obj['datosCursarAsignatura'],
            obj['datoAvalPasantiaInv'],
            obj['datosApoyoEconomico'],
            obj['datosRecCreditosPasantia'],
            obj['datosAvalSeminario'],
            obj['datosApoyoEconomicoCongreso'],
            obj['datosApoyoEconomicoPublicacion'],
            obj['datosActividadDocenteRequest'],
            obj['requiereFirmaDirector'],
            obj['firmaEstudiante']
        );
    }

    constructor(
        public idTipoSolicitud: number,
        public idEstudiante: string,
        public idTutor: string,
        public datosHomologacion: DatosSolHomologPostSave,
        public datosAdicionAsignatura: InfoAsingAdicionCancelacion[],
        public datosCancelarAsignatura: DatosSolicitudCancelacionAsignatura,
        public datosAplazarSemestre: DatosSolicitudAplazamiento,
        public datosCursarAsignatura: DatosSolicitudCursarAsignatura,
        public datosAvalPasantiaInv: DatosSolicitudAvalPasantia,
        public datosApoyoEconomico: DatosApoyoPasantia,
        public datosReconocimientoCreditos: DatosReconoCreditos,
        public datosAvalSeminario: any,
        public datosApoyoEconomicoCongreso: DatosApoyoCongreso,
        public datosApoyoEconomicoPublicacion: DatosApoyoPublicacion,
        public datosActividadDocenteRequest: DatosActividadPracticaDocente[],
        public requiereFirmaDirector: boolean,
        public firmaEstudiante: string
    ) {}
}
