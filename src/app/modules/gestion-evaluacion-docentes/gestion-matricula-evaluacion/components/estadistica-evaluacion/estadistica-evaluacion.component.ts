import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatriculaEvaluacionService } from '../../services/matricula-evaluacion.service';

@Component({
    selector: 'app-estadistica-evaluacion',
    templateUrl: './estadistica-evaluacion.component.html',
    styleUrls: ['./estadistica-evaluacion.component.scss'],
})
export class EstadisticaEvaluacionComponent implements OnInit {
    evaluacion: any = {};
    resultados: any[] = [];
    filtroDocentes: string = 'todos';
    docenteFiltro: string = '';

    docentesOptions = [
        { label: 'Todos los docentes', value: 'todos' },
        { label: 'Docente en particular', value: 'particular' },
    ];

    constructor(
        private route: ActivatedRoute,
        private matriculaEvaluacionService: MatriculaEvaluacionService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.params['id'];

        this.matriculaEvaluacionService
            .obtenerEvaluacionMetadata(id)
            .subscribe((data) => {
                this.evaluacion = data;
                this.resultados = this.evaluacion.areasFormacion
                    .map((area) => area.cursos)
                    .flat()
                    .map((curso) => {
                        return curso.docentes.map((docente) => ({
                            docente: `${docente.nombre} ${docente.apellido}`,
                            asignatura: curso.asignatura,
                            evaluacionesRealizadas:
                                Math.floor(Math.random() * 7) + 1, // Simulación
                            evaluacionesTotales: 7, // Simulación de total
                            notaFinal: Math.floor(Math.random() * 10) + 1, // Simulación de la nota
                        }));
                    })
                    .flat();
            });
    }

    resultadosFiltrados() {
        if (this.filtroDocentes === 'todos') {
            return this.resultados;
        } else if (this.filtroDocentes === 'particular' && this.docenteFiltro) {
            return this.resultados.filter((r) =>
                r.docente
                    .toLowerCase()
                    .includes(this.docenteFiltro.toLowerCase())
            );
        }
        return [];
    }
}
