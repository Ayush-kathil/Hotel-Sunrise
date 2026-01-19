import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Get User Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user || !session.user.email) {
        console.log("No session found");
        setIsAdmin(false);
        return;
      }

      const userEmail = session.user.email.toLowerCase();
      // READ FROM ENV (Make sure this matches exactly in your .env file)
      const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase();

      // 2. CHECK 1: Environment Variable Match (Fastest)
      if (userEmail === envAdminEmail) {
        console.log("Admin verified via Env Var");
        setIsAdmin(true);
        return;
      }

      // 3. CHECK 2: Database Role (More Secure)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin') {
        console.log("Admin verified via DB Role");
        setIsAdmin(true);
      } else {
        console.warn("User is not admin:", userEmail);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#fcfbf9]">
        <Loader2 className="animate-spin text-[#d4af37]" size={40} />
      </div>
    );
  }

  if (!isAdmin) {
    toast.error("Access Denied", { description: "You do not have permission to view this page." });
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;