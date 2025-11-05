import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import useAttendance from "./hooks/useAttendance";
import { recordAttendance } from "./features/Kedatangan/api/kedatanganService";
import AppRoutes from "./routes";

export default function App() {
  useAttendance();
  useEffect(() => {
    const autoRecordAttendance = async () => {
      try {
        // 获取 IP
        const ip = await fetch("https://api.ipify.org?format=json")
          .then((res) => res.json())
          .then((data) => data.ip);

        // 判断是否在学校 Wi-Fi 环境（这里先假设 IP 在学校范围内）
        const isSchoolNetwork = ip.startsWith("192.168."); // 例如校园网 IP

        if (isSchoolNetwork) {
          await recordAttendance({
            userId: 0, // 匿名或之后替换为用户ID
            name: "Unknown",
            role: "Guest",
            loginTime: new Date().toISOString(),
            ipAddress: ip,
            wifiSSID: "Campus-WiFi",
          });
          console.log("✅ Wi-Fi 自动打卡成功");
        }
      } catch (error) {
        console.error("❌ 自动打卡失败:", error);
      }
    };

    autoRecordAttendance();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
