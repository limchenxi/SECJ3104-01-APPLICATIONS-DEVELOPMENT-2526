import { useEffect, useState } from "react";
import { checkIP } from "../api/fetchApi";
import AttendancePage from "./ClockInPage";
import UnauthorizedPage from "./Unauthorised";
import LoadingSpinner from "../../../components/LoadingSpinner";

export default function Kedatangan() {

  const [allowed, setAllowed] = useState<boolean | null>(true);

  useEffect(() => {
    checkIP().then(setAllowed);
  }, []);

  if(allowed === null) return <div><LoadingSpinner/></div>;
  if(!allowed) {
    return <UnauthorizedPage />
  }

  return(
    <AttendancePage/>
  );
}