import { useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('注册成功，请去邮箱验证');
  };

  return (
    <Layout>
      <div>
        <h2>注册</h2>
        <form onSubmit={handleRegister}>
          <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">注册</button>
        </form>
      </div>
    </Layout>
  );
}
