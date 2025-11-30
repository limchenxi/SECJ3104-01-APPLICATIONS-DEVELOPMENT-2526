import { useEffect, useState } from "react";
import { checkIP } from "../api/fetchApi";

function Kedatangan() {

  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    checkIP().then(setAllowed);
  }, []);

  if(allowed === null) return <div>Checking network...</div>;
  if(!allowed) return <div>Oopsies daises</div>

  return(
    <h1>Hello world</h1>
  );
}

export default Kedatangan;