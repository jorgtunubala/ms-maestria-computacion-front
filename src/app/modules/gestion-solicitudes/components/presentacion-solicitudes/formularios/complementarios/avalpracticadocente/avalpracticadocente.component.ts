import { Component, OnInit } from '@angular/core';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

@Component({
    selector: 'app-avalpracticadocente',
    templateUrl: './avalpracticadocente.component.html',
    styleUrls: ['./avalpracticadocente.component.scss'],
})
export class AvalpracticadocenteComponent implements OnInit {
    constructor(public radicar: RadicarService) {}

    ngOnInit(): void {}

    agregarActividad(event: any) {
        this.radicar.actividadesSeleccionadas.push(event.value);

        const actividadId = this.radicar.actividadesSeleccionadas.length - 1;
        if (!this.radicar.adjuntosDeActividades[actividadId]) {
            this.radicar.adjuntosDeActividades[actividadId] = {
                archivos: [],
                enlaces: [],
            };
        }

        if (event.value.peso == null) {
            this.radicar.horasAsignables[actividadId] =
                event.value.horasAsignadas;
        }
    }

    eliminarActividad(index: number) {
        if (this.radicar.actividadesSeleccionadas[index].peso != null) {
            this.radicar.horasIngresadas.splice(index, 1);
        }
        this.radicar.actividadesSeleccionadas.splice(index, 1);
        //this.borrarYActualizarAdjuntos(index);

        this.radicar.horasAsignables.splice(index, 1);
    }

    onValueChange(value: number, index: number, pesoActividad: number): void {
        this.radicar.horasIngresadas[index] = value;
        this.radicar.horasAsignables[index] = value * pesoActividad;
    }
}
