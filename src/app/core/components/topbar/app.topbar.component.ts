import { Component } from '@angular/core';
import { AppMainComponent } from '../main/app.main.component';
import { MenuItem } from 'primeng/api';
import { menuItems } from '../../constants/menu-items';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    items: MenuItem[];

    constructor(public appMain: AppMainComponent) {
        this.items = menuItems;
    }
}
