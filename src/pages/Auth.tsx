import React, { useState } from "react";
import { Utensils } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import AuthComponent from "@/components/auth/AuthComponent";

const Auth = () => {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  return (
    <div className="min-h-screen bg-[#f0f9f9] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-3 rounded-full">
            <Utensils className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          {isSignupMode ? "Create an account" : "Sign in to CalorieVision"}
        </h2>
        <AuthComponent isSignupMode={isSignupMode} returnTo={returnTo} />
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignupMode(!isSignupMode)}
            className="text-sm text-primary hover:underline font-medium"
          >
            {isSignupMode ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;