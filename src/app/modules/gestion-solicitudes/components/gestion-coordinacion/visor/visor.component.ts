import { Component, OnInit } from '@angular/core';
import { GestorService } from '../../../services/gestor.service';

@Component({
    selector: 'app-visor',
    templateUrl: './visor.component.html',
    styleUrls: ['./visor.component.scss'],
})
export class VisorComponent implements OnInit {
    constructor(public gestor: GestorService) {}

    ngOnInit(): void {}

    mostrarArhivo(archivo) {
        window.open(archivo.url, '_blank');
    }
}
