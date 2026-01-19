import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // 1. Get current logged in user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // 2. Check their role in the DB
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          console.error("Profile check failed", error);
          setIsAdmin(false);
        } else {
          // 3. Only allow if role is explicitly 'admin'
          setIsAdmin(profile.role === 'admin');
        }

      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Loading State (Spinner while checking)
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f4f4f5]">
        <Loader2 className="animate-spin text-[#d4af37] mb-4" size={40} />
        <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Verifying Privileges...</p>
      </div>
    );
  }

  // Access Denied? Kick them to home.
  if (!isAdmin) {
    toast.error("Unauthorized Access", { description: "This area is restricted to administrators." });
    return <Navigate to="/" replace />;
  }

  // Access Granted? Render the Admin Dashboard
  return <Outlet />;
};

export default AdminRoute;