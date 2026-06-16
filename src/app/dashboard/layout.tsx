import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import MainContent from '@/components/shared/layout/MainContent';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex-1">
        <MainContent>
          {children}
        </MainContent>
      </div>
      <Footer />
    </>
  );
}
