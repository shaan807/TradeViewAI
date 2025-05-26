import type {Metadata} from 'next';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'TradeVisionAI',
  description: 'Advanced stock visualization and AI analysis tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
