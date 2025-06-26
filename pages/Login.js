import { useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = '/';
  };

  return (
    <Layout>
      <div>
        <h2>登录</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">登录</button>
        </form>
      </div>
    </Layout>
  );
}
