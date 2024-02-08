import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RadicarService } from '../../../services/radicar.service';

@Component({
    selector: 'app-docsadjuntos',
    templateUrl: './docsadjuntos.component.html',
    styleUrls: ['./docsadjuntos.component.scss'],
})
export class DocsAdjuntosComponent implements OnInit {
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
