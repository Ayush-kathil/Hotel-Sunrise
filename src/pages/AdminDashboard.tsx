import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Checking access...");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Get Current User
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setStatus("No user found. Please log in.");
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // 2. Fetch Profile directly
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setDebugInfo({ sessionUser: session.user.email, profile, dbError: error });

      if (error) {
        setStatus(`Database Error: ${error.message}`);
        return;
      }

      if (!profile) {
        setStatus("Error: Profile row is MISSING in database. Run the SQL script!");
        return;
      }

      if (profile.role !== 'admin') {
        setStatus(`Access Denied. Your role is '${profile.role}', but expected 'admin'.`);
        return;
      }

      setStatus("SUCCESS: You are Admin!");
    };

    checkAdmin();
  }, [navigate]);

  return (
    <div className="p-10 font-mono text-sm bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Debugger</h1>
      
      <div className={`p-4 rounded mb-4 text-white font-bold ${status.includes("SUCCESS") ? "bg-green-600" : "bg-red-600"}`}>
        {status}
      </div>

      <pre className="bg-black text-white p-4 rounded overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>

      <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-gray-300 rounded">
        Back Home
      </button>
    </div>
  );
};

export default AdminDashboard;