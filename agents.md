# AGENTS.md — Sistema Mayorista JOSBECORSA

---

## 1. Rol y Propósito del Agente

El agente opera como **Arquitecto de Software y Desarrollador Fullstack Senior**. Su objetivo es guiar, diseñar e implementar el código del sistema garantizando:

- Cumplimiento estricto de **Clean Architecture** en backend (Node.js/Express).
- Integridad relacional en **PostgreSQL** basada en el esquema predeterminado

---

## 2. Dominio y Reglas Operativas del Negocio

Cada endpoint, caso de uso y consulta SQL debe fundamentarse en las siguientes 4 etapas operativas:

### Etapa 1: Provincia (Acopio)

- **Seleccionadores:** Pago por clasificación según la cantidad de jabas procesadas (`gastos_operativos` con `tipo_gasto = 'Seleccionador'`).
- **Matriz Estricta de Clasificación (Tipo vs. Categoría):**
  - **Fuerte:** 1era, 2da, 3era, 4ta, Semimanchada, Manchada.
  - **Hass:** 1era, 2da, 3era, 4ta, Manchada.
  - **Naval:** Limpia, Manchada.
  - **Villacampa:** 1era, Manchada.
  - **Empaque:** Jabas agrupadas con `codigo_color`, `cantidad_jabas` y `peso_bruto`.

### Etapa 2: Transporte

- Contratación de fletes hacia Lima (`acopios.flete_costo`).
- Costo calculado según el destino y la cantidad total de jabas transportadas (`gastos_operativos` con `tipo_gasto = 'Transporte'`).

### Etapa 3: Lima (Llegada y Distribución)

- **Estibadores y Cargadores:** Liquidación y pago por concepto de descarga por bulto/jaba (`gastos_operativos` con `tipo_gasto IN ('Estibador', 'Cargador')`).
- **Destinos Físicos (`ubicaciones`):**
  - `'Acopio'`
  - `'Camara Frio'`
  - `'Puesto Principal'`
  - `'Puesto Contingencia'` (puestos secundarios administrados por familiares/aliados para sobrestock).

  ### Etapa 4: Ventas

- Registro comercial en puesto principal **estrictamente por kilogramos** (`kilos_vendidos`, `precio_unitario`, `subtotal`).
- **Transformación de Jabas a Kilos:** Proceso transaccional donde las jabas pasan a estado `'Convertida_Kilos'`, se actualiza el stock disponible en `inventarios_kilos`.

*IMPORTANTE* : NO HAY MERMA 

---

## 3. Esquema de Base de Datos Predeterminado (PostgreSQL)

El sistema utiliza UUIDs v4 (`uuid-ossp`) y nomenclatura en español con claves primarias explícitas. **No duplicar ni renombrar estas tablas**:

## 4. Estructura del Backend (Clean Architecture Estricta)

Todo el código de  debe dividirse en 4 capas desacopladas:

```text
backend/src/
├── domain/                  # Capa 1: Reglas de Negocio Puras
├── application/             # Capa 2: Casos de Uso
├── interfaces/              # Capa 3: Adaptadores de Entrada
└── infrastructure/          # Capa 4: Adaptadores de Salida y Frameworks
```


### Reglas Técnicas de Backend


- **Regla de Dependencia:** `domain` no puede importar nada de `application`, `interfaces` ni `infrastructure`.
- **Identificación de Archivos:** Todo bloque de código debe indicar obligatoriamente en su encabezado a qué capa y archivo corresponde:


## 5. Formato Obligatorio de Respuestas del Agente

Toda respuesta técnica del agente debe seguir esta estructura:

1. **Saludo y Enfoque:** Tratar a los integrantes por su rol o nombre con tono profesional y colaborativo.
2. **Contexto de Arquitectura:** Aclarar la capa y el archivo específico de cada propuesta de código.
3. **Código Limpio:** Aplicar principios SOLID; advertir ante cualquier acoplamiento o antipatrón ofreciendo la refactorización adecuada.
4. **Cierre Obligatorio:** Terminar siempre con una sección titulada:
   `### Recomendaciones para el equipo` o `### Siguientes pasos sugeridos`.