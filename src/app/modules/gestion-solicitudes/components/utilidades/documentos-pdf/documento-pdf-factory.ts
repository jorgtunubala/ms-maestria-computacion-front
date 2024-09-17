import { Injectable } from '@angular/core';
import { AdicionAsignaturasStrategy } from './adicion-asignaturas-strategy';
import { AplazamientoSemestreStrategy } from './aplazamiento-semestre-strategy';
import { DocumentoPDFStrategy } from '../../../models/documentos/documento-pdf-strategy.model';
import { RadicarService } from '../../../services/radicar.service';
import { PdfService } from '../../../services/pdf.service';
import { ApoyoEconomicoCongresosStrategy } from './apoyo-congresos-strategy';
import { UtilidadesService } from '../../../services/utilidades.service';
import { ApoyoEconomicoPasantiaStrategy } from './apoyo-pasantia-strategy';
import { ApoyoEconomicoPublicOInscripStrategy } from './apoyo-publicaciones-strategy';
import { AvalPracticaDocenteStrategy } from './aval-practica-docente-strategy';
import { AvalPasantiaStrategy } from './aval-pasantia-strategy';
import { CancelacionAsignaturasStrategy } from './cancel-asignaturas-strategy';
import { CursarEnOtrosProgramasStrategy } from './curs-asignaturas-ext-strategy';
import { HomologacionAsignaturasEspStrategy } from './homologacion-asig-esp-strategy';
import { HomologacionAsignaturasPosStrategy } from './homologacion-asig-pos-strategy';
import { RecoCredPracticaDocenteStrategy } from './rec-cred-practica-doc-strategy';
import { RecoCredPasantiaStrategy } from './rec-cred-pasantia-strategy';
import { RecoCredPublicacionStrategy } from './rec-cred-publicacion-strategy';
import { SolicitudDeBecaStrategy } from './solicitud-becas-strategy';

@Injectable({
    providedIn: 'root',
})
export class DocumentoPDFFactory {
    constructor(
        private servicioRadicar: RadicarService,
        private servicioPDF: PdfService,
        private servicioUtilidades: UtilidadesService
    ) {}

    crearEstrategia(codigoSolicitud: string): DocumentoPDFStrategy | null {
        switch (codigoSolicitud) {
            case 'AD_ASIG':
                return new AdicionAsignaturasStrategy(
                    this.servicioRadicar,
                    this.servicioPDF
                );
            case 'AP_SEME':
                return new AplazamientoSemestreStrategy(
                    this.servicioRadicar,
                    this.servicioPDF
                );

            case 'AP_ECON_ASI':
                return new ApoyoEconomicoCongresosStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'AP_ECON_INV':
                return new ApoyoEconomicoPasantiaStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'PA_PUBL_EVE':
                return new ApoyoEconomicoPublicOInscripStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'AV_COMI_PR':
                return new AvalPracticaDocenteStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'AV_PASA_INV':
                return new AvalPasantiaStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'CA_ASIG':
                return new CancelacionAsignaturasStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'CU_ASIG':
                return new CursarEnOtrosProgramasStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'HO_ASIG_ESP':
                return new HomologacionAsignaturasEspStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'HO_ASIG_POS':
                return new HomologacionAsignaturasPosStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'RE_CRED_PR_DOC':
                return new RecoCredPracticaDocenteStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'RE_CRED_PAS':
                return new RecoCredPasantiaStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'RE_CRED_PUB':
                return new RecoCredPublicacionStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            case 'SO_BECA':
                return new SolicitudDeBecaStrategy(
                    this.servicioRadicar,
                    this.servicioPDF,
                    this.servicioUtilidades
                );

            default:
                return null; // Retorna null si no hay estrategia correspondiente
        }
    }
}
