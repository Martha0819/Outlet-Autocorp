import './globals.css';
import { ReduxProvider } from '@/store/ReduxProvider';
import { AppLayoutWrapper } from '@/components/layout/AppLayoutWrapper';
import { ToastContainer } from '@/components/ui/Toast';

export const metadata = {
  title: 'Outlet Autocorp — Mini CRM para Outlet de Autos',
  description: 'Sistema integral de gestión comercial, inventario, guardias y clientes para outlet de autos.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ReduxProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
          <ToastContainer />
        </ReduxProvider>
      </body>
    </html>
  );
}
