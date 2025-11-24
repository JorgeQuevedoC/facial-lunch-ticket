# Sistema de Comedor Industrial

Sistema de tickets de comida con reconocimiento facial usando ZKTeco G3-Pro, Next.js, Supabase y impresora térmica Bluetooth.

## 🎯 Características

- **Reconocimiento facial** con terminal ZKTeco G3-Pro
- **Un ticket por empleado por día** (validación automática)
- **Impresión automática** de tickets térmicos
- **Dashboard en tiempo real** con actualización automática
- **Sin autenticación** para acceso rápido en red local

## 📋 Requisitos

- Node.js 18+
- Yarn
- Supabase account (gratis)
- ZKTeco G3-Pro biometric terminal
- Impresora térmica Bluetooth Redlemon 58mm
- Red local (para conectar el dispositivo ZKTeco)

## 📚 Documentation Guide

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick setup in 6 steps (30 minutes)
- **[DEVICE-INTEGRATION-GUIDE.md](./DEVICE-INTEGRATION-GUIDE.md)** - Comprehensive ZKTeco device integration guide (read this before connecting hardware!)
- **[README.md](./README.md)** - Complete technical documentation (this file)
- **[supabase-setup.sql](./supabase-setup.sql)** - Database schema and setup

**👉 First time connecting the ZKTeco device? Start with [DEVICE-INTEGRATION-GUIDE.md](./DEVICE-INTEGRATION-GUIDE.md)**

## 🚀 Instalación

### 1. Clonar e instalar dependencias

```bash
# Las dependencias ya están instaladas
yarn install
```

### 2. Configurar Supabase

#### Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu **Project URL** y **Anon Key** (los necesitarás más adelante)

#### Crear las tablas

En el SQL Editor de Supabase, ejecuta:

```sql
-- Tabla de empleados
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- Tabla de comidas registradas
CREATE TABLE meals_taken (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice único: un empleado solo puede comer una vez por día
CREATE UNIQUE INDEX meals_unique_daily
ON meals_taken (employee_id, (timestamp::date));

-- Índice para consultas rápidas
CREATE INDEX idx_meals_timestamp ON meals_taken(timestamp DESC);
CREATE INDEX idx_meals_employee ON meals_taken(employee_id);
```

#### Insertar empleados de ejemplo

```sql
-- Agregar algunos empleados de prueba
-- IMPORTANTE: Los IDs deben coincidir con los PINs en el dispositivo ZKTeco
INSERT INTO employees (id, name, active) VALUES
  (1, 'Juan Pérez', true),
  (2, 'María González', true),
  (3, 'Carlos López', true),
  (23, 'Ana Martínez', true);
```

### 3. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# ZKTeco Device
ZKTECO_SERIAL_NUMBER=BFQM235560021

# Thermal Printer
PRINTER_INTERFACE=/dev/tty.Bluetooth-Incoming-Port
# Windows: COM3, COM4, etc.
# Mac: /dev/tty.Bluetooth-Incoming-Port
# Linux: /dev/rfcomm0
```

### 4. Configurar impresora térmica Bluetooth

#### En macOS:

1. Abre **Preferencias del Sistema** → **Bluetooth**
2. Enciende la impresora térmica
3. Empareja el dispositivo (nombre: "BlueTooth Printer" o similar)
4. Anota el puerto en `.env.local` (generalmente `/dev/tty.Bluetooth-Incoming-Port`)

#### En Windows:

1. Abre **Configuración** → **Dispositivos** → **Bluetooth**
2. Empareja la impresora
3. Ve a **Panel de Control** → **Dispositivos e impresoras**
4. Haz clic derecho en la impresora → **Propiedades** → pestaña **Hardware**
5. Anota el puerto COM (ejemplo: `COM3`)
6. Actualiza `PRINTER_INTERFACE=COM3` en `.env.local`

#### En Linux:

```bash
# Escanear dispositivos Bluetooth
sudo hcitool scan

# Emparejar (reemplaza XX:XX:XX:XX:XX:XX con la MAC de tu impresora)
sudo bluetooth-agent PIN 0000 XX:XX:XX:XX:XX:XX

# Crear puerto serial
sudo rfcomm bind 0 XX:XX:XX:XX:XX:XX

# Usar en .env.local
PRINTER_INTERFACE=/dev/rfcomm0
```

### 5. Configurar ZKTeco G3-Pro

#### Conectar el dispositivo a la red

1. En el dispositivo ZKTeco, ve a **Menu** (tecla MENU)
2. **Comm. → Network Settings**
3. Configura IP estática o usa DHCP
4. Anota la dirección IP del dispositivo

#### Configurar ADMS Push

1. En el dispositivo: **Menu → Comm. → Cloud Server**
2. Configura:
   - **Server Address**: IP de tu servidor (ejemplo: `192.168.1.100`)
   - **Server Port**: `3000` (puerto de Next.js)
   - **Enable**: ON
   - **Protocol**: ADMS
3. Guarda la configuración

#### Obtener el Serial Number

1. En el dispositivo: **Menu → System → Device Info**
2. Anota el **Serial Number** (ejemplo: `BFQM235560021`)
3. Actualiza `ZKTECO_SERIAL_NUMBER` en `.env.local`

#### Registrar empleados en el dispositivo

1. **Menu → User Management → Add User**
2. Ingresa el **PIN** (debe coincidir con el `id` en la tabla `employees`)
3. Ingresa el nombre
4. Registra la cara del empleado (facial scan)
5. Guarda

## 🏃 Ejecutar el proyecto

### Modo desarrollo

```bash
yarn dev
```

El servidor estará disponible en:
- **Local**: http://localhost:3000
- **Red local**: http://[tu-ip]:3000

### Modo producción

```bash
yarn build
yarn start
```

## 📱 Uso del sistema

### Dashboard

Accede a `http://[server-ip]:3000/dashboard` para ver:
- Total de comidas servidas hoy
- Lista de empleados que han comido
- Hora de cada comida
- Auto-actualización cada 30 segundos

