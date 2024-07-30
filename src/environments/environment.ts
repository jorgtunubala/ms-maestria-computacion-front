// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: true,
    api_url: 'http://localhost:8091/api/',
};

export const gestion_autenticacion = {
    production: false,
    api_url: 'http://dockertest.unicauca.edu.co:4400/api/',
};

export const gestion_expertos = {
    production: false,
    api_url: 'http://dockertest.unicauca.edu.co:4402/api/',
};

export const gestion_egresados = {
    production: false,
    api_url: 'http://dockertest.unicauca.edu.co:4403/api/',
};

export const gestion_trabajo_grado = {
    production: false,
    api_url: 'http://dockertest.unicauca.edu.co:4401/api/',
};

export const gestion_docentes_estudiantes = {
    production: false,
    api_url: 'http://dockertest.unicauca.edu.co:4402/api/',
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
