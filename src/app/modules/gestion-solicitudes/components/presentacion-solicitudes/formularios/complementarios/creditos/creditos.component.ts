import { Component, OnInit } from '@angular/core';
import { RadicarService } from 'src/app/modules/gestion-solicitudes/services/radicar.service';

interface AdjuntosActividad {
    archivos: File[];
    enlaces: string[];
}
interface AdjuntosDeActividades {
    [actividadId: number]: AdjuntosActividad;
}
@Component({
    selector: 'app-creditos',
    templateUrl: './creditos.component.html',
    styleUrls: ['./creditos.component.scss'],
})
export class CreditosComponent implements OnInit {
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
        this.borrarYActualizarAdjuntos(index);

        this.radicar.horasAsignables.splice(index, 1);
    }

    borrarYActualizarAdjuntos(actividadId: number): void {
        const actividades = this.radicar.adjuntosDeActividades;
        const newActividades: AdjuntosDeActividades = {};

        // Borrar el registro y copiar los restantes
        for (const key in actividades) {
            const keyNum = parseInt(key);
            if (keyNum < actividadId) {
                newActividades[keyNum] = actividades[keyNum];
            } else if (keyNum > actividadId) {
                newActividades[keyNum - 1] = actividades[keyNum];
            }
        }

        this.radicar.adjuntosDeActividades = newActividades;
    }

    onValueChange(
        value: number,
        index: number,
        pesoActividad: number,
        horasAsignadas: number
    ): void {
        this.radicar.horasIngresadas[index] = value;
        this.radicar.horasAsignables[index] = value * pesoActividad;
    }

    onUpload(
        event: any,
        fileUpload: any,
        actividadId: number,
        docIndex: number
    ) {
        if (!this.radicar.adjuntosDeActividades[actividadId]) {
            this.radicar.adjuntosDeActividades[actividadId] = {
                archivos: [],
                enlaces: [],
            };
        }

        this.radicar.adjuntosDeActividades[actividadId].archivos.splice(
            docIndex,
            0,
            event.files[0]
        );
        fileUpload.clear();
    }

    agregarEnlace(actividadId: number, enlace: string, posicion: number) {
        if (!this.radicar.adjuntosDeActividades[actividadId]) {
            this.radicar.adjuntosDeActividades[actividadId] = {
                archivos: [],
                enlaces: [],
            };
        }

        this.radicar.adjuntosDeActividades[actividadId].enlaces.splice(
            posicion,
            0,
            enlace
        );
    }
}
