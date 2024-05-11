import { Component, OnInit } from '@angular/core';
import { GestorService } from '../../../services/gestor.service';

@Component({
    selector: 'app-visor',
    templateUrl: './visor.component.html',
    styleUrls: ['./visor.component.scss'],
})
export class VisorComponent implements OnInit {
    urlOficio: string;
    constructor(public gestor: GestorService) {}

    ngOnInit(): void {
        this.urlOficio = this.gestor.getSolicitudSeleccionada[0];
    }

    mostrarArhivo(archivo) {
        window.open(archivo.url, '_blank');
    }
}
