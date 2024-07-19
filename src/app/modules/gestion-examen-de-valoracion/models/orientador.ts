import { Persona } from "./persona";

export interface Orientador {
    id?: number;
    persona?: Persona;
    rol?: string;
    tipo?: string;
}
