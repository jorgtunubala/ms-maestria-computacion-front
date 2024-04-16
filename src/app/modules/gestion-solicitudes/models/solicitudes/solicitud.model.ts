export class Solicitud {
    private _tipo: string;
    private _fechaEnvio: string;
    private _nombresSolicitante: string;
    private _apellidosSolicitante: string;
    private _identificacion: string;
    private _codigoAcademico: string;
    private _estado: string;
    private _adjuntos: any[];

    constructor(
        tipo: string,
        fechaEnvio: string,
        nombresSolicitante: string,
        apellidosSolicitante: string,
        identificacion: string,
        codigoAcademico: string,
        estado: string,
        adjuntos: any[]
    ) {
        this._tipo = tipo;
        this._fechaEnvio = fechaEnvio;
        this._nombresSolicitante = nombresSolicitante;
        this._apellidosSolicitante = apellidosSolicitante;
        this._identificacion = identificacion;
        this._codigoAcademico = codigoAcademico;
        this._estado = estado;
        this._adjuntos = adjuntos;
    }

    get tipo(): string {
        return this._tipo;
    }

    set tipo(value: string) {
        this._tipo = value;
    }

    get fechaEnvio(): string {
        return this._fechaEnvio;
    }

    set fechaEnvio(value: string) {
        this._fechaEnvio = value;
    }

    get nombresSolicitante(): string {
        return this._nombresSolicitante;
    }

    set nombresSolicitante(value: string) {
        this._nombresSolicitante = value;
    }

    get apellidosSolicitante(): string {
        return this._apellidosSolicitante;
    }

    set apellidosSolicitante(value: string) {
        this._apellidosSolicitante = value;
    }

    get identificacion(): string {
        return this._identificacion;
    }

    set identificacion(value: string) {
        this._identificacion = value;
    }

    get codigoAcademico(): string {
        return this._codigoAcademico;
    }

    set codigoAcademico(value: string) {
        this._codigoAcademico = value;
    }

    get estado(): string {
        return this._estado;
    }

    set estado(value: string) {
        this._estado = value;
    }

    get adjuntos(): any[] {
        return this._adjuntos;
    }

    set adjuntos(value: any[]) {
        this.adjuntos = value;
    }
}
