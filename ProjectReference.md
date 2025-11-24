MVP Specification – Industrial Canteen Ticketing System
Using ZKTeco G3-Pro + Next.js + Supabase + Thermal Printer (Bluetooth)

1. Overview

This MVP implements a system for an industrial canteen where employees get one meal ticket per day.
Employee identification is done using a ZKTeco G3-Pro biometric terminal (facial recognition).
After a valid recognition, the system must:

Receive the recognition event from the ZKTeco G3-Pro (via ADMS Push protocol).

Verify if the employee already used the meal for the day.

If not, insert the meal record in the database.

Print a physical ticket using a Bluetooth thermal printer (Redlemon 58mm).

Provide a simple dashboard to view daily meal consumption.

The tech stack:

Next.js (App Router or Pages) – Backend + Frontend

TypeScript

Supabase (Postgres) – Database only

Tailwind CSS

Node Thermal Printer – ESC/POS printing via Bluetooth

ZKTeco G3-Pro – Facial recognition terminal (ADMS push to HTTP)

2. ZKTeco G3-Pro Integration
   2.1 Communication Method: ADMS Push (HTTP)

We use the ADMS Push mode, where the device sends HTTP requests to the backend:

GET /iclock/getrequest?SN=<serial> → server must respond OK

POST /iclock/cdata?SN=<serial>&table=ATTLOG
Contains attendance/verification events

POST /iclock/cdata?SN=<serial>&table=OPERLOG
Contains user creation/deletion events (optional to use)

2.2 Device Settings

On the G3-Pro:

Menu → Comm. Settings → Cloud Server / ADMS

- Server Address: <server ip or domain>
- Server Port: <port>
- Enable Domain: ON (if available)

The device will send events automatically.

2.3 Required Endpoints

Next.js must expose these two:

GET /iclock/getrequest
POST /iclock/cdata

Use Next.js rewrites if necessary:

// next.config.js
async rewrites() {
return [
{ source: "/iclock/:path*", destination: "/api/iclock/:path*" }
];
}

3. Database Schema (Supabase)
   3.1 Table: employees
   Column Type Notes
   id (PIN) integer PK Must match the ID/PIN in the ZKTeco device
   name text Optional but needed for printing
   active boolean default true
   3.2 Table: meals_taken
   Column Type Notes
   id uuid PK
   employee_id integer FK references employees.id
   timestamp timestamptz stored in UTC
   3.3 Unique daily constraint

To enforce one ticket per employee per day:

CREATE UNIQUE INDEX meals_unique_daily
ON meals_taken (employee_id, (timestamp::date));

This ensures even if two events arrive, duplicates are rejected.

4. Backend Logic (Next.js API)
   4.1 /iclock/getrequest (GET)

Respond:

Content-Type: text/plain
OK

4.2 /iclock/cdata (POST)

Steps:

Validate SN against allowed device serial.

Read raw body as text/plain.

Check table query param:

ATTLOG: attendance event

OPERLOG: user info updates (optional)

Parse event lines. Example ATTLOG body:

2 2025-11-23 17:05:30 0 15 (tabs)

Extract:

employee_id = pin

timestamp = datetime

Check in DB if employee_id already has a record today.

If record exists → do nothing.

If not:

Insert into meals_taken.

Trigger printTicket(employee_id, timestamp).

Respond "OK" (quickly – avoid delays).

4.3 Parsing example (pseudo-code)
const lines = body.split("\n");
for (const line of lines) {
const [pin, dateStr] = line.split("\t");
const ts = new Date(dateStr);

const exists = await hasEatenToday(pin, ts);
if (!exists) {
await insertMeal(pin, ts);
printTicket(pin, ts); // async
}
}
return res.status(200).send("OK");

5. Printing System (Node + Bluetooth)
   5.1 Printer

Model: Redlemon 58mm Bluetooth Thermal Printer
Protocol: ESC/POS (compatible with Node libraries)
Connection: OS-level Bluetooth → virtual COM port

5.2 Library

Use node-thermal-printer

Installation:

npm install node-thermal-printer

5.3 Ticket format (example)
Comedor Industrial - Ticket
Empleado: Juan Pérez (ID 23)
Fecha: 2025-11-23
Hora: 13:05:30
==========================
¡Buen provecho!

5.4 Print function (pseudo-code)
import { printer, types } from "node-thermal-printer";

export async function printTicket(employee, timestamp) {
const p = new printer({
type: types.EPSON,
interface: "COM3", // example, replace with actual BT port
});

p.alignCenter();
p.println("COMEDOR INDUSTRIAL");
p.drawLine();

p.alignLeft();
p.println(`Empleado: ${employee.name} (ID ${employee.id})`);
p.println(`Fecha: ${formatDate(timestamp)}`);
p.println(`Hora: ${formatTime(timestamp)}`);
p.drawLine();

p.println("¡Buen provecho!");
p.cut();

await p.execute();
}

6. Dashboard (Frontend)

Pages:

/dashboard

Shows today's meals_taken list

Displays: employee name, time

Auto-refresh (or Supabase realtime)

/employees (optional)

View list of employees from Supabase

Tech

TailwindCSS

Supabase client for queries

Optionally SSR or client-side fetch

7. Implementation Steps (Chronological)

Initialize Next.js project + Tailwind.

Setup Supabase tables & index.

Create rewrite for /iclock/\* routes.

Implement /iclock/getrequest.

Implement /iclock/cdata:

raw body parsing

ATTLOG handler

DB logic

printing trigger

Pair thermal printer → confirm COM port.

Implement printTicket() with ESC/POS.

Build dashboard page.

Test full flow:

Employee verifies on ZKTeco

API receives event

DB inserts meal record

Ticket prints

Dashboard updates

Optimize, add logs, error handling.

8. Future Improvements (Optional)

Websocket realtime UI updates

Multi-device support

QR/barcode on tickets

Local LAN-only deployment

Employee sync from OPERLOG events

Authentication for dashboard
