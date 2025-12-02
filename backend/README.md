# Blockchain Document Manager

Sistema de gestión de documentos con registro en blockchain Ethereum, almacenamiento en MinIO y análisis con IA.

## 🚀 Características

- **Registro en Blockchain**: Documentos registrados en Ethereum (Sepolia testnet)
- **Almacenamiento Descentralizado**: Archivos almacenados en MinIO/S3
- **Análisis con IA**: Resúmenes automáticos de PDFs usando Google Gemini
- **Propiedad de Usuario**: Los usuarios firman transacciones con su wallet (Metamask)
- **Vista Previa Web**: Visualización de documentos en el navegador
- **Control de Acceso**: Sistema de propietarios en el smart contract

## 📋 Requisitos

- Go 1.21+
- MinIO o S3 compatible
- Cuenta de Ethereum (Sepolia testnet)
- API Key de Google Gemini
- Metamask instalado en el navegador

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd backend
```

2. **Instalar dependencias**
```bash
go mod download
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Ejecutar el servidor**
```bash
go run main.go
```

El servidor estará disponible en `http://localhost:8080`

## 📁 Estructura del Proyecto

```
backend/
├── cmd/                    # Herramientas CLI
├── config/                 # Configuración
├── contracts/              # Smart contracts
├── controllers/            # Controladores HTTP
├── routes/                 # Definición de rutas
├── services/               # Lógica de negocio
├── public/                 # Frontend
└── docs/                   # Documentación
```

## 🔧 Configuración

Ver [docs/SETUP.md](docs/SETUP.md) para instrucciones detalladas de configuración.

## 📚 API

Ver [docs/API.md](docs/API.md) para documentación completa de la API.

## 🏗️ Arquitectura

- **Backend**: Go + Gin framework
- **Blockchain**: Ethereum (Solidity 0.8.30)
- **Storage**: MinIO/S3
- **AI**: Google Gemini via LangChain
- **Frontend**: HTML + JavaScript + Ethers.js

## 🔐 Seguridad

- Las transacciones son firmadas por el usuario en el frontend
- El backend NO maneja claves privadas de usuarios
- Control de acceso mediante sistema de propietarios en el contrato

## 📝 Licencia

MIT

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.
