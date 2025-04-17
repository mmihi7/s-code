
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, QrCode, History, MapPin, Clock, ChevronRight, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const UserDashboard = () => {
  const [showScanDialog, setShowScanDialog] = useState(true);
  const [visitHistory, setVisitHistory] = useState([
    {
      id: 1,
      premiseName: "ABC Office Building",
      location: "Nairobi CBD",
      date: "2025-04-12",
      time: "09:30 AM",
    },
    {
      id: 2,
      premiseName: "XYZ Shopping Mall",
      location: "Westlands",
      date: "2025-04-05",
      time: "02:15 PM",
    },
    {
      id: 3,
      premiseName: "123 Corporate Tower",
      location: "Upper Hill",
      date: "2025-03-28",
      time: "11:45 AM",
    }
  ]);
  const { toast } = useToast();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Start camera when scan dialog opens
  useEffect(() => {
    if (showScanDialog) {
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup when component unmounts
    return () => {
      stopCamera();
    };
  }, [showScanDialog]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
      setShowScanDialog(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleCancel = () => {
    setShowScanDialog(false);
  };

  // Mock function to handle QR code detection
  const handleQRCodeDetected = (premiseData: { name: string, location: string }) => {
    toast({
      title: "QR Code Scanned",
      description: `Checking in at ${premiseData.name}`,
    });
    setShowScanDialog(false);
    // In a real app, would send check-in data to server
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

        <div className="grid gap-6">
          {/* Quick Actions */}
          <Card className="bg-secondary border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => setShowScanDialog(true)}
                  className="bg-scode-blue hover:bg-scode-blue/90"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan Premise QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visit History */}
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recent Visits</TabsTrigger>
              <TabsTrigger value="all">All Visits</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-2">
              <Card className="bg-secondary border-white/10">
                <CardContent className="pt-6">
                  {visitHistory.length > 0 ? (
                    <div className="space-y-4">
                      {visitHistory.map((visit) => (
                        <div 
                          key={visit.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-scode-blue/20 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-scode-blue" />
                            </div>
                            <div>
                              <p className="font-medium">{visit.premiseName}</p>
                              <p className="text-sm text-white/60">{visit.location}</p>
                              <div className="flex items-center mt-1 text-xs text-white/50">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{visit.date} • {visit.time}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-white/60">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p>No visit history yet</p>
                      <p className="text-sm">Scan a premise QR code to check in</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="all" className="mt-2">
              <Card className="bg-secondary border-white/10">
                <CardContent className="pt-6">
                  {/* All visits would be similar, but perhaps with filtering/search options */}
                  <div className="text-center py-6 text-white/60">
                    <p>Visit history feature coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* QR Code Scanning Dialog */}
        <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
          <DialogContent className="sm:max-w-md" onInteractOutside={handleCancel}>
            <DialogHeader>
              <DialogTitle>Scan Premise QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4 items-center">
              <div className="w-full aspect-square relative bg-black rounded-md overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-scode-blue/60 opacity-50 m-10 rounded-lg"></div>
              </div>
              <p className="text-sm text-white/70 text-center">
                Point your camera at the premise QR code to check in
              </p>
              <Button 
                variant="outline"
                onClick={handleCancel}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              
              {/* For testing purposes - in a real app, this would be handled by QR code detection */}
              <Button 
                className="bg-scode-blue hover:bg-scode-blue/90 w-full"
                onClick={() => handleQRCodeDetected({ name: "Test Premise", location: "Test Location" })}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Simulate Successful Scan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default UserDashboard;
