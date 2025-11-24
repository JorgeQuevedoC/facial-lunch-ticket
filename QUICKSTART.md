# 🚀 Quick Start Guide

Follow these steps to get your Industrial Canteen Ticketing System up and running.

## Step 1: Setup Supabase (10 minutes)

### 1.1 Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name**: `canteen-system` (or any name you prefer)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose the closest to your location
4. Wait 2-3 minutes for the project to be ready

### 1.2 Get Your Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 1.3 Setup Database Tables

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" or press `Ctrl/Cmd + Enter`
5. You should see: "Success. No rows returned"

### 1.4 Verify Tables

Go to **Table Editor** and verify you see:
- ✅ `employees` table (with sample data)
- ✅ `meals_taken` table (empty)

---

## Step 2: Configure Environment Variables (2 minutes)

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key-here

   # Keep the others as default for now
   ZKTECO_SERIAL_NUMBER=BFQM235560021
   PRINTER_INTERFACE=COM3
   ```

---

## Step 3: Start Development Server (1 minute)

```bash
yarn dev
```

Open your browser to [http://localhost:3000](http://localhost:3000)

You should see:
- ✅ Home page with "Sistema de Comedor Industrial"
- ✅ Dashboard link
- ✅ Employees link

Click **Ver Dashboard** → You should see the dashboard (empty for now)

Click **Ver Empleados** → You should see the sample employees

---

## Step 4: Setup Bluetooth Printer (10 minutes)

### macOS

```bash
# 1. Turn on printer and enable pairing mode
# 2. Open System Preferences → Bluetooth
# 3. Pair "BlueTooth Printer" device
# 4. Update .env.local:
PRINTER_INTERFACE=/dev/tty.Bluetooth-Incoming-Port
```

### Windows

1. Settings → Devices → Bluetooth
2. Pair the printer
3. Control Panel → Devices and Printers
4. Right-click printer → Properties → Hardware tab
5. Note the COM port (e.g., `COM3`)
6. Update `.env.local`:
   ```env
   PRINTER_INTERFACE=COM3
   ```

### Linux

```bash
# Scan for devices
sudo hcitool scan

# Note printer MAC address (e.g., 00:11:22:33:44:55)
# Pair and bind
sudo bluetooth-agent PIN 0000 00:11:22:33:44:55
sudo rfcomm bind 0 00:11:22:33:44:55

# Update .env.local:
PRINTER_INTERFACE=/dev/rfcomm0
```

### Test the Printer

Create `test-printer.js`:

```javascript
const { ThermalPrinter, PrinterTypes } = require("node-thermal-printer");

async function test() {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: process.env.PRINTER_INTERFACE || "COM3",
  });

  const connected = await printer.isPrinterConnected();
  console.log("Printer connected:", connected);

  if (connected) {
    printer.alignCenter();
    printer.println("PRUEBA DE IMPRESION");
    printer.println("Sistema de Comedor");
    printer.cut();
    await printer.execute();
    console.log("✅ Ticket printed successfully!");
  } else {
    console.log("❌ Printer not connected");
  }
}

test();
```

Run it:
```bash
node test-printer.js
```

---

## Step 5: Configure ZKTeco G3-Pro (15 minutes)

### 5.1 Find Your Server IP

#### macOS/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

#### Windows:
```bash
ipconfig
```

Note your local IP (e.g., `192.168.1.100`)

### 5.2 Configure Device

On the ZKTeco G3-Pro:

1. **Press MENU** → Enter admin password
2. **Comm. → Network Settings**
   - Set static IP or use DHCP
   - Note device IP
3. **Comm. → Cloud Server / ADMS**
   - **Server Address**: `192.168.1.100` (your server IP)
   - **Server Port**: `3000`
   - **Enable Domain**: ON
   - **Protocol**: ADMS
   - **Enable**: ON
4. **Save** and wait for device to connect

### 5.3 Get Serial Number

**Menu → System → Device Info**
- Note the **Serial Number** (e.g., `BFQM235560021`)
- Update in `.env.local`:
  ```env
  ZKTECO_SERIAL_NUMBER=BFQM235560021
  ```

### 5.4 Register Employees

For each employee:

1. **Menu → User Management → Add User**
2. **User ID/PIN**: Enter number (must match DB)
   - Example: Enter `1` for Juan Pérez (from employees table)
3. **Name**: Enter employee name
4. **Face**: Register facial scan
   - Follow on-screen instructions
   - Look at camera, stay still
   - Multiple angles will be captured
5. **Save**

Repeat for all employees in your database.

---

## Step 6: Test the Complete Flow (5 minutes)

### 6.1 Verify Server is Running

Make sure `yarn dev` is running and check logs:

```bash
yarn dev
```

You should see:
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000
```

### 6.2 Test Device Connection

From another terminal:

```bash
curl "http://localhost:3000/iclock/getrequest?SN=BFQM235560021"
```

Should return: `OK`

### 6.3 Test Complete Flow

1. On ZKTeco device, have employee #1 scan their face
2. Watch the server logs for:
   ```
   [ZKTeco] Processing event - PIN: 1, Time: ...
   [ZKTeco] Meal recorded for employee 1 - Juan Pérez
   [Printer] Ticket printed for employee 1 - Juan Pérez
   ```
3. Check that:
   - ✅ Ticket prints automatically
   - ✅ Dashboard shows the meal (refresh page)
   - ✅ Second scan same day = no ticket (already ate)

---

## ✅ Success Checklist

- [ ] Supabase project created and tables set up
- [ ] `.env.local` configured with Supabase credentials
- [ ] Development server running (`yarn dev`)
- [ ] Dashboard accessible and showing employees
- [ ] Bluetooth printer paired and tested
- [ ] ZKTeco device connected to network
- [ ] ZKTeco configured with server IP and port
- [ ] Employees registered in ZKTeco with correct PINs
- [ ] Test scan successful (ticket prints + dashboard updates)

---

## 🎉 You're Ready!

Your system is now fully operational. Employees can:
1. Scan their face on the ZKTeco device
2. Get a printed ticket automatically
3. View statistics on the dashboard

---

## 🆘 Troubleshooting

### "Error fetching meals"
- ✅ Check `.env.local` has correct Supabase credentials
- ✅ Verify tables exist in Supabase
- ✅ Check browser console for errors

### ZKTeco not connecting
- ✅ Device and server on same network
- ✅ Firewall allows port 3000
- ✅ Server IP correct in device settings
- ✅ Check server logs for incoming requests

### Printer not working
- ✅ Printer paired via Bluetooth
- ✅ Correct port in `.env.local`
- ✅ Run `test-printer.js` to verify
- ✅ Check server logs for print errors

### Employee not found
- ✅ PIN in ZKTeco matches employee `id` in database
- ✅ Employee is `active = true` in database
- ✅ Check server logs for the exact PIN received

---

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Customize the dashboard styling
- Add more employees to the database
- Set up automatic backups of Supabase data
- Consider adding reports or analytics

Enjoy your automated canteen system! 🍽️
