import { Persona } from "src/app/shared/models/persona";

export interface Orientador {
    id?: number;
    persona?: Persona;
    rol?: string;
    tipo?: string;
}
