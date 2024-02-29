import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Mensaje } from 'src/app/core/enums/enums';
import { infoMessage } from 'src/app/core/utils/message-util';
// import { Experto } from '../../models/experto';
import { ExpertoService } from '../../services/experto.service';
import { Experto } from '../../models/experto';

@Component({
    selector: 'app-bandeja-expertos',
    templateUrl: './bandeja-expertos.component.html',
    styleUrls: ['./bandeja-expertos.component.scss'],
})
export class BandejaExpertosComponent implements OnInit {
    loading: boolean;
    expertos: Experto[] = [];

    constructor(
        private breadcrumbService: BreadcrumbService,
        private expertoService: ExpertoService,
        private messageService: MessageService,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.setBreadcrumb();
        this.listExpertos();
    }

    listExpertos() {
        this.loading = true;
        this.expertoService
            .listExpertos()
            .subscribe({
                next: (response) =>
                    (this.expertos = response.filter(
                        (d) => d.estado === 'ACTIVO'
                    )),
            })
            .add(() => (this.loading = false));
    }

    setBreadcrumb() {
        this.breadcrumbService.setItems([
            { label: 'Gestión' },
            { label: 'Expertos' },
        ]);
    }

    onRegistrarExperto() {
        this.router.navigate(['expertos/registrar']);
    }

    onEditar(id: number) {
        this.router.navigate(['expertos/editar', id]);
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target,
            message: Mensaje.CONFIRMAR_ELIMINAR_EXPERTO,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si, eliminar',
            rejectLabel: 'No',
            accept: () => this.deleteExperto(id),
        });
    }

    deleteExperto(id: number) {
        this.expertoService.deleteExperto(id).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(Mensaje.EXPERTO_ELIMINADO_CORRECTAMENTE)
                );
                this.listExpertos();
            },
        });
    }

    onCargaExitosa() {
        this.listExpertos();
    }
}
