import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
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
import { Subscription, firstValueFrom } from 'rxjs';
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
import { ResolucionService } from '../../../services/resolucion.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoHva',
    templateUrl: 'documento-formatoHva.component.html',
    styleUrls: ['documento-formatoHva.component.scss'],
})
export class DocumentoFormatoHvaComponent implements OnInit {
    @Input() trabajoDeGradoId: number;
    @Output() formReady = new EventEmitter<FormGroup>();
    @ViewChild('formatoHva') formatoHva!: ElementRef;

    estudianteSubscription: Subscription;
    tituloSubscription: Subscription;

    formatoHvaForm: FormGroup;

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
        { nombre: 'Asignatura D', creditos: 2 },
        { nombre: 'Asignatura E', creditos: 5 },
        { nombre: 'Asignatura F', creditos: 4 },
        { nombre: 'Asignatura G', creditos: 5 },
    ];

    pruebaSuperadaOptions = [
        { label: 'Sí', value: 'Si' },
        { label: 'No', value: 'No' },
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private resolucionService: ResolucionService
    ) {}

    get estudiante(): FormControl {
        return this.formatoHvaForm.get('estudiante') as FormControl;
    }

    get director(): FormControl {
        return this.formatoHvaForm.get('director') as FormControl;
    }

    get codirector(): FormControl {
        return this.formatoHvaForm.get('codirector') as FormControl;
    }

    async loadDirector() {
        try {
            const response = await firstValueFrom(
                this.resolucionService.getResolucionDocente(
                    this.trabajoDeGradoId
                )
            );
            if (response) {
                this.director.setValue(response.director.nombres);
            }
        } catch (error) {
            console.error('Error al obtener el director:', error);
        }
    }

    async loadCodirector() {
        try {
            const response = await firstValueFrom(
                this.resolucionService.getResolucionDocente(
                    this.trabajoDeGradoId
                )
            );
            if (response) {
                this.codirector.setValue(response.codirector.nombres);
            }
        } catch (error) {
            console.error('Error al obtener el codirector:', error);
        }
    }

    ngOnInit() {
        this.initForm();
        this.fechaActual = new Date().toLocaleString();

        this.tituloSubscription =
            this.trabajoDeGradoService.tituloSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.formatoHvaForm.get('titulo').setValue(response);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                        this.formatoHvaForm
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

        if (this.trabajoDeGradoId) {
            this.loadDirector();
            this.loadCodirector();
        }
    }

    initForm(): void {
        this.formatoHvaForm = this.fb.group({
            estudiante: [null, Validators.required],
            codigo: ['123', Validators.required],
            planEstudios: ['2024-2', Validators.required],
            fechaRevision: [null, Validators.required],
            areasFormacion: this.fb.array([], Validators.required),
            pruebaSuperada: [null, Validators.required],
            minimoArticulo: [null, Validators.required],
            creditosCumplidos: [null, Validators.required],
            titulo: [null, Validators.required],
            director: [null, Validators.required],
            codirector: [null, Validators.required],
            coordinador: ['Luz Marina Sierra Martínez', Validators.required],
        });
        this.formReady.emit(this.formatoHvaForm);
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
        const areasFormacionArray = this.formatoHvaForm.get(
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
            this.formatoHvaForm.get('areasFormacion') as FormArray
        )
            .at(areaIndex)
            .get('asignaturas') as FormArray;

        asignaturasFormArray.push(asignaturaFormGroup);
    }

    removeAsignatura(areaIndex: number, asignaturaIndex: number): void {
        const asignaturasFormArray = (
            this.formatoHvaForm.get('areasFormacion') as FormArray
        )
            .at(areaIndex)
            .get('asignaturas') as FormArray;

        asignaturasFormArray.removeAt(asignaturaIndex);
    }

    get areasFormacionControls() {
        return (this.formatoHvaForm.get('areasFormacion') as FormArray)
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
                    transformed[keyNombre] = asignatura.nombre || 'NA';
                    transformed[keyCreditos] = asignatura.creditos || 'NA';
                }
            );
        });

        return transformed;
    }

    onDownload() {
        if (this.formatoHvaForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const formValues = this.formatoHvaForm.value;
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
                    docData[key] = transformedData[key] || 'NA';
                }
            });

            this.loadFile(
                'assets/plantillas/formatoHva.docx',
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

                    saveAs(out, 'formatoHva.docx');
                    this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
                }
            );
        }
    }

    loadFile(url: string, callback: (error: any, content: any) => void) {
        JSZipUtils.default.getBinaryContent(url, callback);
    }

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
