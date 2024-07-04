import { MenuItem } from 'primeng/api';

export const menuItems: MenuItem[] = [
    {
        label: 'INICIO',
        icon: 'pi pi-fw pi-home',
        routerLink: '/',
    },
    {
        label: 'GESTIÓN',
        icon: 'pi pi-fw pi-sliders-h',
        items: [
            {
                label: 'AVALES',
                icon: 'pi pi-check-circle',
                routerLink: '/gestionsolicitudes/avales/pendientes',
            },
            {
                label: 'ESTUDIANTES',
                icon: 'pi pi-user',
                routerLink: '/estudiantes',
            },
            {
                label: 'DOCENTES',
                icon: 'pi pi-user',
                routerLink: '/docentes',
            },
            {
                label: 'ASIGNATURAS',
                icon: 'pi pi-fw pi-clone',
                routerLink: '/gestion-asignaturas',
            },
            {
                label: 'DOCUMENTOS',
                icon: 'pi pi-fw pi-clone',
                routerLink: '/gestion-documentos',
            },
            {
                label: 'SOLICITUDES',
                icon: 'pi pi-fw pi-inbox',
                routerLink: '/gestionsolicitudes/buzon/nuevas',
            },
        ],
    },
    {
        label: 'MATRICULAS',
        icon: 'pi pi-fw pi-id-card',
    },
    {
        label: 'SOLICITUDES',
        icon: 'pi pi-fw pi-inbox',
        routerLink: '/gestionsolicitudes/portafolio/opciones',
    },
    {
        label: 'PRESUPUESTO',
        icon: 'pi pi-fw pi-chart-line',
    },
    {
        label: 'TRABAJOS DE GRADO',
        icon: 'pi pi-fw pi-book',
    },
    {
        label: 'LOGIN',
        icon: 'pi pi-fw pi-user',
        routerLink: '/autenticacion/login',
    },
];
