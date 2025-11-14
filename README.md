# Metrex

Middleware para Express que instrumenta tu API y expone una ruta con un dashboard de métricas ligero (RPS, latencias, status codes y top rutas). Sin dependencias de runtime, sólo `express` como peer.

## Instalación

```bash
npm install metrex
```

> Nota: si vas a publicar con otro nombre, reemplaza `metrex` por el definitivo.

## Uso rápido

```js
const express = require('express');
const { useMetrex } = require('metrex');

const app = express();

// Instrumenta globalmente y monta el dashboard en /metrex
useMetrex(app, { routePath: '/metrex' });

app.get('/hello', (req, res) => res.json({ ok: true }));

app.listen(3000, () => {
  console.log('Metrex en http://localhost:3000/metrex');
});
```

Abre `http://localhost:3000/metrex` para ver el dashboard. El endpoint `GET /metrex/data` expone un JSON con el snapshot actual de métricas.

## Opciones

- `routePath` (string): ruta base del dashboard. Por defecto `/metrex`.
- `historySize` (number): cantidad de eventos a retener en memoria (por defecto 2000).
- `shouldTrack(req)` (function): función filtro; devuelve `false` para no contar un request.
- `excludePaths` (string[] | RegExp[]): paths a excluir de la instrumentación.
- `slowThreshold` (number): umbral en ms para marcar requests lentos (reservado para futuras mejoras).

## Recomendaciones

- Móntalo antes de tus rutas de negocio: `app.use(metrex())` al inicio para capturar todas.
- Si usas paths sensibles, exclúyelos con `excludePaths`.
- Para entornos multiinstancia, considera agregar un endpoint `/health` excluido para no sesgar las métricas.

## Endpoints

- `GET {routePath}`: HTML del dashboard.
- `GET {routePath}/data`: JSON con métricas agregadas.

## Ejemplo local

```bash
npm run example
# abre http://localhost:3000/metrex
```

## Licencia

ISC
