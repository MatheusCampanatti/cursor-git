import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const TestPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleTestClick = () => {
    console.log("It works!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test Page Connected</h1>
      
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">User Status</h2>
          <p className="text-gray-700">
            {user ? (
              <>
                <span className="font-medium">Email:</span> {user.email}
              </>
            ) : (
              "Not logged in"
            )}
          </p>
        </div>
        
        <button
          onClick={handleTestClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Test Button
        </button>
        
        <p className="text-sm text-gray-500 mt-2 text-center">
          Click the button and check the browser console!
        </p>
      </div>
    </div>
  );
};

export default TestPage;