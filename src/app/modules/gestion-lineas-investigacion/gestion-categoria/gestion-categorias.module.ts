import { NgModule } from "@angular/core";
import { PrincipalGestionCategoriasComponent } from "./pages/principal-gestion-categorias/principal-gestion-categorias.component";
import { CommonModule } from "@angular/common";
import { SharedModule } from "primeng/api";
import { PrimenNgModule } from "../../primen-ng/primen-ng.module";
import { GestionCategoriasRoutingModule } from "./gestion-categorias-routing.module";
import { ReactiveFormsModule } from "@angular/forms";


@NgModule({
    declarations: [
        PrincipalGestionCategoriasComponent
    ],
    imports:[
        CommonModule,
        SharedModule,
        PrimenNgModule,
        GestionCategoriasRoutingModule,
        ReactiveFormsModule
    ]
})
export class GestionCategoriasModule{}