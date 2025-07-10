import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Source_Sans_3 } from 'next/font/google';

import { S3ConfigProvider } from '@/context/s3config';
import './globals.css';
import { theme } from './theme';

const sourceSans = Source_Sans_3({
  variable: '--turtleby-font-family',
  subsets: ['latin'],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} antialiased`}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <S3ConfigProvider>{children}</S3ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
