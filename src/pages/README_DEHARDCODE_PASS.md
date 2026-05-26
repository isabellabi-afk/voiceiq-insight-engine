# Dashboard de-hardcoding pass

Primera pasada para subir a GitHub sin datos inventados en frontend.

## Cambios principales

- `apiService.ts`
  - `BASE_URL` ahora usa `VITE_API_BASE_URL` y mantiene Railway solo como default temporal.
  - Se eliminaron `volume_trend_pct: "+12%"` y `response_rate: 85` como fallbacks ficticios.
  - `getReviews` acepta `business_name` para reutilizar la misma función en páginas filtradas.
  - `getPerformanceReviews` centraliza la carga de reviews para series temporales.

- `Performance.tsx`
  - El gráfico temporal ya no crea meses sintéticos `Oct-Mar`.
  - Agrupa reviews reales por mes usando `date`.
  - Si backend no envía growth, muestra `N/A` en vez de inventar `+14.2%`.

- `MarketExplorer.tsx`
  - Eliminada distancia simulada.
  - La tabla muestra ciudad/categoría si API las devuelve.
  - Radar usa ratios calculados desde reviews reales, sin constantes `60/75/85`.

- Textos UI
  - Se reemplazaron menciones internas como `Railway`, `SQLite`, `SQL Ledger` por textos genéricos de API/data.

## Variables de entorno sugeridas

Crear `.env` local:

```bash
VITE_API_BASE_URL=https://web-production-12dfb.up.railway.app
```

En GitHub no subir `.env`; subir `.env.example`.
