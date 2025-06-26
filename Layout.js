import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  return (
    <div>
      <nav>
        <Link href="/">🏠 首页</Link>
        {user ? (
          <>
            <Link href="/Upload">上传房源</Link>
            <Link href="/Favorites">我的收藏</Link>
            <button onClick={handleLogout}>登出</button>
          </>
        ) : (
          <>
            <Link href="/Login">登录</Link>
            <Link href="/Register">注册</Link>
          </>
        )}
      </nav>
      <main>{children}</main>
    </div>
  );
}