### Lista de empleados

Accede a `http://[server-ip]:3000/employees` para ver todos los empleados registrados.

### Flujo de trabajo

1. Empleado se identifica en el ZKTeco G3-Pro (reconocimiento facial)
2. El dispositivo envía evento al servidor
3. El servidor valida:
   - ¿El empleado existe?
   - ¿Ya comió hoy?
4. Si es válido:
   - Registra la comida en la base de datos
   - Imprime ticket automáticamente
   - Actualiza el dashboard

## 🔍 Verificación de funcionamiento

### Probar endpoints del ZKTeco

```bash
# Probar endpoint de polling
curl http://localhost:3000/iclock/getrequest?SN=BFQM235560021

# Debería responder: OK
```

### Ver logs del servidor

```bash
# En desarrollo, los logs aparecerán en la consola
yarn dev

# Busca líneas como:
# [ZKTeco] Device polling - SN: BFQM235560021
# [ZKTeco] Processing event - PIN: 2, Time: 2025-11-24...
# [ZKTeco] Meal recorded for employee 2 - María González
```

### Probar impresión manual

Crea un archivo `test-printer.js`:

```javascript
const { ThermalPrinter, PrinterTypes } = require("node-thermal-printer");

async function testPrint() {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: "/dev/tty.Bluetooth-Incoming-Port", // Tu puerto aquí
  });

  const isConnected = await printer.isPrinterConnected();
  console.log("Impresora conectada:", isConnected);

  if (isConnected) {
    printer.alignCenter();
    printer.println("TEST DE IMPRESION");
    printer.newLine();
    printer.println("Funciona correctamente!");
    printer.cut();
    await printer.execute();
    console.log("Ticket impreso");
  }
}

testPrint();
```

Ejecuta:
```bash
node test-printer.js
```

## 🐛 Solución de problemas

### El dispositivo ZKTeco no conecta

1. Verifica que el dispositivo y el servidor estén en la misma red
2. Verifica que el puerto 3000 esté abierto en el firewall
3. Revisa la configuración de IP y puerto en el dispositivo
4. Revisa los logs del servidor para ver si llegan requests

### La impresora no funciona

1. Verifica que esté emparejada por Bluetooth
2. Verifica el puerto correcto en `.env.local`
3. Ejecuta el script de prueba `test-printer.js`
4. En Windows, asegúrate de que el puerto COM sea correcto
5. Revisa los logs: `[Printer] Failed to print ticket`

### Supabase: Error de conexión

1. Verifica que las credenciales en `.env.local` sean correctas
2. Verifica que las tablas existan
3. Verifica Row Level Security (RLS):
   ```sql
   -- Desactivar RLS para MVP (solo para red local)
   ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
   ALTER TABLE meals_taken DISABLE ROW LEVEL SECURITY;
   ```

### Empleado no encontrado

1. Verifica que el PIN en el ZKTeco coincida con el `id` en la tabla `employees`
2. Verifica que el empleado esté `active = true`
3. Revisa los logs: `[ZKTeco] Employee X not found in database`

## 📊 Estructura del proyecto

```
facial-lunch-ticket/
├── app/
│   ├── api/
│   │   └── iclock/
│   │       ├── getrequest/route.ts  # Endpoint de polling
│   │       └── cdata/route.ts       # Endpoint de datos
│   ├── dashboard/
│   │   └── page.tsx                 # Dashboard principal
│   ├── employees/
│   │   └── page.tsx                 # Lista de empleados
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── supabase.ts                  # Cliente y funciones de DB
│   └── printer.ts                   # Utilidad de impresión
├── .env.local.example
├── next.config.ts
├── package.json
└── README.md
```

## 🔐 Seguridad

⚠️ **Este sistema está diseñado para red local únicamente**

- No expongas el puerto 3000 a Internet
- Usa firewall para restringir acceso solo a la red local
- Para producción, considera agregar autenticación
- Desactiva RLS en Supabase solo si es red local aislada

## 📝 Tareas pendientes

- [ ] Crear proyecto en Supabase
- [ ] Ejecutar SQL para crear tablas
- [ ] Insertar empleados en la base de datos
- [ ] Configurar variables de entorno (`.env.local`)
- [ ] Emparejar impresora Bluetooth
- [ ] Configurar ZKTeco G3-Pro en red
- [ ] Registrar empleados en el dispositivo
- [ ] Probar flujo completo

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs del servidor (`yarn dev`)
2. Verifica la configuración del dispositivo ZKTeco
3. Verifica las credenciales de Supabase
4. Prueba la impresora con el script de prueba

## 📄 Licencia

MIT
