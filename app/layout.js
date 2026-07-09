export const metadata = {
    title: 'Agoyohpp - Sistem AGOYO STOCK dan POS',
    description: 'Sistem manajemen AGOYO STOCK dan kasir untuk AGOYO',
};

export default function RootLayout({ children }) {
    return (
          <html lang="id">
            <body>{children}</body>
      </html>
    );
}
