import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Sistema de Comedor Industrial
        </h1>
        <p className="text-gray-600 mb-8">
          Sistema de tickets de comida con reconocimiento facial
        </p>
        <div className="space-x-4">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Ver Dashboard
          </Link>
          <Link
            href="/employees"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Ver Empleados
          </Link>
        </div>
      </div>
    </div>
  );
}
