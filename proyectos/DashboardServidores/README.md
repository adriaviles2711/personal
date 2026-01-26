# 🖥️ Server Monitoring Dashboard

Dashboard profesional de monitorización de servidores en tiempo real con control completo sobre contenedores Docker.

## ✨ Características

### Monitorización en Tiempo Real
- **Estadísticas del Sistema**: CPU, Memoria, Disco, Red
- **Ping Monitoring**: Latencia y pérdida de paquetes
- **Health Score**: Puntuación de salud basada en múltiples métricas
- **WebSocket**: Actualizaciones automáticas cada 5 segundos

### Control de Servidores
- **Start/Stop/Restart**: Control completo de contenedores Docker
- **Ejecución Remota**: Ejecuta comandos SSH en servidores
- **Plantillas**: Comandos predefinidos para tareas comunes
- **Logs**: Visualización de logs de contenedores

### Visualización
- **Gráficos Interactivos**: Charts.js para CPU, memoria, disco y ping
- **Carousel**: Vista general rotativa de servidores
- **Sistema de Alertas**: Notificaciones basadas en umbrales
- **Códigos de Color**: Verde (normal), Amarillo (advertencia), Rojo (crítico)

### Diseño
- **Responsive**: Adaptado para móvil, tablet y escritorio
- **Tema Oscuro**: Diseño moderno con glassmorphism
- **Animaciones**: Transiciones suaves y micro-interacciones
- **Profesional**: Colores vibrantes y tipografía moderna

## 🏗️ Arquitectura

```
DashboardServidores/
├── backend/                 # Node.js Backend
│   ├── server.js           # Servidor principal
│   ├── config.js           # Configuración
│   ├── ssh-manager.js      # Gestión SSH
│   ├── docker-manager.js   # Control Docker
│   ├── stats-collector.js  # Recolección de estadísticas
│   ├── ping-service.js     # Servicio de ping
│   ├── websocket-handler.js # Manejo de WebSocket
│   └── routes/             # API REST
│       ├── servers.js
│       ├── commands.js
│       └── monitoring.js
│
├── frontend/               # Frontend Vanilla JS
│   ├── index.html
│   ├── css/
│   │   ├── styles.css     # Estilos principales
│   │   └── responsive.css # Diseño responsive
│   └── js/
│       ├── app.js         # Controlador principal
│       ├── api.js         # Capa de comunicación
│       ├── websocket.js   # Cliente WebSocket
│       ├── dashboard.js   # Gestión del dashboard
│       ├── charts.js      # Gráficos
│       ├── carousel.js    # Carousel
│       ├── commands.js    # Ejecución de comandos
│       └── utils.js       # Utilidades
│
├── monitored-server/       # Imagen Docker de servidores
│   ├── Dockerfile
│   └── setup.sh
│
├── Dockerfile              # Dashboard container
├── docker-compose.yml      # Orquestación completa
└── README.md
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker Desktop instalado y ejecutándose
- Git (opcional)

### Instalación y Ejecución

1. **Clonar o navegar al directorio**
   ```bash
   cd C:\Users\adria\Desktop\DashboardServidores
   ```

2. **Construir y levantar todos los contenedores**
   ```bash
   docker-compose up --build
   ```

3. **Acceder al dashboard**
   - Abrir navegador en: http://localhost:3000
   - El WebSocket se conectará automáticamente al puerto 3001

4. **Detener los contenedores**
   ```bash
   docker-compose down
   ```

### Ejecución en Segundo Plano
```bash
docker-compose up -d
```

Ver logs:
```bash
docker-compose logs -f dashboard
```

## 🔧 Configuración

### Variables de Entorno

Copiar `.env.example` a `.env` y ajustar:

```env
PORT=3000
WS_PORT=3001
SSH_USER=monitor
SSH_PASSWORD=monitor123
```

### Umbrales de Alertas

Ajustar en `backend/config.js`:

```javascript
thresholds: {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 75, critical: 90 },
  disk: { warning: 80, critical: 95 },
  ping: { warning: 100, critical: 500 }
}
```

## 📡 API Endpoints

### Servidores
- `GET /api/servers` - Listar todos los servidores
- `GET /api/servers/:id` - Detalles de un servidor
- `POST /api/servers/:id/start` - Iniciar servidor
- `POST /api/servers/:id/stop` - Detener servidor
- `POST /api/servers/:id/restart` - Reiniciar servidor
- `GET /api/servers/:id/stats` - Estadísticas actuales
- `GET /api/servers/:id/logs` - Logs del contenedor

### Comandos
- `POST /api/commands/execute` - Ejecutar comando
- `GET /api/commands/history` - Historial de comandos
- `GET /api/commands/templates` - Plantillas de comandos

### Monitorización
- `GET /api/monitoring/ping/:id` - Historial de ping
- `GET /api/monitoring/alerts` - Todas las alertas
- `GET /api/monitoring/overview` - Vista general

## 🔌 WebSocket Events

### Cliente → Servidor
- `subscribe` - Suscribirse a actualizaciones de un servidor
- `unsubscribe` - Desuscribirse
- `ping` - Verificar conexión

### Servidor → Cliente
- `stats_update` - Actualización de estadísticas
- `ping_update` - Actualización de ping
- `alert` - Nueva alerta
- `status_change` - Cambio de estado del servidor

## 🎨 Personalización

### Colores
Editar variables CSS en `frontend/css/styles.css`:

```css
:root {
  --color-primary: #6366f1;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
}
```

### Intervalos de Monitorización
Ajustar en `backend/config.js`:

```javascript
monitoring: {
  statsInterval: 5000,    // 5 segundos
  pingInterval: 10000,    // 10 segundos
  healthCheckInterval: 30000  // 30 segundos
}
```

## 🐛 Troubleshooting

### Los servidores no se conectan
- Verificar que Docker Desktop esté ejecutándose
- Comprobar que los contenedores estén en la misma red
- Revisar logs: `docker-compose logs server1`

### WebSocket no conecta
- Verificar que el puerto 3001 no esté en uso
- Comprobar firewall de Windows
- Revisar consola del navegador

### Comandos SSH fallan
- Verificar credenciales SSH en `backend/config.js`
- Esperar a que los servidores estén completamente iniciados
- Probar conexión manual: `docker exec dashboard ssh monitor@server1`

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (1 columna, táctil optimizado)
- **Tablet**: 768px - 1024px (2 columnas)
- **Desktop**: > 1024px (Grid completo)

## 🔐 Seguridad

**⚠️ IMPORTANTE**: Este dashboard está diseñado para uso local/desarrollo.

Para producción:
- Cambiar credenciales SSH por defecto
- Implementar autenticación en el frontend
- Usar HTTPS/WSS
- Restringir acceso a API mediante tokens
- Configurar firewall apropiado

## 📝 Tecnologías Utilizadas

### Backend
- **Node.js** + Express
- **ssh2** - Conexiones SSH
- **dockerode** - Control de Docker
- **ws** - WebSocket server
- **ping** - Monitoreo de red

### Frontend
- **HTML5** + **CSS3** + **JavaScript** (Vanilla)
- **Chart.js** - Visualización de datos
- **Google Fonts** (Inter)

### Infraestructura
- **Docker** + **Docker Compose**
- **Ubuntu 22.04** para servidores monitoreados

## 🤝 Contribuir

Este proyecto fue creado para propósitos de monitorización local. Siéntete libre de:
- Reportar bugs
- Sugerir nuevas características
- Enviar pull requests

## 📄 Licencia

MIT License - Uso libre para proyectos personales y comerciales.

## 👨‍💻 Autor

Creado con ❤️ usando Node.js y JavaScript vanilla.

---

**¿Necesitas ayuda?** Revisa los logs con `docker-compose logs -f` o abre un issue.
