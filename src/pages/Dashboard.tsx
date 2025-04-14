
import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowUpDown, 
  Download, 
  Filter, 
  Sliders, 
  Star, 
  Users, 
  Shield, 
  Clock, 
  Bell, 
  ChevronRight, 
  Calendar,
  FileSpreadsheet,
  ChartBar,
  Smartphone,
  MessageSquare,
  Lock,
  PieChart,
  Settings,
  ChevronDown
} from "lucide-react";

// Mock data for visitor log
const mockVisitorData = [
  { id: 1, name: "John Doe", purpose: "Meeting", host: "Sarah Jones", checkIn: "2025-04-14 09:30 AM", checkOut: "2025-04-14 10:45 AM", status: "Completed" },
  { id: 2, name: "Mary Smith", purpose: "Interview", host: "James Wilson", checkIn: "2025-04-14 11:00 AM", checkOut: "", status: "Active" },
  { id: 3, name: "Robert Johnson", purpose: "Delivery", host: "Reception", checkIn: "2025-04-14 12:15 PM", checkOut: "2025-04-14 12:30 PM", status: "Completed" },
  { id: 4, name: "Elizabeth Brown", purpose: "Maintenance", host: "Facility Manager", checkIn: "2025-04-14 13:45 PM", checkOut: "", status: "Active" },
  { id: 5, name: "Michael Davis", purpose: "Client Meeting", host: "CEO Office", checkIn: "2025-04-14 14:30 PM", checkOut: "", status: "Pending Approval" },
  { id: 6, name: "James Wilson", purpose: "Sales Presentation", host: "Marketing Dept", checkIn: "2025-04-14 15:00 PM", checkOut: "2025-04-14 16:30 PM", status: "Completed" },
  { id: 7, name: "Patricia Moore", purpose: "Job Interview", host: "HR Department", checkIn: "2025-04-14 16:15 PM", checkOut: "", status: "Declined" },
];

// Premium features list
const premiumFeatures = [
  { 
    id: "approval", 
    name: "Approval Workflow", 
    icon: Shield, 
    description: "Enable multi-level approval for visitors including host notification and security verification.",
    price: "+ Ksh 1,000/month"
  },
  { 
    id: "analytics", 
    name: "Advanced Analytics", 
    icon: ChartBar, 
    description: "Get detailed visitor insights, trend analysis, peak hour reports, and custom data exports.",
    price: "+ Ksh 1,500/month"
  },
  { 
    id: "ussd", 
    name: "USSD Integration", 
    icon: Smartphone, 
    description: "Enable non-smartphone check-ins via USSD for visitors without the app.",
    price: "+ Ksh 2,000/month"
  },
  { 
    id: "sms", 
    name: "SMS Notifications", 
    icon: MessageSquare, 
    description: "Send automated SMS alerts to hosts when their visitors arrive.",
    price: "+ Ksh 1,000/month"
  },
  { 
    id: "security", 
    name: "Enhanced Security", 
    icon: Lock, 
    description: "ID verification, watchlist checking, and advanced security features.",
    price: "+ Ksh 2,500/month"
  },
  { 
    id: "reporting", 
    name: "Compliance Reporting", 
    icon: FileSpreadsheet, 
    description: "Generate compliance reports for regulatory requirements automatically.",
    price: "+ Ksh 1,200/month"
  }
];

