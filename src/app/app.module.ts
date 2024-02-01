import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './core/pages/app.component';
import { AppTopBarComponent } from './core/components/topbar/app.topbar.component';
import { AppFooterComponent } from './core/components/footer/app.footer.component';

import { MenuService } from './core/services/app.menu.service';
import { ConfigService } from './core/services/app.config.service';
import { AppMainComponent } from './core/components/main/app.main.component';
import { AppMenuComponent } from './core/components/menu/app.menu.component';
import { AppMenuitemComponent } from './core/components/menu-item/app.menuitem.component';
import { AppConfigComponent } from './core/components/config/app.config.component';
import { PrimenNgModule } from './modules/primen-ng/primen-ng.module';
import { HomeComponent } from './core/components/home/home.component';
import { ConfirmationService, MessageService, SharedModule } from 'primeng/api';
import { AppBreadcrumbComponent } from './core/components/breadcrumb/app.breadcrumb.component';
import { BreadcrumbService } from './core/components/breadcrumb/app.breadcrumb.service';
import { DialogService } from 'primeng/dynamicdialog';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        PrimenNgModule,
        SharedModule,
        ReactiveFormsModule,
    ],
    declarations: [
        AppComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMainComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppConfigComponent,
        AppBreadcrumbComponent,
        HomeComponent,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        MessageService,
        MenuService,
        ConfigService,
        ConfirmationService,
        DialogService,
        BreadcrumbService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
