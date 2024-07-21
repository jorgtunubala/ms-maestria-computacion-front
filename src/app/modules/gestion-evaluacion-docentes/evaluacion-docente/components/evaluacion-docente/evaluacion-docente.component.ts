import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-evaluacion-docente',
  templateUrl: './evaluacion-docente.component.html',
  styleUrls: ['./evaluacion-docente.component.scss']
})
export class EvaluacionDocenteComponent implements OnInit {

  docentes = [
    { nombre: 'Carlos Cobos', asignatura: 'Metodología de la investigación', notaFinal: null, completado: false },
    { nombre: 'Carlos Cobos', asignatura: 'Minería de datos', notaFinal: null, completado: false },
    { nombre: 'Carlos Alberto Ardila', asignatura: 'Seminario de matemáticas', notaFinal: null, completado: false },
    { nombre: 'Cesar Alberto Collazos', asignatura: 'Seminario de la investigación', notaFinal: null, completado: false }
  ];

  preguntas = [
    'Asiste con puntualidad a las actividades académicas programadas',
    'Entrega oportunamente los resultados de las evaluaciones',
    'Utiliza diferentes medios didácticos en el desarrollo de sus clases',
    'Desarrolla actividades que promueven la formación y el aprendizaje independiente de los estudiantes',
    'Domina y está actualizado con los temas del curso',
    'Relaciona los temas del curso con alternativas que facilitan su comprensión y promueven la solución de problemas',
    'Desarrolla el contenido del curso según lo establecido en el programa',
    'Es ordenado en la exposición de sus ideas y en los temas que presenta',
    'Relaciona las evaluaciones con los objetivos y los temas desarrollados en el curso',
    'Es ecuánime en la evaluación de los estudiantes',
    'Es cordial y respetuoso en el trato con los estudiantes',
    'Está dispuesto al diálogo y sugerencias y cambios para mejorar su actividad'
  ];

  evaluaciones = [];
  currentDocente = 0;
  evaluationCompleted = false;

  constructor() { }

  ngOnInit() {
    this.inicializarEvaluaciones();
  }

  inicializarEvaluaciones() {
    this.docentes.forEach(docente => {
      const evaluacion = { docente: docente.nombre, asignatura: docente.asignatura, respuestas: Array(this.preguntas.length).fill(null) };
      this.evaluaciones.push(evaluacion);
    });
  }

  evaluar(docenteIndex, preguntaIndex, valor) {
    this.evaluaciones[docenteIndex].respuestas[preguntaIndex] = valor;
    this.checkCompletion(docenteIndex);
  }

  checkCompletion(docenteIndex) {
    const completado = this.evaluaciones[docenteIndex].respuestas.every(respuesta => respuesta !== null);
    this.docentes[docenteIndex].completado = completado;
  }

  obtenerPromedio(respuestas) {
    const sum = respuestas.reduce((acc, val) => acc + (val || 0), 0);
    return sum / respuestas.length;
  }

  finalizarEvaluacion() {
    this.evaluaciones.forEach((evaluacion, index) => {
      const promedio = this.obtenerPromedio(evaluacion.respuestas);
      this.docentes[index].notaFinal = promedio.toFixed(2);
    });
    this.evaluationCompleted = true;
  }

  get docentesEvaluados() {
    return this.docentes.filter(d => d.completado).length;
  }

  get totalDocentes() {
    return this.docentes.length;
  }

  anterior() {
    if (this.currentDocente > 0) {
      this.currentDocente--;
    }
  }

  siguiente() {
    if (this.currentDocente < this.docentes.length - 1) {
      this.currentDocente++;
    }
  }

  canFinalizar() {
    return this.docentes.every(docente => docente.completado);
  }
}
