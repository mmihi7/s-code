
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const UserAccess = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      // Simulate login process
      // In a real app, this would be an API call to authenticate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, any non-empty credentials will work
      if (email.trim() && password.trim()) {
        toast({
          title: "Login successful",
          description: "Welcome back to S-Code!"
        });
        navigate("/user-dashboard"); // Redirect to the user dashboard
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred during login.",
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
                  <UserPlus className="w-6 h-6 text-scode-blue" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Visitor Login</CardTitle>
              <CardDescription className="text-center">
                Login to check in at S-Code locations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-white/70">Email or Phone Number</label>
                  <Input 
                    id="email" 
                    type="text" 
                    placeholder="Enter your email or phone" 
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
                  {isLoggingIn ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <div className="text-sm text-center text-white/60">
                Are you a premise owner?
              </div>
              <Button variant="outline" className="w-full mb-2" asChild>
                <Link to="/premise-login">
                  Premise Owner Login
                </Link>
              </Button>
              
              <div className="text-sm text-center text-white/60 mt-2">
                Don't have a visitor account yet?
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/register-user">
                  <UserPlus className="w-4 h-4 mr-2" /> 
                  Register as a Visitor
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserAccess;
