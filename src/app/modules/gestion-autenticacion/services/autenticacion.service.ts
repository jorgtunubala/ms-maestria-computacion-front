import { EventEmitter, Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuService } from 'src/app/core/services/app.menu.service';
import { DynamicloginComponent } from '../components/dynamiclogin/dynamiclogin.component';
import { Router } from '@angular/router';

interface Usuario {
    nombreCompleto: string;
    rol: string;
    correo: string;
    username: string;
    password: string;
}

const usuarios: Usuario[] = [
    {
        nombreCompleto: 'Juan Pérez',
        rol: 'Admin',
        correo: 'juan@example.com',
        username: 'admin',
        password: 'adm',
    },
    {
        nombreCompleto: 'María García',
        rol: 'estudiante',
        correo: 'juliiml95@gmail.com',
        username: 'estudiante',
        password: 'est',
    },
    {
        nombreCompleto: 'Carlos Martinez',
        rol: 'docente',
        correo: 'julianaml_95@hotmail.com',
        username: 'docente',
        password: 'doc',
    },
    {
        nombreCompleto: 'Andrea Zuluaga',
        rol: 'coordinador',
        correo: 'julimlps5@gmail.com',
        username: 'coordinador',
        password: 'coo',
    },
];

@Injectable({
    providedIn: 'root',
})
export class AutenticacionService {
    isLoggedInStatus: boolean = false;
    userRole: string = '';
    loggedInUser: Usuario | null = null;
    dialogRef: DynamicDialogRef;

    loginSuccess$: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private dialogService: DialogService,
        private menuService: MenuService,
        private router: Router
    ) {
        // Verificar el estado de inicio de sesión al inicializar el servicio
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            this.isLoggedInStatus = true;
            this.loggedInUser = JSON.parse(storedUser);
        }
    }

    login(username: string, password: string): boolean {
        const usuarioEncontrado: Usuario = this.buscarUsuario(
            username,
            password
        );

        if (usuarioEncontrado) {
            this.isLoggedInStatus = true;
            this.loggedInUser = usuarioEncontrado;
            localStorage.setItem(
                'loggedInUser',
                JSON.stringify(this.loggedInUser)
            );

            // Emitir la alerta después de que loggedInUser se actualice correctamente
            this.menuService.emitAlertLogin();
            return true;
        } else {
            return false;
        }
    }

    buscarUsuario(username: string, password: string): Usuario | undefined {
        return usuarios.find(
            (user) => user.username === username && user.password === password
        );
    }

    logout(): void {
        this.isLoggedInStatus = false;
        this.loggedInUser = null;
        localStorage.removeItem('loggedInUser');
        this.router.navigate(['']);
    }

    isLoggedIn(): boolean {
        return this.isLoggedInStatus;
    }

    getLoggedInUser(): Usuario | null {
        return this.loggedInUser;
    }

    getRole() {
        return this.loggedInUser.rol;
    }

    getFullName() {
        return this.loggedInUser.nombreCompleto;
    }

    getEmail() {
        return this.loggedInUser.correo;
    }

    hasRole(role: string): boolean {
        return this.loggedInUser.rol === role;
    }

    openLoginDialog(): void {
        this.dialogRef = this.dialogService.open(DynamicloginComponent, {
            header: 'Inicie sesión',
            width: '30%',
        });
    }
}
