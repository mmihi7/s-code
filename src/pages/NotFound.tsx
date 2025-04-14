
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout showNavigation={false}>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-gradient">404</h1>
          <p className="text-xl mb-6 text-white/80">Oops! Page not found</p>
          <p className="text-white/60 max-w-md mx-auto mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Button asChild className="bg-scode-blue hover:bg-scode-blue/90">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" /> Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
