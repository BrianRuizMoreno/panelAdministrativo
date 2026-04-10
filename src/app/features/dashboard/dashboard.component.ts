import { Component, OnInit, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { from, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, mergeMap, toArray, map, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  LayoutDashboard,
  Users,
  MessageSquare,
  Search,
  RefreshCw,
  PlusCircle,
  UserPlus,
  Phone,
  ListChecks,
  LogOut,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  LifeBuoy,
  ToggleLeft,
  ToggleRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  Activity,
  Zap,
  Pencil,
  Check,
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-angular';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { ITercero, IContacto, IMetrica, ICrearContactoDto, IEditarContactoDto, IListaPrecio } from '../../core/interfaces/dashboard.interfaces';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Activity, Users, Zap, Search, RefreshCw, PlusCircle,
        Trash2, Pencil, Check, CheckCircle, AlertTriangle,
        User, UserPlus, MessageSquare, Phone, ListChecks, LogOut,
        LayoutDashboard, TrendingUp, Clock, LifeBuoy,
        ToggleLeft, ToggleRight, ChevronsLeft, ChevronsRight,
        ChevronUp, ChevronDown
      })
    }
  ],
  template: `
    <div class="app-layout" [class.sidebar-is-collapsed]="sidebarCollapsed()">
      <!-- Sidebar Glassmorphic con Physis Identity -->
      <aside class="sidebar glass-effect" [class.collapsed]="sidebarCollapsed()">
        <div class="logo-area">
          <img src="https://logos.automatizaciones-physis.cloud/uploads/1775070765_306318286_384550087203017_4093999974189775495_n.png" alt="Bolsa de Café" class="brand-logo">
          <div class="logo-text">
            <span class="brand">Panel Administrativo</span>
            <span class="sub">Admin Contactos Bolsa de Café</span>
          </div>
        </div>
        
        <button class="toggle-sidebar-btn" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
          <lucide-icon [name]="sidebarCollapsed() ? 'chevrons-right' : 'chevrons-left'" size="16"></lucide-icon>
        </button>

        <nav class="side-nav">
          <button (click)="activeTab.set('metricas')" [class.active]="activeTab() === 'metricas'" class="nav-item">
            <lucide-icon name="activity"></lucide-icon>
            <span>Métricas Operativas</span>
          </button>
          <button (click)="activeTab.set('terceros')" [class.active]="activeTab() === 'terceros'" class="nav-item">
            <lucide-icon name="users"></lucide-icon>
            <span>Directorio de Terceros</span>
          </button>
          <button (click)="activeTab.set('contactos')" [class.active]="activeTab() === 'contactos'" class="nav-item">
            <lucide-icon name="zap"></lucide-icon>
            <span>Gestión de Contactos</span>
          </button>
          <button (click)="activeTab.set('listas')" [class.active]="activeTab() === 'listas'" class="nav-item">
            <lucide-icon name="list-checks"></lucide-icon>
            <span>Listas de Precios</span>
          </button>
        </nav>

        <div class="user-profile">
            <div class="avatar">
                <lucide-icon name="user"></lucide-icon>
            </div>
            <div class="user-meta">
                <span class="name">{{ authService.userName() }}</span>
                <span class="role">Admin Operativo</span>
            </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="content-area">
        <!-- Header con Identidad Bolsa de Café -->
        <header class="top-header">
            <div class="header-main-title">
                <h1 class="current-page">Administrador Contactos Bolsa de Café</h1>
                <p class="timestamp">{{ currentYear() }} • Panel de Control</p>
            </div>
            <div class="header-actions">
                <div class="search-global" *ngIf="activeTab() !== 'metricas'">
                    <lucide-icon name="search" size="18"></lucide-icon>
                    <input
                        type="text"
                        [ngModel]="searchTerm()"
                        (ngModelChange)="onSearchChange($event)"
                        [placeholder]="'Buscar en ' + activeTabTitle() + '...'"
                    />
                </div>
                <button (click)="fetchData()" class="btn-sync" [class.loading]="isSyncing()">
                    <lucide-icon name="refresh-cw"></lucide-icon>
                    <span>{{ isSyncing() ? 'Sincronizando' : 'Actualizar' }}</span>
                </button>
                <button (click)="authService.logout()" class="btn-header-logout" title="Cerrar sesión">
                    <lucide-icon name="log-out"></lucide-icon>
                    <span>Salir</span>
                </button>
                <img src="https://logos.automatizaciones-physis.cloud/uploads/1775070765_306318286_384550087203017_4093999974189775495_n.png" alt="Bolsa de Cafe" class="client-logo">
            </div>
        </header>

        <!-- View Containers -->
        <div class="view-viewport animate-fade">

            <!-- METRICAS VIEW (KPIs Reales) -->
            <section *ngIf="activeTab() === 'metricas'" class="metricas-view animate-slide-up">
                <div class="metricas-grid">
                    <div class="metric-card success">
                        <div class="metric-icon"><lucide-icon name="check-circle"></lucide-icon></div>
                        <div class="metric-info">
                            <span class="value">{{ kpis().pedidos.toLocaleString() }}</span>
                            <span class="label">Pedidos Realizados</span>
                        </div>
                    </div>
                    <div class="metric-card warning">
                        <div class="metric-icon"><lucide-icon name="life-buoy"></lucide-icon></div>
                        <div class="metric-info">
                            <span class="value">{{ kpis().asistencia.toLocaleString() }}</span>
                            <span class="label">Asistencia Humana</span>
                        </div>
                    </div>
                    <div class="metric-card info">
                        <div class="metric-icon"><lucide-icon name="clock"></lucide-icon></div>
                        <div class="metric-info">
                            <span class="value">{{ kpis().fueraHorario.toLocaleString() }}</span>
                            <span class="label">Fuera de Horario</span>
                        </div>
                    </div>
                    <div class="metric-card danger">
                        <div class="metric-icon"><lucide-icon name="alert-triangle"></lucide-icon></div>
                        <div class="metric-info">
                            <span class="value">{{ kpis().errores.toLocaleString() }}</span>
                            <span class="label">Errores Bot</span>
                        </div>
                    </div>
                    <div class="metric-card total">
                        <div class="metric-icon"><lucide-icon name="layout-dashboard"></lucide-icon></div>
                        <div class="metric-info">
                            <span class="value">{{ kpis().total.toLocaleString() }}</span>
                            <span class="label">Total Interacciones</span>
                        </div>
                    </div>
                </div>

                <div class="chart-section">
                    <div class="chart-container glass-card">
                        <div class="chart-header">
                            <h3>Distribución Operativa del Bot</h3>
                            <p>Análisis porcentual por categoría</p>
                        </div>
                        <div class="canvas-wrapper">
                            <canvas id="mainChart"></canvas>
                        </div>
                    </div>
                    <div class="savings-card glass-card">
                        <div class="savings-icon"><lucide-icon name="trending-up" size="48"></lucide-icon></div>
                        <h3>Eficiencia de pedidos mediante bot</h3>
                        <div class="savings-value">
                            <span class="number">{{ hoursSaved() }}</span>
                            <span class="unit">HS AHORRADAS</span>
                        </div>
                        <p>Basado en 5 min. ahorrados por cada pedido automatizado.</p>
                        <div class="savings-progress">
                            <div class="bar" [style.width]="'75%'"></div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- TERCEROS VIEW (Estructura Physis) -->
            <section *ngIf="activeTab() === 'terceros'" class="data-view animate-slide-up">
                <div class="table-card glass-card">
                    <div class="table-header-info">
                        <h2>Directorio de Entidades (Terceros)</h2>
                        <span class="count-pill">{{ filteredTerceros().length }} Registros</span>
                    </div>
                    <div class="table-scroll">
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th>Cta. Clt</th>
                                    <th>Razón Social / Entidad</th>
                                    <th>CUIT / DNI</th>
                                    <th>Direccion</th>
                                    <th class="text-right">Habilitar Bot</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let t of filteredTerceros(); trackBy: trackTercero">
                                    <td class="id-col" data-label="Cta. Clt">{{ t.IdCtaAuxi }}</td>
                                    <td class="name-col" data-label="Entidad" [class.text-muted-address]="(t.Nombre || '').includes(t.DomicilioNumero || '---')">
                                        {{ t.Nombre || 'Sin nombre' }}
                                    </td>
                                    <td class="meta-col" data-label="CUIT / DNI">{{ t.Nro_Documento || '---' }}</td>
                                    <td class="meta-col italic" data-label="Direccion">{{ getDireccion(t) }}</td>
                                    <td class="actions-col" data-label="Habilitar">
                                        <button (click)="openAddContact(t)" class="btn-action-add">
                                            <lucide-icon name="user-plus" size="18"></lucide-icon>
                                            <span>Configurar Acceso</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr *ngIf="filteredTerceros().length === 0" class="empty-state">
                                    <td colspan="5">No se encontraron entidades con los criterios de búsqueda.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- CONTACTOS VIEW (Estructura Bolsa de Café) -->
            <section *ngIf="activeTab() === 'contactos'" class="data-view animate-slide-up">
                <div class="table-card glass-card">
                    <div class="table-header-info">
                        <h2>Gestión de Accesos Bot</h2>
                        <span class="count-pill">{{ filteredContactos().length }} Activos</span>
                    </div>
                    <div class="table-scroll">
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th>Id Cta.</th>
                                    <th>Id Cto.</th>
                                    <th>Nombre Autorizado</th>
                                    <th>WhatsApp</th>
                                    <th>Lista Precios</th>
                                    <th class="text-center">Bot Activo</th>
                                    <th class="text-right">Estado</th>
                                    <th class="actions-col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let c of filteredContactos(); trackBy: trackContacto">
                                    <td class="id-col" data-label="Id Cta.">{{ c.IdCtaAuxi }}</td>
                                    <td class="id-col secondary" data-label="Id Cto.">{{ c.IdContacto }}</td>
                                    <td class="name-col" data-label="Nombre" [class.text-muted-address]="c.Nombre.includes('Resistencia')">
                                        {{ c.Nombre }}
                                    </td>
                                    <td class="phone-col" data-label="WhatsApp">
                                        <div class="phone-badge">
                                            <lucide-icon name="message-square" size="14"></lucide-icon>
                                            {{ c.Telefono }}
                                        </div>
                                    </td>
                                    <td class="meta-col" data-label="Lista"><span class="price-chip">{{ c.ListaPrecio }}</span></td>
                                    <td class="toggle-col text-center" data-label="Bot">
                                        <button
                                            class="toggle-btn"
                                            [class.active]="isBotActive(c)"
                                            (click)="toggleBot(c)"
                                            [disabled]="isUpdating() === c.id"
                                        >
                                            <lucide-icon [name]="isBotActive(c) ? 'toggle-right' : 'toggle-left'"></lucide-icon>
                                        </button>
                                    </td>
                                    <td class="status-col" data-label="Estado">
                                        <span class="status-pill" [class.active]="isBotActive(c)">
                                            {{ isBotActive(c) ? 'HABILITADO' : 'BLOQUEADO' }}
                                        </span>
                                    </td>
                                    <td class="actions-col">
                                        <div class="action-group">
                                            <button class="edit-btn" (click)="openEditContact(c)" title="Editar Contacto">
                                                <lucide-icon name="pencil" size="16"></lucide-icon>
                                            </button>
                                            <button class="delete-btn" (click)="confirmDelete(c)" title="Eliminar Contacto">
                                                <lucide-icon name="trash-2" size="16"></lucide-icon>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr *ngIf="filteredContactos().length === 0" class="empty-state">
                                    <td colspan="8">Ningún contacto configurado para la Bolsa de Café.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
            <!-- LISTAS VIEW -->
            <section *ngIf="activeTab() === 'listas'" class="data-view animate-slide-up">
                <div class="table-card glass-card">
                    <div class="table-header-info">
                        <h2>Listas de Precios Disponibles</h2>
                        <span class="count-pill">{{ listas().length }} Listas</span>
                    </div>
                    <div class="table-scroll">
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th class="cursor-pointer" (click)="toggleListSort()">
                                        Nro. Lista
                                        <lucide-icon [name]="listSortDir() === 'asc' ? 'chevron-up' : 'chevron-down'" size="14" style="margin-left: 4px; vertical-align: middle;"></lucide-icon>
                                    </th>
                                    <th>Nombre de Lista</th>
                                    <th class="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let l of filteredListas(); trackBy: trackLista">
                                    <td class="id-col" data-label="Nro.">{{ l.Numero }}</td>
                                    <td class="name-col" data-label="Nombre">{{ l.Nombre || 'Sin nombre' }}</td>
                                    <td class="actions-col" data-label="Acciones">
                                        <button (click)="actualizarLista(l)" class="btn-action-add" [disabled]="isUpdatingLista() === l.Numero">
                                            <lucide-icon [name]="isUpdatingLista() === l.Numero ? 'refresh-cw' : 'check'" size="18" [class.animate-spin]="isUpdatingLista() === l.Numero"></lucide-icon>
                                            <span>{{ isUpdatingLista() === l.Numero ? 'Actualizando...' : 'Actualizar' }}</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr *ngIf="filteredListas().length === 0" class="empty-state">
                                    <td colspan="2">No se encontraron listas.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
      </main>

      <!-- Modal Contacto para Bolsa de Café -->
      <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="modal-window glass-effect" (click)="$event.stopPropagation()">
            <div class="modal-header">
                <h2>{{ isEditing() ? 'Editar Contacto' : 'Añadir Contacto Bot' }}</h2>
                <p>{{ isEditing() ? 'Actualizando' : 'Habilitar' }} acceso operativo para: <br><strong>{{ selectedTercero()?.Nombre }}</strong></p>
            </div>
            <div class="modal-body">
                <div class="form-field">
                    <label>Nombre / Alias del Contacto (Sucursal, Encargado, etc.)</label>
                    <div class="input-icon">
                        <lucide-icon name="user" size="18"></lucide-icon>
                        <input type="text" [(ngModel)]="newContact.nombre" placeholder="Ej: Sucursal Centro / Juan Pérez"/>
                    </div>
                </div>
                <div class="form-field">
                    <label>WhatsApp Autorizado (+549...)</label>
                    <div class="input-icon">
                        <lucide-icon name="phone" size="18"></lucide-icon>
                        <input type="text" [(ngModel)]="newContact.telefono" placeholder="Ej: 5493412345678"/>
                    </div>
                </div>
                <div class="form-field">
                    <label>Lista de Precios Asignada</label>
                    <div class="input-icon">
                        <lucide-icon name="list-checks" size="18"></lucide-icon>
                        <input type="number" [(ngModel)]="newContact.listaPrecio" placeholder="Ej: 50001"/>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
                <button class="btn-primary" (click)="saveContact()" [disabled]="!newContact.telefono || !newContact.nombre || isSaving()">
                    <lucide-icon [name]="isSaving() ? 'refresh-cw' : (isEditing() ? 'pencil' : 'check-circle')" [class.animate-spin]="isSaving()" size="18" style="margin-right: 10px;"></lucide-icon>
                    {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Actualizar Cambios' : 'Habilitar Acceso Bot') }}
                </button>
            </div>
        </div>
      </div>

      <!-- Toast de Confirmación de Borrado -->
      <div class="confirm-overlay" *ngIf="showConfirmToast()">
        <div class="confirm-toast glass slide-up">
            <div class="confirm-content">
                <div class="confirm-icon danger">
                    <lucide-icon name="alert-triangle" size="24"></lucide-icon>
                </div>
                <div class="confirm-text">
                    <h3>¿Eliminar contacto?</h3>
                    <p>Se borrará permanentemente a <strong>{{ pendingDeleteContact()?.Nombre }}</strong></p>
                </div>
            </div>
            <div class="confirm-actions">
                <button class="btn-cancel" (click)="cancelDelete()">Cancelar</button>
                <button class="btn-confirm-delete" (click)="executeDelete()">Eliminar Ahora</button>
            </div>
        </div>
      </div>

      <!-- Sistema de Toasts -->
      <div class="toast-container" *ngIf="toastMsg()" [class.error]="toastType() === 'error'">
        <div class="toast-content animate-slide-up">
            <lucide-icon [name]="toastType() === 'success' ? 'check-circle' : 'alert-triangle'" size="20"></lucide-icon>
            <span>{{ toastMsg() }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { --primary: #003366; --secondary: #55c1e6; --accent: #8b5cf6; --bg: #0f172a; --text: #f8fafc; --success: #27c24c; --danger: #f43f5e; }

    .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

    /* Sidebar Premium */
    .sidebar { width: 300px; position: relative; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(25px); border-right: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; padding: 32px; z-index: 100; box-shadow: 10px 0 30px rgba(0,0,0,0.5); transition: width 0.3s ease, padding 0.3s ease; }
    .logo-area { display: flex; align-items: center; gap: 12px; margin-bottom: 56px; }
    .brand-logo { height: 40px; object-fit: contain; }
    .logo-text { display: flex; flex-direction: column; overflow: hidden; white-space: nowrap; transition: opacity 0.3s; }
    .logo-text .brand { color: white; font-weight: 800; font-size: 1.15rem; letter-spacing: 0.5px; }
    .logo-text .sub { color: var(--secondary); font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
    
    .toggle-sidebar-btn { position: absolute; right: -14px; top: 52px; background: var(--bg); border: 1px solid rgba(255,255,255,0.1); color: var(--secondary); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
    .toggle-sidebar-btn:hover { background: var(--secondary); color: var(--primary); transform: translateY(-50%) scale(1.1); }
    .toggle-sidebar-btn lucide-icon { width: 18px; height: 18px; }

    /* Estado Colapsado */
    .sidebar.collapsed { width: 90px; padding: 32px 16px; }
    .sidebar.collapsed .logo-text { opacity: 0; display: none; }
    .sidebar.collapsed .nav-item span { display: none; }
    .sidebar.collapsed .user-meta { display: none; }
    .sidebar.collapsed .nav-item { justify-content: center; padding: 16px; margin-top: 10px; }
    .sidebar.collapsed .logo-area { margin-bottom: 40px; justify-content: center; }

    .side-nav { flex: 1; display: flex; flex-direction: column; gap: 12px; }
    .nav-item { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 12px; border: none; background: transparent; color: #94a3b8; cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-weight: 600; text-align: left; }
    .nav-item:hover { background: rgba(255,255,255,0.04); color: var(--secondary); transform: translateX(5px); }
    .nav-item.active { background: linear-gradient(135deg, var(--secondary), #2dd4bf); color: var(--primary); box-shadow: 0 10px 25px rgba(85, 193, 230, 0.4); font-weight: 800; }
    .nav-item lucide-icon { width: 22px; height: 22px; }

    .user-profile { background: rgba(255,255,255,0.03); padding: 16px; border-radius: 20px; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.08); }
    .avatar { width: 44px; height: 44px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--secondary); border: 2px solid rgba(255,255,255,0.05); }
    .user-meta { flex: 1; display: flex; flex-direction: column; }
    .user-meta .name { color: white; font-size: 0.95rem; font-weight: 700; }
    .user-meta .role { color: #64748b; font-size: 0.78rem; font-weight: 600; }
    .btn-logout { background: transparent; border: none; color: var(--danger); cursor: pointer; padding: 10px; border-radius: 10px; transition: 0.3s; }
    .btn-logout:hover { background: rgba(244, 67, 54, 0.15); }

    /* Content Area */
    .content-area { flex: 1; padding: 48px; overflow-y: auto; background: radial-gradient(circle at 10% 20%, rgba(85, 193, 230, 0.04), transparent 800px); }
    .top-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; flex-wrap: wrap; gap: 32px; }
    .header-main-title h1 { font-size: 2.2rem; font-weight: 900; color: white; letter-spacing: -1.5px; line-height: 1.1; }
    .header-main-title .timestamp { color: var(--secondary); font-size: 0.85rem; font-weight: 800; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px; }

    .header-actions { display: flex; align-items: center; gap: 16px; }
    .search-global { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 0 18px; border-radius: 16px; display: flex; align-items: center; gap: 14px; width: 320px; height: 54px; transition: 0.3s; }
    .search-global:focus-within { border-color: var(--secondary); background: rgba(255,255,255,0.08); box-shadow: 0 0 0 4px rgba(85, 193, 230, 0.1); }
    .search-global lucide-icon { color: #64748b; }
    .search-global input { background: transparent; border: none; color: white; width: 100%; outline: none; font-size: 1rem; font-weight: 500; }
    .search-global input::placeholder { color: #475569; }

    .btn-sync { background: var(--secondary); color: var(--primary); padding: 0 28px; border-radius: 16px; border: none; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 12px; height: 54px; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);  font-size: 0.95rem; text-transform: uppercase; }
    .btn-sync:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(85, 193, 230, 0.5); }
    .btn-sync.loading lucide-icon { animation: rotate 1.2s linear infinite; }

    .btn-header-logout { background: rgba(244, 67, 54, 0.1); color: #f87171; border: 1px solid rgba(244, 67, 54, 0.2); padding: 0 20px; border-radius: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; height: 54px; transition: 0.3s; font-size: 0.9rem; }
    .btn-header-logout:hover { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; transform: translateY(-2px); }
    .btn-header-logout lucide-icon { width: 18px; height: 18px; }

    .client-logo { height: 60px; object-fit: contain; margin-left: 10px; border-radius: 12px; }

    /* Metricas View */
    .metricas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 48px; }
    .metric-card { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05); padding: 28px; border-radius: 24px; display: flex; flex-direction: column; gap: 16px; position: relative; overflow: hidden; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .metric-card:hover { transform: translateY(-8px); background: rgba(30, 41, 59, 0.6); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); }

    .metric-card::after { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--secondary); }
    .success::after { background: var(--success); }
    .warning::after { background: var(--warning); }
    .info::after { background: var(--accent); }
    .danger::after { background: var(--danger); }
    .total::after { background: white; }

    .metric-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: justify; color: white; }
    .metric-info { display: flex; flex-direction: column; }
    .metric-info .value { font-size: 2.2rem; font-weight: 900; color: white; line-height: 1; margin-bottom: 8px; font-family: 'Outfit', sans-serif; }
    .metric-info .label { font-size: 0.78rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }

    .chart-section { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }
    .glass-card { background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.06); border-radius: 32px; padding: 40px; }
    .chart-header h3 { color: white; font-size: 1.4rem; font-weight: 900; letter-spacing: -0.5px; }
    .chart-header p { color: #64748b; font-size: 0.9rem; margin-top: 6px; font-weight: 500; }
    .canvas-wrapper { height: 320px; margin-top: 32px; }

    .savings-card { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(145deg, rgba(39, 194, 76, 0.1), transparent); border-color: rgba(39, 194, 76, 0.2); }
    .savings-icon { color: var(--success); filter: drop-shadow(0 0 10px rgba(39, 194, 76, 0.5)); }
    .savings-card h3 { font-size: 1.2rem; color: white; font-weight: 900; margin-top: 16px; }
    .savings-value { display: flex; flex-direction: column; margin: 32px 0; }
    .savings-value .number { font-size: 6.5rem; font-weight: 900; color: var(--success); line-height: 0.8; letter-spacing: -5px; }
    .savings-value .unit { font-size: 1rem; font-weight: 900; color: #94a3b8; margin-top: 15px; letter-spacing: 2px; }
    .savings-progress { width: 100%; height: 8px; background: rgba(255,255,255,0.03); border-radius: 20px; margin-top: 24px; overflow: hidden; }
    .savings-progress .bar { height: 100%; background: var(--success); border-radius: 20px; box-shadow: 0 0 20px rgba(39, 194, 76, 0.6); }

    /* Tables Modernized */
    .table-header-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .table-header-info h2 { color: white; font-weight: 900; font-size: 1.5rem; }
    .count-pill { background: rgba(85, 193, 230, 0.15); color: var(--secondary); padding: 4px 14px; border-radius: 30px; font-size: 0.75rem; font-weight: 900; border: 1px solid rgba(85, 193, 230, 0.3); }

    .table-scroll { overflow-x: auto; margin: -10px; padding: 10px; }
    .modern-table { width: 100%; border-collapse: collapse; min-width: 900px; }
    .modern-table th { text-align: left; padding: 20px 16px; color: #64748b; font-weight: 900; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid rgba(255,255,255,0.05); }
    .modern-table td { padding: 22px 16px; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.03); transition: 0.3s; }
    .modern-table tr:hover td { background: rgba(255,255,255,0.02); color: white; }

    .id-col { font-family: 'JetBrains Mono', monospace; font-weight: 800; color: var(--secondary); font-size: 0.9rem; }
    .id-col.secondary { color: #94a3b8; font-size: 0.8rem; }
    .name-col { font-weight: 700; color: white; font-size: 1rem; }
    .italic { font-style: italic; opacity: 0.8; }
    .price-chip { background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); color: var(--accent); padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 900; }

    .btn-action-add { background: var(--success); border: none; color: var(--primary); padding: 10px 20px; border-radius: 12px; display: flex; align-items: center; gap: 10px; font-weight: 900; cursor: pointer; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-size: 0.85rem; text-transform: uppercase; }
    .btn-action-add:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 8px 20px rgba(39, 194, 76, 0.4); }

    .phone-badge { display: flex; align-items: center; gap: 10px; color: #2dd4bf; font-weight: 800; font-family: monospace; font-size: 0.95rem; }
    .toggle-btn { background: none; border: none; color: #334155; cursor: pointer; transform: scale(1.8); transition: 0.4s; }
    .toggle-btn.active { color: var(--success); }
    .status-pill { background: rgba(244, 67, 54, 0.1); color: var(--danger); padding: 6px 14px; border-radius: 30px; font-size: 0.68rem; font-weight: 900; border: 1px solid rgba(244, 67, 54, 0.2); }
    .status-pill.active { background: rgba(39, 194, 76, 0.1); color: var(--success); border-color: rgba(39, 194, 76, 0.2); }
    .text-muted-address { font-size: 0.85rem; color: #94a3b8 !important; font-weight: 500; }
    .empty-state { text-align: center; color: #475569; padding: 100px !important; font-size: 1.1rem; font-weight: 600; }

    /* Modals bolsa de cafe */
    .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.9); backdrop-filter: blur(12px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-window { width: 100%; max-width: 520px; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 32px; padding: 48px; box-shadow: 0 40px 80px -15px rgba(0,0,0,0.7); }
    .modal-header h2 { color: white; font-weight: 900; margin-bottom: 12px; font-size: 1.8rem; letter-spacing: -1px; }
    .modal-header p { color: #94a3b8; margin-bottom: 40px; font-weight: 500; line-height: 1.5; word-wrap: break-word; overflow-wrap: break-word; }
    .modal-header p strong { display: block; margin-top: 5px; color: var(--secondary); word-break: break-all; }
    .form-field { margin-bottom: 28px; }
    .form-field label { display: block; color: var(--secondary); font-size: 0.75rem; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; white-space: normal; line-height: 1.4; }
    .input-icon { position: relative; width: 100%; box-sizing: border-box; }
    .input-icon lucide-icon { position: absolute; left: 18px; top: 16px; color: #475569; }
    .input-icon input { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 16px; padding: 16px 16px 16px 54px; color: white; outline: none; transition: 0.3s; font-size: 1rem; font-weight: 600; box-sizing: border-box; }
    .input-icon input:focus { border-color: var(--secondary); box-shadow: 0 0 0 5px rgba(85, 193, 230, 0.15); }
    .modal-footer { display: flex; gap: 20px; margin-top: 16px; }
    .btn-secondary { flex: 1; background: rgba(255,255,255,0.03); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 18px; border-radius: 18px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .btn-secondary:hover { background: rgba(255,255,255,0.08); }
    .btn-primary { flex: 1; background: var(--secondary); color: var(--primary); border: none; padding: 18px; border-radius: 18px; font-weight: 900; cursor: pointer; font-size: 0.95rem; text-transform: uppercase; transition: 0.3s; }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(1); }

    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-fade { animation: fadeIn 0.8s ease-out; }
    .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

    /* Responsive */
    @media (max-width: 1280px) { .sidebar { width: 80px; padding: 20px 10px; } .logo-text, .nav-item span, .user-meta, .role { display: none; } .nav-item { justify-content: center; padding: 15px; } .logo-area { margin-bottom: 40px; justify-content: center; } .content-area { padding: 32px; } }
    @media (max-width: 768px) {
        /* MOBILE VIEW OPTIMIZATIONS (Prevent Horizontal Scroll) */
        .app-layout { flex-direction: column; height: 100vh; overflow-x: hidden; }
        .sidebar {
            width: 100% !important; height: auto !important; padding: 12px; border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            flex-direction: column !important; align-items: stretch !important; gap: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 100;
        }
        .logo-area { margin-bottom: 0; display: flex; justify-content: center; }
        .logo-area .brand-logo { height: 32px; }
        .side-nav { flex-direction: row; gap: 4px; justify-content: space-around; }
        .nav-item { padding: 10px; font-size: 0.75rem; flex: 1; flex-direction: column; gap: 4px; border-radius: 12px; }
        .nav-item lucide-icon { margin-right: 0; }
        .nav-item span { display: block; font-size: 0.65rem; }
        .user-profile { display: none; }

        .content-area { padding: 16px; flex: 1; overflow-y: auto; overflow-x: hidden; width: 100%; box-sizing: border-box; }
        .top-header { margin-bottom: 24px; gap: 12px; flex-direction: column; align-items: stretch; width: 100%; }
        .search-global { width: 100% !important; height: 48px; border-radius: 14px; }
        .header-actions { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .btn-sync, .btn-header-logout { height: 48px; width: 100%; border-radius: 14px; font-size: 0.85rem; }
        .client-logo { height: 35px; width: auto; margin: 10px auto; order: 10; }

        .metricas-grid { grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; box-sizing: border-box; }
        .chart-section { grid-template-columns: 1fr; gap: 16px; width: 100%; }
        .metric-info .value { font-size: 1.4rem; }
        .chart-container { padding: 16px; width: 100%; box-sizing: border-box; }
        .savings-card { order: -1; min-height: auto; padding: 20px; width: 100%; box-sizing: border-box; }
        .savings-value .number { font-size: 3.5rem; }
        .modal-window { padding: 20px; width: 95%; max-width: none; border-radius: 20px; }

        /* MOBIL TABLE TO CARDS - NO SLIDING */
        .table-scroll { overflow: visible !important; }
        .modern-table { border-spacing: 0; min-width: 0 !important; width: 100% !important; }
        .modern-table thead { display: none; }
        .modern-table tr {
            display: block;
            margin-bottom: 20px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 16px;
        }
        .modern-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            min-height: 44px;
            text-align: right !important;
            width: 100% !important;
        }
        .modern-table td:last-child { border-bottom: none; }
        .modern-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #94a3b8;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
        }
        .actions-col {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px;
            padding-top: 15px !important;
            border-bottom: none;
        }
        .btn-action-add { width: 100%; justify-content: center; height: 52px; font-weight: 800; border-radius: 16px; }
        .phone-col { justify-content: flex-end !important; }
        .toggle-col { justify-content: flex-end !important; }
    }

    /* Acciones premium */
    .action-group { display: flex; gap: 8px; justify-content: flex-end; }
    .edit-btn, .delete-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; transition: 0.2s; color: white; }
    .edit-btn { background: rgba(85, 193, 230, 0.1); color: var(--secondary); }
    .edit-btn:hover { background: var(--secondary); color: var(--primary); transform: scale(1.1); }
    .delete-btn { background: rgba(244, 63, 94, 0.1); color: var(--danger); }
    .delete-btn:hover { background: var(--danger); color: white; transform: scale(1.1); }

    /* Toasts CSS */
    .toast-container { position: fixed; top: 32px; right: 32px; z-index: 9999; pointer-events: none; }
    .toast-content { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-left: 4px solid var(--success); padding: 16px 24px; border-radius: 16px; display: flex; align-items: center; gap: 16px; color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.5); min-width: 300px; box-sizing: border-box; }
    .toast-container.error .toast-content { border-left-color: var(--danger); }
    .toast-content lucide-icon { color: var(--success); }
    .toast-container.error .toast-content lucide-icon { color: var(--danger); }
    .toast-content span { font-weight: 700; font-size: 0.95rem; }

    @media (max-width: 480px) {
        .content-area { padding: 12px; }
        .search-global { width: calc(100% - 10px) !important; margin: 0 auto; box-sizing: border-box; }
        .metricas-grid { grid-template-columns: 1fr; }
        .nav-item span { display: none; }
        .header-actions { grid-template-columns: 1fr; }
        .client-logo { grid-column: span 1; }
        .modal-window { padding: 24px; width: 95% !important; border-radius: 24px; margin: 10px; }
        .modal-header h2 { font-size: 1.4rem; }
        .modal-footer { flex-direction: column; }
    }

    /* Confirm Toast Styles */
    .confirm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }

    .confirm-toast {
        background: rgba(30, 41, 59, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 24px;
        border-radius: 28px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    .confirm-content {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
    }

    .confirm-icon.danger {
        width: 48px;
        height: 48px;
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .confirm-text h3 { margin: 0; color: #f8fafc; font-size: 1.2rem; }
    .confirm-text p { margin: 4px 0 0; color: #94a3b8; font-size: 0.9rem; }

    .confirm-actions {
        display: flex;
        gap: 12px;
    }

    .confirm-actions button {
        flex: 1;
        padding: 12px;
        border-radius: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
    }

    .btn-cancel {
        background: rgba(255, 255, 255, 0.05);
        color: #94a3b8;
    }
    .btn-cancel:hover { background: rgba(255, 255, 255, 0.1); color: #f8fafc; }

    .btn-confirm-delete {
        background: #ef4444;
        color: white;
    }
    .btn-confirm-delete:hover { background: #dc2626; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }

    .slide-up {
        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly authService = inject(AuthService);

  readonly activeTab = signal<'metricas' | 'terceros' | 'contactos' | 'listas'>('metricas');
  readonly searchTerm = signal('');
  readonly isSyncing = signal(false);
  readonly isSaving = signal(false);
  readonly sidebarCollapsed = signal(true);

  readonly metricas = signal<IMetrica[]>([]);
  readonly terceros = signal<ITercero[]>([]);
  readonly contactos = signal<IContacto[]>([]);
  readonly listas = signal<IListaPrecio[]>([]);

  readonly showModal = signal(false);
  readonly selectedTercero = signal<ITercero | null>(null);
  readonly isUpdating = signal<string | number | null>(null);
  readonly isUpdatingLista = signal<string | number | null>(null);
  readonly listSortDir = signal<'asc' | 'desc'>('asc');

  readonly currentYear = signal(new Date().getFullYear().toString());

  // Toasts
  readonly toastMsg = signal<string | null>(null);
  readonly toastType = signal<'success' | 'error'>('success');

  // Edición
  readonly isEditing = signal(false);
  readonly editingId = signal<string | number | null>(null);

  // Confirmación de Borrado
  readonly showConfirmToast = signal(false);
  readonly pendingDeleteContact = signal<IContacto | null>(null);

  newContact = {
    nombre: '',
    telefono: '',
    listaPrecio: 50001
  };

  constructor() {
    this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
    ).subscribe(term => {
        this.searchTerm.set(term);
    });

    // Escuchar el cambio de pestaña para reinicializar el chart si es necesario
    effect(() => {
        if (this.activeTab() === 'metricas' && this.metricas().length > 0) {
            // Un pequeño delay para asegurar que el DOM (*ngIf) se ha renderizado
            setTimeout(() => this.initChart(), 300);
        }
    });
  }

  readonly activeTabTitle = computed(() => {
    switch(this.activeTab()) {
        case 'metricas': return 'Dashboard Operativo';
        case 'terceros': return 'Directorio de Terceros';
        case 'contactos': return 'Gestión de Contactos';
        case 'listas': return 'Listas de Precios';
    }
  });

  readonly kpis = computed(() => {
    const data = this.metricas();
    const getVal = (label: string) => {
        const m = data.find(x => x.label === label);
        return Number(m?.value) || 0;
    };

    const stats = {
        pedidos: getVal('Pedidos Realizados'),
        asistencia: getVal('Asistencia Humana'),
        fueraHorario: getVal('Fuera de Horario'),
        errores: getVal('Errores Bot'),
        total: getVal('Total Interacciones')
    };

    return stats;
  });

  readonly hoursSaved = computed(() => {
    const pedidos = this.kpis().pedidos;
    const hours = (pedidos * 5) / 60;
    return hours < 10 ? hours.toFixed(1) : Math.round(hours).toString();
  });

  readonly filteredTerceros = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.terceros();

    return this.terceros().filter(t => {
      const nombre = String(t.Nombre || '').toLowerCase();
      const cuit = String(t.Nro_Documento || '').toLowerCase();
      const id = String(t.IdCtaAuxi || '').toLowerCase();

      return nombre.includes(term) || cuit.includes(term) || id.includes(term);
    });
  });

  readonly filteredContactos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.contactos().filter(c =>
        (c.Nombre?.toLowerCase() ?? '').includes(term) ||
        (c.Telefono?.toLowerCase() ?? '').includes(term) ||
        (c.IdCtaAuxi?.toLowerCase() ?? '').includes(term) ||
        (c.IdContacto?.toLowerCase() ?? '').includes(term)
    );
  });

  readonly filteredListas = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const sortDir = this.listSortDir();
    
    let result = [...this.listas()];

    if (term) {
      result = result.filter(l => {
        const nombre = String(l.Nombre || '').toLowerCase();
        const num = String(l.Numero || '').toLowerCase();
        return nombre.includes(term) || num.includes(term);
      });
    }

    return result.sort((a, b) => {
      const valA = Number(a.Numero) || 0;
      const valB = Number(b.Numero) || 0;
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  });

  private readonly searchSubject = new Subject<string>();


  onSearchChange(term: string): void {
      this.searchSubject.next(term);
  }

  trackTercero(_: number, t: ITercero): string {
      return t.IdCtaAuxi;
  }

  trackContacto(_: number, c: IContacto): string | number {
      return c.id;
  }

  trackLista(_: number, l: IListaPrecio): string | number {
      return l.Numero ?? l.Nombre;
  }

  ngOnInit() {
    this.fetchData();
  }

  fetchData(): void {
    this.isSyncing.set(true);
    this.dashboardService.fetchAll().subscribe({
        next: (data) => {
            this.metricas.set(data.metricas);
            this.terceros.set(data.terceros);
            this.contactos.set(data.contactos);
            this.listas.set(data.listas);
            this.isSyncing.set(false);
        },
        error: () => {
            this.isSyncing.set(false);
        }
    });
  }

  // Eliminado el método fetchListasDeTerceros anterior ya que ahora se trae directo del Arbol de Listas en fetchData()


  getDireccion(t: ITercero): string {
    // Si el nombre parece una dirección, evitamos duplicidad
    const dir = `${t.DomicilioCalle ?? ''} ${t.DomicilioNumero ?? ''} ${t.DomicilioLocalidad ?? ''}`.trim();
    if (t.Nombre && t.Nombre.includes(t.DomicilioCalle || '---')) return dir || 'Sin dirección';
    return dir || 'Sin dirección';
  }


  initChart() {
    const ctx = document.getElementById('mainChart') as HTMLCanvasElement;
    if (!ctx) return;

    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const visibleMetrics = this.metricas().filter(m => m.label !== 'Total Interacciones');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: visibleMetrics.map(m => m.label),
            datasets: [{
                data: visibleMetrics.map(m => Number(m.value) || 0),
                backgroundColor: ['#27c24c', '#f59e0b', '#64748b', '#f44336'],
                hoverOffset: 12,
                borderWidth: 0,
                borderRadius: 10
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: window.innerWidth < 480 ? 'bottom' : 'right',
                    align: 'center',
                    labels: {
                        color: '#94a3b8',
                        padding: 15,
                        font: { size: 11, weight: 'bold' },
                        usePointStyle: true
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            animation: { animateRotate: true, animateScale: true }
        }
    });
  }

  isBotActive(c: IContacto): boolean {
    return c.BotActivo === "1" || c.BotActivo === 1;
  }

  toggleBot(c: IContacto) {
    this.isUpdating.set(c.id);
    const newStatus = this.isBotActive(c) ? "0" : "1";

    // Buscamos el tercero para contexto completo (Dirección, Email, etc.)
    const t = this.terceros().find(x => x.IdCtaAuxi === c.IdCtaAuxi);

    const payload: IEditarContactoDto = {
        id: c.id,
        idCtaAuxi: c.IdCtaAuxi,
        idPpal: t?.IdPpal || '',
        idAuxi: t?.IdAuxi || '',
        nombre: c.Nombre,
        telefono: c.Telefono,
        direccion: t ? this.getDireccion(t) : '',
        email: t?.Email || '',
        listaPrecio: c.ListaPrecio,
        botActivo: newStatus
      };

    this.dashboardService.editarContacto(payload).subscribe({
        next: () => {
            this.fetchData();
            this.isUpdating.set(null);
            this.showToast(newStatus === "1" ? '¡Bot Activado!' : '¡Bot Desactivado!');
        },
        error: () => {
            this.isUpdating.set(null);
            this.showToast('Error al actualizar bot', 'error');
        }
    });
  }

  actualizarLista(lista: IListaPrecio) {
    if (!lista.Numero) {
        this.showToast('No se puede actualizar, falta el número de lista', 'error');
        return;
    }
    this.isUpdatingLista.set(lista.Numero);

    this.dashboardService.actualizarListaPrecio(lista.Numero).subscribe({
        next: () => {
            this.isUpdatingLista.set(null);
            this.showToast(`¡Lista ID: ${lista.Numero} actualizada correctamente!`);
        },
        error: () => {
            this.isUpdatingLista.set(null);
            this.showToast(`Error al actualizar la lista ID: ${lista.Numero}`, 'error');
        }
    });
  }

  toggleListSort() {
    this.listSortDir.set(this.listSortDir() === 'asc' ? 'desc' : 'asc');
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMsg.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toastMsg.set(null), 3500);
  }

  openAddContact(t: ITercero) {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.selectedTercero.set(t);
    this.newContact.nombre = t.Nombre;
    this.newContact.telefono = '';
    this.newContact.listaPrecio = 50001;
    this.showModal.set(true);
  }

  openEditContact(contact: IContacto) {
    const t = this.terceros().find(x => x.IdCtaAuxi === contact.IdCtaAuxi);
    this.isEditing.set(true);
    this.editingId.set(contact.id);
    this.selectedTercero.set(t || null);
    this.newContact.nombre = contact.Nombre;
    this.newContact.telefono = contact.Telefono;
    this.newContact.listaPrecio = contact.ListaPrecio;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedTercero.set(null);
  }

  confirmDelete(contact: IContacto) {
    this.pendingDeleteContact.set(contact);
    this.showConfirmToast.set(true);
  }

  cancelDelete() {
    this.showConfirmToast.set(false);
    this.pendingDeleteContact.set(null);
  }

  executeDelete() {
    const contact = this.pendingDeleteContact();
    if (!contact) return;

    this.showConfirmToast.set(false);
    this.dashboardService.eliminarContacto(contact).subscribe({
      next: () => {
        this.fetchData();
        this.showToast('¡Contacto eliminado con éxito!');
        this.pendingDeleteContact.set(null);
      },
      error: (err) => {
        console.error('Error al eliminar contacto:', err);
        this.showToast('No se pudo eliminar el contacto', 'error');
        this.pendingDeleteContact.set(null);
      }
    });
  }

  saveContact() {
    const t = this.selectedTercero();
    if (!t) return;

    this.isSaving.set(true);

    if (this.isEditing()) {
      const payload: IEditarContactoDto = {
        id: this.editingId()!,
        idCtaAuxi: t.IdCtaAuxi,
        idPpal: t.IdPpal,
        idAuxi: t.IdAuxi,
        nombre: this.newContact.nombre,
        telefono: this.newContact.telefono,
        direccion: this.getDireccion(t),
        email: t.Email || '',
        listaPrecio: this.newContact.listaPrecio,
        botActivo: "1"
      };

      this.dashboardService.editarContacto(payload).subscribe({
        next: () => {
          this.fetchData();
          this.isSaving.set(false);
          this.closeModal();
          this.showToast('¡Contacto actualizado correctamente!');
        },
        error: () => {
          this.isSaving.set(false);
          this.showToast('Error al actualizar el contacto', 'error');
        }
      });
    } else {
      const payload: ICrearContactoDto = {
        idCtaAuxi: t.IdCtaAuxi,
        idPpal: t.IdPpal,
        idAuxi: t.IdAuxi,
        nombre: this.newContact.nombre,
        telefono: this.newContact.telefono,
        direccion: this.getDireccion(t),
        email: t.Email || '',
        listaPrecio: this.newContact.listaPrecio,
        botActivo: "1"
      };

      this.dashboardService.crearContacto(payload).subscribe({
        next: () => {
          this.fetchData();
          this.isSaving.set(false);
          this.closeModal();
          this.activeTab.set('contactos');
          this.showToast('¡Contacto creado con éxito!');
        },
        error: () => {
          this.isSaving.set(false);
          this.showToast('Error al crear el contacto', 'error');
        }
      });
    }
  }
}
