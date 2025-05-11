
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { ArrowRight } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import IsometricPremises from "@/components/animations/IsometricPremises";

const Index = () => {
  return (
    <MainLayout showNavigation={false}>
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-between p-4 md:p-6">
        {/* Top section with logo and tagline */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-6 w-full"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-2 text-gradient">
            Code
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-4">
            Paperless Visitor Management
          </p>
        </motion.div>
        
        {/* Animation section - full width and wider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full flex-1 h-[250px] md:h-[350px] mb-8"
        >
          <Canvas
            camera={{ position: [8, 8, 8], fov: 60 }}
            className="w-full h-full"
          >
            <IsometricPremises />
          </Canvas>
        </motion.div>
        
        {/* Two columns for actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-4"
        >
          {/* Left column - Login */}
          <Link 
            to="/premise-login"
            className="group flex items-center justify-center p-6 rounded-xl hover:bg-scode-blue/10 transition-colors w-full text-center"
          >
            <span className="text-lg font-semibold text-white mr-2">Login</span>
            <ArrowRight className="w-5 h-5 text-scode-blue group-hover:translate-x-1 transition-transform" />
          </Link>
          
          {/* Right column - Get Started */}
          <Link 
            to="/register-premise"
            className="group flex items-center justify-center p-6 rounded-xl hover:bg-scode-blue/10 transition-colors w-full text-center"
          >
            <span className="text-lg font-semibold text-white mr-2">Get Started</span>
            <ArrowRight className="w-5 h-5 text-scode-blue group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Index;
