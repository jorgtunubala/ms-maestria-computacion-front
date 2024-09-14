import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RadicarService } from '../../../services/radicar.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-docsadjuntos',
    templateUrl: './docsadjuntos.component.html',
    styleUrls: ['./docsadjuntos.component.scss'],
    providers: [MessageService],
})
export class DocsAdjuntosComponent implements OnInit {
    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event: Event) {
        event.returnValue = true;
        return '¿Estás seguro de que quieres salir de la página?';
    }

    constructor(
        public radicar: RadicarService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        try {
            this.radicar.requisitosSolicitudEscogida.documentosRequeridos;
        } catch (error) {
            console.error('Se produjo un error:', error);

            // Verificar si el error es del tipo TypeError y si contiene la cadena 'documentosRequeridos'
            if (
                error instanceof TypeError &&
                error.message.includes('documentosRequeridos')
            ) {
                // Redirigir al usuario a una ruta específica
                this.router.navigate([
                    '/gestionsolicitudes/portafolio/radicar/selector',
                ]);
            } else {
                // Manejar otros errores de manera apropiada
                console.error('Error no esperado:', error);
            }
        }
    }

    onUpload(event, fubauto, indice) {
        /*
        console.log(indice);
        console.log(
            '' +
                this.radicar.requisitosSolicitudEscogida.documentosRequeridos[
                    indice
                ].nombre
        );
        for (let doc of event.files) {
            this.radicar.documentosAdjuntos[indice] = doc;
        }

        fubauto.clear();
        */
        for (let doc of event.files) {
            // Obtener el nombre del archivo original y la extensión
            const originalName = doc.name;
            const fileExtension = originalName.split('.').pop();

            // Obtener el nuevo nombre del archivo
            const nuevoNombre =
                this.radicar.requisitosSolicitudEscogida.documentosRequeridos[
                    indice
                ].nombre;
            const nuevoNombreConExtension = `${nuevoNombre}.${fileExtension}`;

            const renamedFile = new File([doc], nuevoNombreConExtension, {
                type: 'application/pdf', // Establece el tipo MIME correcto para un PDF
            });
            // Actualizar la lista de documentos adjuntos
            this.radicar.documentosAdjuntos[indice] = renamedFile;
        }

        // Limpiar el componente de subida de archivos
        fubauto.clear();
    }

    eliminarDocumento(indice) {
        this.radicar.documentosAdjuntos[indice] = undefined;
    }

    validarDocsCompletos(): boolean {
        /*
        if (
            [
                'RE_CRED_PAS',
                'RE_CRED_DIS',
                'PR_CURS_TEO',
                'AS_CRED_MAT',
            ].includes(this.radicar.tipoSolicitudEscogida.codigoSolicitud)
        ) {
            if (
                this.radicar.documentosAdjuntos.length !==
                this.radicar.requisitosSolicitudEscogida.documentosRequeridos
                    .length -
                    1
            ) {
                return false;
            }

            if (this.radicar.enlaceMaterialAudiovisual == '') {
                return false;
            }
        } else {
            // Verifica si los tamaños son iguales
            if (
                this.radicar.documentosAdjuntos.length !==
                this.radicar.requisitosSolicitudEscogida.documentosRequeridos
                    .length
            ) {
                return false;
            }
        }

        // Verifica si todas las casillas de documentosAdjuntos están llenas
        for (const documento of this.radicar.documentosAdjuntos) {
            if (!documento) {
                return false;
            }
        }
*/
        return true; // Si pasa ambas verificaciones, devuelve true
    }

    showWarn() {
        this.messageService.add({
            severity: 'warn',
            summary: 'Documentación Incompleta',
            detail: 'Cargue todos los documentos requeridos',
        });
    }

    navigateToNext() {
        if (this.validarDocsCompletos()) {
            this.router.navigate([
                '/gestionsolicitudes/portafolio/radicar/resumen',
            ]);
        } else {
            this.showWarn();
        }
    }

    navigateToBack() {
        this.router.navigate([
            '/gestionsolicitudes/portafolio/radicar/formulario',
        ]);
    }
}
