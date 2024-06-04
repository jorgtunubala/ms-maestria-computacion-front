import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Mensaje } from 'src/app/core/enums/enums';
import { infoMessage } from 'src/app/core/utils/message-util';
import { ExpertoService } from '../../services/experto.service';
import { Experto } from '../../models/experto';
import { excludedKeys, fieldMap } from '../../utils/fieldmap';

@Component({
    selector: 'app-bandeja-expertos',
    templateUrl: './bandeja-expertos.component.html',
    styleUrls: ['./bandeja-expertos.component.scss'],
})
export class BandejaExpertosComponent implements OnInit {
    loading: boolean;
    expertos: Experto[] = [];
    displayDialog: boolean = false;
    expertoSeleccionado: any = null;
    fieldMap = fieldMap;
    excludedKeys = excludedKeys;
    mostrarInactivosFlag: boolean = true; // La variable por defecto está en 'true' para mostrar activos

    constructor(
        private breadcrumbService: BreadcrumbService,
        private expertoService: ExpertoService,
        private messageService: MessageService,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
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
                        (d) =>
                            d.estado ===
                            (this.mostrarInactivosFlag ? 'ACTIVO' : 'INACTIVO')
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

    onPrevisualizar(experto: any) {
        this.expertoSeleccionado = experto;
        this.displayDialog = true;
    }

    mostrarInactivos() {
        this.mostrarInactivosFlag = !this.mostrarInactivosFlag;
        this.listExpertos();
    }

    cambiarEstado(event: any, experto: Experto, nuevoEstado: string) {
        this.confirmationService.confirm({
            target: event.target,
            message: Mensaje.ESTADO_EXPERTO_ACTUALIZADO_CORRECTAMENTE,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            accept: () => this.cambiarEstadoExperto(experto, nuevoEstado),
        });
    }

    cambiarEstadoExperto(experto: Experto, nuevoEstado: string) {
        this.expertoService
            .cambiarEstadoExperto(experto.id!, nuevoEstado)
            .subscribe({
                next: () => {
                    this.listExpertos();
                    this.messageService.add(
                        infoMessage(
                            `Experto ${
                                nuevoEstado === 'ACTIVO' ? 'habilitado' : 'deshabilitado'
                            } correctamente`
                        )
                    );
                },
            });
    }

    //para el previsualizar
    getKeys(obj: any, prefix: string = ''): any[] {
        let keys: any[] = [];
    
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
    
            if (
                excludedKeys.some((excludedKey) => newKey.endsWith(excludedKey))
            )
                continue;
    
            if (
                typeof value === 'object' &&
                value !== null &&
                !Array.isArray(value)
            ) {
                keys.push(...this.getKeys(value, newKey));
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    keys = keys.concat(
                        this.getKeys(item, `${newKey}.${index}`)
                    );
                });
            } else {
                keys.push({
                    key: this.fieldMap[newKey] || this.formatKey(newKey),
                    value: value,
                });
            }
        }
    
        return keys;
    }
    

    formatKey(key: string): string {
        const displayKey = key.split('.').pop();
        return displayKey
            ? displayKey.charAt(0).toUpperCase() + displayKey.slice(1)
            : '';
    }
}
