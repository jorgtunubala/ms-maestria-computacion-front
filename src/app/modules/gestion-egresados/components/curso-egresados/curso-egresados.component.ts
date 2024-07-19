import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Mensaje } from 'src/app/core/enums/enums';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import { CursoService } from '../../services/cursos.service';
import { CursoRequest } from '../../models/curso';

@Component({
    selector: 'curso-egresados',
    templateUrl: 'curso-egresados.component.html',
    styleUrls: ['curso-egresados.component.scss'],
})
export class CursoEgresadoComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    cursoForm: FormGroup;

    cursoId: number;
    estudianteId: number;

    editMode: boolean;
    loading: boolean = false;

    asignaturaSelected: number;
    asignaturas: any[] = [];

    constructor(
        private fb: FormBuilder,
        private ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private messageService: MessageService,
        private cursoService: CursoService
    ) {}

    ngOnInit() {
        this.initForm();
        this.loadAsignaturas();
        this.extractIdsFromConfig();
    }

    initForm(): void {
        this.cursoForm = this.fb.group({
            idCurso: [null, Validators.required],
            idEstudiante: [null, Validators.required],
            orientadoA: [null, Validators.required],
            fechaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
        });

        this.formReady.emit(this.cursoForm);
    }

    loadAsignaturas(): void {
        this.cursoService.listarAsignaturas().subscribe({
            next: (response) => {
                if (response) {
                    this.asignaturas = response.map((asignatura: any) => ({
                        label: asignatura.nombreAsignatura,
                        value: asignatura.idAsignatura,
                    }));
                }
            },
            error: (e) => this.handleErrorResponse(e),
        });
    }

    extractIdsFromConfig(): void {
        if (this.config.data?.estudianteId) {
            this.estudianteId = Number(this.config.data.estudianteId);
            this.cursoForm.get('idEstudiante').setValue(this.estudianteId);
        }
        if (this.config.data?.cursoId) {
            this.editMode = true;
            this.cursoId = Number(this.config.data.cursoId);
            this.loadDataForEdit(this.cursoId);
        }
    }

    loadDataForEdit(id: number): void {
        this.cursoService.getCurso(id).subscribe({
            next: (response) => {
                this.setValuesForm(response);
                this.cursoForm
                    .get('fechaInicio')
                    .setValue(
                        response.fechaInicio
                            ? new Date(response.fechaInicio)
                            : null
                    );
                this.cursoForm
                    .get('fechaFin')
                    .setValue(
                        response.fechaFin ? new Date(response.fechaFin) : null
                    );
            },
            error: (e) => this.handleErrorResponse(e),
        });
    }

    setValuesForm(curso: CursoRequest): void {
        this.cursoForm.patchValue({ ...curso });
    }

    getFormControl(formControlName: string): FormControl {
        return this.cursoForm.get(formControlName) as FormControl;
    }

    addCurso(): void {
        this.loading = true;
        this.cursoService
            .addCurso(this.cursoForm.value)
            .subscribe({
                next: () => this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO),
                error: (e) => this.handleErrorResponse(e),
                complete: () => this.closeDialog(),
            })
            .add(() => (this.loading = false));
    }

    updateCurso(): void {
        this.loading = true;
        this.cursoService
            .updateCurso(this.cursoId, this.cursoForm.value)
            .subscribe({
                next: () =>
                    this.handleSuccessMessage(Mensaje.ACTUALIZACION_EXITOSA),
                error: (e) => this.handleErrorResponse(e),
                complete: () => this.closeDialog(),
            })
            .add(() => (this.loading = false));
    }

    onCancel(): void {
        this.closeDialog();
    }

    onSave(): void {
        if (this.cursoForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        }
        this.editMode ? this.updateCurso() : this.addCurso();
    }

    handlerResponseException(response: any): void {
        if (response.status !== 500) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value) => {
            this.messageService.add(errorMessage(value));
        });
    }

    handleSuccessMessage(message: string): void {
        this.messageService.add(infoMessage(message));
    }

    handleWarningMessage(message: string): void {
        this.messageService.clear();
        this.messageService.add(warnMessage(message));
    }

    handleErrorResponse(error: any): void {
        this.handlerResponseException(error);
        this.loading = false;
    }

    closeDialog(): void {
        this.ref.close();
    }
}
