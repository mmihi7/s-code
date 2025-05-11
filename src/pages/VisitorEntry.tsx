import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import sha256 from "crypto-js/sha256";

// --- Helpers for image upload ---
function base64ToBlob(base64: string, mime = 'image/png') {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}

async function uploadImageToStorage(base64: string, path: string): Promise<string | null> {
  const file = base64ToBlob(base64);
  const { data, error } = await supabase.storage
    .from('user-photos')
    .upload(path, file, { upsert: true });
  if (error) {
    console.error("Upload error:", error);
    return null;
  }
  return supabase.storage.from('user-photos').getPublicUrl(path).data.publicUrl;
}

// --- PhotoInput component for capturing or uploading photos (no OCR) ---
type PhotoInputProps = {
  value: string | null;
  onChange: (val: string | null) => void;
};
const PhotoInput: React.FC<PhotoInputProps> = ({ value, onChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(value || null);

  const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    setStream(mediaStream);
    if (videoRef.current) videoRef.current.srcObject = mediaStream;
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCaptured(dataUrl);
    onChange(dataUrl);
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  const removePhoto = () => {
    setCaptured(null);
    onChange(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCaptured(dataUrl);
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {!captured && (
        <div className="flex gap-2">
          {stream ? (
            <div>
              <video ref={videoRef} autoPlay width={200} height={150}></video>
              <Button type="button" onClick={capturePhoto} className="mt-2 w-full">Capture</Button>
            </div>
          ) : (
            <Button type="button" onClick={startCamera} className="w-full">Open Camera</Button>
          )}
          <input type="file" accept="image/*" onChange={handleFileUpload} className="ml-2" />
        </div>
      )}
      {captured && (
        <div>
          <img src={captured} alt="Captured" width={200} className="mb-2" />
          <Button type="button" onClick={removePhoto} variant="secondary" className="w-full mb-2">Remove</Button>
        </div>
      )}
    </div>
  );
};

const VisitorEntry = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const premise_id = query.get("premise_id");
  const [loading, setLoading] = useState(true);
  const [premise, setPremise] = useState<any>(null);
  const [visitorFields, setVisitorFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [fieldConfig, setFieldConfig] = useState<{ [key: string]: any }>({});
  const [submitting, setSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justInsertedVisitorId, setJustInsertedVisitorId] = useState<string | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [saveInfoError, setSaveInfoError] = useState<string | null>(null);
  const [saveInfoSuccess, setSaveInfoSuccess] = useState(false);

  // --- New state for unified flow ---
  const [isRegisteredUser, setIsRegisteredUser] = useState(false);
  const [existingUserData, setExistingUserData] = useState<any>(null);
  const [fieldsToShow, setFieldsToShow] = useState<string[]>([]);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationForm, setRegistrationForm] = useState<any>({});
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationTermsAccepted, setRegistrationTermsAccepted] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showContinueCheckInDialog, setShowContinueCheckInDialog] = useState(false);

  // --- Add state for real-time visitor status ---
  const [visitorStatus, setVisitorStatus] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState<string | null>(null);

  // Fetch premise info and visitor fields
  useEffect(() => {
    const fetchPremiseAndFields = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch premise info
        const { data: premiseData, error: premiseError } = await supabase
          .from("premises")
          .select("*")
          .eq("id", premise_id)
          .single();

        if (premiseError || !premiseData) {
          setPremise(null);
          setLoading(false);
          return;
        }
        setPremise(premiseData);

        // Get visitor form config
        const { data: formConfig, error: formConfigError } = await supabase
          .from("qrcode_forms")
          .select("form_fields")
          .eq("premise_id", premise_id)
          .single();

        if (formConfigError || !formConfig) {
          setVisitorFields([]);
          setFieldConfig({});
        } else {
          let fields = formConfig.form_fields;
          if (!Array.isArray(fields)) {
            fields = [];
          }
          setVisitorFields(fields);
          const configObj: { [key: string]: any } = {};
          (fields || []).forEach((f: any) => {
            configObj[f.name] = f;
          });
          setFieldConfig(configObj);
        }
      } catch (err) {
        setError("Failed to load premise information.");
      } finally {
        setLoading(false);
      }
    };

    fetchPremiseAndFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premise_id]);

  // --- Registration check logic ---
  useEffect(() => {
    // Use code/phone/email as identifier, here we use 'user_code' from query or form
    const userCode = query.get("user_code") || formData.user_code || "";
    if (!userCode || visitorFields.length === 0) {
      setIsRegisteredUser(false);
      setExistingUserData(null);
      setFieldsToShow(visitorFields.map(f => f.name));
      return;
    }

    async function checkIfRegistered() {
      // You may adjust this to use email/phone as needed
      const { data, error } = await supabase
        .from("registered_users")
        .select("*")
        .or(`code.eq.${userCode},email.eq.${userCode},phone.eq.${userCode}`)
        .single();

      if (data) {
        setIsRegisteredUser(true);
        setExistingUserData(data);

        // Determine which fields are required but missing
        const missingFields = visitorFields
          .filter(f => !data[f.name] || data[f.name] === "")
          .map(f => f.name);
        setFieldsToShow(missingFields);
        // Pre-fill formData with existing info
        setFormData((prev: any) => ({
          ...prev,
          ...data
        }));
      } else {
        setIsRegisteredUser(false);
        setExistingUserData(null);
        setFieldsToShow(visitorFields.map(f => f.name));
      }
    }

    checkIfRegistered();
    // Only run when visitorFields or query changes (not formData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorFields, query]);

  // --- Real-time subscription for visitor status changes ---
  useEffect(() => {
    if (!justInsertedVisitorId) return;
    // Subscribe to changes on this visitor row
    const channel = supabase.channel('visitor-status-' + justInsertedVisitorId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'visitors',
          filter: `id=eq.${justInsertedVisitorId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          setVisitorStatus(newStatus);
          if (newStatus === 'denied') {
            setDenialReason(payload.new.denial_reason || null);
          } else {
            setDenialReason(null);
          }
        }
      )
      .subscribe();
    // Fetch initial status in case of missed event
    (async () => {
      const { data, error } = await supabase
        .from('visitors')
        .select('status, denial_reason')
        .eq('id', justInsertedVisitorId)
        .single();
      if (data) {
        setVisitorStatus(data.status);
        setDenialReason(data.denial_reason || null);
      }
    })();
    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [justInsertedVisitorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (fieldName: string, value: string | null) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  // --- UPDATED handleSubmit to upload images to storage and store URLs ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!premise_id) {
        setError("Invalid premise. Please scan the correct QR code.");
        setSubmitting(false);
        return;
      }
      const checked_in_at = new Date().toISOString();

      // Upload images to storage and get URLs
      let facephotoUrl = null;
      let idphotoFrontUrl = null;
      let idphotoBackUrl = null;

      if (formData.facephoto) {
        facephotoUrl = await uploadImageToStorage(
          formData.facephoto,
          `facephotos/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
        );
      }
      if (formData.idphoto_front) {
        idphotoFrontUrl = await uploadImageToStorage(
          formData.idphoto_front,
          `idphotos/front_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
        );
      }
      if (formData.idphoto_back) {
        idphotoBackUrl = await uploadImageToStorage(
          formData.idphoto_back,
          `idphotos/back_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
        );
      }

      // Compose a string from key fields for the signature
      const dataToSign = `${formData.name || ""}|${premise_id}|${checked_in_at}`;
      const signature = sha256(dataToSign).toString();

      // Prepare insert object (all keys in snake_case)
      const insertObj: any = {
        premise_id,
        ...formData,
        facephoto: facephotoUrl,
        idphoto_front: idphotoFrontUrl,
        idphoto_back: idphotoBackUrl,
        checked_in_at,
        signature,
        status: "pending"
      };

      let result;
      if (isRegisteredUser) {
        // Only update missing fields for registered user
        const updateObj: any = {};
        fieldsToShow.forEach((field) => {
          updateObj[field] = insertObj[field];
        });
        updateObj.checked_in_at = checked_in_at;
        updateObj.signature = signature;
        updateObj.status = "pending";
        updateObj.role = "visitor";
        updateObj.premise_id = premise_id;
        // Insert a new visitor record (for audit trail)
        result = await supabase
          .from("visitors")
          .insert([{ ...existingUserData, ...updateObj, premise_id }])
          .select();
      } else {
        // Insert as new visitor
        result = await supabase
          .from("visitors")
          .insert([insertObj])
          .select();
      }

      const { data, error } = result;

      if (error || !data || !data[0]) {
        setError("Check-in failed: " + (error?.message || "Unknown error"));
        console.error("Supabase insert error:", error);
      } else {
        setJustInsertedVisitorId(data[0].id);
        setRegistrationComplete(true);
        setShowSaveDialog(!isRegisteredUser); // Offer registration to new users
        setPendingApproval(true);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Registration Modal Logic ---
  const openRegistrationModal = () => {
    setRegistrationForm({
      name: formData.name || "",
      email: formData.email || "",
      phone: formData.phone || "",
      password: "",
      confirmPassword: "",
      facephoto: formData.facephoto || null,
      idphoto_front: formData.idphoto_front || null,
      idphoto_back: formData.idphoto_back || null,
    });
    setRegistrationTermsAccepted(false);
    setRegistrationError(null);
    setShowRegistrationModal(true);
  };

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRegistrationForm({ ...registrationForm, [e.target.name]: e.target.value });
  };

  const handleRegistrationPhotoChange = (field: string, value: string | null) => {
    setRegistrationForm({ ...registrationForm, [field]: value });
  };

  const handleGoogleRegistration = async () => {
    setRegistrationLoading(true);
    setRegistrationError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      setRegistrationError("Google registration failed: " + error.message);
    }
    setRegistrationLoading(false);
  };

  // --- Supabase Auth Registration ---
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationLoading(true);
    setRegistrationError(null);

    try {
      // Validate
      if (!registrationForm.name || !registrationForm.email || !registrationForm.password || !registrationForm.confirmPassword) {
        setRegistrationError("Please fill in all required fields.");
        return;
      }
      if (registrationForm.password !== registrationForm.confirmPassword) {
        setRegistrationError("Passwords do not match.");
        return;
      }
      if (!registrationTermsAccepted) {
        setRegistrationError("You must accept the terms and conditions.");
        return;
      }

      // 1. Register user with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: registrationForm.email,
        password: registrationForm.password,
        options: {
          data: {
            name: registrationForm.name,
            phone: registrationForm.phone,
          }
        }
      });

      if (signUpError) {
        setRegistrationError("Auth registration failed: " + signUpError.message);
        return;
      }
      const user = signUpData?.user;
      if (!user) {
        setRegistrationError("Registration failed: No user returned from Supabase Auth.");
        return;
      }

      // 2. Upload images if present
      let facephotoUrl = null;
      let idphotoFrontUrl = null;
      let idphotoBackUrl = null;
      if (registrationForm.facephoto) {
        facephotoUrl = await uploadImageToStorage(
          registrationForm.facephoto,
          `facephotos/${user.id}_${Date.now()}.png`
        );
      }
      if (registrationForm.idphoto_front) {
        idphotoFrontUrl = await uploadImageToStorage(
          registrationForm.idphoto_front,
          `idphotos/front_${user.id}_${Date.now()}.png`
        );
      }
      if (registrationForm.idphoto_back) {
        idphotoBackUrl = await uploadImageToStorage(
          registrationForm.idphoto_back,
          `idphotos/back_${user.id}_${Date.now()}.png`
        );
      }

      // 3. Generate digital signature
      const registeredAt = new Date().toISOString();
      const signatureData = `${registrationForm.name || ""}|${registrationForm.email || ""}|${registrationForm.phone || ""}|${registeredAt}`;
      const signature = sha256(signatureData).toString();

      // 4. Insert profile into registered_users (no password field)
      const regObj = {
        auth_user_id: user.id,
        name: registrationForm.name,
        email: registrationForm.email,
        phone: registrationForm.phone,
        facephoto: facephotoUrl,
        idphoto_front: idphotoFrontUrl,
        idphoto_back: idphotoBackUrl,
        registered_at: registeredAt,
        signature,
      };

      const { error: profileError } = await supabase
        .from("registered_users")
        .insert([regObj]);

      if (profileError) {
        setRegistrationError("Profile save failed: " + profileError.message);
        return;
      }

      setShowRegistrationModal(false);
      setShowContinueCheckInDialog(true);
    } catch (err) {
      setRegistrationError("An unexpected error occurred.");
      console.error("Registration error:", err);
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Save info to registered_users (partial registration allowed, now opens modal)
  const handleSaveInfo = () => {
    openRegistrationModal();
  };

  // Handle OTP verification (simulate for now)
  const handleVerifyOtp = async () => {
    setOtpError(null);
    if (otp !== "123456") {
      setOtpError("Invalid code. Please try again.");
      return;
    }
    setSaveInfoSuccess(true);
    setShow2FA(false);
    setTimeout(() => {
      setShowSaveDialog(false);
    }, 2000);
  };

  // --- Continue Check-In Dialog ---
  const handleContinueCheckIn = () => {
    setShowContinueCheckInDialog(false);
    setFormData({
      ...formData,
      name: registrationForm.name,
      email: registrationForm.email,
      phone: registrationForm.phone,
      facephoto: registrationForm.facephoto,
      idphoto_front: registrationForm.idphoto_front,
      idphoto_back: registrationForm.idphoto_back,
    });
    setRegistrationComplete(false);
    setPendingApproval(false);
  };

  // --- UI for real-time status feedback ---
  let statusFeedback = null;
  if (visitorStatus === 'approved') {
    statusFeedback = (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry Approved</DialogTitle>
          </DialogHeader>
          <div className="text-green-600 font-semibold text-center mb-2">You have been approved. Please proceed.</div>
        </DialogContent>
      </Dialog>
    );
  } else if (visitorStatus === 'denied') {
    statusFeedback = (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry Denied</DialogTitle>
          </DialogHeader>
          <div className="text-red-600 font-semibold text-center mb-2">You have been denied entry.</div>
          {denialReason && (
            <div className="text-center text-white/80">Reason: {denialReason}</div>
          )}
        </DialogContent>
      </Dialog>
    );
  } else if (visitorStatus === 'exited') {
    statusFeedback = (
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visit Ended</DialogTitle>
          </DialogHeader>
          <div className="text-center text-white/80">Your visit has ended. Thank you!</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-lg text-white/70">Loading premise information...</div>
        </div>
      </MainLayout>
    );
  }

  if (!premise) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Invalid QR Code</CardTitle>
              <CardDescription className="text-center">
                This QR code is invalid or the premise does not exist.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (registrationComplete) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-green-600 flex items-center justify-center gap-2">
                <Check className="w-6 h-6" /> Check-in Complete
              </CardTitle>
              <CardDescription className="text-center">
                Thank you for checking in at {premise.name}!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              {pendingApproval ? (
                <div className="text-yellow-600 font-semibold">
                  Your check-in is pending approval by the premise. Please wait for confirmation.
                </div>
              ) : (
                <>You may now proceed to the reception or wait for further instructions.</>
              )}
            </CardContent>
          </Card>
          {/* Registration Dialog */}
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Become a Registered S-Coder?</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                S-Code allows you to check in faster at over 50,000 establishments globally.<br />
                <strong>Would you like to register for future fast check-ins?</strong>
                <div className="text-xs mt-2 text-gray-500">
                  You only need your name and a contact (phone or email) to become registered. You can complete your profile later to get verified.
                </div>
                {saveInfoError && (
                  <div className="text-red-500 mt-2">{saveInfoError}</div>
                )}
                {saveInfoSuccess && (
                  <div className="text-green-600 mt-2">You are now a registered S-Coder! Complete your profile later to get verified.</div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleSaveInfo} disabled={savingInfo || saveInfoSuccess}>
                  Register
                </Button>
                <Button variant="secondary" onClick={() => setShowSaveDialog(false)} disabled={savingInfo}>
                  Skip, just check in
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Registration Modal */}
          <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register as S-Coder</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegistrationSubmit}>
                <div className="py-2 space-y-3 max-h-[60vh] overflow-y-auto">
                  <Input
                    name="name"
                    placeholder="Full Name"
                    value={registrationForm.name || ""}
                    onChange={handleRegistrationChange}
                    required
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={registrationForm.email || ""}
                    onChange={handleRegistrationChange}
                    required
                  />
                  <Input
                    name="phone"
                    placeholder="Phone"
                    value={registrationForm.phone || ""}
                    onChange={handleRegistrationChange}
                  />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={registrationForm.password || ""}
                    onChange={handleRegistrationChange}
                    required
                  />
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    value={registrationForm.confirmPassword || ""}
                    onChange={handleRegistrationChange}
                    required
                  />
                  <div>
                    <label className="block mb-1 text-sm font-medium text-white/80">Face Photo</label>
                    <PhotoInput
                      value={registrationForm.facephoto || null}
                      onChange={val => handleRegistrationPhotoChange("facephoto", val)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-white/80">ID Photo (Front)</label>
                    <PhotoInput
                      value={registrationForm.idphoto_front || null}
                      onChange={val => handleRegistrationPhotoChange("idphoto_front", val)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-white/80">ID Photo (Back)</label>
                    <PhotoInput
                      value={registrationForm.idphoto_back || null}
                      onChange={val => handleRegistrationPhotoChange("idphoto_back", val)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={registrationTermsAccepted}
                      onChange={e => setRegistrationTermsAccepted(e.target.checked)}
                      id="terms"
                      className="mr-2"
                    />
                    <label htmlFor="terms" className="text-xs">
                      I accept the <a href="#" className="underline">terms and conditions</a>
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={handleGoogleRegistration}
                    disabled={registrationLoading}
                  >
                    <LogIn className="w-4 h-4" /> Register with Google
                  </Button>
                  {registrationError && <div className="text-red-500">{registrationError}</div>}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={registrationLoading || !registrationTermsAccepted}>
                    {registrationLoading ? "Registering..." : "Register"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* Continue Check-In Dialog */}
          <Dialog open={showContinueCheckInDialog} onOpenChange={setShowContinueCheckInDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registration Complete</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                Would you like to continue checking in?
              </div>
              <DialogFooter>
                <Button onClick={handleContinueCheckIn}>
                  Continue Check-In
                </Button>
                <Button variant="secondary" onClick={() => setShowContinueCheckInDialog(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* OTP Dialog (if needed for future real 2FA) */}
          <Dialog open={show2FA} onOpenChange={setShow2FA}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Your Registration</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                Please enter the 6-digit code sent to your phone/email.<br />
                <Input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  className="mt-4"
                  placeholder="Enter code"
                />
                {otpError && <div className="text-red-500 mt-2">{otpError}</div>}
              </div>
              <DialogFooter>
                <Button onClick={handleVerifyOtp}>Verify</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Render status feedback modal if needed */}
          {statusFeedback}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Visitor Check-In</CardTitle>
            <CardDescription className="text-center">
              Welcome to {premise.name}! Please fill in your details to check in.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              {error && (
                <div className="text-red-500 text-center mb-4">{error}</div>
              )}
              {visitorFields.length === 0 && (
                <div className="text-red-500 text-center mb-4">
                  No visitor fields configured for this premise.
                </div>
              )}
              {visitorFields.map((field: any, idx: number) => {
                if (field.name === "signature") return null; // Do not render digital signature input!
                const config = fieldConfig[field.name] || { label: field.label || field.name, placeholder: "", type: "text" };

                // Only show editable fields for registered users if missing
                if (isRegisteredUser && existingUserData) {
                  if (!fieldsToShow.includes(field.name)) {
                    // Show as disabled input
                    return (
                      <div key={field.name || idx} className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-white/80" htmlFor={field.name}>
                          {config.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <Input
                          id={field.name}
                          name={field.name}
                          type={config.type}
                          placeholder={config.placeholder}
                          value={existingUserData[field.name] || ""}
                          disabled
                          className="w-full bg-gray-100 text-gray-500"
                        />
                      </div>
                    );
                  }
                  // Else: show as editable because it's missing
                }

                // Special handling for ID photo (front and back)
                if (field.name.toLowerCase() === "idphoto") {
                  return (
                    <div key={field.name || idx} className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-white/80">
                        {config.label} (Front)
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <PhotoInput
                        value={formData.idphoto_front || null}
                        onChange={val => setFormData({ ...formData, idphoto_front: val })}
                      />
                      <label className="block mb-1 text-sm font-medium text-white/80 mt-4">
                        {config.label} (Back)
                      </label>
                      <PhotoInput
                        value={formData.idphoto_back || null}
                        onChange={val => setFormData({ ...formData, idphoto_back: val })}
                      />
                    </div>
                  );
                }

                // Photo input for facephoto
                if (field.name.toLowerCase() === "facephoto") {
                  return (
                    <div key={field.name || idx} className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-white/80" htmlFor={field.name}>
                        {config.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <PhotoInput
                        value={formData[field.name] || null}
                        onChange={val => handlePhotoChange(field.name, val)}
                      />
                    </div>
                  );
                }

                // Normal field (editable)
                return (
                  <div key={field.name || idx} className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-white/80" htmlFor={field.name}>
                      {config.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {config.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder={config.placeholder}
                        required={field.required}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="w-full"
                      />
                    ) : (
                      <Input
                        id={field.name}
                        name={field.name}
                        type={config.type}
                        placeholder={config.placeholder}
                        required={field.required}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className="w-full"
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Checking in..." : "Check In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VisitorEntry;