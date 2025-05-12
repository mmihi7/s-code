import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

// Premise ID generator: A123456Z
function generatePremiseId() {
  const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26)); // 'A' to 'Z'
  const randomDigits = () => String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `${randomLetter()}${randomDigits()}${randomLetter()}`;
}

const RegisterPremise = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    companyName: "",
    businessType: "",
    address: "",
    email: "",
    phone: "",
    adminName: "",
    password: "",
    confirmPassword: "",
    terms: false
  });

  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: ""
  });

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    
    // Handle checkbox inputs
    if (id === 'terms') {
      const target = e.target as HTMLInputElement;
      setForm(prev => ({
        ...prev,
        [id]: target.checked
      }));
      return;
    }

    // Handle other inputs
    setForm(prev => ({
      ...prev,
      [id]: value
    }));

    // Clear errors when typing in password fields
    if (id === 'password' || id === 'confirmPassword') {
      setFormErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      password: "",
      confirmPassword: ""
    };

    if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return !errors.password && !errors.confirmPassword;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // 1. Create auth user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.adminName,
            company: form.companyName
          }
        }
      });

      if (authError) throw authError;

      // 2. Create premise record
      const premiseId = generatePremiseId();
      const { data, error } = await supabase.from("premises").insert([
        {
          id: premiseId,
          name: form.companyName,
          business_type: form.businessType,
          address: form.address,
          email: form.email,
          phone: form.phone,
          admin_name: form.adminName,
          owner_id: authData.user?.id
        },
      ]).select().single();

      if (error) throw error;

      // Store the premise_id for dashboard
      if (data?.id) {
        localStorage.setItem("premise_id", data.id);
      }

      setRegistrationComplete(true);
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      // Reset loading state immediately on error
      setLoading(false);
    }
  };

  const navigateToDashboard = () => {
    toast({
      title: "Navigating to dashboard",
      description: "Opening your premise dashboard...",
    });
    navigate("/dashboard");
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
              <CardTitle className="text-2xl flex items-center" style={{ minHeight: "2.5rem" }}>
                {/* Empty placeholder to maintain top padding */}
                <span>&nbsp;</span>
              </CardTitle>
              <CardDescription>
                <span>&nbsp;</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!registrationComplete ? (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="companyName" className="text-sm text-white/70">Company/Institution Name*</label>
                        <Input 
                          id="companyName"
                          required
                          placeholder="Enter company name"
                          className="bg-background border-white/20"
                          value={form.companyName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="businessType" className="text-sm text-white/70">Business Type*</label>
                        <select
                          id="businessType"
                          required
                          className="w-full h-10 px-3 rounded-md bg-background border border-white/20 text-white"
                          value={form.businessType}
                          onChange={handleChange}
                        >
                          <option value="">Select business type</option>
                          <option value="corporate">Corporate Office</option>
                          <option value="block">Building / Mall</option>
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
                        value={form.address}
                        onChange={handleChange}
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
                          value={form.email}
                          onChange={handleChange}
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
                          value={form.phone}
                          onChange={handleChange}
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
                        value={form.adminName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm text-white/70">Password*</label>
                        <Input
                          id="password"
                          type="password"
                          required
                          placeholder="Enter password"
                          className="bg-background border-white/20"
                          value={form.password}
                          onChange={handleChange}
                        />
                        {formErrors.password && (
                          <p className="text-sm text-red-500">{formErrors.password}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm text-white/70">Confirm Password*</label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          required
                          placeholder="Confirm password"
                          className="bg-background border-white/20"
                          value={form.confirmPassword}
                          onChange={handleChange}
                        />
                        {formErrors.confirmPassword && (
                          <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                    {/* Terms and Conditions */}
                    <div className="pt-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={form.terms}
                          onCheckedChange={(checked) => 
                            setForm(prev => ({ ...prev, terms: checked as boolean }))
                          }
                          required
                        />
                        <label htmlFor="terms" className="text-sm text-white/70">
                          I agree to the Terms and Conditions*
                        </label>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-scode-blue hover:bg-scode-blue/90" disabled={loading}>
                      {loading ? "Registering..." : "Register Premise"}
                    </Button>
                  </div>
                </form>
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
                    <Button
                      className="bg-scode-blue hover:bg-scode-blue/90"
                      onClick={navigateToDashboard}
                    >
                      Go to Dashboard
                    </Button>
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