// import { useEffect } from "react";
// import { recordAttendance } from "../features/Kedatangan/api/kedatanganService";

// export default function useAttendance() {
//   useEffect(() => {
//     const autoRecordAttendance = async () => {
//       try {
//         // 获取公网 IP
//         const ip = await fetch("https://api.ipify.org?format=json")
//           .then(res => res.json())
//           .then(data => data.ip);

//         // 校园网 IP 判断逻辑
//         const isCampusNetwork =
//           ip.startsWith("192.168.") ||
//           ip.startsWith("10.") ||
//           ip.startsWith("172.16.");

//         if (isCampusNetwork) {
//           await recordAttendance({
//             userId: 0,
//             name: "Guru",
//             role: "Guru",
//             loginTime: new Date().toISOString(),
//             ipAddress: ip,
//             wifiSSID: "Campus-WiFi",
//           });
//           console.log("✅ Wi-Fi 自动打卡成功");
//         } else {
//           console.log("❌ 不在校园网，未打卡");
//         }
//       } catch (err) {
//         console.error("❌ 自动打卡失败:", err);
//       }
//     };

//     autoRecordAttendance();
//   }, []);
// }
