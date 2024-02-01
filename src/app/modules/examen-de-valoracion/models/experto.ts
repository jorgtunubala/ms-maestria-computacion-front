import { LineaInvestigacion } from 'src/app/shared/models/linea-investigacion';
import { Titulo } from 'src/app/shared/models/titulo';
import { Persona } from 'src/app/shared/models/persona';

export interface Experto {
    id?: number;
    estado?: string;
    persona?: Persona;
    codigo?: string;
    facultad?: string;
    departamento?: string;
    escalafon?: string;
    observacion?: string;
    lineasInvestigacion?: LineaInvestigacion[];
    tipoVinculacion?: string;
    titulos?: Titulo[];
}
