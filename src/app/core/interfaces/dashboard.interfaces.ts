export interface IMetrica {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

export interface IListaPrecio {
    Nombre: string;
    Numero?: string | number;
}

export interface ITercero {
    IdCtaAuxi: string;
    Nombre: string;
    Nro_Documento: string;
    DomicilioCalle?: string;
    DomicilioNumero?: string;
    DomicilioLocalidad?: string;
    IdPpal: string;
    IdAuxi: string;
    Email?: string;
    id?: string | number;
}

export interface IContacto {
    IdCtaAuxi: string;
    IdContacto: string;
    Nombre: string;
    Telefono: string;
    ListaPrecio: number;
    BotActivo: string | number;
    id: string | number;
}

export interface IActualizarBotDto {
    idCtaAuxi: string;
    telefono: string;
    botActivo: string; // "1" o "0"
}

export interface ICrearContactoDto {
    idCtaAuxi: string;
    idPpal: string;
    idAuxi: string;
    nombre: string;
    telefono: string;
    email?: string;
    direccion?: string;
    listaPrecio: number;
    botActivo: string;
}

export interface IEditarContactoDto extends ICrearContactoDto {
    id: string | number;
}
