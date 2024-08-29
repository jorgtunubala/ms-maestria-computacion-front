import { Component, OnInit } from '@angular/core';
import { CuestionarioService } from '../../../gestion-cuestionarios/services/cuestionario.service';
import { Cuestionario } from '../../../gestion-cuestionarios/models/cuestionario';

@Component({
    selector: 'app-agregar-evaluacion',
    templateUrl: './agregar-evaluacion.component.html',
    styleUrls: ['./agregar-evaluacion.component.scss'],
})
export class AgregarEvaluacionComponent implements OnInit {
    evaluacion: any = {
        periodo: null,
        anio: null,
        cuestionario: null,
    };
    cuestionarios: any[] = [];
    mostrarDetalles: boolean = false;
    evaluacionExistente: boolean = false;
    yearRange: string;
    areasFormacion: any[] = [];
    cantidadEstudiantesRegistrados: number = 0;

    constructor(private cuestionarioService: CuestionarioService) {
        const currentYear = new Date().getFullYear();
        this.yearRange = `${currentYear - 100}:${currentYear}`;
    }

    ngOnInit(): void {
        this.cuestionarios = [
            { label: 'Seleccionar cuestionario', value: null },
        ];
        this.loadCuestionarios();

        this.areasFormacion = [
            {
                idArea: 1,
                nombre: 'Área de Fundamentación',
                cursos: [
                    {
                        id: 1,
                        grupoCurso: 'A',
                        idArea: 1,
                        area: 'Área de Fundamentación',
                        codigo: 1,
                        asignatura: 'Metodología de la Investigación',
                        docentes: [
                            {
                                id: 1,
                                codigo: 'DOC001',
                                nombre: 'Andrés',
                                apellido: 'García',
                                correo: 'agarcia@example.com'
                            },
                            {
                                id: 2,
                                codigo: 'DOC002',
                                nombre: 'María',
                                apellido: 'Martínez',
                                correo: 'mmartinez@example.com'
                            },
                            {
                                id: 9,
                                codigo: 'DOC009',
                                nombre: 'Alejandro',
                                apellido: 'Díaz',
                                correo: 'adiaz@example.com'
                            }
                        ],
                        cantidadEstudiantes: 12
                    },
                    {
                        id: 2,
                        grupoCurso: 'A',
                        idArea: 1,
                        area: 'Área de Fundamentación',
                        codigo: 2,
                        asignatura: 'Seminario de Matemáticas',
                        docentes: [
                            {
                                id: 4,
                                codigo: 'DOC004',
                                nombre: 'Sandra',
                                apellido: 'Pérez',
                                correo: 'sperez@example.com'
                            }
                        ],
                        cantidadEstudiantes: 10
                    }
                ]
            },
            {
                idArea: 2,
                nombre: 'Área de Electivas',
                cursos: [
                    {
                        id: 4,
                        grupoCurso: 'A',
                        idArea: 2,
                        area: 'Área de Electivas',
                        codigo: 4,
                        asignatura: 'Metodologías ágiles para la gestión de proyectos de desarrollo de software',
                        docentes: [
                            {
                                id: 6,
                                codigo: 'DOC006',
                                nombre: 'Laura',
                                apellido: 'González',
                                correo: 'lgonzalez@example.com'
                            }
                        ],
                        cantidadEstudiantes: 10
                    }
                ]
            }
        ];

        this.cantidadEstudiantesRegistrados = this.areasFormacion.reduce((total, area) => {
            return total + area.cursos.reduce((areaTotal, curso) => areaTotal + curso.cantidadEstudiantes, 0);
        }, 0);
    }

    loadCuestionarios(): void {
        this.cuestionarioService.listCuestionarios().subscribe(
            (data: Cuestionario[]) => {
                this.cuestionarios = data.map(c => ({ label: c.nombre, value: c.id }));
                this.cuestionarios.unshift({ label: 'Seleccionar cuestionario', value: null });
            },
            error => {
                console.error('Error al cargar los cuestionarios', error);
            }
        );
    }

    verDetalles() {
        this.mostrarDetalles = true;
        this.evaluacionExistente = true; // Cambia esto basado en tu lógica
    }

    registrarEvaluacion() {
        console.log('Registrar evaluación', this.evaluacion);
    }
}
