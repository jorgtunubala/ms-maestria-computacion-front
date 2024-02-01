import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { Docente } from 'src/app/shared/models/docente';
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { BuscadorExpertosComponent } from 'src/app/shared/components/buscador-expertos/buscador-expertos.component';
import { Experto } from '../../models/experto';
import { SolicitudService } from '../../services/solicitud.service';
import { Estudiante } from 'src/app/shared/models/estudiante';
import { LocalStorageService } from '../../services/localstorage.service';
import { Observable } from 'rxjs';
import { Solicitud } from '../../models/solicitud';

@Component({
    selector: 'app-solicitud-examen',
    templateUrl: 'solicitud-examen.component.html',
    styleUrls: ['solicitud-examen.component.scss'],
})
export class SolicitudExamenComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();

    loading: boolean;
    editMode: boolean = false;
    items: any;
    localStorageKey: string = 'miFormulario';
    estudianteSeleccionado: Estudiante = {};
    activeIndex: number = 0;
    solicitudForm: FormGroup;
    selectedFileFirst: File | null;
    selectedFileSecond: File | null;
    selectedFileThird: File | null;
    selectedFileFourth: File | null;

    constructor(
        private breadcrumbService: BreadcrumbService,
        private messageService: MessageService,
        private dialogService: DialogService,
        private solicitudService: SolicitudService,
        private route: ActivatedRoute,
        private localStorageService: LocalStorageService,
        private fb: FormBuilder,
        private router: Router
    ) {}

    get docente(): FormControl {
        return this.solicitudForm.get('docente') as FormControl;
    }

    get experto(): FormControl {
        return this.solicitudForm.get('experto') as FormControl;
    }

    get estudiante(): FormControl {
        return this.solicitudForm.get('estudiante') as FormControl;
    }

    ngOnInit() {
        if (this.router.url.includes('editar')) {
            this.loadEditMode();
        }
        this.initForm();
        this.loadData();
        this.subscribeToEstudianteSeleccionado();
        this.setupAdditionalFunctionality('doc_solicitud_valoracion');
        this.setupAdditionalFunctionality('doc_anteproyecto_examen');
        this.setupAdditionalFunctionality('doc_examen_valoracion');
        this.setupAdditionalFunctionality('doc_oficio_jurados');
        this.items = [
            {
                label: 'Solicitud Examen de Validacion',
                command: (event: any) =>
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Primer Paso',
                        detail: event.item.label,
                    }),
            },
            {
                label: 'Respuesta Examen de Validacion',
                command: (event: any) =>
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Segundo Paso',
                        detail: event.item.label,
                    }),
            },
            {
                label: 'Generacion de Resolucion',
                command: (event: any) =>
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Tercer Paso',
                        detail: event.item.label,
                    }),
            },
            {
                label: 'Sustentacion Proyecto de Investigacion',
                command: (event: any) =>
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Cuarto Paso',
                        detail: event.item.label,
                    }),
            },
        ];
        this.setBreadcrumb();
    }

    loadEditMode() {
        this.editMode = true;
        this.loadSolicitud();
    }

    loadSolicitud() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.solicitudService.getSolicitud(id).subscribe({
            next: (response) => this.setValuesForm(response),
        });
    }

    setValuesForm(solicitud: Solicitud) {
        this.solicitudForm.patchValue({
            ...solicitud,
        });
    }

    private subscribeToEstudianteSeleccionado() {
        this.solicitudService.estudianteSeleccionado$.subscribe((response) => {
            this.handleEstudianteSeleccionado(response);
        });
    }

    private handleEstudianteSeleccionado(response: any) {
        if (response) {
            this.estudianteSeleccionado = response;
            this.estudiante.setValue(response);
        } else {
            const estudianteFormValue =
                this.solicitudForm.get('estudiante').value;
            console.log(estudianteFormValue);
            this.estudianteSeleccionado = estudianteFormValue;

            if (estudianteFormValue) {
                this.solicitudService.setEstudianteSeleccionado(
                    estudianteFormValue
                );
            } else {
                this.router.navigate(['examen-de-valoracion']);
            }
        }
    }

    onActiveIndexChange(event: number) {
        this.activeIndex = event;
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Trabajos de Grado' },
            {
                label: 'Examen de Valoracion',
                routerLink: 'examen-de-valoracion',
            },
            { label: 'Solicitud' },
        ]);
    }

    onFileSelectFirst(event: any) {
        this.selectedFileFirst = this.uploadFileAndSetValue(
            'doc_solicitud_valoracion',
            event
        );
    }

    onFileSelectSecond(event: any) {
        this.selectedFileSecond = this.uploadFileAndSetValue(
            'doc_anteproyecto_examen',
            event
        );
    }

    onFileSelectThird(event: any) {
        this.selectedFileThird = this.uploadFileAndSetValue(
            'doc_examen_valoracion',
            event
        );
    }

    onFileSelectFourth(event: any) {
        this.selectedFileFourth = this.uploadFileAndSetValue(
            'doc_oficio_jurados',
            event
        );
    }

    onFileClear(event: any, field: string) {
        if (field == 'doc_solicitud_valoracion') {
            this.selectedFileFirst = null;
        }
        if (field == 'doc_anteproyecto_examen') {
            this.selectedFileSecond = null;
        }
        if (field == 'doc_examen_valoracion') {
            this.selectedFileThird = null;
        }
        if (field == 'doc_oficio_jurados') {
            this.selectedFileFourth = null;
        }
    }

    private uploadFileAndSetValue(fileControlName: string, event: any) {
        const selectedFiles: FileList = event.files;

        if (selectedFiles && selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0];

            this.solicitudService
                .uploadFile(
                    selectedFile,
                    this.estudianteSeleccionado.codigo,
                    fileControlName
                )
                .subscribe({
                    next: () =>
                        this.messageService.add(
                            infoMessage(Mensaje.GUARDADO_EXITOSO)
                        ),
                    error: (e) => this.handlerResponseException(e),
                });

            this.solicitudForm.get(fileControlName).setValue(selectedFile);

            return selectedFile;
        }

        return null;
    }

    initForm(): void {
        this.solicitudForm = this.fb.group({
            titulo: [null, Validators.required],
            doc_solicitud_valoracion: [null, Validators.required],
            doc_anteproyecto_examen: [null, Validators.required],
            doc_examen_valoracion: [null],
            estudiante: [null, Validators.required],
            docente: [null, Validators.required],
            experto: [null, Validators.required],
            numero_acta: [null, Validators.required],
            fecha_acta: [null],
            doc_oficio_jurados: [null],
            fecha_maxima_evaluacion: [null],
        });

        this.formReady.emit(this.solicitudForm);
    }

    loadData(): void {
        if (!this.editMode) {
            const savedState = this.localStorageService.getFormState(
                this.localStorageKey
            );

            if (savedState) {
                // Convierte la cadena de fecha a objeto Date
                if (savedState.fecha_acta) {
                    savedState.fecha_acta = new Date(savedState.fecha_acta);
                }

                if (savedState.fecha_maxima_evaluacion) {
                    savedState.fecha_maxima_evaluacion = new Date(
                        savedState.fecha_maxima_evaluacion
                    );
                }

                this.solicitudForm.patchValue(savedState);
            }

            this.solicitudForm.valueChanges.subscribe(() => {
                this.localStorageService.saveFormState(
                    this.solicitudForm,
                    this.localStorageKey
                );
            });
        }
    }

    private setupAdditionalFunctionality(fieldName: string): void {
        this.getFileAndSetValue(fieldName).subscribe({
            next: (response) => {
                console.log(response);
                this.solicitudForm.get(fieldName).setValue(response);
            },
            error: (e) => this.handlerResponseException(e),
        });
    }

    private getFileAndSetValue(fieldName: string): Observable<any> {
        console.log(this.estudianteSeleccionado.codigo);
        const palabraClave = this.solicitudService.generatePalabraClave(
            this.estudianteSeleccionado.codigo,
            fieldName
        );

        return this.solicitudService.getFile(palabraClave);
    }

    getFormControl(formControlName: string): FormControl {
        return this.solicitudForm.get(formControlName) as FormControl;
    }

    showBuscadorDocentes() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '60%',
        });
    }

    showBuscadorExpertos() {
        return this.dialogService.open(BuscadorExpertosComponent, {
            header: 'Seleccionar experto',
            width: '60%',
        });
    }

    onSeleccionarDocente() {
        const ref = this.showBuscadorDocentes();
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    const docente = this.mapDocenteLabel(response);
                    this.docente.setValue(docente);
                }
            },
        });
    }

    onSeleccionarExperto() {
        const ref = this.showBuscadorExpertos();
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    const experto = this.mapExpertoLabel(response);
                    this.experto.setValue(experto);
                }
            },
        });
    }

    mapRequest(): any {
        const value = this.solicitudForm.getRawValue();
        console.log(value);
        return {
            titulo: value.titulo,
            doc_solicitud_valoracion: value.doc_solicitud_valoracion,
            doc_anteproyecto_examen: value.doc_anteproyecto_examen,
            doc_examen_valoracion: value.doc_examen_valoracion,
            estudiante: value.estudiante?.id,
            docente: value.docente?.id,
            experto: value.experto?.id,
            numero_acta: value.numero_acta,
            fecha_acta: value.fecha_acta,
            doc_oficio_jurados: value.doc_oficio_jurados,
            fecha_maxima_evaluacion: value.fecha_maxima_evaluacion,
        };
    }

    createSolicitud() {
        const request = this.mapRequest();
        this.loading = true;
        this.solicitudService
            .createSolicitud(request)
            .subscribe({
                next: () =>
                    this.messageService.add(
                        infoMessage(Mensaje.GUARDADO_EXITOSO)
                    ),
                error: (e) => this.handlerResponseException(e),
                complete: () => {
                    this.redirectToBandeja(),
                        this.localStorageService.clearLocalStorage(
                            this.localStorageKey
                        );
                },
            })
            .add(() => (this.loading = false));
    }

    updateSolicitud() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        const request = this.mapRequest();
        this.loading = true;
        this.solicitudService
            .updateEstudiante(id, request)
            .subscribe({
                next: () =>
                    this.messageService.add(
                        infoMessage(Mensaje.ACTUALIZACION_EXITOSA)
                    ),
                error: (e) => this.handlerResponseException(e),
                complete: () => this.redirectToBandeja(),
            })
            .add(() => (this.loading = false));
    }

    onSave() {
        if (this.solicitudForm.invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }
        this.editMode ? this.updateSolicitud() : this.createSolicitud();
    }

    onCrearDocumento() {
        this.router.navigate(['examen-de-valoracion/solicitud/crear']);
    }

    limpiarExperto() {
        this.experto.setValue(null);
    }

    limpiarDocente() {
        this.docente.setValue(null);
    }

    redirectToBandeja() {
        this.router.navigate(['examen-de-valoracion']);
    }

    handlerResponseException(response: any) {
        if (response.status != 501) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value, _) => {
            this.messageService.add(errorMessage(value));
        });
    }

    mapDocenteLabel(docente: Docente) {
        const ultimaUniversidad =
            docente.titulos.length > 0
                ? docente.titulos[docente.titulos.length - 1].universidad
                : 'Sin título universitario';

        return {
            id: docente.persona.id,
            nombre: docente.persona.nombre,
            apellido: docente.persona.apellido,
            correo: docente.persona.correoElectronico,
            universidad: ultimaUniversidad,
        };
    }

    mapExpertoLabel(experto: Experto) {
        const ultimaUniversidad =
            experto.titulos.length > 0
                ? experto.titulos[experto.titulos.length - 1].universidad
                : 'Sin título universitario';

        return {
            id: experto.id,
            nombre: experto.persona.nombre,
            apellido: experto.persona.apellido,
            correo: experto.persona.correoElectronico,
            universidad: ultimaUniversidad,
        };
    }
}
