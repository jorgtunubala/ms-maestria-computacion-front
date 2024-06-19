import { Component, OnInit } from '@angular/core';

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
areas: any[] = [];

constructor() {
    const currentYear = new Date().getFullYear();
    this.yearRange = `${currentYear - 100}:${currentYear}`;
}

ngOnInit(): void {
    this.cuestionarios = [
        { label: 'Seleccionar cuestionario', value: null },
        // Otros cuestionarios disponibles
    ];
    // Asignaturas simuladas por áreas
    this.areas = [
        {
            nombre: 'Área de fundamentación',
            asignaturas: [
                { codigo: '27611', grupo: 'A', nombre: 'Metodología de la Investigación', docente: 'CESAR JESUS PARDO CALVACHE, ERWIN MEZA VEGA, NESTOR MILCIADES DIAZ', cantidadEstudiantes: 10 },
                { codigo: '27700', grupo: 'A', nombre: 'Seminario de Matemáticas', docente: 'JULIO ARIEL HURTADO ALEGRIA', cantidadEstudiantes: 5 },
                { codigo: '27701', grupo: 'A', nombre: 'Gestión de la Tecnología y la Innovación', docente: 'RICARDO ANTONIO ZAMBRANO SEGUR', cantidadEstudiantes: 4 }
            ]
        },
        {
            nombre: 'Área de electivas',
            asignaturas: [
                { codigo: '123', grupo: 'A', nombre: 'Metodologías ágiles para la gestión de proyectos de dllo de Sw', docente: 'CESAR JESUS PARDO CALVACHE', cantidadEstudiantes: 4 },
                { codigo: '342', grupo: 'A', nombre: 'Ingeniería de la Usabilidad', docente: 'CESAR ALBERTO COLLAZOS ORDOÑE', cantidadEstudiantes: 2 },
                { codigo: '2341', grupo: 'A', nombre: 'Ingeniería de Procesos Sw', docente: 'JULIO ARIEL HURTADO ALEGRIA', cantidadEstudiantes: 3 }
            ]
        },
        {
            nombre: 'Área de investigación',
            asignaturas: [
                { codigo: '27708', grupo: 'A', nombre: 'Seminario de Investigación', docente: 'CESAR ALBERTO COLLAZOS ORDOÑE', cantidadEstudiantes: 4 },
                { codigo: '27708', grupo: 'B', nombre: 'Seminario de Investigación', docente: 'CARLOS ALBERTO COBOS LOZADA', cantidadEstudiantes: 3 },
                { codigo: '27708', grupo: 'C', nombre: 'Seminario de Investigación', docente: 'CAROLINA GONZALEZ SERRANO', cantidadEstudiantes: 2 }
            ]
        }
    ];
}

verDetalles() {
    // Aquí pondrías la lógica para verificar si la evaluación ya existe y mostrar los detalles
    this.mostrarDetalles = true;
    // Simulación de existencia de evaluación
    this.evaluacionExistente = true; // Cambia esto basado en tu lógica
}

registrarEvaluacion() {
    // Lógica para registrar la evaluación
    console.log('Registrar evaluación', this.evaluacion);
}
}
