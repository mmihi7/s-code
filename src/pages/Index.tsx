
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { ArrowRight, QrCode } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import IsometricPremises from "@/components/animations/IsometricPremises";

const Index = () => {
  const navigate = useNavigate();

  return (
    <MainLayout showNavigation={false}>
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center p-0">
        {/* Top section with logo and tagline */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-10 w-full"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-2 text-gradient">
            S-Code
          </h1>
          <p className="text-lg md:text-xl text-white/80">
            Transform Visitor Management
          </p>
        </motion.div>
        
        {/* Main section with animation and registration card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full flex-1 grid md:grid-cols-2 gap-6 px-6"
        >
          {/* Left column - 3D Animation */}
          <div className="bg-black/20 rounded-xl border border-white/10 overflow-hidden h-[400px] md:h-full flex items-center justify-center">
            <Canvas
              camera={{ position: [10, 10, 10], fov: 50 }}
              className="w-full h-full"
            >
              <IsometricPremises />
            </Canvas>
          </div>
          
          {/* Right column - Registration Link */}
          <div className="flex justify-center items-center">
            <Link 
              to="/register-premise"
              className="group flex flex-col items-center justify-center p-6 rounded-xl bg-scode-blue/20 hover:bg-scode-blue/30 transition-colors w-full max-w-md text-center"
            >
              <div className="w-16 h-16 bg-scode-blue/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-scode-blue/30 transition-colors">
                <QrCode className="w-8 h-8 text-scode-blue" />
              </div>
              
              <span className="text-lg font-semibold text-white mb-4 hover:text-white/90 transition-colors">
                Register Your Premise
              </span>
              
              <div className="flex items-center text-white/60 hover:text-white transition-colors">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Index;
