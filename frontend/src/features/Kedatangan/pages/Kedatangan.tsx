import { useEffect, useState } from "react";
import { checkIP } from "../api/fetchApi";
import AttendancePage from "./ClockInPage";

export default function Kedatangan() {

  const [allowed, setAllowed] = useState<boolean | null>(true);

  // useEffect(() => {
  //   checkIP().then(setAllowed);
  // }, []);

  if(allowed === null) return <div>Checking network...</div>;
  if(!allowed) return <div>Not Authorised</div>

  return(
    <AttendancePage/>
  );
}