import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PrincipalGestionCustionarioComponent } from "./pages/principal-gestion-custionario/principal-gestion-custionario.component";
import { BandejaCuestionariosComponent } from "./components/Bandeja-Cuestionarios/Bandeja-Cuestionarios.component";

const routes: Routes = [
    {
        path: '',
        component: PrincipalGestionCustionarioComponent,
        children: [
            {
                path: '',
                component: BandejaCuestionariosComponent,
            }
        ]
    
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GestionCuestionariosRoutingModule { }