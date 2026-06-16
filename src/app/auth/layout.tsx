import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </>
  );
}
