import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RadicarService } from '../../services/radicar.service';

@Component({
    selector: 'app-documentos',
    templateUrl: './documentos.component.html',
    styleUrls: ['./documentos.component.scss'],
})
export class DocumentosComponent implements OnInit {
    msgs1: any[];
    constructor(public radicar: RadicarService, private router: Router) {}

    ngOnInit(): void {
        this.msgs1 = [
            {
                severity: 'info',
                summary: 'Información',
                detail: 'No se requiere adjuntar documentos adicionales para esta solicitud, continua con el siguiente paso',
            },
        ];
    }

    onUpload(event, fubauto, indice) {
        for (let doc of event.files) {
            this.radicar.documentosAdjuntos[indice] = doc;
        }

        fubauto.clear();
    }

    eliminarDocumento(indice) {
        this.radicar.documentosAdjuntos[indice] = undefined;
    }

    navigateToNext() {
        this.router.navigate(['/gestionsolicitudes/creacion/resumen']);
    }

    navigateToBack() {
        this.router.navigate(['/gestionsolicitudes/creacion/datos']);
    }
}
