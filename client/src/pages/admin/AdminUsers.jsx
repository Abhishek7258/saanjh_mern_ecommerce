import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const load = () => api.get('/admin/users').then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const role = async (u) => {
    try { await api.put(`/admin/users/${u._id}/role`, { isAdmin: !u.isAdmin }); toast.success(u.isAdmin ? 'Admin access removed' : 'Made admin'); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const del = async (u) => {
    if (!window.confirm(`Delete ${u.name}'s account?`)) return;
    try { await api.delete(`/admin/users/${u._id}`); toast.success('User deleted'); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <>
      <h1 className="title">Customers</h1>
      <div className="panel scroll">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u._id}><td>{u.name}</td><td>{u.email}</td>
              <td><span className={`pill ${u.isAdmin ? 'shipped' : 'pending'}`}>{u.isAdmin ? 'Admin' : 'Customer'}</span></td>
              <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="acts">{u._id !== me._id && <><button className="linkbtn" onClick={() => role(u)}>{u.isAdmin ? 'Remove admin' : 'Make admin'}</button><button className="linkbtn danger" onClick={() => del(u)}>Delete</button></>}</td></tr>))}</tbody>
        </table>
      </div>
    </>
  );
}
