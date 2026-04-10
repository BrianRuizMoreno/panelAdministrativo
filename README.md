# ☕ Bolsa de Café - Panel Administrativo

> **Premium Admin Dashboard for ERP Physis Integration**

Este proyecto es una Progressive Web App (PWA) de alto rendimiento diseñada para la gestión operativa y administración de bots de mensajería para **Physis SRL**. Construida sobre Angular moderno (Signals), ofrece una interfaz fluida, segura y reactiva para el control de terceros y contactos operativos.

---

## 🚀 Vision General
El Panel Administrativo actúa como una capa de orquestación visual que conecta los datos maestros del ERP Physis con la lógica automatizada de n8n. Permite a los administradores:
- Visualizar métricas operativas en tiempo real.
- Gestionar un directorio inteligente de terceros.
- Administrar el ciclo de vida de los bots (Alta, Baja, Modificación y Estado).

---

## 🛠️ Stack Tecnológico
- **Frontend**: Angular 20+ (Signals, Standalone Components).
- **Estilo**: CSS Vanilla Premium (Glassmorphism & Dark Mode).
- **Iconografía**: Lucide Angular & FontAwesome.
- **Gráficos**: Chart.js reactivo.
- **Orquestación**: n8n Webhooks (POST Architecture).
- **Persistencia**: PostgreSQL (via n8n).

---

## 📦 Instalación y Despliegue

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm start

# 3. Compilar para producción (PWA)
npm run build
```

---

## 🌐 Configuración de Entorno (`environment.ts`)
El dashboard se comunica exclusivamente mediante Webhooks de n8n. Asegúrate de configurar las URLs base en el archivo de entorno:

```typescript
webhooks: {
    base: 'https://n8n.tudominio.com/webhook',
    metricas: '/api-metricas',
    terceros: '/api-terceros',
    contactos: '/api-contactos',
    actualizarBot: '/actualizar-bot',    // Cierra el ciclo de edición y estado
    crearContacto: '/crear-contacto-bot',
    eliminarContacto: '/eliminar-contacto'
}
```

---

## ✨ Características Principales
1. **Offline-First Ready**: Diseñado bajo estándares PWA para resiliencia de red.
2. **Arquitectura Reactiva**: Uso de Signals para gestión de estado sin `any` y con tipado estricto.
3. **Validación Delegada**: Lógica de negocio pesada procesada en n8n/Physis APIs para un cliente ligero.
4. **Diseño Mobile-First**: Adaptabilidad total desde smartphones hasta monitores ultra-wide.

---

## 🔒 Seguridad y Arquitectura
- **Sesión**: Persistencia activa mientras la app esté en memoria; invalidación automática tras cierre de proceso.
- **Retries**: Configuración de reintentos automáticos (x3) para comunicaciones críticas con los endpoints.
- **Payloads Limpios**: El frontend solo recolecta y envía; n8n se encarga de la lógica de plantillas y mapeo ERP.

---

## 📝 Soporte Técnica
Desarrollado para **Bolsa de Café** integrando flujos nativos de **Physis Informática SRL**.

---
© 2026 Physis SRL. Todos los derechos reservados.
