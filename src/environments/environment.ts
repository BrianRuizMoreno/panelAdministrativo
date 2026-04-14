export const environment = {
    production: true,
    apiUrl: 'https://autogestion.labolsadecafe.com.ar/phy2service/api/core/auth',

    serial: '00735_01',
    idEmpresa: '00001',
    sigesUrl: 'https://autogestion.labolsadecafe.com.ar/phy2service/api/siges',
    sifacUrl: 'https://autogestion.labolsadecafe.com.ar/phy2service/api/sifac',
    webhooks: {
        base: 'https://n8n.bolsadecafe.cloud/webhook',
        authProxy: '/auth-proxy',
        metricas: '/api-metricas',
        terceros: '/api-terceros',
        contactos: '/api-contactos',
        actualizarBot: '/actualizar-bot',
        crearContacto: '/crear-contacto-bot',
        eliminarContacto: '/borrar-contacto',
        actualizarLista: '/actualizar-lista-precios'
    }
};
