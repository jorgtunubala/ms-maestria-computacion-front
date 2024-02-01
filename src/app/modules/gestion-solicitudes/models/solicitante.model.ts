export class Solicitante {
    private _nombresSolicitante: string;
    private _apellidosSolicitante: string;
    private _identificacion: string;
    private _tipoIdentificacion: string;
    private _codigoAcademico: string;
    private _tutor: any;

    constructor(
        nombresSolicitante: string,
        apellidosSolicitante: string,
        identificacion: string,
        codigoAcademico: string,
        tutor: any
    ) {
        this._nombresSolicitante = nombresSolicitante;
        this._apellidosSolicitante = apellidosSolicitante;
        this._identificacion = identificacion;
        this._codigoAcademico = codigoAcademico;
        this._tutor = tutor;
    }

    get nombresSolicitante(): string {
        return this._nombresSolicitante;
    }

    set nombresSolicitante(nombres: string) {
        this._nombresSolicitante = nombres;
    }

    get apellidosSolicitante(): string {
        return this._apellidosSolicitante;
    }

    set apellidosSolicitante(apellidos: string) {
        this._apellidosSolicitante = apellidos;
    }

    get identificacion(): string {
        return this._identificacion;
    }

    set identificacion(identificacion: string) {
        this._identificacion = identificacion;
    }

    get tipoIdentificacion(): string {
        return this._tipoIdentificacion;
    }

    set tipoIdentificacion(tipoIdentificacion: string) {
        this._tipoIdentificacion = tipoIdentificacion;
    }

    get codigoAcademico(): string {
        return this._codigoAcademico;
    }

    set codigoAcademico(codigo: string) {
        this._codigoAcademico = codigo;
    }

    get tutor(): any {
        return this._tutor;
    }

    set tutor(tutor: any) {
        this._tutor = tutor;
    }
}
