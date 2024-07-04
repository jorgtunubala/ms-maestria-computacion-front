import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PreventLoginGuard } from './guards/preventlogin.guard';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [PreventLoginGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionAutenticacionRoutingModule {}
