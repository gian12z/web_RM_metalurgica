# RM Metalúrgica - Dockerización

Este proyecto está dockerizado con una arquitectura de microservicios separando frontend, backend y base de datos.

## Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend      │    │   Base Datos    │
│    (Nginx)      │◄──►│   (Node.js)      │◄──►│    (MySQL)      │
│    Puerto 80    │    │   Puerto 4000    │    │   Puerto 3306   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Componentes:

- **Frontend**: Nginx sirviendo archivos estáticos (HTML, CSS, JS, imágenes)
- **Backend**: API Node.js + Express con autenticación JWT
- **Base de Datos**: MySQL 8.0 con persistencia de datos
