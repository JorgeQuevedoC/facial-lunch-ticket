"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTodaysMeals, getAllMeals } from "@/lib/supabase";
import type { MealTaken } from "@/lib/supabase";

export default function Dashboard() {
  const [meals, setMeals] = useState<MealTaken[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showAll, setShowAll] = useState(false);

  const fetchMeals = async () => {
    try {
      const data = showAll ? await getAllMeals() : await getTodaysMeals();
      setMeals(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMeals();
    }, 30000);

    return () => clearInterval(interval);
  }, [showAll]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Dashboard - Comedor Industrial</h1>
          <p className="text-blue-100">
            {loading ? "Cargando..." : formatDate(new Date().toISOString())}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-600 text-sm font-medium mb-1">
                Total de comidas hoy
              </h2>
              <p className="text-4xl font-bold text-blue-600">{meals.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Última actualización</p>
              <p className="text-sm font-medium text-gray-700">
                {formatTime(lastUpdate.toISOString())}
              </p>
              <button
                onClick={fetchMeals}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Actualizar ahora
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/employees"
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Ver Lista de Empleados
          </Link>
        </div>

        {/* Meals Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {showAll ? "Todas las Comidas" : "Comidas de Hoy"}
            </h2>
            <label className="flex items-center cursor-pointer">
              <span className="mr-3 text-sm font-medium text-gray-700">
                Ver todas
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                />
                <div
                  className={`block w-14 h-8 rounded-full transition ${
                    showAll ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                    showAll ? "transform translate-x-6" : ""
                  }`}
                ></div>
              </div>
            </label>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Cargando...
            </div>
          ) : meals.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay comidas registradas hoy
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    {showAll && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meals.map((meal) => (
                    <tr key={meal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {meal.employee_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {meal.employees?.name || "Desconocido"}
                      </td>
                      {showAll && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(meal.timestamp).toLocaleDateString("es-MX")}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(meal.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Servido
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>La página se actualiza automáticamente cada 30 segundos</p>
        </div>
      </main>
    </div>
  );
}
