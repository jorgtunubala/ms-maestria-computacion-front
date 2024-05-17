import { MenuItem } from 'primeng/api';

export const menuItems: MenuItem[] = [
    {
        label: 'INICIO',
        icon: 'pi pi-fw pi-home',
        routerLink: '/',
    },
    {
        label: 'GESTIÓN',
        icon: 'pi pi-fw pi-user',
        items: [
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
                label: 'EXPERTOS',
                icon: 'pi pi-user',
                routerLink:'/expertos',
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
                routerLink: '/gestionsolicitudes/buzon',
            },
            {
                label:'LÍNEAS INVESTIGACIÓN',
                icon: 'pi pi-fw pi-clone',
                items:[
                    {
                        label: 'Categorías',
                        icon: 'pi pi-fw pi-bars',
                        routerLink:'/gestion-lineas-investigacion/categorias'
                    },
                    {
                        label: 'Lienas de Investigación',
                        icon: 'pi pi-fw pi-clone',
                        routerLink:'/gestion-lineas-investigacion/lineas'
                    }
                ]
                // routerLink:'/gestion-lineas-investigacion',
            }
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
    { separator: true },
    {
        label: 'TRABAJOS DE GRADO',
        icon: 'pi pi-fw pi-book',
    },
];
