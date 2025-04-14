
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, Check, Download, QrCode } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const RegisterPremise = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationComplete(true);
    toast({
      title: "Premise registration successful",
      description: "Your premise has been registered successfully.",
    });
  };

  const handleDownloadQR = () => {
    if (!qrCodeRef.current) return;

    // In a real app, we would generate and download an actual QR code image
    // Here we'll simulate it by creating a dummy image
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Draw QR code (simplified representation)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = "#1E90FF";
      ctx.fillRect(50, 50, 200, 200);
      
      // Create QR patterns
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillRect(70 + i * 30, 70 + j * 30, 25, 25);
          }
        }
      }
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");
      
      // Create a download link
      const link = document.createElement("a");
      link.download = "scode-premise-qr.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "QR Code Downloaded",
        description: "Your premise QR code has been downloaded successfully.",
      });
    }
  };

  const navigateToDashboard = () => {
    toast({
      title: "Navigating to dashboard",
      description: "Your dashboard is being prepared.",
    });
    // In a real app, we would navigate to an actual dashboard
    // For now, we'll just go to the homepage
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="flex justify-center p-6 py-12">
        <div className="w-full max-w-2xl">
          <Link to="/" className="inline-flex items-center text-sm text-white/60 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
          </Link>
          
          <Card className="bg-secondary border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Building className="mr-2 h-6 w-6" />
                Register Your Premise
              </CardTitle>
              <CardDescription>
                Get started with S-Code visitor management for your business or institution
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!registrationComplete ? (
                <Tabs defaultValue="details" className="space-y-4">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="details">Premise Details</TabsTrigger>
                    <TabsTrigger value="settings">System Settings</TabsTrigger>
                  </TabsList>
                  
                  <form onSubmit={handleSubmit}>
                    <TabsContent value="details" className="space-y-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="companyName" className="text-sm text-white/70">Company/Institution Name*</label>
                            <Input 
                              id="companyName" 
                              required
                              placeholder="Enter company name" 
                              className="bg-background border-white/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="businessType" className="text-sm text-white/70">Business Type*</label>
                            <select 
                              id="businessType" 
                              required
                              className="w-full h-10 px-3 rounded-md bg-background border border-white/20 text-white"
                            >
                              <option value="">Select business type</option>
                              <option value="corporate">Corporate Office</option>
                              <option value="retail">Retail</option>
                              <option value="education">Educational Institution</option>
                              <option value="healthcare">Healthcare</option>
                              <option value="government">Government</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="address" className="text-sm text-white/70">Physical Address*</label>
                          <Textarea 
                            id="address" 
                            required
                            placeholder="Enter physical address" 
                            className="bg-background border-white/20"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="email" className="text-sm text-white/70">Business Email*</label>
                            <Input 
                              id="email" 
                              type="email"
                              required
                              placeholder="Enter business email" 
                              className="bg-background border-white/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm text-white/70">Business Phone*</label>
                            <Input 
                              id="phone" 
                              type="tel"
                              required
                              placeholder="Enter business phone" 
                              className="bg-background border-white/20"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="adminName" className="text-sm text-white/70">Admin/Contact Person*</label>
                          <Input 
                            id="adminName" 
                            required
                            placeholder="Enter name of admin/contact person" 
                            className="bg-background border-white/20"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="adminEmail" className="text-sm text-white/70">Admin Email*</label>
                            <Input 
                              id="adminEmail" 
                              type="email"
                              required
                              placeholder="Enter admin email" 
                              className="bg-background border-white/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="adminPhone" className="text-sm text-white/70">Admin Phone*</label>
                            <Input 
                              id="adminPhone" 
                              type="tel"
                              required
                              placeholder="Enter admin phone" 
                              className="bg-background border-white/20"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Access Control Settings</h3>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Approval Workflow*</label>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2 p-3 rounded-md bg-background/40">
                              <input type="radio" id="noApproval" name="approvalFlow" defaultChecked />
                              <label htmlFor="noApproval" className="text-sm">No approval required (automatic check-in)</label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 rounded-md bg-background/40">
                              <input type="radio" id="securityApproval" name="approvalFlow" />
                              <label htmlFor="securityApproval" className="text-sm">Security/reception approval</label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 rounded-md bg-background/40">
                              <input type="radio" id="hostApproval" name="approvalFlow" />
                              <label htmlFor="hostApproval" className="text-sm">Host approval (person being visited)</label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Entry Point Settings</label>
                          <div className="flex items-start space-x-2">
                            <Checkbox id="multipleEntries" />
                            <label htmlFor="multipleEntries" className="text-sm">
                              Enable multiple entry points (generate multiple QR codes)
                            </label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Exit Tracking</label>
                          <div className="flex items-start space-x-2">
                            <Checkbox id="exitTracking" defaultChecked />
                            <label htmlFor="exitTracking" className="text-sm">
                              Enable exit tracking for visitors
                            </label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-white/70">Additional Features</label>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <Checkbox id="notifications" defaultChecked />
                              <label htmlFor="notifications" className="text-sm">
                                Email notifications for new visitors
                              </label>
                            </div>
                            <div className="flex items-start space-x-2">
                              <Checkbox id="smsNotifications" />
                              <label htmlFor="smsNotifications" className="text-sm">
                                SMS notifications (additional charges may apply)
                              </label>
                            </div>
                            <div className="flex items-start space-x-2">
                              <Checkbox id="ussd" />
                              <label htmlFor="ussd" className="text-sm">
                                Enable USSD option for non-smartphone check-ins (premium feature)
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <div className="flex items-start space-x-2">
                            <Checkbox id="terms" required />
                            <label htmlFor="terms" className="text-sm leading-tight">
                              I agree to the <Link to="#" className="text-scode-blue hover:underline">Terms of Service</Link>, <Link to="#" className="text-scode-blue hover:underline">Privacy Policy</Link>, and consent to processing visitor data in accordance with applicable laws
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full bg-scode-blue hover:bg-scode-blue/90">
                        Register Premise
                      </Button>
                    </TabsContent>
                  </form>
                </Tabs>
              ) : (
                <div className="space-y-6 pt-4 pb-2 animate-fade-in">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Registration Successful!</h3>
                    <p className="text-white/70 mb-6 max-w-md">
                      Your premise has been successfully registered with S-Code. You can now manage your visitor flow digitally.
                    </p>
                    
                    <div className="bg-black/30 p-6 rounded-xl mb-6 w-full max-w-xs" ref={qrCodeRef}>
                      <div className="flex justify-center mb-3">
                        <QrCode className="w-32 h-32 text-scode-blue" />
                      </div>
                      <p className="text-sm text-white/70">
                        Your unique premise QR code has been generated. Visitors can scan this code to check in.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <Button variant="outline" onClick={handleDownloadQR}>
                        <Download className="mr-2 h-4 w-4" />
                        Download QR Code
                      </Button>
                      <Button 
                        className="bg-scode-blue hover:bg-scode-blue/90"
                        onClick={navigateToDashboard}
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            {!registrationComplete && (
              <CardFooter className="text-center text-sm text-white/60 flex flex-col gap-2 pt-2">
                <div>
                  For more information about pricing and features, please visit our <Link to="#" className="text-scode-blue hover:underline">pricing page</Link>.
                </div>
                <div>
                  Need help? <Link to="#" className="text-scode-blue hover:underline">Contact support</Link>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPremise;
