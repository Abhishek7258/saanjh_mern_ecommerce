import { useState } from 'react';
import toast from 'react-hot-toast';
import { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { user, update } = useAuth();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const saveName = async (e) => {
    e.preventDefault();
    try { await update({ name }); toast.success('Name updated'); } catch (err) { toast.error(errMsg(err)); }
  };
  const savePw = async (e) => {
    e.preventDefault();
    try { await update(pw); setPw({ currentPassword: '', newPassword: '' }); toast.success('Password changed'); } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <section className="section narrow">
      <h1 className="title">Account</h1>
      <form className="panel acct" onSubmit={saveName}>
        <h3>Your details</h3>
        <label>Email<input value={user.email} disabled /></label>
        <label>Name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
        <button className="btn sm">Save name</button>
      </form>
      <form className="panel acct" onSubmit={savePw}>
        <h3>Change password</h3>
        <label>Current password<input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" /></label>
        <label>New password<input type="password" required minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" /></label>
        <button className="btn sm">Update password</button>
      </form>
    </section>
  );
}
