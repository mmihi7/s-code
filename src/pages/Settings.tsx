
import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, UserCog, Building, Users, CreditCard, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPlan] = useState("Basic");
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully."
    });
  };

  return (
    <MainLayout premiseName="My Business">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
            <p className="text-white/60">Manage your account and subscription settings</p>
          </div>
          <Link to="/dashboard" className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid grid-cols-4 max-w-2xl">
            <TabsTrigger value="profile">
              <UserCog className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="premise">
              <Building className="w-4 h-4 mr-2" />
              Premise
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm text-white/70">First Name</label>
                    <Input 
                      id="firstName" 
                      defaultValue="John"
                      className="bg-background border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm text-white/70">Last Name</label>
                    <Input 
                      id="lastName" 
                      defaultValue="Doe"
                      className="bg-background border-white/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm text-white/70">Email Address</label>
                    <Input 
                      id="email" 
                      type="email"
                      defaultValue="john@example.com"
                      className="bg-background border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm text-white/70">Phone Number</label>
                    <Input 
                      id="phone" 
                      type="tel"
                      defaultValue="+254712345678"
                      className="bg-background border-white/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm text-white/70">Address</label>
                  <Textarea 
                    id="address" 
                    defaultValue="123 Main St, Nairobi, Kenya"
                    className="bg-background border-white/20"
                  />
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm text-white/70">Current Password</label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    placeholder="Enter current password" 
                    className="bg-background border-white/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm text-white/70">New Password</label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      placeholder="Enter new password" 
                      className="bg-background border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm text-white/70">Confirm Password</label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      placeholder="Confirm new password" 
                      className="bg-background border-white/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>

                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="premise" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Premise Information</CardTitle>
                <CardDescription>Update your business premise details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="businessName" className="text-sm text-white/70">Business Name</label>
                  <Input 
                    id="businessName" 
                    defaultValue="My Business"
                    className="bg-background border-white/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="businessType" className="text-sm text-white/70">Business Type</label>
                    <select
                      id="businessType"
                      defaultValue="office"
                      className="w-full h-10 px-3 rounded-md bg-background border border-white/20 text-white"
                    >
                      <option value="office">Office</option>
                      <option value="retail">Retail Store</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="hotel">Hotel</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="businessId" className="text-sm text-white/70">Business Registration ID</label>
                    <Input 
                      id="businessId" 
                      defaultValue="BUS-123456"
                      className="bg-background border-white/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="businessAddress" className="text-sm text-white/70">Business Address</label>
                  <Textarea 
                    id="businessAddress" 
                    defaultValue="456 Business Park, Nairobi, Kenya"
                    className="bg-background border-white/20"
                  />
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Administration</CardTitle>
                <CardDescription>Manage users and permission roles</CardDescription>
              </CardHeader>
              <CardContent>
                {currentPlan === "Basic" ? (
                  <div className="text-center py-8">
                    <p className="text-lg text-white/80 mb-4">User administration is a Premium feature</p>
                    <p className="text-white/60 max-w-md mx-auto mb-6">
                      Upgrade to Premium to add multiple users with different permission levels.
                    </p>
                    <Button 
                      onClick={() => setIsUpgrading(true)} 
                      className="bg-scode-blue hover:bg-scode-blue/90"
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Premium plan user administration content would go here */}
                    <p>User administration content</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your current subscription plan and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background/40 rounded-lg border border-white/10">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{currentPlan} Plan</h3>
                    <p className="text-white/60">{currentPlan === "Basic" ? "Free" : "KSH 7,500 per month"}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {currentPlan === "Basic" 
                        ? "Limited to 500 visitors" 
                        : "Unlimited visitors with premium features"}
                    </p>
                  </div>
                  {currentPlan === "Basic" ? (
                    <Button 
                      className="bg-scode-blue hover:bg-scode-blue/90"
                      onClick={() => setIsUpgrading(true)}
                    >
                      Upgrade
                    </Button>
                  ) : (
                    <Button variant="outline">Manage Plan</Button>
                  )}
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-3">Available Plans</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Plan Card */}
                    <div className="p-4 bg-background/40 rounded-lg border border-white/10">
                      <h4 className="text-md font-semibold mb-1">Basic Plan</h4>
                      <p className="text-white/80 text-xl mb-2">Free</p>
                      <ul className="space-y-2 mb-4">
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Limited to 500 visitors
                        </li>
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Basic visitor information
                        </li>
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Simple visitor approval
                        </li>
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Basic analytics
                        </li>
                      </ul>
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        disabled={currentPlan === "Basic"}
                      >
                        {currentPlan === "Basic" ? "Current Plan" : "Downgrade"}
                      </Button>
                    </div>
                    
                    {/* Premium Plan Card */}
                    <div className="p-4 bg-background/40 rounded-lg border border-scode-blue/30">
                      <div className="bg-scode-blue text-white text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-2">RECOMMENDED</div>
                      <h4 className="text-md font-semibold mb-1">Premium Plan</h4>
                      <p className="text-white/80 text-xl mb-2">KSH 7,500<span className="text-white/60 text-sm">/month</span></p>
                      <ul className="space-y-2 mb-4">
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Unlimited visitors
                        </li>
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Custom visitor information
                        </li>
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Multi-level approval
                        </li>
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Advanced analytics
                        </li>
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Vehicle registration
                        </li>
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Group registration
                        </li>
                        <li className="text-sm text-white/70 flex items-center">
                          <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                          Enhanced security
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-scode-blue hover:bg-scode-blue/90"
                        disabled={currentPlan === "Premium"}
                        onClick={() => setIsUpgrading(true)}
                      >
                        {currentPlan === "Premium" ? "Current Plan" : "Upgrade"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <h3 className="text-md font-semibold mb-2">Extended Features</h3>
                    <ul className="space-y-2">
                      <li className="text-sm text-white/70 flex items-center">
                        <span className="bg-yellow-500/20 text-yellow-500 rounded-full p-0.5 mr-2">*</span>
                        USSD Integration
                      </li>
                      <li className="text-sm text-white/70 flex items-center">
                        <span className="bg-yellow-500/20 text-yellow-500 rounded-full p-0.5 mr-2">*</span>
                        SMS Notifications
                      </li>
                      <li className="text-sm text-white/70 flex items-center">
                        <span className="bg-yellow-500/20 text-yellow-500 rounded-full p-0.5 mr-2">*</span>
                        API Integration
                      </li>
                    </ul>
                    <p className="text-xs text-white/60 mt-2">* Additional charges may apply</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                type="text" 
                placeholder="Type 'delete' to confirm" 
                className="bg-background border-white/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive">
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgrading} onOpenChange={setIsUpgrading}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              Unlock all premium features for KSH 7,500 per month.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-background/40 rounded-lg border border-scode-blue/30">
              <h3 className="font-semibold mb-2">Premium Features</h3>
              <ul className="space-y-2">
                <li className="text-sm flex items-center">
                  <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                  Unlimited visitors
                </li>
                <li className="text-sm flex items-center">
                  <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                  Custom visitor information
                </li>
                <li className="text-sm flex items-center">
                  <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                  Multi-level approval workflow
                </li>
                <li className="text-sm flex items-center">
                  <span className="bg-green-500/20 text-green-500 rounded-full p-0.5 mr-2">✓</span>
                  Advanced analytics and reporting
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="cardName" className="text-sm text-white/70">Cardholder Name</label>
                <Input 
                  id="cardName" 
                  placeholder="Name on card" 
                  className="bg-background border-white/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cardNumber" className="text-sm text-white/70">Card Number</label>
                <Input 
                  id="cardNumber" 
                  placeholder="1234 5678 9012 3456"
                  className="bg-background border-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="expiry" className="text-sm text-white/70">Expiry Date</label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY"
                  className="bg-background border-white/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cvv" className="text-sm text-white/70">CVV</label>
                <Input 
                  id="cvv" 
                  placeholder="123"
                  className="bg-background border-white/20"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgrading(false)}>
              Cancel
            </Button>
            <Button className="bg-scode-blue hover:bg-scode-blue/90">
              Subscribe - KSH 7,500/mo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Settings;
