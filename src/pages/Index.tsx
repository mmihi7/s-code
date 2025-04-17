
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { ArrowRight, Building, LogIn } from "lucide-react";
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              S-Code
            </h1>
            <p className="text-2xl md:text-3xl text-white/80">
              Transform Visitor Management
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full"
          >
            {/* Premise Card */}
            <div className="group flex flex-col items-center justify-center p-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 border border-white/10 text-center hover:border-scode-blue/50 transition-all max-w-md mx-auto">
              <div className="w-16 h-16 bg-scode-blue/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-scode-blue/30 transition-colors">
                <Building className="w-8 h-8 text-scode-blue" />
              </div>
              <Link 
                to="/register-premise"
                className="mt-4 inline-flex items-center px-6 py-3 bg-scode-blue text-white rounded-md hover:bg-scode-blue/90 transition-colors"
              >
                Register Your Premise <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <div className="mt-4 pt-4 border-t border-white/10 w-full">
                <Link 
                  to="/premise-login" 
                  className="text-sm text-white/60 hover:text-white transition-colors flex items-center justify-center"
                >
                  <LogIn className="w-3 h-3 mr-1" /> Premise Owner Login
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
