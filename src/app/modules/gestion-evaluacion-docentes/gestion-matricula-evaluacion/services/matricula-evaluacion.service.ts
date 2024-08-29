import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { backend } from 'src/app/core/constants/api-url';
// import { getHeaders } from 'src/app/core/constants/header';

@Injectable({
    providedIn: 'root',
})
export class MatriculaEvaluacionService {
    constructor(private http: HttpClient) {}

    listarEvaluciones(): Observable<any> {
        // Simulación de la respuesta del backend
        const datosSimulados = [
            {
                id: 1,
                anio: 2024,
                periodo: 2,
                nombreCuestionario: "Cuestionario de evaluación docente",
                cantidadAsignaturas: 7,
                estado: "ACTIVO"
            },
            {
                id: 2,
                anio: 2023,
                periodo: 1,
                nombreCuestionario: "Cuestionario de evaluación docente",
                cantidadAsignaturas: 5,
                estado: "CERRADO"
            },
            {
                id: 3,
                anio: 2022,
                periodo: 2,
                nombreCuestionario: "Cuestionario de evaluación docente",
                cantidadAsignaturas: 6,
                estado: "CERRADO"
            }
        ];

        // Retorna los datos simulados como un Observable
        return of(datosSimulados);

        // Cuando el backend esté disponible, puedes descomentar estas líneas y eliminar la simulación:
        // return this.http.get<any>(backend('evaluacion/list'), {
        //     headers: getHeaders(),
        // });
    }
}
