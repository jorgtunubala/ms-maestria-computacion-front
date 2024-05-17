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

    constructor(
        private breadcrumbService: BreadcrumbService,
        private expertoService: ExpertoService,
        private messageService: MessageService,
        private router: Router,
        private confirmationService: ConfirmationService
    ) { }

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

    onPrevisualizar(experto: any) {
        this.expertoSeleccionado = experto;
        this.displayDialog = true;
    }

    // Function to rename keys and exclude unwanted keys
    formatKey(key: string): string {
        const displayKey = key.split('.').pop();
        return displayKey ? displayKey.charAt(0).toUpperCase() + displayKey.slice(1) : '';
    }
    
    getKeys(obj: any, prefix: string = ''): any[] {
        let keys: any[] = [];
        let lineasInvestigacion: string[] = [];
    
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
    
            // Verificar si el nuevo key termina con alguna de las partes excluidas
            if (excludedKeys.some((excludedKey) => newKey.endsWith(excludedKey))) continue;
    
            if (newKey.startsWith('lineasInvestigacion') && newKey.endsWith('titulo')) {
                // Si es un título de línea de investigación, agregar a la lista especial
                if (typeof value === 'string') {
                    lineasInvestigacion.push(value);
                }
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Si es un objeto anidado, llamar recursivamente a la función
                keys.push(...this.getKeys(value, newKey));
            } else if (Array.isArray(value)) {
                // Si es un array, recorrer cada elemento y concatenar las keys
                value.forEach((item, index) => {
                    keys = keys.concat(this.getKeys(item, `${newKey}.${index}`));
                });
            } else {
                // Si es un valor simple, agregar a las keys
                keys.push({
                    key: this.fieldMap[newKey] || this.formatKey(newKey),
                    value: value,
                });
            }
        }
    
        // Agregar las líneas de investigación si existen
        if (lineasInvestigacion.length > 0) {
            keys.push({
                key: 'Línea de Investigación',
                value: lineasInvestigacion.join(', '),
            });
        }
    
        return keys;
    }
    
}
