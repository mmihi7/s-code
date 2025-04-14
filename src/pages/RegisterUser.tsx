
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, Upload, UserPlus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

const RegisterUser = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
  const [facePhotoUrl, setFacePhotoUrl] = useState<string | null>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [captureType, setCaptureType] = useState<'id' | 'face'>('id');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const nextStep = () => {
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
      description: "Your account has been created.",
    });
    // In real app, would redirect to dashboard or login
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'face') => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (type === 'id') {
        setIdPhotoUrl(imageUrl);
      } else {
        setFacePhotoUrl(imageUrl);
      }
      toast({
        title: "Upload successful",
        description: type === 'id' ? "ID photo uploaded." : "Face photo uploaded.",
      });
    }
  };

  const openCamera = (type: 'id' | 'face') => {
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
        if (captureType === 'id') {
          setIdPhotoUrl(imageUrl);
        } else {
          setFacePhotoUrl(imageUrl);
        }
        
        // Stop camera stream
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        
        setShowCameraDialog(false);
        toast({
          title: "Photo captured",
          description: captureType === 'id' ? "ID photo captured successfully." : "Face photo captured successfully."
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
  
  const removePhoto = (type: 'id' | 'face') => {
    if (type === 'id') {
      setIdPhotoUrl(null);
    } else {
      setFacePhotoUrl(null);
    }
    toast({
      title: "Photo removed",
      description: type === 'id' ? "ID photo removed." : "Face photo removed."
    });
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
                Create your S-Code visitor account in {step} of 3 steps
              </CardDescription>
              
              {/* Progress Bar */}
              <div className="w-full mt-2 bg-background rounded-full h-2">
                <div 
                  className="bg-scode-blue h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    
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
                
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-medium">Identity Verification</h3>
                    
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
                    
                    <div className="space-y-2">
                      <label htmlFor="idNumber" className="text-sm text-white/70">ID Number*</label>
                      <Input 
                        id="idNumber" 
                        required
                        placeholder="Enter your ID number" 
                        className="bg-background border-white/20"
                      />
                    </div>
                    
                    {/* ID Photo Upload */}
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">ID Photo*</label>
                      {!idPhotoUrl ? (
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center bg-black/30">
                          <Upload className="h-10 w-10 text-white/40 mb-2" />
                          <p className="text-sm text-white/60 text-center mb-2">
                            Upload a clear photo of your ID
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              onClick={() => document.getElementById('idPhotoInput')?.click()}
                            >
                              Choose File
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              onClick={() => openCamera('id')}
                            >
                              Take Photo
                            </Button>
                            <input
                              id="idPhotoInput"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'id')}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-white/20 rounded-lg overflow-hidden">
                          <div className="relative">
                            <img 
                              src={idPhotoUrl} 
                              alt="ID" 
                              className="w-full h-auto object-contain max-h-48"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              type="button"
                              className="absolute top-2 right-2"
                              onClick={() => removePhoto('id')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Face Photo Upload */}
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">Face Photo*</label>
                      {!facePhotoUrl ? (
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center bg-black/30">
                          <Camera className="h-10 w-10 text-white/40 mb-2" />
                          <p className="text-sm text-white/60 text-center mb-2">
                            Take a photo or upload a recent photo of yourself
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              onClick={() => document.getElementById('facePhotoInput')?.click()}
                            >
                              Choose File
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              type="button"
                              onClick={() => openCamera('face')}
                            >
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
                              className="w-full h-auto object-contain max-h-48"
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
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-medium">Security & Terms</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
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
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="terms" required />
                        <label htmlFor="terms" className="text-sm leading-tight">
                          I agree to the <Link to="#" className="text-scode-blue hover:underline">Terms of Service</Link> and <Link to="#" className="text-scode-blue hover:underline">Privacy Policy</Link>
                        </label>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox id="gdpr" required />
                        <label htmlFor="gdpr" className="text-sm leading-tight">
                          I consent to the collection and processing of my personal data in accordance with GDPR and Kenya Data Protection Act
                        </label>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox id="signature" required />
                        <label htmlFor="signature" className="text-sm leading-tight">
                          I confirm that the information provided is accurate and serves as my digital signature
                        </label>
                      </div>
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
                  
                  {step < 3 ? (
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
            <DialogTitle>Take a {captureType === 'id' ? 'Photo of ID' : 'Selfie'}</DialogTitle>
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
