import { useState } from "react";
import AIList from "./model/ai-list";
import AiUsageAnalytics from "./usage/ai-usage";
import AIHeaderTabs from "./AIHeaderTabs";
// import AiModuleSettings from "./default/ai-default";

export default function AIManagementIndex() {
  const [activeTab, setActiveTab] = useState<"model" | "usage" | "default">(
    "model"
  );
  const tabTitle = {
    model: "Senarai Model AI",
    usage: "Analitik Penggunaan AI",
    default: "Default Setting",
  }[activeTab];

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 tracking-tight">
        {tabTitle}
      </h1>

      {/* Header Tabs Component */}
      <AIHeaderTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Main Content Card */}
      <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
        {activeTab === "model" && <AIList items={[]} />}
        {activeTab === "usage" && <AiUsageAnalytics />}
        {/* {activeTab === "default" && <AiModuleSettings moduleId={""} />} */}
      </div>
    </div>
  );
}
