import { ThermalPrinter, PrinterTypes } from "node-thermal-printer";
import type { Employee } from "./supabase";

/**
 * Get printer interface from environment or use default
 */
function getPrinterInterface(): string {
  return process.env.PRINTER_INTERFACE || "COM3";
}

/**
 * Format date as DD/MM/YYYY
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format time as HH:MM:SS
 */
function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Print a meal ticket for an employee
 */
export async function printTicket(
  employee: Employee,
  timestamp: Date
): Promise<void> {
  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: getPrinterInterface(),
      removeSpecialCharacters: false,
      lineCharacter: "=",
      options: {
        timeout: 5000,
      },
    });

    // Check if printer is connected
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      throw new Error("Printer not connected");
    }

    // Header
    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.bold(true);
    printer.println("COMEDOR INDUSTRIAL");
    printer.bold(false);
    printer.println("Ticket de Comida");
    printer.drawLine();
    printer.newLine();

    // Employee info
    printer.alignLeft();
    printer.setTextNormal();
    printer.println(`Empleado: ${employee.name}`);
    printer.println(`ID: ${employee.id}`);
    printer.newLine();

    // Date and time
    printer.println(`Fecha: ${formatDate(timestamp)}`);
    printer.println(`Hora: ${formatTime(timestamp)}`);
    printer.newLine();

    // Footer
    printer.drawLine();
    printer.alignCenter();
    printer.println("Buen provecho!");
    printer.newLine();
    printer.newLine();

    // Cut paper
    printer.cut();

    // Execute print
    await printer.execute();
    console.log(`Ticket printed for employee ${employee.id} - ${employee.name}`);
  } catch (error) {
    console.error("Error printing ticket:", error);
    // Don't throw - we don't want printing failures to block the API response
  }
}
