import './globals.css';
import Script from 'next/script';
export const metadata = { title: 'Clevo', viewport: 'width=device-width, initial-scale=1, maximum-scale=1' };
export default function Layout({ children }) {
  return (<html lang="uz"><body>
    <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
    {children}</body></html>);
}
