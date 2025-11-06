import { useEffect } from "react";
import useAttendance from "../../../hooks/useAttendance";
import { recordAttendance } from "../api/kedatanganService";

export default function Wifi() {
  
  useAttendance();
  useEffect(() => {
    const autoRecordAttendance = async () => {
      try {
        const ip = await fetch("https://api.ipify.org?format=json")
          .then((res) => res.json())
          .then((data) => data.ip);

        // 判断是否在学校 Wi-Fi 环境（这里先假设 IP 在学校范围内）
        const isSchoolNetwork = ip.startsWith("192.168."); 

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
    <>
    </>
  );
}
