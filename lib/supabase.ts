import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // During build time or when env vars are missing, use dummy values
  // This prevents build errors while still catching runtime issues
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    console.error(
      "Missing Supabase environment variables. Please check .env.local"
    );
  }
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

/**
 * Database type definitions
 */
export interface Employee {
  id: number;
  name: string;
  active: boolean;
}

export interface MealTaken {
  id: string;
  employee_id: number;
  timestamp: string;
  employees?: Employee;
}

/**
 * Check if an employee has already eaten today
 */
export async function hasEatenToday(
  employeeId: number,
  timestamp: Date
): Promise<boolean> {
  const dateStr = timestamp.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("meals_taken")
    .select("id")
    .eq("employee_id", employeeId)
    .gte("timestamp", `${dateStr}T00:00:00Z`)
    .lt("timestamp", `${dateStr}T23:59:59Z`)
    .limit(1);

  if (error) {
    console.error("Error checking meal status:", error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Insert a meal record for an employee
 */
export async function insertMeal(
  employeeId: number,
  timestamp: Date
): Promise<boolean> {
  const { error } = await supabase.from("meals_taken").insert({
    employee_id: employeeId,
    timestamp: timestamp.toISOString(),
  });

  if (error) {
    console.error("Error inserting meal:", error);
    return false;
  }

  return true;
}

/**
 * Get employee information by ID
 */
export async function getEmployee(employeeId: number): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .single();

  if (error) {
    console.error("Error fetching employee:", error);
    return null;
  }

  return data;
}

/**
 * Get all meals taken today
 */
export async function getTodaysMeals(): Promise<MealTaken[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("meals_taken")
    .select(
      `
      *,
      employees (
        id,
        name,
        active
      )
    `
    )
    .gte("timestamp", `${today}T00:00:00Z`)
    .lt("timestamp", `${today}T23:59:59Z`)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error fetching today's meals:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all employees
 */
export async function getAllEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }

  return data || [];
}
