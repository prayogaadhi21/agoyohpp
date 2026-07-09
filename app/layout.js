export const metadata = {
  title: 'Agoyohpp - Sistem Gudang dan POS',
  description: 'Sistem manajemen gudang dan kasir untuk coffee shop',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
    <body>{children}</body>
    </html>
  );
}
