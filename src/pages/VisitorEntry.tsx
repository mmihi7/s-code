
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Building, Check, User, Phone, UserPlus, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Mock premise data for demonstration
const mockPremiseData = {
  "premise123": {
    name: "ABC Office Building",
    fields: ["name", "phone", "visitingPerson", "purpose"],
    logo: "/placeholder.svg"
  },
  "premise456": {
    name: "XYZ Shopping Mall",
    fields: ["name", "phone", "idNumber"],
    logo: "/placeholder.svg"
  }
};

const VisitorEntry = () => {
  const { premiseId } = useParams<{ premiseId: string }>();
  const { toast } = useToast();
  const [premise, setPremise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Form field labels and placeholders
  const fieldConfig: Record<string, { label: string, placeholder: string, type: string }> = {
    name: { 
      label: "Full Name", 
      placeholder: "Enter your full name", 
      type: "text" 
    },
    phone: { 
      label: "Phone Number", 
      placeholder: "Enter your phone number", 
      type: "tel" 
    },
    email: { 
      label: "Email Address", 
      placeholder: "Enter your email (optional)", 
      type: "email" 
    },
    idNumber: { 
      label: "ID Number", 
      placeholder: "Enter your national ID number", 
      type: "text" 
    },
    visitingPerson: { 
      label: "Person You're Visiting", 
      placeholder: "Enter name of person you're visiting", 
      type: "text" 
    },
    purpose: { 
      label: "Purpose of Visit", 
      placeholder: "Briefly describe why you're visiting", 
      type: "textarea" 
    },
  };

  // Fetch premise data
  useEffect(() => {
    // In a real app, this would be an API call to fetch premise details
    const fetchPremiseData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (premiseId && mockPremiseData[premiseId as keyof typeof mockPremiseData]) {
          setPremise(mockPremiseData[premiseId as keyof typeof mockPremiseData]);
        } else {
          toast({
            title: "Premise not found",
            description: "This QR code doesn't seem to be valid.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error loading premise data",
          description: "Could not load premise information.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPremiseData();
  }, [premiseId, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRegistrationComplete(true);
      toast({
        title: "Check-in successful",
        description: `You've been checked in at ${premise?.name}.`
      });
      
      // After a successful check-in, prompt user to save details
      setTimeout(() => {
        setShowSaveDialog(true);
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Check-in failed",
        description: "Could not check you in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDetails = () => {
    // In a real app, this would save the user's details and create a permanent account
    localStorage.setItem('scode_visitor', JSON.stringify({
      ...formData,
      savedAt: new Date().toISOString()
    }));
    
    toast({
      title: "Details saved",
      description: "Your information has been saved for future visits."
    });
    
    setShowSaveDialog(false);
  };

  if (loading) {
    return (
      <MainLayout showNavigation={false}>
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <div className="animate-pulse text-center">
            <p className="text-white/60">Loading premise information...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!premise) {
    return (
      <MainLayout showNavigation={false}>
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-6">
          <Card className="bg-secondary border-white/10 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-red-500">Invalid QR Code</CardTitle>
              <CardDescription className="text-center">
                This QR code doesn't link to a valid premise.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-white/60">Please scan a valid S-Code premise QR code to check in.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showNavigation={false}>
      <div className="flex justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="bg-secondary border-white/10">
            {!registrationComplete ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center overflow-hidden">
                      <img src={premise.logo} alt={premise.name} className="w-10 h-10" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center">{premise.name}</CardTitle>
                  <CardDescription className="text-center">
                    Please provide the following information to check in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {premise.fields.map((field: string) => (
                      <div key={field} className="space-y-2">
                        <label htmlFor={field} className="text-sm text-white/70">
                          {fieldConfig[field]?.label || field}
                        </label>
                        {fieldConfig[field]?.type === 'textarea' ? (
                          <Textarea
                            id={field}
                            placeholder={fieldConfig[field]?.placeholder}
                            className="bg-background border-white/20"
                            value={formData[field] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            required
                          />
                        ) : (
                          <Input
                            id={field}
                            type={fieldConfig[field]?.type || 'text'}
                            placeholder={fieldConfig[field]?.placeholder}
                            className="bg-background border-white/20"
                            value={formData[field] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            required
                          />
                        )}
                      </div>
                    ))}
                    <Button 
                      className="w-full bg-scode-blue hover:bg-scode-blue/90 mt-4" 
                      disabled={submitting}
                      type="submit"
                    >
                      {submitting ? "Processing..." : "Check In"}
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center">Check-in Successful!</CardTitle>
                  <CardDescription className="text-center">
                    You have been checked in at {premise.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-white/70 mb-4">
                    <p>Your visit has been recorded.</p>
                    <p className="mt-2 text-sm">Thank you for using S-Code!</p>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Dialog to save user details for future visits */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-secondary border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Save your details?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/70">
              Would you like to save your information for future visits? This will make checking in faster next time.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="sm:w-1/2">
              Not Now
            </Button>
            <Button 
              onClick={handleSaveDetails} 
              className="bg-scode-blue hover:bg-scode-blue/90 sm:w-1/2"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Save My Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default VisitorEntry;
