import { useEffect } from "react";

const List () => {
    useEffect(() => {
  getMyCerapan().then(setData);
}, []);
    return (
        <>
        </>
    );
};

export default List;