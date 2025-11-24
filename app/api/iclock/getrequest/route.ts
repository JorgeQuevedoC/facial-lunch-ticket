import { NextRequest, NextResponse } from "next/server";

/**
 * ZKTeco ADMS Push - Device polling endpoint
 * The device calls this periodically to check for commands
 * We simply respond with "OK" to acknowledge
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const serialNumber = searchParams.get("SN");

  console.log(`[ZKTeco] Device polling - SN: ${serialNumber}`);

  // Validate serial number (optional but recommended)
  const expectedSerial = process.env.ZKTECO_SERIAL_NUMBER;
  if (expectedSerial && serialNumber !== expectedSerial) {
    console.warn(`[ZKTeco] Unknown device serial: ${serialNumber}`);
  }

  // Respond with OK (plain text)
  return new NextResponse("OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
