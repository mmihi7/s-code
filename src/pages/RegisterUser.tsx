
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, Upload, UserPlus, X, CheckCircle, ChevronRight, Fingerprint, ShieldCheck, Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const RegisterUser = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [idPhotoFrontUrl, setIdPhotoFrontUrl] = useState<string | null>(null);
  const [idPhotoBackUrl, setIdPhotoBackUrl] = useState<string | null>(null);
  const [facePhotoUrl, setFacePhotoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [captureType, setCaptureType] = useState<'face' | 'idFront' | 'idBack'>('face');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureCtx, setSignatureCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [quickSignIn, setQuickSignIn] = useState<'google' | 'apple' | null>(null);
  const [permissions, setPermissions] = useState({
    camera: false,
    notifications: false,
    storage: false,
  });

  const nextStep = () => {
    // Validate current step before proceeding
    if (step === 1 && !facePhotoUrl) {
      toast({
        title: "Photo required",
        description: "Please take or upload your face photo to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2 && (!idPhotoFrontUrl || !idPhotoBackUrl)) {
      toast({
        title: "ID photos required",
        description: "Please take or upload both sides of your ID to continue.",
        variant: "destructive"
      });
      return;
    }

    if (step === 5 && !signatureUrl) {
      toast({
        title: "Signature required",
        description: "Please draw your signature to continue.",
        variant: "destructive"
      });
      return;
    }

    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration successful",
      description: "Your account has been created and verified.",
    });
    // In real app, would redirect to user dashboard
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'face' | 'idFront' | 'idBack') => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (type === 'face') {
        setFacePhotoUrl(imageUrl);
      } else if (type === 'idFront') {
        setIdPhotoFrontUrl(imageUrl);
      } else {
        setIdPhotoBackUrl(imageUrl);
      }
      toast({
        title: "Upload successful",
        description: "Photo uploaded.",
      });
    }
  };

  const openCamera = (type: 'face' | 'idFront' | 'idBack') => {
    setCaptureType(type);
    setShowCameraDialog(true);
    
    navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: type === 'face' ? 'user' : 'environment' } 
    })
    .then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    })
    .catch((err) => {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
      setShowCameraDialog(false);
    });
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageUrl = canvas.toDataURL('image/jpeg');
        if (captureType === 'face') {
          setFacePhotoUrl(imageUrl);
        } else if (captureType === 'idFront') {
          setIdPhotoFrontUrl(imageUrl);
        } else {
          setIdPhotoBackUrl(imageUrl);
        }
        
        // Stop camera stream
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        
        setShowCameraDialog(false);
        toast({
          title: "Photo captured",
          description: "Photo captured successfully."
        });
      }
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraDialog(false);
  };
  
  const removePhoto = (type: 'face' | 'idFront' | 'idBack') => {
    if (type === 'face') {
      setFacePhotoUrl(null);
    } else if (type === 'idFront') {
      setIdPhotoFrontUrl(null);
    } else {
      setIdPhotoBackUrl(null);
    }
    toast({
      title: "Photo removed",
      description: "Photo has been removed."
    });
  };

  // Signature pad setup
  React.useEffect(() => {
    if (step === 5 && signatureRef.current) {
      const canvas = signatureRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#ffffff';
        setSignatureCtx(ctx);
      }
    }
  }, [step]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (signatureCtx) {
      signatureCtx.beginPath();
      
      // Handle both mouse and touch events
      const clientX = 'touches' in e 
        ? e.touches[0].clientX 
        : e.clientX;
      const clientY = 'touches' in e 
        ? e.touches[0].clientY 
        : e.clientY;
      
      const canvas = signatureRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        signatureCtx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCtx) return;
    
    // Handle both mouse and touch events
    const clientX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    const clientY = 'touches' in e 
      ? e.touches[0].clientY 
      : e.clientY;
    
    const canvas = signatureRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      signatureCtx.lineTo(x, y);
      signatureCtx.stroke();
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (signatureCtx) {
      signatureCtx.closePath();
      
      // Save the signature as image URL
      const canvas = signatureRef.current;
      if (canvas) {
        const signatureImage = canvas.toDataURL('image/png');
        setSignatureUrl(signatureImage);
      }
    }
  };

  const clearSignature = () => {
    if (signatureRef.current && signatureCtx) {
      signatureCtx.clearRect(0, 0, signatureRef.current.width, signatureRef.current.height);
      setSignatureUrl(null);
    }
  };

  const handleQuickSignIn = (provider: 'google' | 'apple') => {
    setQuickSignIn(provider);
    // In a real app, would initiate OAuth flow
    toast({
      title: `${provider} sign-in initiated`,
      description: "Connecting to external service...",
    });
    
    // Simulate success after a brief delay
    setTimeout(() => {
      // Skip to step 4 (verification) after quick sign-in
      setStep(4);  
      toast({
        title: "Quick sign-in successful",
        description: `Connected via ${provider}.`,
      });
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="flex justify-center p-6 py-12">
        <div className="w-full max-w-2xl">
          <Link to="/user-access" className="inline-flex items-center text-sm text-white/60 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
          </Link>
          
          <Card className="bg-secondary border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <UserPlus className="mr-2 h-6 w-6" />
                Register as a Visitor
              </CardTitle>
              <CardDescription>
                Create your S-Code visitor account in {step} of 7 steps
              </CardDescription>
              
              {/* Progress Bar */}
              <div className="w-full mt-2 bg-background rounded-full h-2">
                <div 
                  className="bg-scode-blue h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(step / 7) * 100}%` }}
                />
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-medium">Face Photo</h3>
                    <p className="text-white/60 text-sm">Let's start by taking a clear photo of your face</p>
                    
                    {/* Face Photo Upload */}
                    <div className="space-y-2">
                      {!facePhotoUrl ? (
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center bg-black/30 aspect-square max-h-80">
                          <Camera className="h-12 w-12 text-white/40 mb-4" />
                          <p className="text-sm text-white/60 text-center mb-4">
                            Take a selfie or upload a recent photo of yourself
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              onClick={() => document.getElementById('facePhotoInput')?.click()}
                              className="min-w-[120px]"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Photo
                            </Button>
                            <Button 
                              variant="default"
                              size="sm" 
                              type="button"
                              onClick={() => openCamera('face')}
                              className="bg-scode-blue hover:bg-scode-blue/90 min-w-[120px]"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Take Photo
                            </Button>
                            <input
                              id="facePhotoInput"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'face')}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-white/20 rounded-lg overflow-hidden">
                          <div className="relative">
                            <img 
                              src={facePhotoUrl} 
                              alt="Face" 
                              className="w-full h-auto object-contain aspect-square max-h-80"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              type="button"
                              className="absolute top-2 right-2"
                              onClick={() => removePhoto('face')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-6">
                      <h4 className="text-base font-medium">Quick Registration</h4>
                      <p className="text-white/60 text-sm mb-4">
                        Or register quickly with your existing accounts
                      </p>
                      
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          className="flex-1 flex items-center justify-center"
                          type="button"
                          onClick={() => handleQuickSignIn('google')}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Google
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="flex-1 flex items-center justify-center"
                          type="button"
                          onClick={() => handleQuickSignIn('apple')}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.4-1.09-.42-2.09-.44-3.21 0-1.38.53-2.25.33-3.12-.4C3.31 16.85 3.96 8.94 8.72 8.65c1.2.03 2.04.54 2.76.56.45 0 1.3-.6 2.85-.48.85.08 3.13.34 4.62 2.53-3.35 2.22-2.82 6.69.62 8.33-.62.74-1.75 1.76-2.52 2.69zM12.03 8.25c-.21-2.32 1.76-4.44 4.12-4.61.27 2.29-1.84 4.5-4.12 4.61z" />
                          </svg>
                          Apple
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-medium">ID Verification</h3>
                    <p className="text-white/60 text-sm">We need to verify your identity with an official ID</p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="idType" className="text-sm text-white/70">ID Type*</label>
                        <select 
                          id="idType" 
                          required
                          className="w-full h-10 px-3 rounded-md bg-background border border-white/20 text-white"
                        >
                          <option value="">Select ID type</option>
                          <option value="nationalId">National ID</option>
                          <option value="passport">Passport</option>
                          <option value="drivingLicense">Driving License</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* ID Front Photo */}
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">ID Front Side*</label>
                      {!idPhotoFrontUrl ? (
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center bg-black/30">
                          <Upload className="h-10 w-10 text-white/40 mb-2" />
                          <p className="text-sm text-white/60 text-center mb-2">
                            Upload a clear photo of the front of your ID
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              onClick={() => document.getElementById('idFrontPhotoInput')?.click()}
                            >
                              Choose File
                            </Button>
                            <Button 
                              variant="default"
                              size="sm" 
                              type="button"
                              onClick={() => openCamera('idFront')}
                              className="bg-scode-blue hover:bg-scode-blue/90"
                            >
                              Take Photo
                            </Button>
                            <input
                              id="idFrontPhotoInput"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'idFront')}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-white/20 rounded-lg overflow-hidden">
                          <div className="relative">
                            <img 
                              src={idPhotoFrontUrl} 
                              alt="ID Front" 
                              className="w-full h-auto object-contain max-h-48"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              type="button"
                              className="absolute top-2 right-2"
                              onClick={() => removePhoto('idFront')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* ID Back Photo */}
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">ID Back Side*</label>
                      {!idPhotoBackUrl ? (
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center bg-black/30">
                          <Upload className="h-10 w-10 text-white/40 mb-2" />
                          <p className="text-sm text-white/60 text-center mb-2">
                            Upload a clear photo of the back of your ID
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              onClick={() => document.getElementById('idBackPhotoInput')?.click()}
                            >
                              Choose File
                            </Button>
                            <Button 
                              variant="default"
                              size="sm" 
                              type="button"
                              onClick={() => openCamera('idBack')}
                              className="bg-scode-blue hover:bg-scode-blue/90"
                            >
                              Take Photo
                            </Button>
                            <input
                              id="idBackPhotoInput"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'idBack')}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-white/20 rounded-lg overflow-hidden">
                          <div className="relative">
                            <img 
                              src={idPhotoBackUrl} 
                              alt="ID Back" 
                              className="w-full h-auto object-contain max-h-48"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              type="button"
                              className="absolute top-2 right-2"
                              onClick={() => removePhoto('idBack')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-scode-blue/10 border border-scode-blue/30 rounded-lg p-4 text-sm">
                      <p className="text-white/80">
                        In the future, we will use AI to automatically extract details from your ID such as:
                      </p>
                      <ul className="list-disc pl-5 mt-2 text-white/70 space-y-1">
                        <li>Full name</li>
                        <li>ID registration number</li>
                        <li>Place of birth</li>
                        <li>Date of birth</li>
                        <li>Other relevant information</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <p className="text-white/60 text-sm">Please fill in your personal details</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm text-white/70">First Name*</label>
                        <Input 
                          id="firstName" 
                          required
                          placeholder="Enter your first name" 
                          className="bg-background border-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm text-white/70">Last Name*</label>
                        <Input 
                          id="lastName" 
                          required
                          placeholder="Enter your last name" 
                          className="bg-background border-white/20"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm text-white/70">Email Address*</label>
                        <Input 
                          id="email" 
                          type="email"
                          required
                          placeholder="Enter your email" 
                          className="bg-background border-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm text-white/70">Phone Number*</label>
                        <Input 
                          id="phone" 
                          type="tel"
                          required
                          placeholder="Enter your phone number" 
                          className="bg-background border-white/20"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm text-white/70">Address</label>
                      <Textarea 
                        id="address" 
                        placeholder="Enter your address" 
                        className="bg-background border-white/20"
                      />
                    </div>
                  </div>
                )}
                
                {step === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-medium">Verification Details</h3>
                    <p className="text-white/60 text-sm">Review your information before continuing</p>
                    
                    <div className="bg-background/50 rounded-lg p-5 space-y-4">
                      <div className="flex items-start gap-4">
                        {facePhotoUrl && (
                          <img 
                            src={facePhotoUrl} 
                            alt="Face" 
                            className="w-20 h-20 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-medium">{quickSignIn ? 'Quick Sign-in via ' + quickSignIn.charAt(0).toUpperCase() + quickSignIn.slice(1) : 'John Doe'}</h4>
                          <p className="text-sm text-white/60">johndoe@example.com</p>
                          <p className="text-sm text-white/60">+254 712 345 678</p>
                          
                          <div className="flex items-center mt-2 text-scode-blue text-sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            ID Verified
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">ID Type:</span>
                          <span>National ID</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">ID Number:</span>
                          <span>****4578</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">Date of Birth:</span>
                          <span>15 May 1988</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          type="button" 
                          size="sm"
                          className="w-full"
                          onClick={() => setStep(3)}
                        >
                          Edit Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm text-white/70">Create Password*</label>
                        <Input 
                          id="password" 
                          type="password"
                          required
                          placeholder="Create a strong password" 
                          className="bg-background border-white/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm text-white/70">Confirm Password*</label>
                        <Input 
                          id="confirmPassword" 
                          type="password"
                          required
                          placeholder="Confirm your password" 
                          className="bg-background border-white/20"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center py-2 space-x-2">
                      <Checkbox id="twoFactor" />
                      <label htmlFor="twoFactor" className="text-sm leading-tight">
                        Enable two-factor authentication (Recommended)
                      </label>
                    </div>
                  </div>
                )}
                
                {step === 5 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-medium">Digital Signature</h3>
                    <p className="text-white/60 text-sm">Please draw your signature below</p>
                    
                    <div className="space-y-3">
                      <div
                        className="border-2 border-white/20 rounded-lg bg-black/20 p-2"
                      >
                        <canvas
                          ref={signatureRef}
                          width="600"
                          height="200"
                          className="bg-black/30 w-full h-40 rounded-md cursor-crosshair"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={endDrawing}
                          onMouseLeave={endDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={endDrawing}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={clearSignature}
                      >
                        Clear Signature
                      </Button>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-sm text-white/70">
                        This digital signature will be used to authenticate your visits. By drawing your signature, you agree that it represents your legal signature for all S-Code related activities.
                      </p>
                    </div>
                  </div>
                )}
                
                {step === 6 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-medium">App Permissions</h3>
                    <p className="text-white/60 text-sm">S-Code needs the following permissions to function properly</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-background/50 rounded-lg">
                        <div className="mt-0.5">
                          <Checkbox 
                            id="cameraPermission"
                            checked={permissions.camera}
                            onCheckedChange={(checked) => 
                              setPermissions(prev => ({...prev, camera: checked === true}))
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor="cameraPermission" className="font-medium block">Camera Access</label>
                          <p className="text-sm text-white/60">
                            Required for scanning QR codes and capturing photos
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-background/50 rounded-lg">
                        <div className="mt-0.5">
                          <Checkbox 
                            id="storagePermission"
                            checked={permissions.storage}
                            onCheckedChange={(checked) => 
                              setPermissions(prev => ({...prev, storage: checked === true}))
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor="storagePermission" className="font-medium block">Storage Access</label>
                          <p className="text-sm text-white/60">
                            Required for storing your profile information locally
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-background/50 rounded-lg">
                        <div className="mt-0.5">
                          <Checkbox 
                            id="notificationsPermission"
                            checked={permissions.notifications}
                            onCheckedChange={(checked) => 
                              setPermissions(prev => ({...prev, notifications: checked === true}))
                            }
                          />
                        </div>
                        <div>
                          <label htmlFor="notificationsPermission" className="font-medium block">Notifications</label>
                          <p className="text-sm text-white/60">
                            Receive important alerts about your visits and account activity
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {step === 7 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-medium">Legal Terms & Agreements</h3>
                    <p className="text-white/60 text-sm">Please review and accept our terms and data policies</p>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="terms" required className="mt-1" />
                        <label htmlFor="terms" className="text-sm leading-tight">
                          I agree to the <Link to="#" className="text-scode-blue hover:underline">Terms of Service</Link> and <Link to="#" className="text-scode-blue hover:underline">Privacy Policy</Link>
                        </label>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox id="gdpr" required className="mt-1" />
                        <label htmlFor="gdpr" className="text-sm leading-tight">
                          I consent to the collection and processing of my personal data in accordance with GDPR and Kenya Data Protection Act
                        </label>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox id="signature" required className="mt-1" />
                        <label htmlFor="signature" className="text-sm leading-tight">
                          I confirm that the information provided is accurate and serves as my digital signature
                        </label>
                      </div>
                      
                      <Separator className="my-3 bg-white/10" />
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox id="promotional" className="mt-1" />
                        <label htmlFor="promotional" className="text-sm leading-tight text-white/70">
                          I agree to receive promotional messages from S-Code partners (optional)
                        </label>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox id="newsletter" className="mt-1" />
                        <label htmlFor="newsletter" className="text-sm leading-tight text-white/70">
                          Subscribe to occasional email updates about new features (optional)
                        </label>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-background/50 rounded-lg space-y-2">
                      <div className="flex items-center">
                        <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="font-medium text-sm">Data Protection Summary</h4>
                      </div>
                      <p className="text-xs text-white/70">
                        Your personal data is protected and will only be used for visitor management purposes. Your face photo and ID information are securely stored with encryption. We implement full compliance with Kenya Data Protection Act and international privacy standards.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  
                  {step < 7 ? (
                    <Button type="button" className="bg-scode-blue hover:bg-scode-blue/90" onClick={nextStep}>
                      Continue
                    </Button>
                  ) : (
                    <Button type="submit" className="bg-scode-blue hover:bg-scode-blue/90">
                      Complete Registration
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="text-center text-sm text-white/60 flex justify-center pt-2">
              Already have an account? <Link to="/user-access" className="text-scode-blue ml-1 hover:underline">Log in</Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Camera Dialog */}
      <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
        <DialogContent className="sm:max-w-md" onInteractOutside={closeCamera}>
          <DialogHeader>
            <DialogTitle>
              {captureType === 'face' ? 'Take a Selfie' : 
               captureType === 'idFront' ? 'Capture ID Front' : 'Capture ID Back'}
            </DialogTitle>
            <DialogClose onClick={closeCamera} />
          </DialogHeader>
          <div className="flex flex-col space-y-2 items-center">
            <div className="w-full max-w-sm aspect-video relative bg-black rounded-md overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              {captureType !== 'face' && (
                <div className="absolute inset-0 border-2 border-scode-blue/60 opacity-50 m-8 rounded-md"></div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <Button 
              onClick={capturePhoto}
              className="bg-scode-blue hover:bg-scode-blue/90"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture Photo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default RegisterUser;
