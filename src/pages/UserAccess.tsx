
import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, LogIn, ArrowLeft } from "lucide-react";
 
const UserAccess = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-sm text-white/60 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
          </Link>
          
          <Card className="bg-secondary border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">User Access</CardTitle>
              <CardDescription>
                Login to check in or register as a new visitor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-white/70">Email or Phone Number</label>
                <Input 
                  id="email" 
                  type="text" 
                  placeholder="Enter your email or phone" 
                  className="bg-background border-white/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-white/70">Password</label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  className="bg-background border-white/20"
                />
              </div>
              <Button className="w-full bg-scode-blue hover:bg-scode-blue/90">
                <LogIn className="w-4 h-4 mr-2" /> 
                Log In
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <div className="text-sm text-center text-white/60">
                Don't have an account yet?
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
