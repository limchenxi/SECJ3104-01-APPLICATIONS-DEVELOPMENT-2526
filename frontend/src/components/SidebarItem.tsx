export const SidebarItem = {
  GURU: [
    { label: "Dashboard", to: "/dashboard/guru" },
    { label: "Kedatangan", to: "/kedatangan" },
    { label: "eRPH", to: "/rph" },
    { label: "AI Quiz", to: "/quiz" },
    { label: "Cerapan Kendiri", to: "/cerapan" },
    { label: "Teaching Assignment", to: "/teaching-assignment" },
    { label: "Profile", to: "/profile" },
  ],

  PENTADBIR: [
    { label: "Dashboard", to: "/dashboard/pentadbir" },
    { label: "Cerapan", to: "/pentadbir/cerapan" },
    { label: "Template Rubrik", to: "/pentadbir/template-rubrik" },
    { label: "Teaching Assignment", to: "/teaching-assignment" },
    { label: "Profile", to: "/profile" },
  ],

  SUPERADMIN: [
    {
      label: "Modul Guru",
      children: [
        { label: "eRPH", to: "/rph" },
        { label: "AI Quiz", to: "/quiz" },
        { label: "Cerapan Kendiri", to: "cerapan" },
      ],
    },
    {
      label: "Modul Pentadbir",
      children: [
        { label: "Cerapan", to: "pentadbir/cerapan" },
        { label: "Template Rubrik", to: "pentadbir/template-rubrik" },
      ],
    },
    { label: "Dashboard", to: "/dashboard/superadmin" },
    { label: "Pengurusan AI", to: "/ai" },
    { label: "Pengurusan Pengguna", to: "/users" },
    { label: "Teaching Assignment", to: "/teaching-assignment" },
    { label: "Profile", to: "/profile" },
  ],
};