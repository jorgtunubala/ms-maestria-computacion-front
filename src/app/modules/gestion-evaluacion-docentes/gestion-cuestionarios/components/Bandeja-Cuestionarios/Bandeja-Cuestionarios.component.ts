import { Component, OnInit } from '@angular/core';
import { Cuestionario } from '../../models/cuestionario';
import { CuestionarioService } from '../../services/cuestionario.service';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { Mensaje } from 'src/app/core/enums/enums';
import { Router } from '@angular/router';

@Component({
    selector: 'app-bandeja-buestionarios',
    templateUrl: './bandeja-cuestionarios.component.html',
    styleUrls: ['./bandeja-cuestionarios.component.scss'],
})
export class BandejaCuestionariosComponent implements OnInit {
    visible: boolean = false;
    loading: boolean;
    cuestionarios: Cuestionario[] = [];
    displayDialog: boolean = false;
    isNewCuestionario: boolean = true;
    mostrarInactivasFlag: boolean = true;
    cuestionario: Cuestionario = this.initializeCuestionario();

    constructor(
        private cuestionarioService: CuestionarioService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadCuestionarios();
    }

    showDialog() {
        this.resetCuestionario();
        this.isNewCuestionario = true;
        this.displayDialog = true;
    }

    navigateToAddQuestions(id: number) {
      this.router.navigate(['/ruta-agregar-preguntas', id]);
  }

    loadCuestionarios() {
        this.loading = true;
        this.cuestionarioService.listCuestionarios().subscribe({
            next: (response) => this.filterCuestionarios(response),
            error: (err) =>
                this.handleError(err, 'Error al cargar cuestionarios'),
            complete: () => (this.loading = false),
        });
    }

    filterCuestionarios(cuestionarios: Cuestionario[]) {
        this.cuestionarios = cuestionarios.filter(
            (d) =>
                d.estado === (this.mostrarInactivasFlag ? 'ACTIVO' : 'INACTIVO')
        );
    }

    onCancel() {
        this.displayDialog = false;
    }

    onSave() {
        this.isNewCuestionario
            ? this.createCuestionario()
            : this.updateCuestionario();
    }

    onEdit(id: number) {
        this.cuestionarioService.getCuestionario(id).subscribe({
            next: (data) => this.editCuestionario(data),
            error: (err) =>
                this.handleError(err, 'Error al cargar el cuestionario'),
        });
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target!,
            message: Mensaje.CONFIRMAR_ELIMINAR_CUESTIONARIO,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteCuestionario(id),
        });
    }

    private handleError(error: any, detail: string) {
        console.error(error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: detail,
        });
    }

    private initializeCuestionario(): Cuestionario {
        return {
            nombre: '',
            observacion: '',
        };
    }
    private resetCuestionario() {
        this.cuestionario = this.initializeCuestionario();
    }

    private createCuestionario() {
        this.cuestionarioService
            .createCuestionario(this.cuestionario)
            .subscribe({
                next: (data) => this.onCuestionarioCreated(data),
                error: (err) =>
                    this.handleError(err, 'Error al agregar el cuestionario'),
            });
    }

    private updateCuestionario() {
        this.cuestionarioService
            .updateCuestionario(this.cuestionario.id!, this.cuestionario)
            .subscribe({
                next: (data) => this.onCuestionarioUpdated(data),
                error: (err) =>
                    this.handleError(
                        err,
                        'Error al actualizar el cuestionario'
                    ),
            });
    }

    private deleteCuestionario(id: number) {
        this.cuestionarioService.deleteCuestionario(id).subscribe({
            next: () => this.onCuestionarioDeleted(),
            error: (err) =>
                this.handleError(err, 'Error al eliminar el cuestionario'),
        });
    }

    private updateCuestionarioEstado(
        cuestionario: Cuestionario,
        nuevoEstado: string
    ) {
        this.cuestionarioService
            .cambiarEstadoCuestionario(cuestionario.id!, nuevoEstado)
            .subscribe({
                next: () => this.onEstadoUpdated(nuevoEstado),
                error: (err) =>
                    this.handleError(
                        err,
                        'Error al cambiar el estado del cuestionario'
                    ),
            });
    }

    private editCuestionario(data: Cuestionario) {
        this.cuestionario = { ...data };
        this.isNewCuestionario = false;
        this.displayDialog = true;
    }

    private onCuestionarioCreated(data: Cuestionario) {
        this.cuestionarios.push(data);
        this.displayDialog = false;
        this.showMessage('Éxito', 'Cuestionario agregado con éxito', 'success');
        this.loadCuestionarios();
    }

    private onCuestionarioUpdated(data: Cuestionario) {
        const index = this.cuestionarios.findIndex(
            (cuestionario) => this.cuestionario.id === data.id
        );
        if (index !== -1) {
            this.cuestionario[index] = data;
        }
        this.displayDialog = false;
        this.showMessage(
            'Éxito',
            'Cuestionario actualiazado con éxito',
            'success'
        );
        this.loadCuestionarios();
    }

    private onCuestionarioDeleted() {
        this.showMessage(
            'Éxito',
            Mensaje.CUESTIONARIO_ELIMINADO_CORRECTAMENTE,
            'info'
        );
        this.loadCuestionarios();
    }

    private onEstadoUpdated(nuevoEstado: string) {
        const estado =
            nuevoEstado === 'ACTIVO' ? 'habilitada' : 'deshabilitada';
        this.showMessage(
            'Éxito',
            `Cuestionario ${estado} correctamente`,
            'info'
        );
        this.loadCuestionarios();
    }

    private showMessage(summary: string, detail: string, severity: string) {
        this.messageService.add({ severity, summary, detail });
    }
}
