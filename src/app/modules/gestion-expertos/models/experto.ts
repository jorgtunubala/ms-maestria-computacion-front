
import { Movilidad } from "./movilidad";
import { Persona } from "./persona";

export interface LineaInvestigacion {
    name: string;
    selected: boolean; // O cualquier otra propiedad que necesites almacenar
}

export interface Experto {
    id?: number;
    persona?: Persona;
    tituloexper?: string;
    universidadtitexp?: string;
    copiadocidentidad?: string;
    universidadexp?: string;
    facultadexp?: string;
    grupoinvexp?: string;
    lineainvexp?: string;
    // lineainvexp?: LineaInvestigacion[]; 
    observacionexp?: string;
    estado?:string;
    movilidad?:Movilidad;

    
}