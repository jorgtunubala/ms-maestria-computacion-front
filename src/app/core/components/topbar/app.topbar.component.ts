import { Component, HostListener, OnInit } from '@angular/core';
import { AppMainComponent } from '../main/app.main.component';
import { MenuItem } from 'primeng/api';
import { menuItems as originalMenuItems } from '../../constants/menu-items';
import { MenuService } from '../../services/app.menu.service';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

interface Usuario {
    username: string;
    email: string;
    role: string[];
}

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent implements OnInit {
    isTopBarVisible = true;
    items: MenuItem[];

    constructor(
        public appMain: AppMainComponent,
        private autenticacion: AutenticacionService,
        private menuService: MenuService
    ) {}

    ngOnInit() {
        // Inicializar los elementos del menú al iniciar el componente
        this.initializeMenuItems();
        // Suscribirse a cambios en el estado de autenticación
        this.menuService.alertLogin$.subscribe(() => {
            const user: Usuario | null = this.autenticacion.loggedInUser;
            if (user) {
                this.initializeMenuItems();
            }
        });
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event) {
        // Mostrar/ocultar la barra superior en función del desplazamiento de la página
        if (window.pageYOffset > 120) {
            this.isTopBarVisible = false;
        } else {
            this.isTopBarVisible = true;
        }
    }

    initializeMenuItems() {
        // Crear una copia profunda de los elementos del menú originales
        this.items = JSON.parse(JSON.stringify(originalMenuItems));
        // Actualizar el menú según el estado de autenticación
        if (this.autenticacion.isLoggedIn()) {
            this.updateMenuForLoggedInUser();
        } else {
            this.filterMenuItems(null);
        }
    }

    updateMenuForLoggedInUser() {
        const user = this.autenticacion.getLoggedInUser();

        if (user) {
            // Actualizar el menú para mostrar el nombre del usuario y opción de cerrar sesión
            this.items = this.items.map((item) => {
                if (item.label === 'LOGIN') {
                    return {
                        label: user.username.toUpperCase(),
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Cerrar sesión',
                                icon: 'pi pi-fw pi-sign-out',
                                command: () => this.logout(),
                            },
                        ],
                    };
                }
                return item;
            });
            // Filtrar elementos del menú según el rol del usuario
            this.filterMenuItems(user);
        }
    }

    filterMenuItems(user: Usuario | null) {
        this.items = this.items.filter((item) => {
            if (item.label === 'GESTIÓN') {
                if (!user) {
                    // No mostrar el elemento GESTIÓN si no hay usuario
                    return false;
                } else if (user.role.includes('ROLE_COORDINADOR')) {
                    // Mostrar todos los subítems menos "AVALES" si el usuario es coordinador
                    item.items = item.items.filter(
                        (subItem) => subItem.label !== 'AVALES'
                    );
                    return true;
                } else if (user.role.includes('ROLE_DOCENTE')) {
                    // Mostrar solo el subítem "AVALES" si el usuario es docente
                    item.items = item.items.filter(
                        (subItem) => subItem.label === 'AVALES'
                    );
                    return true;
                }
                return false;
            }
            return true;
        });
    }

    logout() {
        // Cerrar sesión y reinicializar los elementos del menú
        this.autenticacion.logout();
        this.initializeMenuItems();
    }
}
