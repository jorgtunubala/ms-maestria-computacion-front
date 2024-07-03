import {
    Component,
    HostListener,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
} from '@angular/core';
import { AppMainComponent } from '../main/app.main.component';
import { MenuItem } from 'primeng/api';
import { menuItems } from '../../constants/menu-items';
import { Subscription } from 'rxjs';
import { MenuService } from '../../services/app.menu.service';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

interface Usuario {
    nombreCompleto: string;
    rol: string;
    correo: string;
    username: string;
    password: string;
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
        this.initializeMenuItems();
        this.menuService.alertLogin$.subscribe(() => {
            const user: Usuario | null = this.autenticacion.loggedInUser;

            if (user) {
                this.initializeMenuItems();
            }
        });
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(event) {
        if (window.pageYOffset > 120) {
            this.isTopBarVisible = false;
        } else {
            this.isTopBarVisible = true;
        }
    }

    initializeMenuItems() {
        this.items = [...menuItems];

        if (this.autenticacion.isLoggedIn()) {
            this.updateMenuForLoggedInUser();
        }
    }

    updateMenuForLoggedInUser() {
        const user = this.autenticacion.getLoggedInUser();
        if (user) {
            this.items = this.items.map((item) => {
                if (item.label === 'LOGIN') {
                    return {
                        label: user.nombreCompleto.toUpperCase(),
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
        }
    }

    logout() {
        this.autenticacion.logout();
        this.items = [...menuItems];
    }
}
