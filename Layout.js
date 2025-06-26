import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div>
      <nav>
        <Link href="/">首页</Link> | <Link href="/Login">登录</Link> | <Link href="/Register">注册</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
