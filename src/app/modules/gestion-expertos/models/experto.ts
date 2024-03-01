
import { Movilidad } from "./movilidad";
import { Persona } from "./persona";

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
    observacionexp?: string;
    estado?:string;
    movilidad?:Movilidad;

    
}