import './globals.css';

export const metadata = {
  title: 'AI Video Meeting Assistant',
  description: 'Real-time video calling with AI meeting assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
