import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  showSidebar?: boolean;
  centered?: boolean;
}

export default function MainLayout({
  showSidebar = false,
  centered = false,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        <main
          className={`flex-1 ${centered ? 'flex items-center justify-center px-4 py-10' : 'px-4 py-8 sm:px-6 lg:px-8'}`}
        >
          {centered ? (
            <Outlet />
          ) : (
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
