import { useEffect, useState } from 'react';
import { userApi } from './api';

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userApi.getAll().then(setUsers);
  }, []);

  return (
    <div>
      <h2>User List</h2>
      {users.map(u => (
        <div key={u.id}>
          {u.name} ({u.email})
        </div>
      ))}
    </div>
  );
}
