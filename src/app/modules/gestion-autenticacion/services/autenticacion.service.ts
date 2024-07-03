import { EventEmitter, Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuService } from 'src/app/core/services/app.menu.service';
import { DynamicloginComponent } from '../components/dynamiclogin/dynamiclogin.component';

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
        username: 'juanperez',
        password: 'password123',
    },
    {
        nombreCompleto: 'María García',
        rol: 'estudiante',
        correo: 'maria@example.com',
        username: 'mariagarcia',
        password: 'securepass',
    },
    {
        nombreCompleto: 'Carlos Martinez',
        rol: 'docente',
        correo: 'carlos@example.com',
        username: 'carmartin',
        password: 'password123',
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
        private menuService: MenuService
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
    }

    isLoggedIn(): boolean {
        return this.isLoggedInStatus;
    }

    getLoggedInUser(): Usuario | null {
        return this.loggedInUser;
    }

    getRole() {
        return this.userRole;
    }

    openLoginDialog(): void {
        this.dialogRef = this.dialogService.open(DynamicloginComponent, {
            header: 'Inicie sesión',
            width: '30%',
        });
    }
}
