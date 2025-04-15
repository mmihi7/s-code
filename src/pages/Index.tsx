
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { ArrowRight, UserPlus, Building, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <MainLayout showNavigation={false}>
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-2 text-gradient">
              S-Code
            </h1>
            <p className="text-xl md:text-2xl text-white/80">
              Transforming Visitor Management in Kenya
            </p>
            <p className="mt-4 text-white/60 max-w-lg mx-auto">
              Welcome to the digital revolution in visitor management. S-Code replaces traditional visitor books with a seamless digital experience.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mt-8"
          >
            <Button 
              onClick={() => navigate("/user-access")}
              className="group flex flex-col items-center justify-center p-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 text-center hover:border-scode-blue/50 transition-all"
            >
              <div className="w-16 h-16 bg-scode-blue/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-scode-blue/30 transition-colors">
                <LogIn className="w-8 h-8 text-scode-blue" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Log In</h2>
              <p className="text-white/60 mb-4">Login for returning users</p>
              <span className="inline-flex items-center text-scode-blue">
                Access your dashboard <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            
            <Link 
              to="/register-premise" 
              className="group flex flex-col items-center justify-center p-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 text-center hover:border-scode-blue/50 transition-all"
            >
              <div className="w-16 h-16 bg-scode-blue/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-scode-blue/30 transition-colors">
                <Building className="w-8 h-8 text-scode-blue" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Register Premise</h2>
              <p className="text-white/60 mb-4">Generate QR codes and manage visitor flow</p>
              <span className="inline-flex items-center text-scode-blue">
                Get started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link 
              to="/register-user" 
              className="group flex flex-col items-center justify-center p-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 text-center hover:border-scode-blue/50 transition-all"
            >
              <div className="w-16 h-16 bg-scode-blue/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-scode-blue/30 transition-colors">
                <UserPlus className="w-8 h-8 text-scode-blue" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Register User</h2>
              <p className="text-white/60 mb-4">Create a new visitor account</p>
              <span className="inline-flex items-center text-scode-blue">
                Sign Up <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
