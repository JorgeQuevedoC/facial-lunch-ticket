# 🔧 ZKTeco G3-Pro Device Integration Guide

**Complete step-by-step guide for connecting your ZKTeco G3-Pro biometric terminal to the Industrial Canteen System**

⏱️ **Total Time**: Approximately 60-90 minutes
📋 **Difficulty**: Intermediate
🎯 **Goal**: Connect ZKTeco device to your Next.js app and enable automatic meal ticket printing

---

## 📑 Table of Contents

1. [Pre-Integration Checklist](#1-pre-integration-checklist)
2. [Physical Device Setup](#2-physical-device-setup)
3. [Network Configuration](#3-network-configuration)
4. [Server Preparation](#4-server-preparation)
5. [ADMS Push Configuration](#5-adms-push-configuration)
6. [Employee Registration](#6-employee-registration)
7. [Testing & Verification](#7-testing--verification)
8. [Troubleshooting](#8-troubleshooting)
9. [Day-of-Use Checklist](#9-day-of-use-checklist)

---

## 1. Pre-Integration Checklist

### ✅ Hardware Required

- [ ] ZKTeco G3-Pro biometric terminal
- [ ] Power adapter (12V DC, included with device)
- [ ] Ethernet cable (Cat5e or better) OR WiFi access
- [ ] Computer/server running the Next.js app
- [ ] Thermal printer (Redlemon 58mm Bluetooth)
- [ ] Router/switch for network connectivity

### ✅ Software Required

- [ ] Next.js app installed and running (`yarn dev`)
- [ ] Supabase configured with database tables
- [ ] `.env.local` file created with Supabase credentials
- [ ] Server accessible on local network

### ✅ Information to Gather

Before starting, have this information ready:

| Item | How to Get It | Example |
|------|---------------|---------|
| **Server IP Address** | Run `ifconfig` (Mac/Linux) or `ipconfig` (Windows) | `192.168.1.100` |
| **Network Subnet** | Check router settings | `255.255.255.0` |
| **Network Gateway** | Usually your router IP | `192.168.1.1` |
| **DNS Server** | Use gateway or `8.8.8.8` | `8.8.8.8` |
| **Available IP for Device** | Check router DHCP range | `192.168.1.150` |

### ✅ Network Topology

```
┌─────────────────┐
│  Router/Switch  │ 192.168.1.1
└────────┬────────┘
         │
    ┌────┴────────────────────┐
    │                         │
┌───┴─────────┐      ┌───────┴────────┐
│   Server    │      │  ZKTeco G3-Pro │
│ 192.168.1.100│      │ 192.168.1.150  │
│  Port 3000  │      │                │
└─────────────┘      └────────────────┘
```

**Important**: Both devices MUST be on the same subnet!

---

## 2. Physical Device Setup

### Step 2.1: Unboxing and Inspection

1. **Remove device from box** and inspect for damage
2. **Locate components**:
   - ZKTeco G3-Pro main unit
   - Power adapter (12V DC)
   - Mounting bracket and screws
   - Quick start guide
   - Ethernet cable (if included)

### Step 2.2: Mounting (Optional for Testing)

For initial testing, you can place the device on a desk. For permanent installation:

1. **Choose location**:
   - Height: 1.2-1.5 meters from floor
   - Well-lit area (avoid direct sunlight)
   - Within Ethernet cable reach of network
   - Protected from weather if outdoor

2. **Mount device**:
   - Use provided bracket
   - Ensure stable mounting
   - Cable management for power/network

### Step 2.3: Power Connection

1. **Connect power adapter** to device (DC input port on back/bottom)
2. **Plug adapter into outlet**
3. **Wait for boot** (15-30 seconds)
4. **Observe display**:
   - Device will show logo/splash screen
   - Then switch to main verification screen
   - LED indicator should light up (usually green)

### Step 2.4: Initial Access

1. **Touch the screen** to wake device
2. **Access admin menu**:
   - Press and hold the **MENU** button (usually top-right physical button)
   - OR tap **Menu** icon on touchscreen
3. **Enter admin password**:
   - **Default**: Usually `0` or `1234` or `12345`
   - Check device manual for specific default
   - **Important**: Change this later for security!

4. **You should now see**: System menu with options like:
   - User Management
   - Comm. (Communication)
   - System
   - Options
   - etc.

---

## 3. Network Configuration

### Step 3.1: Choose Connection Method

**Option A: Ethernet (Recommended)**
- More stable
- Better for production
- No wireless interference

**Option B: WiFi**
- More flexible placement
- May have connectivity issues
- Requires WiFi credentials

### Step 3.2: Configure Network Settings (Ethernet)

1. **In device menu, navigate**:
   ```
   MENU → Comm. → Network Settings
   ```

2. **Configure IP Address**:

   **Option 1 - DHCP (Easier, less stable)**:
   ```
   DHCP: Enable
   ```
   - Device will get IP automatically
   - IP may change on router restart
   - Good for testing only

   **Option 2 - Static IP (Recommended for production)**:
   ```
   DHCP: Disable
   IP Address: 192.168.1.150
   Subnet Mask: 255.255.255.0
   Gateway: 192.168.1.1
   DNS Server: 8.8.8.8 (or your gateway)
   ```

3. **Save settings** (usually press "OK" or "Save")

4. **Wait for connection** (5-10 seconds)

5. **Verify IP assigned**:
   - Return to Network Settings
   - Check "IP Address" field shows your IP
   - For DHCP, note the assigned IP

### Step 3.3: Configure Network Settings (WiFi)

If using WiFi instead:

1. **Navigate to**:
   ```
   MENU → Comm. → WiFi Settings
   ```

2. **Enable WiFi**:
   ```
   WiFi: Enable
   ```

3. **Scan for networks**:
   - Press "Scan" or "Search"
   - Wait for network list

4. **Select your network**:
   - Tap your WiFi SSID
   - Enter password using on-screen keyboard
   - Save

5. **Check connection**:
   - Device should show "Connected"
   - Note the assigned IP address

### Step 3.4: Test Network Connectivity

**From the Device**:

1. **Navigate to**:
   ```
   MENU → Comm. → Network Settings → Test
   ```

2. **Ping test** (if available):
   - Enter your router IP (e.g., `192.168.1.1`)
   - Press "Ping"
   - Should show "Success" or "Reply"

**From Your Computer**:

```bash
# Ping the device (use the IP you configured)
ping 192.168.1.150

# Should show replies:
# Reply from 192.168.1.150: bytes=32 time=1ms TTL=64
```

**If ping fails**:
- ✅ Check Ethernet cable is connected
- ✅ Check device shows IP address
- ✅ Verify computer and device on same subnet
- ✅ Check firewall settings

---

## 4. Server Preparation

### Step 4.1: Find Your Server IP Address

**On macOS**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Output: inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255
```

**On Linux**:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# OR
hostname -I
```

**On Windows**:
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Note your IP**: ___________________ (example: 192.168.1.100)

### Step 4.2: Start the Server

1. **Navigate to project directory**:
   ```bash
   cd /Users/jorge/Projects/QuePar/DNSIT/facial-lunch-ticket
   ```

2. **Ensure `.env.local` is configured**:
   ```bash
   cat .env.local
   # Should show Supabase credentials
   ```

3. **Start server** (if not already running):
   ```bash
   yarn dev
   ```

4. **Verify server is listening on network**:
   ```
   ▲ Next.js 15.5.6
   - Local:        http://localhost:3000
   - Network:      http://0.0.0.0:3000
   ```

### Step 4.3: Test Server Access from Network

**From another computer on network**:
```bash
# Replace with your server IP
curl http://192.168.1.100:3000
# Should return HTML of home page
```

**Test ZKTeco endpoint**:
```bash
curl "http://192.168.1.100:3000/iclock/getrequest?SN=test"
# Should return: OK
```

### Step 4.4: Configure Firewall

**macOS**:
```bash
# Allow port 3000
# System Preferences → Security & Privacy → Firewall → Firewall Options
# Allow incoming connections for "node"
```

**Linux (ufw)**:
```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

**Windows**:
```powershell
# Windows Defender Firewall → Advanced Settings → Inbound Rules
# New Rule → Port → TCP → 3000 → Allow
```

---

## 5. ADMS Push Configuration

### What is ADMS Push?

ADMS (Attendance Data Management System) Push is a protocol where the ZKTeco device **actively sends** attendance events to your server via HTTP POST requests. This is different from "pulling" data from the device.

**How it works**:
1. Employee scans face on device
2. Device immediately sends HTTP POST to your server
3. Server processes event and prints ticket
4. Device receives "OK" response

### Step 5.1: Get Device Serial Number

1. **On device, navigate**:
   ```
   MENU → System → Device Info
   ```

2. **Find "Serial Number"**:
   - Example: `BFQM235560021`
   - Write it down: ___________________

3. **Update `.env.local` on server**:
   ```env
   ZKTECO_SERIAL_NUMBER=BFQM235560021
   ```

4. **Restart server** if it's running:
   ```bash
   # Press Ctrl+C to stop
   yarn dev
   ```

### Step 5.2: Configure ADMS Push on Device

1. **Navigate to**:
   ```
   MENU → Comm. → Cloud Server
   ```

   OR (depending on firmware):
   ```
   MENU → Comm. → ADMS Settings
   ```

   OR:
   ```
   MENU → Communication → Push Settings
   ```

2. **Configure the following fields**:

   | Field | Value | Notes |
   |-------|-------|-------|
   | **Enable** | ON | Activates ADMS Push |
   | **Protocol** | ADMS | Select from dropdown |
   | **Server Address** | `192.168.1.100` | Your server IP (NO http://) |
   | **Server Port** | `3000` | Next.js default port |
   | **Enable Domain** | OFF | Usually not needed for local IP |
   | **Push Interval** | `30` | Seconds between heartbeats |
   | **Device SN** | (Auto-filled) | Should match what you noted |

   **⚠️ Important**:
   - Do NOT include `http://` in Server Address
   - Just the IP: `192.168.1.100`
   - Port is separate field: `3000`

3. **Save configuration**:
   - Press "Save" or "OK"
   - Device may restart

### Step 5.3: Verify ADMS Connection

**On Device**:
1. Check connection status (if available):
   ```
   MENU → Comm. → Cloud Server → Status
   ```
   - Should show "Connected" or "Online"

**On Server**:
1. Watch server logs:
   ```bash
   yarn dev
   ```

2. You should see within 30 seconds:
   ```
   [ZKTeco] Device polling - SN: BFQM235560021
   ```

3. This means device is successfully connecting!

**If you don't see logs**:
- ✅ Check server IP is correct
- ✅ Check port 3000 is open in firewall
- ✅ Verify device has network connectivity
- ✅ Check server is running
- ✅ Try restarting device

---

## 6. Employee Registration

### Step 6.1: Prepare Employee List

1. **Ensure employees exist in Supabase**:
   ```sql
   SELECT * FROM employees ORDER BY id;
   ```

2. **Note the employee IDs** (PINs):
   - Example: Employee "Juan Pérez" has ID `1`
   - Employee "María González" has ID `2`
   - etc.

3. **Create a checklist**:
   ```
   [ ] ID 1 - Juan Pérez
   [ ] ID 2 - María González
   [ ] ID 3 - Carlos López
   [ ] ID 23 - Ana Martínez
   ```

### Step 6.2: Registration Best Practices

**Environment Setup**:
- ✅ Good, even lighting (avoid shadows on face)
- ✅ No direct sunlight or backlighting
- ✅ Stand 30-50cm from device
- ✅ Remove glasses/hats if possible
- ✅ Look directly at camera
- ✅ Neutral expression

**Tips**:
- Register in same conditions as daily use
- Morning light is best
- Register multiple angles if option available
- Test immediately after registration

### Step 6.3: Register an Employee

1. **Navigate to**:
   ```
   MENU → User Management → Add User
   ```

2. **Enter User ID (PIN)**:
   - Press "User ID" or "PIN" field
   - Enter the employee ID from database (e.g., `1`)
   - **CRITICAL**: This MUST match the `id` in `employees` table
   - Press "OK"

3. **Enter Name**:
   - Press "Name" field
   - Use on-screen keyboard to enter name
   - Example: `Juan Perez`
   - Press "OK"

4. **Register Face**:
   - Press "Face" or "Facial Recognition"
   - Follow on-screen instructions:
     - "Look at camera"
     - "Turn head slightly left"
     - "Turn head slightly right"
     - "Face forward"
   - Device captures 3-5 images
   - Shows progress bar or percentage

5. **Verify Quality**:
   - Device shows "Registration successful" or quality score
   - If quality is low (< 70%), re-register
   - Press "OK" to save

6. **Set Verification Mode** (if asked):
   - Select "Face Only" or "Face + Card"
   - For this system: **Face Only**

7. **Save User**:
   - Press "Save" or "OK"
   - User is now registered

### Step 6.4: Test the Registration

1. **Exit to main screen**
2. **Employee stands in front of device**
3. **Device should**:
   - Recognize face within 1-2 seconds
   - Display employee name
   - Beep or show success message
4. **If not recognized**:
   - Try different angle
   - Check lighting
   - Re-register with better conditions

### Step 6.5: Repeat for All Employees

- Register each employee using steps above
- **Remember**: PIN must match database ID
- Test each one after registration
- Keep checklist updated

---

## 7. Testing & Verification

### Step 7.1: Test API Endpoints

**Test 1: Device Polling (GET)**
```bash
curl -v "http://192.168.1.100:3000/iclock/getrequest?SN=BFQM235560021"

# Expected response:
HTTP/1.1 200 OK
Content-Type: text/plain

OK
```

**Test 2: Simulate Attendance Event (POST)**
```bash
curl -X POST "http://192.168.1.100:3000/iclock/cdata?SN=BFQM235560021&table=ATTLOG" \
  -H "Content-Type: text/plain" \
  -d "1	2025-11-24 10:30:00	0	15"

# Expected response:
OK
```

**Check server logs after Test 2**:
```
[ZKTeco] Processing event - PIN: 1, Time: 2025-11-24...
[ZKTeco] Meal recorded for employee 1 - Juan Pérez
[Printer] Ticket printed for employee 1 - Juan Pérez
```

**Check database**:
```sql
SELECT * FROM meals_taken WHERE employee_id = 1;
```

### Step 7.2: Test Complete Flow (Live)

**Setup**:
1. Server running (`yarn dev`)
2. Printer paired and ready
3. Employee registered in device
4. Watching server logs

**Execute**:
1. **Employee scans face** on ZKTeco device
2. **Watch for**:
   - Device shows "Success" or employee name
   - Server logs show processing
   - Ticket prints automatically
   - Dashboard updates (refresh page)

**Verify**:
```bash
# Check dashboard
open http://192.168.1.100:3000/dashboard

# Should show the new meal entry
```

**Check database**:
```sql
SELECT
  m.id,
  m.employee_id,
  e.name,
  m.timestamp
FROM meals_taken m
JOIN employees e ON m.employee_id = e.id
WHERE m.timestamp::date = CURRENT_DATE
ORDER BY m.timestamp DESC;
```

### Step 7.3: Test Duplicate Prevention

1. **Same employee scans again immediately**
2. **Expected behavior**:
   - Device still recognizes (shows name)
   - Server logs: `[ZKTeco] Employee X already ate today - skipping`
   - **NO** ticket prints
   - **NO** new database record

3. **Verify in database**:
   ```sql
   -- Should still show only 1 meal for today
   SELECT COUNT(*) FROM meals_taken
   WHERE employee_id = 1
   AND timestamp::date = CURRENT_DATE;
   -- Result: 1
   ```

### Step 7.4: Test Multiple Employees

1. Have 2-3 employees scan in sequence
2. Each should:
   - Get recognized
   - Trigger ticket print
   - Appear in dashboard
   - Create database record

### Step 7.5: Test Error Scenarios

**Test: Unknown Employee**
1. Register a user in device with PIN `999` (not in database)
2. Have them scan face
3. **Expected**:
   - Device recognizes
   - Server logs: `[ZKTeco] Employee 999 not found in database`
   - NO ticket prints
   - NO database record

**Test: Inactive Employee**
1. In database, set employee to inactive:
   ```sql
   UPDATE employees SET active = false WHERE id = 3;
   ```
2. Have employee 3 scan
3. **Expected**:
   - Server logs: `[ZKTeco] Employee 3 is inactive - skipping`
   - NO ticket prints

---

## 8. Troubleshooting

### Issue 1: Device Won't Connect to Network

**Symptoms**:
- No IP address shown
- Can't ping device
- Network status shows "Disconnected"

**Solutions**:
1. ✅ Check Ethernet cable is firmly connected
2. ✅ Try different cable/port on switch
3. ✅ Verify DHCP is enabled on router (if using DHCP)
4. ✅ Try static IP configuration
5. ✅ Restart device (power cycle)
6. ✅ Check router logs for DHCP assignment

### Issue 2: ADMS Push Not Working

**Symptoms**:
- No logs appear on server
- Device shows "Offline" or "Disconnected"
- Attendance events don't trigger

**Solutions**:
1. ✅ Verify server IP is correct on device
2. ✅ Check port 3000 is not blocked by firewall
3. ✅ Test with curl: `curl "http://SERVER_IP:3000/iclock/getrequest?SN=SERIAL"`
4. ✅ Check server is running and accessible from network
5. ✅ Verify serial number in `.env.local` matches device
6. ✅ Check device network connectivity
7. ✅ Try disabling "Enable Domain" on device
8. ✅ Restart both device and server

**Debug**: Enable verbose logging on device (if available):
```
MENU → System → Debug → Enable
```

### Issue 3: Employee Not Found

**Symptoms**:
- Server logs: `Employee X not found in database`
- No ticket prints despite recognition

**Solutions**:
1. ✅ Check database for employee with that ID:
   ```sql
   SELECT * FROM employees WHERE id = X;
   ```
2. ✅ Verify PIN in device matches database ID
3. ✅ Check employee is active:
   ```sql
   SELECT id, name, active FROM employees WHERE id = X;
   ```
4. ✅ If missing, add employee to database:
   ```sql
   INSERT INTO employees (id, name, active)
   VALUES (X, 'Employee Name', true);
   ```

### Issue 4: Facial Recognition Fails

**Symptoms**:
- Device shows "Not recognized"
- "Face quality too low"
- Takes long time to recognize

**Solutions**:
1. ✅ Improve lighting conditions
2. ✅ Clean camera lens
3. ✅ Remove glasses/hats
4. ✅ Stand at correct distance (30-50cm)
5. ✅ Look directly at camera
6. ✅ Re-register face with better quality
7. ✅ Check device face detection settings:
   ```
   MENU → Options → Face Recognition → Sensitivity
   ```
   Try setting to "Medium" or "Low" for easier recognition

### Issue 5: Printer Not Working

**Symptoms**:
- No ticket prints
- Server logs: `Failed to print ticket`

**Solutions**:
1. ✅ Check printer is paired via Bluetooth
2. ✅ Verify printer has paper
3. ✅ Check battery/power
4. ✅ Verify `PRINTER_INTERFACE` in `.env.local`
5. ✅ Test with test script (see README)
6. ✅ Check server logs for specific error

### Issue 6: Duplicate Meals Not Prevented

**Symptoms**:
- Employee can get multiple tickets same day
- Multiple database records for same day

**Solutions**:
1. ✅ Check unique index exists:
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename = 'meals_taken'
   AND indexname = 'meals_unique_daily';
   ```
2. ✅ If missing, create it:
   ```sql
   CREATE UNIQUE INDEX meals_unique_daily
   ON meals_taken (employee_id, (timestamp::date));
   ```

### Issue 7: Server Not Accessible from Network

**Symptoms**:
- Can access on localhost but not from network
- Device can't connect to server

**Solutions**:
1. ✅ Verify server started with `-H 0.0.0.0`:
   ```bash
   yarn dev
   # Should show: Network: http://0.0.0.0:3000
   ```
2. ✅ Check firewall allows port 3000
3. ✅ Test from another computer:
   ```bash
   curl http://SERVER_IP:3000
   ```
4. ✅ Verify both devices on same subnet

### Device Status Indicators

**LED Meanings** (typical):
- 🟢 **Green solid**: Device ready, online
- 🟡 **Yellow blinking**: Processing/scanning
- 🔴 **Red**: Error or offline
- 🔵 **Blue**: Network activity

**Display Messages**:
- "Scan face" / "Please verify": Ready for scan
- "Verified" / "Success": Recognition successful
- "Try again": Poor quality scan
- "Not registered": Face not in database
- "Online" / "Connected": ADMS connected

**Audio Feedback**:
- 🔊 **Single beep**: Successful scan
- 🔊 **Double beep**: Failed scan
- 🔊 **Long beep**: Error

---

## 9. Day-of-Use Checklist

### Before Employees Arrive

**1 Hour Before**:
- [ ] Power on ZKTeco device
- [ ] Verify device shows "Online" or "Connected"
- [ ] Start server: `yarn dev`
- [ ] Check server logs show device polling
- [ ] Pair and test thermal printer
- [ ] Load printer with paper
- [ ] Test print one ticket manually
- [ ] Open dashboard in browser
- [ ] Verify dashboard shows today's date

**30 Minutes Before**:
- [ ] Test complete flow with test employee
- [ ] Verify ticket prints correctly
- [ ] Check dashboard updates
- [ ] Verify database record created
- [ ] Test duplicate prevention
- [ ] Check printer has enough paper for expected volume

**15 Minutes Before**:
- [ ] Post instructions near device (if needed)
- [ ] Have backup paper rolls ready
- [ ] Have this troubleshooting guide accessible
- [ ] Notify employees system is ready

### During Operation

**Monitor**:
- [ ] Server logs for errors
- [ ] Dashboard for anomalies
- [ ] Printer paper level
- [ ] Device status (should stay green)

**Keep Handy**:
- [ ] Extra printer paper
- [ ] This troubleshooting guide
- [ ] Supabase dashboard access
- [ ] Router access (in case of network issues)

### End of Day

- [ ] Check dashboard shows all expected meals
- [ ] Review server logs for any errors
- [ ] Verify database count matches expectations:
  ```sql
  SELECT COUNT(*) FROM meals_taken
  WHERE timestamp::date = CURRENT_DATE;
  ```
- [ ] Back up database (optional):
  ```sql
  SELECT * FROM meals_taken
  WHERE timestamp::date = CURRENT_DATE;
  ```
- [ ] Leave server running (or stop if not needed)
- [ ] Device can stay on (low power mode)

---

## 🎯 Quick Reference Card

### Common Tasks

**Restart Device**:
```
Hold power button OR unplug/replug power
```

**Check Device IP**:
```
MENU → Comm. → Network Settings → IP Address
```

**Check ADMS Status**:
```
MENU → Comm. → Cloud Server → Status
```

**Test Server**:
```bash
curl "http://SERVER_IP:3000/iclock/getrequest?SN=SERIAL"
```

**View Server Logs**:
```bash
cd /Users/jorge/Projects/QuePar/DNSIT/facial-lunch-ticket
yarn dev
# Watch console output
```

**Check Today's Meals**:
```
Open: http://SERVER_IP:3000/dashboard
```

### Common Values

| Item | Value |
|------|-------|
| Server Port | 3000 |
| Default Admin PIN | 0 or 1234 |
| Recommended Distance | 30-50cm |
| Device Height | 1.2-1.5m |
| Push Interval | 30 seconds |

---

## 📞 Support Resources

If you encounter issues not covered here:

1. **Check main README.md** for general setup
2. **Check QUICKSTART.md** for step-by-step setup
3. **Check server logs** for detailed errors
4. **Check Supabase logs** for database issues
5. **ZKTeco Support**: Check manufacturer documentation

---

## ✨ Success Criteria

You know everything is working when:

✅ Device shows "Online" or "Connected"
✅ Server logs show periodic device polling
✅ Employee face scan triggers immediate ticket print
✅ Dashboard updates with new meal entry
✅ Database shows new record
✅ Second scan same day = no ticket (duplicate prevention)
✅ Unknown employees = no ticket
✅ All employees can scan successfully

---

**🎉 Congratulations!** Your ZKTeco G3-Pro is now fully integrated with the Industrial Canteen System!

For ongoing operation, refer to the [Day-of-Use Checklist](#9-day-of-use-checklist) above.
