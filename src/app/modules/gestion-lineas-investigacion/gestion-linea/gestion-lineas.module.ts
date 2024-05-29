import { NgModule } from "@angular/core";
import { PrincipalGestionLineasComponent } from "../gestion-linea/pages/principal-gestion-lineas/principal-gestion-lineas.component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "primeng/api";
import { PrimenNgModule } from "../../primen-ng/primen-ng.module";
import { GestionLineasInvestigacionRoutingModule } from "./gestion-lineas-routing.module";
import { ReactiveFormsModule } from "@angular/forms";


@NgModule({
    declarations: [
        PrincipalGestionLineasComponent,
        
    ],
    imports: [
        CommonModule,
        SharedModule,
        PrimenNgModule,
        GestionLineasInvestigacionRoutingModule,
        ReactiveFormsModule,
    ],
})
export class GestionLineasInvestigacionModule { }