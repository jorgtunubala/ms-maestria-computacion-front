import { Component, OnInit } from '@angular/core';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

interface actividadCreditos {
    nombre: string;
    abreviacion: string;
    codigo: string;
}

@Component({
    selector: 'app-creditos',
    templateUrl: './creditos.component.html',
    styleUrls: ['./creditos.component.scss'],
})
export class CreditosComponent implements OnInit {
    //actividadSeleccionada: actividadCreditos;
    constructor(public radicar: RadicarService) {}

    ngOnInit(): void {}

    agregarActividad(event: any) {
        this.radicar.actividadesSeleccionadas.push(event.value);
    }

    eliminarActividad(index: number) {
        this.radicar.actividadesSeleccionadas.splice(index, 1);
    }
}
