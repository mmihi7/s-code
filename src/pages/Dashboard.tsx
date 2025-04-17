
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  QrCode, 
  Users, 
  Settings as SettingsIcon, 
  Download, 
  BarChart3, 
  Clock, 
  UserCheck, 
  ArrowUpRight, 
  Shield,
  Sparkles
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data for dashboard
const visitorData = [
  { id: 1, name: "John Doe", purpose: "Meeting", time: "10:30 AM", date: "2025-04-17", status: "Checked Out" },
  { id: 2, name: "Jane Smith", purpose: "Interview", time: "11:45 AM", date: "2025-04-17", status: "Active" },
  { id: 3, name: "Alex Wong", purpose: "Delivery", time: "09:15 AM", date: "2025-04-17", status: "Active" },
];

// Plan features
const basicPlanFeatures = [
  "50 monthly visitors",
  "Basic analytics",
  "1 entry point",
  "Email notifications",
  "30 days data retention"
];

const premiumPlanFeatures = [
  "Unlimited visitors",
  "Advanced analytics",
  "Multiple entry points",
  "SMS notifications",
  "Visitor pre-registration",
  "API access",
  "1 year data retention"
];

const Dashboard = () => {
  const [currentPlan] = useState("Basic");
  const { toast } = useToast();
  const [premiseFields, setPremiseFields] = useState([
    { id: 1, name: "name", label: "Full Name", required: true },
    { id: 2, name: "phone", label: "Phone Number", required: true },
    { id: 3, name: "visitingPerson", label: "Person Being Visited", required: true },
    { id: 4, name: "purpose", label: "Purpose of Visit", required: true },
  ]);
  
  const handleDownloadQR = () => {
    // In a real app, this would generate and download a QR code
    toast({
      title: "QR Code Downloaded",
      description: "Your premise QR code has been downloaded successfully."
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Premise Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card className="bg-secondary border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              <div className="text-2xl font-bold">135</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-white/60">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
              <div className="text-2xl font-bold">7</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-white/60">Currently in your premise</p>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Visit Time</CardTitle>
              <div className="text-2xl font-bold">47m</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-white/60">-5% from last week</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="visitors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visitors" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Visitors
            </TabsTrigger>
            <TabsTrigger value="qrcode" className="flex items-center">
              <QrCode className="w-4 h-4 mr-2" />
              QR Codes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visitors" className="space-y-4">
            <Card className="bg-secondary border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Recent Visitors</CardTitle>
                <CardDescription>
                  Track and manage visitors to your premise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-white/10">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b border-white/10 transition-colors hover:bg-secondary/20">
                          <th className="h-10 px-4 text-left align-middle font-medium text-white">Name</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-white">Purpose</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-white">Time</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-white">Status</th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-white"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitorData.map((visitor) => (
                          <tr 
                            key={visitor.id}
                            className="border-b border-white/10 transition-colors hover:bg-white/5"
                          >
                            <td className="p-4 align-middle">{visitor.name}</td>
                            <td className="p-4 align-middle">{visitor.purpose}</td>
                            <td className="p-4 align-middle">
                              <div className="flex flex-col">
                                <span>{visitor.time}</span>
                                <span className="text-xs text-white/60">{visitor.date}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                visitor.status === "Active" ? "bg-green-500/20 text-green-500" : "bg-white/10 text-white/60"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                  visitor.status === "Active" ? "bg-green-500" : "bg-white/60"
                                }`}></span>
                                {visitor.status}
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <Button variant="ghost" size="sm">
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline">View All Visitors</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="qrcode" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-secondary border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl">Premise QR Code</CardTitle>
                  <CardDescription>
                    Visitors scan this QR code to check in to your premise
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg mb-6">
                    <QrCode className="w-48 h-48 text-black" />
                  </div>
                  <Button 
                    onClick={handleDownloadQR}
                    className="bg-scode-blue hover:bg-scode-blue/90"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl">Required Visitor Information</CardTitle>
                  <CardDescription>
                    Customize what information visitors need to provide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {premiseFields.map(field => (
                      <div key={field.id} className="flex items-center justify-between p-2 border border-white/10 rounded-md">
                        <div>
                          <p className="font-medium">{field.label}</p>
                          <p className="text-xs text-white/60">
                            {field.required ? "Required" : "Optional"}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    ))}
                    
                    <Button className="w-full" variant="outline">
                      + Add Field
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-secondary border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Visitor Analytics</CardTitle>
                <CardDescription>
                  {currentPlan === "Basic" ? 
                    "Upgrade to Premium for detailed analytics" : 
                    "Detailed insights about your visitor traffic"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                {currentPlan === "Basic" ? (
                  <div className="text-center">
                    <BarChart3 className="w-20 h-20 mx-auto opacity-40 mb-4" />
                    <p className="text-white/60 mb-4">
                      Advanced analytics are available on the Premium plan
                    </p>
                    <Button className="bg-scode-blue hover:bg-scode-blue/90">
                      Upgrade to Premium
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <BarChart3 className="w-20 h-20 mx-auto opacity-40" />
                    <p className="text-white/60">
                      Analytics visualization would appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-secondary border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl">Premise Settings</CardTitle>
                  <CardDescription>
                    Configure your premise and visitor management settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Premise Information</h3>
                    <Button variant="outline" className="w-full text-left justify-start">
                      <Building className="mr-2 h-4 w-4" />
                      Edit Premise Details
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Security Settings</h3>
                    <Button variant="outline" className="w-full text-left justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Configure Security Options
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">User Management</h3>
                    <Button variant="outline" className="w-full text-left justify-start">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Manage Staff Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary border-white/10">
                <CardHeader>
                  <CardTitle className="text-xl">Your Plan</CardTitle>
                  <CardDescription>
                    Current plan: <span className="font-medium">{currentPlan}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-white/10 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      {currentPlan === "Basic" ? (
                        <>Basic</>
                      ) : (
                        <>Premium <Sparkles className="ml-1 w-4 h-4 text-yellow-400" /></>
                      )}
                    </h3>
                    <ul className="space-y-2 mb-4">
                      {currentPlan === "Basic" ? 
                        basicPlanFeatures.map((feature, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <span className="mr-2">✓</span> {feature}
                          </li>
                        )) : 
                        [...basicPlanFeatures, ...premiumPlanFeatures].map((feature, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <span className="mr-2">✓</span> {feature}
                          </li>
                        ))
                      }
                    </ul>
                    
                    {currentPlan === "Basic" && (
                      <Button className="w-full bg-scode-blue hover:bg-scode-blue/90">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                      </Button>
                    )}
                    
                    {currentPlan === "Premium" && (
                      <Button className="w-full" variant="outline">
                        Manage Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
