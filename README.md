# Bills App

Aplicación de seguimiento de gastos personales que permite importar extractos bancarios (Excel y PDF), categorizar transacciones automáticamente y visualizar estadísticas con gráficos interactivos, comparaciones mensuales e interanuales.

## Funcionalidades

- **Importación de extractos**: Soporte para Excel (BBVA, Santander cuenta) y PDF (Santander tarjeta de crédito)
- **Categorización automática**: Las transacciones se clasifican automáticamente según patrones configurables
- **Dashboard interactivo**: Vista general con KPIs, distribución por categoría (donut), tendencia mensual y gastos por categoría
- **Comparaciones temporales**: Gasto actual vs mes anterior, vs mismo mes del año anterior con indicadores de cambio porcentual
- **Análisis detallado**: Gráficos de barras apiladas por categoría con desglose mensual
- **Tabla de transacciones**: Lista virtualizada con búsqueda y edición inline
- **Notificaciones por email**: Recordatorio mensual automático para subir extractos

## Tecnologías

### Backend
- **Node.js** + **Express** con **TypeScript**
- **MongoDB** + **Mongoose**
- **Multer** para carga de archivos
- **XLSX** para hojas de cálculo + **pdf-parse** para PDFs
- **Resend** para email + **node-cron** para tareas programadas

### Frontend
- **React 18** con **TypeScript**
- **Vite** como bundler
- **Redux Toolkit** con `createAsyncThunk`
- **React Router v6**
- **Styled Components** con variables CSS (design tokens)
- **ECharts** (donut, líneas de tendencia, barras apiladas)
- **TanStack React Table** + **react-window** (tabla virtualizada)
- **Framer Motion** para animaciones

## Estructura del proyecto

```
billsApp/
├── backend/
│   └── src/
│       ├── controllers/     # Controladores HTTP (thin layer)
│       ├── services/        # Lógica de negocio
│       │   ├── dataService.ts
│       │   ├── analyticsService.ts
│       │   ├── dashboardService.ts
│       │   └── sheetService.ts
│       ├── models/          # Schemas de Mongoose
│       ├── routes/          # Rutas REST
│       ├── middleware/      # Error handling
│       ├── utils/           # Parsers (Excel + PDF), email
│       ├── types/           # Interfaces TypeScript
│       └── data/            # Configuración estática
├── frontend/
│   └── src/
│       ├── components/      # UI reutilizables
│       │   └── charts/      # DonutChart, TrendChart, CategoryBarChart
│       ├── pages/           # Home, Analytics, Transactions, Upload
│       ├── redux/           # Store, slices, thunks, typed hooks
│       ├── utils/           # Funciones de formato
│       └── types.ts         # Tipos compartidos
```

## Instalación

### Requisitos previos
- Node.js >= 18
- MongoDB (local o Atlas)

### Backend

```bash
cd backend
cp .env.example .env    # Configura las variables de entorno
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env    # Configura la URL del backend
npm install
npm run dev
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dashboard?year=2026&month=1` | Dashboard con KPIs, comparaciones y gráficos |
| GET | `/api/data` | Todas las transacciones |
| GET | `/api/data/categories` | Categorías |
| GET | `/api/data/analytics?category=X&from=...&to=...` | Analytics por categoría |
| PATCH | `/api/data/:id` | Actualizar transacción |
| DELETE | `/api/data/:id` | Eliminar transacción |
| POST | `/api/sheets/upload` | Subir extracto (Excel o PDF) |

## Bancos soportados

| Banco | Formato | Tipo |
|-------|---------|------|
| BBVA | Excel (.xls, .xlsx) | Cuenta corriente |
| Santander | Excel (.xls, .xlsx) | Cuenta corriente |
| Santander | PDF | Tarjeta de crédito |

### Agregar un nuevo banco

1. Añadir configuración en `backend/src/data/bank.json`
2. Para Excel: implementar `BankParser` en `backend/src/utils/bankParsers.ts`
3. Para PDF: añadir parser en `backend/src/utils/pdfParser.ts`
4. Añadir opción en el dropdown de `frontend/src/pages/Upload/Upload.tsx`
