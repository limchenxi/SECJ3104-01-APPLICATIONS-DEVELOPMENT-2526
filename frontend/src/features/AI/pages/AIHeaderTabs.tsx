interface AIHeaderTabsProps {
  activeTab: "model" | "usage" | "default";
  onChange: (tab: "model" | "usage" | "default") => void;
}

export default function AIHeaderTabs({ activeTab, onChange }: AIHeaderTabsProps) {
  const tabs = [
    { key: "model", label: "Model" },
    { key: "usage", label: "Penggunaan & Analitik" },
    // { key: "default", label: "Default settings" },
  ];

  return (
    <div className="flex gap-4 border-b pb-2 mb-6">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key as any)}
          className={`
            px-4 py-2 rounded-md transition
            ${activeTab === t.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}
          `}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
