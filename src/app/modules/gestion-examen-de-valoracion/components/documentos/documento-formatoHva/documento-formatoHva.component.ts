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
import { FileUpload } from 'primeng/fileupload';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoHva',
    templateUrl: 'documento-formatoHva.component.html',
    styleUrls: ['documento-formatoHva.component.scss'],
})
export class DocumentoFormatoHvaComponent implements OnInit {
    @Input() fileFormatoHva: File;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoHvaPdfGenerated = new EventEmitter<File>();
    @ViewChild('formatoHva') formatoHva!: ElementRef;
    @ViewChild('FormatoHva') FormatoHva!: FileUpload;

    estudianteSubscription: Subscription;

    formatoHvaForm: FormGroup;

    isPending = true;
    loading = false;

    estudianteSeleccionado: any;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get estudiante(): FormControl {
        return this.formatoHvaForm.get('estudiante') as FormControl;
    }

    ngOnInit() {
        this.initForm();

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
    }

    initForm(): void {
        const today = new Date();
        const dia = today.getDate();
        const mes = today.getMonth() + 1;
        const anio = today.getFullYear();

        this.formatoHvaForm = this.fb.group({
            dia: [dia, Validators.required],
            mes: [mes, Validators.required],
            anio: [anio, Validators.required],
            facultad: [
                'Ingeniería Electrónica y Telecomunicaciones',
                Validators.required,
            ],
            programa: ['Maestría en Computación', Validators.required],
            estudiante: [null, Validators.required],
            titulo: [null, Validators.required],
            coordinador: [null, Validators.required],
        });
        this.formReady.emit(this.formatoHvaForm);
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
    }

    onCancel() {
        this.router.navigate(['examen-de-valoracion/solicitud']);
    }

    onDownload() {
        this.isPending = false;
        if (this.formatoHvaForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const formValues = this.formatoHvaForm.value;

            const docData: any = {
                dia: formValues.dia,
                mes: formValues.mes,
                anio: formValues.anio,
                facultad: formValues.facultad,
                programa: formValues.programa,
                estudiante: formValues.estudiante,
                titulo: formValues.titulo,
                coordinador: formValues.coordinador,
            };

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
            this.loading = false;
        }
    }

    loadFile(url: string, callback: (error: any, content: any) => void) {
        JSZipUtils.default.getBinaryContent(url, callback);
    }

    onAdjuntar(event: any) {
        if (this.formatoHvaForm.invalid) {
            this.FormatoHva.clear();
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const file: File = event.files[0];
            if (file) {
                this.formatoHvaPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            }
            this.loading = false;
            this.FormatoHva.clear();
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoHvaForm.get(formControlName) as FormControl;
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
