import {
    Component,
    ElementRef,
    EventEmitter,
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
import { MessageService, SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Mensaje, Rol, TipoRol } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { enumToSelectItems } from 'src/app/core/utils/util';
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { BuscadorExpertosComponent } from 'src/app/shared/components/buscador-expertos/buscador-expertos.component';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { Orientador } from '../../../models/orientador';
import { PdfService } from 'src/app/shared/services/pdf.service';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'documento-formatoA',
    templateUrl: 'documento-formatoA.component.html',
    styleUrls: ['documento-formatoA.component.scss'],
})
export class DocumentoFormatoAComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoAPdfGenerated = new EventEmitter<File>();

    formatoAForm: FormGroup;

    @ViewChild('formatoA') formatoA!: ElementRef;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;
    private evaluadorInternoSubscription: Subscription;
    private evaluadorExternoSubscription: Subscription;

    loading = false;

    tipoSeleccionado = '';
    rolSeleccionado = '';

    fechaActual: Date;
    firmaTutor: string | ArrayBuffer;
    estudianteSeleccionado: Estudiante = {};

    orientadores: Orientador[] = [];
    roles: SelectItem[] = enumToSelectItems(Rol);
    tipos: SelectItem[] = enumToSelectItems(TipoRol);

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private dialogService: DialogService,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private pdfService: PdfService
    ) {}

    get titulo(): FormControl {
        return this.formatoAForm.get('titulo') as FormControl;
    }

    get estudiante(): FormControl {
        return this.formatoAForm.get('estudiante') as FormControl;
    }

    get experto(): FormControl {
        return this.formatoAForm.get('evaluadorExterno') as FormControl;
    }

    get orientador(): FormControl {
        return this.formatoAForm.get('orientador') as FormControl;
    }

    get docente(): FormControl {
        return this.formatoAForm.get('evaluadorInterno') as FormControl;
    }

    get tipo(): FormControl {
        return this.formatoAForm.get('tipo') as FormControl;
    }

    get rol(): FormControl {
        return this.formatoAForm.get('rol') as FormControl;
    }

    ngOnInit() {
        this.initForm();
        this.fechaActual = new Date();

        this.tituloSubscription =
            this.trabajoDeGradoService.tituloSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.titulo.setValue(response);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                        this.estudiante.setValue(
                            this.nombreCompletoEstudiante(response)
                        );
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.evaluadorExternoSubscription =
            this.trabajoDeGradoService.evaluadorExternoSeleccionadoSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.experto.setValue(response);
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );
        this.evaluadorInternoSubscription =
            this.trabajoDeGradoService.evaluadorInternoSeleccionadoSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.docente.setValue(response);
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );

        this.tipo.valueChanges.subscribe(
            (response) => (this.tipoSeleccionado = response)
        );
        this.rol.valueChanges.subscribe(
            (response) => (this.rolSeleccionado = response)
        );
    }

    initForm(): void {
        this.formatoAForm = this.fb.group({
            asunto: [null, Validators.required],
            titulo: [null, Validators.required],
            estudiante: [null, Validators.required],
            orientador: [null, Validators.required],
            rol: [null, Validators.required],
            tipo: [null, Validators.required],
            evaluadorInterno: [null, Validators.required],
            evaluadorExterno: [null, Validators.required],
            firmaTutor: [null, Validators.required],
        });

        this.formatoAForm.get('titulo').disable();
        this.formatoAForm.get('estudiante').disable();
        this.formatoAForm.get('evaluadorInterno').disable();
        this.formatoAForm.get('evaluadorExterno').disable();
        this.formReady.emit(this.formatoAForm);
    }

    ngOnDestroy() {
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.evaluadorExternoSubscription) {
            this.evaluadorExternoSubscription.unsubscribe();
        }
        if (this.evaluadorInternoSubscription) {
            this.evaluadorInternoSubscription.unsubscribe();
        }
    }

    onCancel() {
        this.router.navigate(['examen-de-valoracion/solicitud']);
    }

    onAdjuntar() {
        if (this.formatoAForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const content = document.getElementById('formatoA');
            this.pdfService.generatePDF(content, '').then((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoA.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                this.formatoAPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
        }
    }

    onDownload() {
        if (this.formatoAForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const content = document.getElementById('formatoA');
            this.pdfService.generatePDF(content, null).then((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoA.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                const link = document.createElement('a');
                link.download = file.name;
                link.href = URL.createObjectURL(file);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoAForm.get(formControlName) as FormControl;
    }

    formatText(text: string): string {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    onFirmaChange(event: any, fieldName: string) {
        const input = event && event.files ? event : { files: [] };
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (fieldName === 'firmaTutor') {
                    this.firmaTutor = reader.result as string;
                }
            };
            reader.readAsDataURL(file);
            const patchObject = {};
            patchObject[fieldName] = file;
            this.formatoAForm.patchValue(patchObject);
        }
    }

    showBuscadorExpertos() {
        return this.dialogService.open(BuscadorExpertosComponent, {
            header: 'Seleccionar experto',
            width: '40%',
        });
    }

    mapOrientadorLabel(orientador: any) {
        return {
            id: orientador.id,
            nombre: orientador.nombre,
            apellido: orientador.apellido,
            correo: orientador.correo ?? orientador.correoElectronico,
            rol: this.rolSeleccionado,
            tipo: this.tipoSeleccionado,
        };
    }

    showBuscadorDocentes() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '40%',
        });
    }
    nombreCompletoEstudiante(e: any) {
        return `${e.nombre} ${e.apellido}`;
    }

    onSeleccionarOrientador(tipo: string): void {
        const ref =
            tipo === 'INTERNO'
                ? this.showBuscadorDocentes()
                : this.showBuscadorExpertos();

        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    const orientador =
                        tipo === 'INTERNO'
                            ? this.mapOrientadorLabel(response)
                            : this.mapOrientadorLabel(response);
                    this.orientador.setValue(orientador);
                    this.orientadores.push(orientador);
                }
            },
        });
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

    limpiarOrientador(index: number) {
        this.orientador.setValue(null);
        this.orientadores.splice(index, 1);
    }
}
