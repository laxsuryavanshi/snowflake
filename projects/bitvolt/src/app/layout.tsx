import { Source_Sans_3 } from 'next/font/google';

import './globals.css';

const sourceSans = Source_Sans_3({
  variable: '--turtleby-font-family',
  subsets: ['latin'],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
