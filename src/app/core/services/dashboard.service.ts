import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IMetrica, ITercero, IContacto, ICrearContactoDto, IEditarContactoDto, IListaPrecio } from '../interfaces/dashboard.interfaces';

/** Estructura de respuesta estándar de n8n cuando el nodo devuelve items con .json */
interface N8nItem<T> {
    json?: T;
}

/** Respuesta paginada estándar del ERP Physis */
interface PhysisResponse<T> {
    data?: { datos?: T[] } | string;
    datos?: T[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.webhooks.base;

    /** Normaliza arrays de n8n que pueden envolver items en { json: { ... } } */
    private normalize<T>(data: N8nItem<T>[]): T[] {
        if (!Array.isArray(data)) return [];
        return data.map(item => item.json ?? (item as T));
    }

    /** Extrae el array de datos de la respuesta variable del ERP Physis */
    private extractPhysisData<T>(res: PhysisResponse<T>): T[] {
        let raw: unknown = (res && res.data) ? res.data : res;

        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw) as { datos?: T[] } | T[];
                return (parsed as { datos?: T[] }).datos ?? (Array.isArray(parsed) ? parsed : []);
            } catch {
                return [];
            }
        }

        if (raw && typeof raw === 'object' && 'datos' in raw) {
            const withDatos = raw as { datos?: T[] };
            return Array.isArray(withDatos.datos) ? withDatos.datos : [];
        }

        return Array.isArray(raw) ? raw as T[] : [];
    }

    getMetricas(): Observable<IMetrica[]> {
        return this.http.get<N8nItem<Record<string, number>>[]>(`${this.baseUrl}${environment.webhooks.metricas}`)
            .pipe(
                map(data => {
                    const raw = (data && data[0]?.json) || (data && data[0] as Record<string, number>) || {};
                    const pedidos       = Number(raw['PedidosRealizados'] || 0);
                    const asistencia    = Number(raw['Asistencia'] || 0);
                    const fueraHorario  = Number(raw['FueraHorario'] || 0);
                    const errores       = Number(raw['Errores'] || 0);
                    const total         = Number(raw['InteraccionesTotales'] || raw['Interacciones'] || (pedidos + asistencia + fueraHorario + errores));

                    return [
                        { label: 'Total Interacciones', value: total,         icon: 'activity',        color: 'blue'   },
                        { label: 'Pedidos Realizados',  value: pedidos,       icon: 'shopping-cart',   color: 'green'  },
                        { label: 'Asistencia Humana',   value: asistencia,    icon: 'life-buoy',       color: 'orange' },
                        { label: 'Fuera de Horario',    value: fueraHorario,  icon: 'clock',           color: 'gray'   },
                        { label: 'Errores Bot',         value: errores,       icon: 'alert-triangle',  color: 'red'    }
                    ] as IMetrica[];
                }),
                retry(3)
            );
    }

    getTerceros(): Observable<ITercero[]> {
        return this.http.get<PhysisResponse<ITercero>>(`${environment.sigesUrl}/terceros`)
            .pipe(
                map(res => this.extractPhysisData<ITercero>(res)),
                retry(3)
            );
    }

    getContactos(): Observable<IContacto[]> {
        return this.http.get<N8nItem<IContacto>[]>(`${this.baseUrl}${environment.webhooks.contactos}`)
            .pipe(
                map(data => this.normalize<IContacto>(data)),
                retry(3)
            );
    }

    crearContacto(payload: ICrearContactoDto): Observable<unknown> {
        return this.http.post(`${this.baseUrl}${environment.webhooks.crearContacto}`, payload)
            .pipe(retry(3));
    }

    editarContacto(payload: IEditarContactoDto): Observable<unknown> {
        return this.http.post(`${this.baseUrl}${environment.webhooks.actualizarBot}`, payload)
            .pipe(retry(3));
    }

    eliminarContacto(contacto: IContacto): Observable<unknown> {
        return this.http.post(`${this.baseUrl}${environment.webhooks.eliminarContacto}`, contacto)
            .pipe(retry(3));
    }

    getListasPrecios(): Observable<IListaPrecio[]> {
        const params = {
            imputables: 'true',
            noImputables: 'true',
            unSoloNivel: 'false'
        };
        return this.http.get<any>(`${environment.sifacUrl}/clientes/listas-precios/arbol`, { params })
            .pipe(
                map(res => {
                    const tree = res.Datos || res;
                    const flattened: IListaPrecio[] = [];
                    
                    const traverse = (node: any) => {
                        if (node.Imputable) {
                            flattened.push({
                                Nombre: node.Descripcion || node.text,
                                Numero: node.Codigo
                            });
                        }
                        if (node.items && Array.isArray(node.items)) {
                            node.items.forEach((child: any) => traverse(child));
                        }
                    };

                    traverse(tree);
                    return flattened;
                })
            );
    }

    actualizarListaPrecio(listaId: string | number): Observable<any> {
        return this.http.post(`${environment.webhooks.base}${environment.webhooks.actualizarLista}`, { listaId });
    }

    fetchAll(): Observable<{ metricas: IMetrica[]; terceros: ITercero[]; contactos: IContacto[]; listas: IListaPrecio[] }> {
        return forkJoin({
            metricas:  this.getMetricas().pipe(catchError(()  => of<IMetrica[]>([])),  ),
            terceros:  this.getTerceros().pipe(catchError(()  => of<ITercero[]>([])),  ),
            contactos: this.getContactos().pipe(catchError(() => of<IContacto[]>([])), ),
            listas:    this.getListasPrecios().pipe(catchError(() => of<IListaPrecio[]>([])), )
        });
    }
}
