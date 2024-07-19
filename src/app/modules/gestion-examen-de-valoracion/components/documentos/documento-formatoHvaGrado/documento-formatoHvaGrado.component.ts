import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import * as PizZip from 'pizzip';
import * as Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import * as JSZipUtils from 'pizzip/utils/index.js';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoHvaGrado',
    templateUrl: 'documento-formatoHvaGrado.component.html',
    styleUrls: ['documento-formatoHvaGrado.component.scss'],
})
export class DocumentoFormatoHvaGradoComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoHvaGradoPdfGenerated = new EventEmitter<File>();
    @ViewChild('formatoHvaGrado') formatoHvaGrado!: ElementRef;

    estudianteSubscription: Subscription;
    tituloSubscription: Subscription;

    formatoHvaGradoForm: FormGroup;

    loading = false;

    fechaActual: string;

    title: string = 'docx-generator';
    estudianteSeleccionado: any;

    tiposAreaFormacion = [
        { nombre: 'Fundamentación' },
        { nombre: 'Electiva' },
        { nombre: 'Investigación' },
        { nombre: 'Complementación' },
    ];

    asignaturas = [
        { nombre: 'Asignatura A', creditos: 3 },
        { nombre: 'Asignatura B', creditos: 4 },
        { nombre: 'Asignatura C', creditos: 5 },
    ];

    pruebaSuperadaOptions = [
        { label: 'Sí', value: 'Si' },
        { label: 'No', value: 'No' },
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get estudiante(): FormControl {
        return this.formatoHvaGradoForm.get('estudiante') as FormControl;
    }

    ngOnInit() {
        this.initForm();
        this.fechaActual = new Date().toLocaleString();

        this.tituloSubscription =
            this.trabajoDeGradoService.tituloSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.formatoHvaGradoForm
                            .get('titulo')
                            .setValue(response);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                        this.formatoHvaGradoForm
                            .get('estudiante')
                            .setValue(
                                this.nombreCompletoEstudiante(
                                    this.estudianteSeleccionado
                                )
                            );
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });
    }

    initForm(): void {
        this.formatoHvaGradoForm = this.fb.group({
            estudiante: [null, Validators.required],
            codigo: ['123', Validators.required],
            planEstudios: ['2024-2', Validators.required],
            fechaRevision: [null, Validators.required],
            areasFormacion: this.fb.array([], Validators.required),
            pruebaSuperada: [null, Validators.required],
            minimoArticulo: [null, Validators.required],
            creditosCumplidos: [null, Validators.required],
            titulo: [null, Validators.required],
            director: [
                'Dr. Juan Camilo Rodríguez Fernández',
                Validators.required,
            ],
            codirector: [
                'Dr. María Fernanda Gómez de la Vega',
                Validators.required,
            ],
            coordinador: ['Alba Catalina Ramírez Mendoza', Validators.required],
        });
        this.formReady.emit(this.formatoHvaGradoForm);
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
    }

    addAreaFormacion(event: any): void {
        const areaSeleccionada = event.value;
        const areasFormacionArray = this.formatoHvaGradoForm.get(
            'areasFormacion'
        ) as FormArray;
        const areaExistente = areasFormacionArray.controls.find(
            (control) => control.get('tipo').value === areaSeleccionada.nombre
        );

        if (!areaExistente) {
            const areaFormGroup = this.fb.group({
                tipo: areaSeleccionada.nombre,
                asignaturas: this.fb.array([]),
            });

            areasFormacionArray.push(areaFormGroup);
        }
    }

    addAsignatura(areaIndex: number, asignaturaSeleccionada: any): void {
        const asignaturaFormGroup = this.fb.group({
            nombre: asignaturaSeleccionada.nombre,
            creditos: asignaturaSeleccionada.creditos,
        });

        const asignaturasFormArray = (
            this.formatoHvaGradoForm.get('areasFormacion') as FormArray
        )
            .at(areaIndex)
            .get('asignaturas') as FormArray;

        asignaturasFormArray.push(asignaturaFormGroup);
    }

    removeAsignatura(areaIndex: number, asignaturaIndex: number): void {
        const asignaturasFormArray = (
            this.formatoHvaGradoForm.get('areasFormacion') as FormArray
        )
            .at(areaIndex)
            .get('asignaturas') as FormArray;

        asignaturasFormArray.removeAt(asignaturaIndex);
    }

    get areasFormacionControls() {
        return (this.formatoHvaGradoForm.get('areasFormacion') as FormArray)
            .controls;
    }

    transformFormValues(formValues: any): any {
        const transformed = { ...formValues };
        delete transformed.areasFormacion;

        formValues.areasFormacion.forEach((area: any, areaIndex: number) => {
            area.asignaturas.forEach(
                (asignatura: any, asignaturaIndex: number) => {
                    const keyNombre = `asignatura${area.tipo}${asignaturaIndex}.nombre`;
                    const keyCreditos = `asignatura${area.tipo}${asignaturaIndex}.creditos`;
                    transformed[keyNombre] = asignatura.nombre;
                    transformed[keyCreditos] = asignatura.creditos;
                }
            );
        });

        return transformed;
    }

    onDownload() {
        if (this.formatoHvaGradoForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const formValues = this.formatoHvaGradoForm.value;
            const transformedData = this.transformFormValues(formValues);

            const docData: any = {
                estudiante: transformedData.estudiante,
                codigo: transformedData.codigo,
                planEstudios: transformedData.planEstudios,
                fechaRevision: this.fechaActual,
                pruebaSuperada: transformedData.pruebaSuperada.value,
                minimoArticulo: transformedData.minimoArticulo,
                creditosCumplidos: transformedData.creditosCumplidos,
                titulo: transformedData.titulo,
                director: transformedData.director,
                codirector: transformedData.codirector,
                coordinador: transformedData.coordinador,
            };

            Object.keys(transformedData).forEach((key) => {
                if (key.startsWith('asignatura')) {
                    docData[key] = transformedData[key];
                }
            });

            this.loadFile(
                'assets/plantillas/formatoHvaGrado.docx',
                (error: any, content: any) => {
                    if (error) {
                        throw error;
                    }
                    const zip = new PizZip(content);
                    const doc = new Docxtemplater(zip, {
                        paragraphLoop: true,
                        linebreaks: true,
                    });

                    doc.setData(docData);

                    try {
                        doc.render();
                    } catch (error) {
                        console.error(error);
                        throw error;
                    }

                    const out = doc.getZip().generate({
                        type: 'blob',
                        mimeType:
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    });

                    saveAs(out, 'formatoHvaGrado.docx');
                    this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
                }
            );
        }
    }

    loadFile(url: string, callback: (error: any, content: any) => void) {
        JSZipUtils.default.getBinaryContent(url, callback);
    }

    onCancel() {
        this.router.navigate(['examen-de-valoracion/solicitud']);
    }

    // generateDocDefinition() {
    //     return {
    //         content: [
    //             { text: 'Estudio de hoja de vida académica', style: 'header' },
    //             {
    //                 text: `Estudiante: ${this.estudianteSeleccionado.nombre}`,
    //                 style: 'subheader',
    //             },
    //             { text: `Código: 123`, style: 'subheader' },
    //             { text: `Plan de Estudios: 2024`, style: 'subheader' },
    //             { text: `Revisión requisitos grado: HOY`, style: 'subheader' },
    //             {
    //                 style: 'tableExample',
    //                 table: {
    //                     headerRows: 1,
    //                     widths: ['*', '*', '*', '*', '*', '*'],
    //                     body: [
    //                         [
    //                             'Área Formación',
    //                             'Semestre I',
    //                             'Semestre II',
    //                             'Semestre III',
    //                             'Semestre IV',
    //                             'Semestre V',
    //                         ],
    //                         ['Fundamentación', 'Matemáticas', '3', '', '', ''],
    //                         ['Electiva', 'Física', '4', 'Química', '4', ''],
    //                         ['Investigación', '', '', '', '', ''],
    //                         ['Complementación', '', '', '', '', ''],
    //                         ['Créditos Mínimos', '12', '13', '15', '18', '22'],
    //                         ['Total Créditos', '50', '58', '', '', ''],
    //                     ],
    //                 },
    //             },
    //             {
    //                 text: '24974 - Prueba de Suficiencia en Idioma Extranjero: Sí',
    //                 style: 'subheader',
    //             },
    //             {
    //                 text: 'Mínimo un artículo en revista categoría A, B o C: 2',
    //                 style: 'subheader',
    //             },
    //             {
    //                 text: 'Total: 40 créditos cumplidos de 42 requeridos',
    //                 style: 'subheader',
    //             },
    //             {
    //                 text: 'Título de la Tesis: Impacto de la Física en la Tecnología',
    //                 style: 'subheader',
    //             },
    //             { text: 'Director: Dr. Smith', style: 'subheader' },
    //             { text: 'Codirector: Dr. Johnson', style: 'subheader' },
    //             { text: 'Coordinador: Alba Mayo', style: 'subheader' },
    //         ],
    //         styles: {
    //             header: {
    //                 fontSize: 18,
    //                 bold: true,
    //             },
    //             subheader: {
    //                 fontSize: 15,
    //                 bold: true,
    //             },
    //             tableExample: {
    //                 margin: [0, 5, 0, 15],
    //             },
    //         },
    //     };
    // }

    nombreCompletoEstudiante(e: any) {
        return `${e.nombre} ${e.apellido}`;
    }

    handlerResponseException(response: any) {
        if (response.status !== 500) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value) => {
            this.messageService.add(errorMessage(value));
        });
    }

    private handleSuccessMessage(message: string) {
        this.messageService.add(infoMessage(message));
    }

    private handleWarningMessage(message: string) {
        this.messageService.clear();
        this.messageService.add(warnMessage(message));
    }
}
