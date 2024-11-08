# GeoTransporteAPP - Aplicación de Geolocalizacion de Transporte Publico

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribución](#contribución)

## Descripción


GeoTransporteAPP es una aplicación móvil avanzada de geolocalización diseñada para facilitar el acceso a la información en tiempo real sobre el transporte público, optimizando la experiencia tanto de usuarios finales como de socios y trabajadores. Su objetivo principal es mejorar la eficiencia y la visibilidad del transporte en diversas áreas, permitiendo a los usuarios consultar la ubicación de vehículos, así como la llegada estimada de los mismos.

Además, GeoTransporteAPP está estructurada para brindar un entorno completo de administración para los socios de transporte, quienes pueden gestionar múltiples elementos clave como sus trabajadores, vehículos, rutas, y paraderos. Cada socio tiene control individual sobre su flota y su personal, lo que permite una experiencia personalizada y adaptada a las necesidades específicas de cada empresa o entidad
## Características

- **Login:** Login de socios y conductores, y acceso seguro mediante autenticación.
- **Gestión Integral para Socios:** Los socios pueden gestionar todos los aspectos de su operación, incluyendo:
---------------------------------**Trabajadores:** Agregar y gestionar perfiles de conductores y otro personal operativo.
---------------------------------**Vehículos:** Administración de vehículos en su flota, asignación de conductores, y estado de cada vehículo.
---------------------------------**Rutas y Paraderos:** Configuración de rutas y paraderos para facilitar la geolocalización y el seguimiento de los vehículos en tiempo real.
- **Historial de Conductore:** Acceso al historial de envíos realizados.
- **Mapa Publico:** Mapa publico para todos las visistas con los vehiculos y conductores en ruta segun su ubicación.
- **Perfil de Conductor:** Gestión de los vehiculos disponibles, y rutas a seleccionar para iniciar ruta.

## Tecnologías Utilizadas

- **Ionic Framework**: Para el desarrollo de la interfaz de usuario y la lógica de la aplicación.
- **Angular**: Framework utilizado en conjunto con Ionic para el desarrollo frontend.
- **Firebase**: Backend para la gestión de la base de datos y autenticación.
- **Capacitor**: Para la integración nativa con dispositivos móviles.
- **Google Maps API**: Para la localización y visualización de ubicaciones.

## Requisitos Previos

Antes de empezar, asegúrate de tener instaladas las siguientes herramientas:

- Node.js (versión actual)
- Ionic CLI (versión actual)
- Android Studio (para pruebas en dispositivos móviles)

## Instalación

Sigue estos pasos para instalar el proyecto:

1. Clona el repositorio desde GitHub:
   ```bash
   git clone https://github.com/MiguelAHM99/Grupo01_Capstone_07D.git

2. Navega al directorio del proyecto e instala las dependencias:
   ```bash
   cd GeoTransporteAPP

3.  variables de entorno node.js :

```bash

  ng add @angular/fire
  npm install -g firebase-tools
  npm install uuid
  npm install --save-dev @types/node
  npm install @capacitor/geolocation
  npm install @capacitor/google-maps

```


1. Para iniciar el proyecto en modo de desarrollo, utiliza el siguiente comando:
    ```bash
    ionic serve
  
Para probar el proyecto en un dispositivo móvil, abre el proyecto en Android Studio y conéctalo a un dispositivo o emulador.

## Estructura del Proyecto



1. La estructura principal del proyecto es la siguiente:
   ```bash
   
    GeoTransporteAPP/
    ├── src/
    │   ├── app/
    │   │   ├── common/
    │   │   │   ├── models/
    │   │   │   ├── services/
    │   │   ├── pages/
    │   │   │   ├── admin-diver/
    │   │   │   ├── admin-edit-diver/
    │   │   │   ├── admin-edit-rute/
    │   │   │   ├── admin-edit-vehicle/
    │   │   │   ├── admin-panel/
    │   │   │   ├── admin-rute/
    │   │   │   ├── admin-vehicle/
    │   │   │   ├── driver-map/
    │   │   │   ├── inicio/
    │   │   │   ├── login/
    │   │   │   └── user/
    │   └── assets/
    │   └── environments/
    └── ...

