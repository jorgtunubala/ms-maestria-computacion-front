
import { Movilidad } from "./movilidad";
import { Persona } from "./persona";

export interface Experto {
    // id?: number;
    // estado?: string;
    // persona?: Persona;
    // codigo?: string;
    // facultad?: string;
    // departamento?: string;
    // escalafon?: string;
    // observacion?: string;
    // lineasInvestigacion?: LineaInvestigacion[];
    // tipoVinculacion?: string;
    // titulos?: Titulo[];

    id?: number;
    persona?: Persona;
    tituloexper?: string;
    universidadtitexp?: string;
    copiadocidentidad?: string;
    universidadexp?: string;
    facultadexp?: string;
    grupoinvexp?: string;
    lineainvexp?: string;
    observacionexp?: string;
    estado?:string;
    movilidad?:Movilidad;

    
}