const Dashboard = () => {
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [visitorData] = useState(mockVisitorData);
  
  const handleUpgradeClick = (featureId: string) => {
    toast({
      title: "Upgrade initiated",
      description: `You're upgrading to the ${featureId} feature. This will redirect to payment.`,
    });
  };
  
  const handleExportData = () => {
    toast({
      title: "Exporting data",
      description: "Your visitor data is being prepared for export.",
    });
    
    // In a real app, this would trigger an actual CSV download
    setTimeout(() => {
      const element = document.createElement("a");
      const mockCsv = "data:text/csv;charset=utf-8,ID,Name,Purpose,Host,Check In,Check Out,Status\n" +
        visitorData.map(v => `${v.id},${v.name},${v.purpose},${v.host},${v.checkIn},${v.checkOut},${v.status}`).join("\n");
      
      element.setAttribute("href", encodeURI(mockCsv));
      element.setAttribute("download", "visitor_log.csv");
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1000);
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-120px)]">
        {/* Sidebar for premium features */}
        <div className={`bg-black/40 border-r border-white/10 ${sidebarCollapsed ? 'w-16' : 'w-72'} transition-all duration-300`}>
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <h2 className={`font-semibold text-white ${sidebarCollapsed ? 'hidden' : 'block'}`}>Premium Features</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/70 hover:text-white"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="py-4">
            {premiumFeatures.map((feature) => (
              <Dialog key={feature.id}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`w-full text-left justify-start mb-1 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}
                  >
                    <feature.icon className="h-5 w-5 mr-2 text-scode-blue" />
                    {!sidebarCollapsed && (
                      <span>{feature.name}</span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-secondary border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="flex items-center text-xl">
                      <feature.icon className="h-5 w-5 mr-2 text-scode-blue" />
                      {feature.name}
                    </DialogTitle>
                    <DialogDescription className="text-white/70">
                      Upgrade your plan to access this premium feature
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <p className="text-white">{feature.description}</p>
                    <div className="bg-black/30 p-4 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="text-yellow-400 h-5 w-5 mr-2" />
                        <span>Premium Feature</span>
                      </div>
                      <span className="font-semibold text-scode-blue">{feature.price}</span>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline">Learn More</Button>
                    <Button 
                      className="bg-scode-blue hover:bg-scode-blue/90"
                      onClick={() => handleUpgradeClick(feature.id)}
                    >
                      Upgrade Now
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}
            
            {!sidebarCollapsed && (
              <div className="px-4 pt-6 mt-4 border-t border-white/10">
                <Link to="#" className="text-sm text-scode-blue hover:underline flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  View all pricing plans
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Premise Dashboard</h1>
              <p className="text-white/70">Manage your visitors and premise settings</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-1" /> Export Data
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-secondary border-white/10 text-white p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter Visitors</h4>
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">Date Range</label>
                      <div className="flex gap-2">
                        <input type="date" className="flex-1 bg-black/20 border border-white/20 rounded p-2 text-sm" />
                        <span className="flex items-center">to</span>
                        <input type="date" className="flex-1 bg-black/20 border border-white/20 rounded p-2 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">Status</label>
                      <select className="w-full bg-black/20 border border-white/20 rounded p-2 text-sm">
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending Approval</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">Reset</Button>
                      <Button size="sm">Apply Filters</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="sm">
                <Sliders className="h-4 w-4 mr-1" /> Settings
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-secondary border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total Visitors Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">7</span>
                  <span className="text-green-500 text-sm mb-1">+2 from yesterday</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="h-4 w-4 text-scode-blue" />
                  <span className="text-sm text-white/70">4 currently on premises</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Average Visit Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">56 mins</span>
                  <span className="text-white/70 text-sm mb-1">this week</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-scode-blue" />
                  <span className="text-sm text-white/70">Trending 10% longer</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">1</span>
                  <span className="text-yellow-500 text-sm mb-1">Awaiting response</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Bell className="h-4 w-4 text-scode-blue" />
                  <span className="text-sm text-white/70">Michael Davis - Client Meeting</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-secondary border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Visitor Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>
                        <div className="flex items-center">
                          Name
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitorData.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell>{visitor.id}</TableCell>
                        <TableCell className="font-medium">{visitor.name}</TableCell>
                        <TableCell>{visitor.purpose}</TableCell>
                        <TableCell>{visitor.host}</TableCell>
                        <TableCell>{visitor.checkIn}</TableCell>
                        <TableCell>{visitor.checkOut || "—"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            visitor.status === "Active" ? "bg-green-500/20 text-green-400" :
                            visitor.status === "Completed" ? "bg-blue-500/20 text-blue-400" :
                            visitor.status === "Pending Approval" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {visitor.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Basic pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-white/70">
                  Showing <b>7</b> of <b>7</b> visitors
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm" disabled>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Collapsible className="border border-white/10 rounded-md">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5">
                <div className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-scode-blue" />
                  <h3 className="font-medium">Premium Analytics</h3>
                </div>
                <ChevronDown className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-t border-white/10">
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <Star className="h-12 w-12 text-yellow-400" />
                  <h4 className="text-xl font-medium">Unlock Premium Analytics</h4>
                  <p className="text-white/70 max-w-md">
                    Gain valuable insights with visitor trends, occupancy reports, peak hour analysis, and custom dashboards.
                  </p>
                  <Button 
                    className="mt-2 bg-scode-blue hover:bg-scode-blue/90"
                    onClick={() => handleUpgradeClick('analytics')}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
