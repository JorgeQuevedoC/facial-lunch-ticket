# ✅ Tomorrow's Device Integration Checklist

**Quick reference for connecting the ZKTeco G3-Pro device**

📖 **Full Guide**: [DEVICE-INTEGRATION-GUIDE.md](./DEVICE-INTEGRATION-GUIDE.md)

---

## 🎒 What to Bring/Prepare

- [ ] ZKTeco G3-Pro device
- [ ] Power adapter
- [ ] Ethernet cable (or WiFi password)
- [ ] Laptop/computer with this project
- [ ] Thermal printer (Bluetooth)
- [ ] Paper rolls for printer
- [ ] Access to router/network
- [ ] This checklist printed or on phone

---

## 📝 Information You'll Need

Before starting, gather these:

| What | How to Get | Write Here |
|------|------------|------------|
| **Server IP** | `ifconfig` or `ipconfig` | _____________ |
| **Router IP** | Check router label | _____________ |
| **Network Name** | Check WiFi settings | _____________ |
| **Subnet Mask** | Usually 255.255.255.0 | _____________ |
| **Available IP for Device** | Pick one in range | _____________ |

---

## ⏱️ Timeline (60-90 minutes total)

### Phase 1: Preparation (10 min)
- [ ] Ensure server is running: `yarn dev`
- [ ] Verify Supabase is configured (`.env.local` exists)
- [ ] Test server accessible: `curl http://localhost:3000`
- [ ] Have DEVICE-INTEGRATION-GUIDE.md open

### Phase 2: Device Setup (15 min)
- [ ] Connect power to ZKTeco device
- [ ] Wait for boot (device shows main screen)
- [ ] Access admin menu (MENU button, password: 0 or 1234)
- [ ] Connect Ethernet cable OR configure WiFi

### Phase 3: Network Config (15 min)
- [ ] Navigate: MENU → Comm. → Network Settings
- [ ] Set IP address (static recommended):
  - IP: `192.168.1.150` (example)
  - Subnet: `255.255.255.0`
  - Gateway: `192.168.1.1` (your router)
  - DNS: `8.8.8.8`
- [ ] Save and verify IP shows correctly
- [ ] Test ping from computer: `ping 192.168.1.150`

### Phase 4: ADMS Push Setup (10 min)
- [ ] Get device serial number: MENU → System → Device Info
- [ ] Write it down: _______________________
- [ ] Update `.env.local`:
  ```
  ZKTECO_SERIAL_NUMBER=BFQM235560021
  ```
- [ ] Restart server
- [ ] Configure ADMS: MENU → Comm. → Cloud Server
  - Server Address: `192.168.1.100` (your server IP, NO http://)
  - Server Port: `3000`
  - Enable: ON
  - Protocol: ADMS
- [ ] Save configuration
- [ ] Check server logs for device polling within 30 seconds

### Phase 5: Employee Registration (20-30 min)
- [ ] Have employee list from Supabase ready
- [ ] For each employee:
  - [ ] MENU → User Management → Add User
  - [ ] User ID = database ID (e.g., 1, 2, 3...)
  - [ ] Name = employee name
  - [ ] Face = scan face (good lighting!)
  - [ ] Save
  - [ ] Test recognition immediately

### Phase 6: Testing (10-15 min)
- [ ] Test API endpoint:
  ```bash
  curl "http://192.168.1.100:3000/iclock/getrequest?SN=SERIAL"
  ```
  Should return: `OK`
- [ ] Test complete flow:
  - [ ] Employee scans face
  - [ ] Server logs show processing
  - [ ] Ticket prints (if printer ready)
  - [ ] Dashboard updates
  - [ ] Database record created
- [ ] Test duplicate prevention:
  - [ ] Same employee scans again
  - [ ] Should NOT print ticket
  - [ ] Logs show "already ate today"

---

## 🚨 Quick Troubleshooting

### Device won't get IP
→ Try DHCP first, then static
→ Check cable is connected
→ Restart device

### Can't ping device
→ Verify same subnet (192.168.1.x)
→ Check firewall
→ Try different IP address

### No logs on server
→ Check server IP on device (no http://)
→ Verify port 3000 open in firewall
→ Check serial number matches
→ Restart device and server

### Face won't register
→ Better lighting
→ Remove glasses
→ Stand 30-50cm away
→ Try again with neutral expression

---

## 📞 During Integration - Have These Open

1. **Terminal**: `yarn dev` (watching logs)
2. **Browser**: `http://localhost:3000/dashboard`
3. **This Guide**: DEVICE-INTEGRATION-GUIDE.md
4. **Supabase**: https://supabase.com/dashboard

---

## ✅ Success Criteria

You'll know it's working when:

✅ Device shows IP address
✅ Can ping device from computer
✅ Server logs show device polling every 30 seconds
✅ Employee face scan → immediate ticket print
✅ Dashboard shows new meal
✅ Second scan → no ticket (duplicate prevention)

---

## 📱 Quick Commands Reference

**Check server is accessible**:
```bash
curl http://192.168.1.100:3000
```

**Test ZKTeco endpoint**:
```bash
curl "http://192.168.1.100:3000/iclock/getrequest?SN=SERIAL"
```

**Check today's meals in database**:
```sql
SELECT * FROM meals_taken WHERE timestamp::date = CURRENT_DATE;
```

**Find your IP**:
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

---

## 💡 Pro Tips

- **Start early**: Give yourself 90 minutes first time
- **Test as you go**: Don't wait until the end
- **Good lighting**: Register faces in same lighting as daily use
- **One at a time**: Register and test each employee before moving to next
- **Keep notes**: Write down what works for your setup
- **Take photos**: Screenshot/photo of device settings for reference

---

## 📋 Post-Integration Notes

After you finish, write notes here for future reference:

**Device IP**: _______________
**Server IP**: _______________
**Serial Number**: _______________
**Admin Password** (if changed): _______________

**Issues encountered**:
1.
2.
3.

**Solutions**:
1.
2.
3.

**Time taken**: _______ minutes

---

## 🎉 Next Steps After Integration

Once everything works:

1. **Print this checklist** for daily operations
2. **Train employees** on how to use device
3. **Test during low-traffic** time first
4. **Monitor first day** closely
5. **Backup database** regularly

---

**Good luck tomorrow! 🚀**

Remember: The detailed guide (DEVICE-INTEGRATION-GUIDE.md) has answers to almost everything. Don't hesitate to refer to it!
