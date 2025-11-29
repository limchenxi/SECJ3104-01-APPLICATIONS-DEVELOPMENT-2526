export default function SuperadminDashboard() {
  return (
    <div className="p-6 space-y-6">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900">Superadmin Dashboard</h1>
      <p className="text-gray-600">Selamat datang! Berikut ialah gambaran keseluruhan operasi sistem.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Jumlah Pengguna" value="128" />
        <SummaryCard title="Guru Aktif" value="103" />
        <SummaryCard title="Pentadbir" value="25" />
        <SummaryCard title="Jumlah AI Generations" value="4,290" />
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-lg mb-4">Modul AI Paling Popular</h2>

          <ul className="space-y-3">
            <li className="flex justify-between border-b pb-2">
              <span>AI Quiz</span>
              <span className="font-bold">1,820 kali</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span>Model RPH</span>
              <span className="font-bold">1,310 kali</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span>Cerapan Kendiri</span>
              <span className="font-bold">780 kali</span>
            </li>
          </ul>
        </div>

        <div className="p-5 bg-white shadow rounded-lg">
          <h2 className="font-semibold text-lg mb-4">Status Sistem AI</h2>

          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span>Provider (Utama):</span>
              <span className="font-bold text-blue-600">OpenAI</span>
            </li>
            <li className="flex justify-between">
              <span>Model Default:</span>
              <span className="font-bold">gpt-4.1-mini</span>
            </li>
            <li className="flex justify-between">
              <span>Status API:</span>
              <span className="text-green-600 font-bold">OK ✓</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-5 bg-white shadow rounded-lg">
        <h2 className="font-semibold text-lg mb-4">Tindakan Pantas</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction label="Pengurusan AI" to="/ai" />
          <QuickAction label="Pengurusan Pengguna" to="/users" />
          <QuickAction label="Teaching Assignment" to="/teaching-assignment" />
          <QuickAction label="Cerapan" to="/pentadbir/cerapan" />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="p-5 bg-white shadow rounded-lg">
        <h2 className="font-semibold text-lg mb-4">Aktiviti Terkini</h2>

        <ul className="space-y-3">
          <li>- Guru <span className="font-bold">Ahmad</span> menjana AI Quiz (5 min yang lalu)</li>
          <li>- Pentadbir <span className="font-bold">Siti</span> menambah Template Rubrik</li>
          <li>- Superadmin mengubah Default Model → gpt-4.1-mini</li>
        </ul>
      </div>

    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="p-5 bg-white shadow rounded-lg">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function QuickAction({ label, to }) {
  return (
    <a
      href={to}
      className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-center font-medium"
    >
      {label}
    </a>
  );
}
