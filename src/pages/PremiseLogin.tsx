
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

const PremiseLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Get premise details to verify ownership
      const { data: premiseData, error: premiseError } = await supabase
        .from('premises')
        .select('*')
        .eq('owner_id', authData.user.id)
        .single();

      if (premiseError) throw premiseError;

      // Update timestamps and metadata in auth metadata
      await supabase.auth.updateUser({
        data: {
          premise_id: premiseData.id,
          premise_name: premiseData.name
        }
      });

      toast({
        title: "Login successful",
        description: `Welcome back to ${premiseData.name}!`
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-sm text-white/60 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
          </Link>
          
          <Card className="bg-secondary border-white/10">
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-scode-blue/20 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-scode-blue" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Premise Login</CardTitle>
              <CardDescription className="text-center">
                Access your premise dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-white/70">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your premise email" 
                    className="bg-background border-white/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm text-white/70">Password</label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    className="bg-background border-white/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  className="w-full bg-scode-blue hover:bg-scode-blue/90" 
                  disabled={isLoggingIn}
                  type="submit"
                >
                  <LogIn className="w-4 h-4 mr-2" /> 
                  {isLoggingIn ? "Logging in..." : "Log In to Dashboard"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <div className="text-sm text-center text-white/60">
                Don't have a premise account yet?
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/register-premise">
                  <Building className="w-4 h-4 mr-2" /> 
                  Register Your Premise
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PremiseLogin;
