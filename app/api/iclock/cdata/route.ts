import { NextRequest, NextResponse } from "next/server";
import {
  hasEatenToday,
  insertMeal,
  getEmployee,
} from "@/lib/supabase";
import { printTicket } from "@/lib/printer";

/**
 * Parse ATTLOG event line
 * Format: PIN\tDateTime\tStatus\tVerifyType\tWorkCode (tab-separated)
 * Example: 2\t2025-11-23 17:05:30\t0\t15\t
 */
interface AttendanceEvent {
  pin: number;
  timestamp: Date;
  status: number;
  verifyType: number;
}

function parseAttlogLine(line: string): AttendanceEvent | null {
  const parts = line.trim().split("\t");

  if (parts.length < 2) {
    return null;
  }

  const pin = parseInt(parts[0], 10);
  const dateTimeStr = parts[1];

  if (isNaN(pin) || !dateTimeStr) {
    return null;
  }

  const timestamp = new Date(dateTimeStr);
  if (isNaN(timestamp.getTime())) {
    return null;
  }

  return {
    pin,
    timestamp,
    status: parseInt(parts[2] || "0", 10),
    verifyType: parseInt(parts[3] || "0", 10),
  };
}

/**
 * Process an attendance event
 */
async function processAttendanceEvent(event: AttendanceEvent): Promise<void> {
  console.log(
    `[ZKTeco] Processing event - PIN: ${event.pin}, Time: ${event.timestamp.toISOString()}`
  );

  try {
    // Check if employee already ate today
    const alreadyEaten = await hasEatenToday(event.pin, event.timestamp);

    if (alreadyEaten) {
      console.log(`[ZKTeco] Employee ${event.pin} already ate today - skipping`);
      return;
    }

    // Get employee info
    const employee = await getEmployee(event.pin);
    if (!employee) {
      console.warn(`[ZKTeco] Employee ${event.pin} not found in database`);
      return;
    }

    if (!employee.active) {
      console.warn(`[ZKTeco] Employee ${event.pin} is inactive - skipping`);
      return;
    }

    // Insert meal record
    const inserted = await insertMeal(event.pin, event.timestamp);
    if (!inserted) {
      console.error(`[ZKTeco] Failed to insert meal for employee ${event.pin}`);
      return;
    }

    console.log(`[ZKTeco] Meal recorded for employee ${event.pin} - ${employee.name}`);

    // Print ticket asynchronously (don't wait)
    printTicket(employee, event.timestamp).catch((error) => {
      console.error(`[Printer] Failed to print ticket for ${event.pin}:`, error);
    });
  } catch (error) {
    console.error(`[ZKTeco] Error processing event for PIN ${event.pin}:`, error);
  }
}

/**
 * ZKTeco ADMS Push - Data upload endpoint
 * The device sends attendance and operational logs here
 */
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const serialNumber = searchParams.get("SN");
  const table = searchParams.get("table");

  console.log(`[ZKTeco] Data received - SN: ${serialNumber}, Table: ${table}`);

  // Validate serial number
  const expectedSerial = process.env.ZKTECO_SERIAL_NUMBER;
  if (expectedSerial && serialNumber !== expectedSerial) {
    console.warn(`[ZKTeco] Unknown device serial: ${serialNumber}`);
    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    // Read raw body as text
    const body = await request.text();

    if (!body || body.trim().length === 0) {
      console.log(`[ZKTeco] Empty body received`);
      return new NextResponse("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.log(`[ZKTeco] Raw body:\n${body}`);

    // Process based on table type
    if (table === "ATTLOG") {
      // Parse attendance log
      const lines = body.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;

        const event = parseAttlogLine(line);
        if (event) {
          // Process asynchronously but don't wait
          processAttendanceEvent(event).catch((error) => {
            console.error(`[ZKTeco] Error processing event:`, error);
          });
        } else {
          console.warn(`[ZKTeco] Failed to parse line: ${line}`);
        }
      }
    } else if (table === "OPERLOG") {
      // Optional: handle user operations (user add/delete)
      console.log(`[ZKTeco] OPERLOG received (not implemented):\n${body}`);
    } else {
      console.log(`[ZKTeco] Unknown table type: ${table}`);
    }

    // Always respond with OK quickly
    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error(`[ZKTeco] Error processing request:`, error);

    // Still respond with OK to avoid device retries
    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
