import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  QrCode as QrCodeIcon,
  Users,
  Settings as SettingsIcon,
  Download,
  BarChart3,
  CheckCircle2,
  UserCheck,
  Sparkles,
  Camera,
  FileText,
  UserRoundCog,
  Car,
  IdCard,
  Mail,
  Phone,
  RefreshCcw,
  Trash2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabaseClient";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import QRCode from "react-qr-code";
import { useNavigate, Link } from "react-router-dom";
import { SHA256 } from "crypto-js";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import FormConfiguration from '@/components/FormConfiguration';

// Types
interface VisitorField {
  id: number;
  name: string;
  label: string;
  required: boolean;
  visible: boolean;
  premium?: boolean;
  custom?: boolean;
  type?: string;
}

const defaultVisitorFields: VisitorField[] = [
  { id: 1, name: "name", label: "Full Name", required: true, visible: true, premium: false },
  { id: 2, name: "idnumber", label: "ID Number", required: true, visible: true, premium: false },
  { id: 3, name: "phone", label: "Phone Number", required: true, visible: true, premium: false },
  { id: 4, name: "email", label: "Email Address", required: false, visible: true, premium: false },
  { id: 5, name: "purpose", label: "Purpose of Visit", required: false, visible: false, premium: true },
  { id: 6, name: "department", label: "Department", required: false, visible: false, premium: true },
  { id: 7, name: "visitingperson", label: "Person Being Visited", required: false, visible: false, premium: true },
  { id: 8, name: "vehicle", label: "Vehicle Registration Number", required: false, visible: false, premium: true }
];

interface AttentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitor: any;
  onCheckoutAndApprove: (reason: string) => Promise<void>;
  onCheckoutAndDeny: (reason: string, denyReason: string) => Promise<void>;
}

const AttentionModal: React.FC<AttentionModalProps> = ({ 
  isOpen, 
  onClose, 
  visitor, 
  onCheckoutAndApprove, 
  onCheckoutAndDeny 
}) => {
  const [checkoutReason, setCheckoutReason] = useState('');
  const [denyReason, setDenyReason] = useState('');
  const [action, setAction] = useState<'approve' | 'deny' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!checkoutReason.trim()) {
      toast({
        title: "Required",
        description: "Please provide a reason for late checkout",
        variant: "destructive"
      });
      return;
    }

    if (action === 'deny' && !denyReason.trim()) {
      toast({
        title: "Required",
        description: "Please provide a reason for denying entry",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === 'approve') {
        await onCheckoutAndApprove(checkoutReason);
      } else if (action === 'deny') {
        await onCheckoutAndDeny(checkoutReason, denyReason);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Attention Required</DialogTitle>
          <DialogDescription>
            This visitor has an unchecked visit that needs to be handled
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Visitor Details</Label>
            <div className="text-sm">
              <p><strong>Name:</strong> {visitor?.name}</p>
              <p><strong>ID:</strong> {visitor?.idnumber}</p>
              <p><strong>Previous Entry:</strong> {new Date(visitor?.previous_entry_time).toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkoutReason">Checkout Reason (Internal)</Label>
            <Textarea 
              id="checkoutReason"
              placeholder="Why wasn't the visitor checked out previously?"
              value={checkoutReason}
              onChange={(e) => setCheckoutReason(e.target.value)}
            />
          </div>
          {action === 'deny' && (
            <div className="space-y-2">
              <Label htmlFor="denyReason">Deny Reason</Label>
              <Textarea 
                id="denyReason"
                placeholder="Why is this entry being denied?"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAction(null);
                onClose();
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => setAction('deny')}
              disabled={isSubmitting}
              className="flex-1"
            >
              Deny Entry
            </Button>
            <Button
              onClick={() => setAction('approve')}
              disabled={isSubmitting}
              className="flex-1"
            >
              Approve Entry
            </Button>
          </div>
          {action && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !checkoutReason.trim() || (action === 'deny' && !denyReason.trim())}
              className="w-full"
            >
              Confirm {action === 'approve' ? 'Approval' : 'Denial'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = () => {
  const [currentPlan] = useState("Basic");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [premise, setPremise] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [visitorFields, setVisitorFields] = useState<VisitorField[]>([]);
  const [saving, setSaving] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [iteration, setIteration] = useState<number>(1);
  const [customQuestion, setCustomQuestion] = useState("");
  const [visitors, setVisitors] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Settings Tab State ---
  const [approvalType, setApprovalType] = useState<"security" | "reception" | "host">("security");
  const [ussdOption, setUssdOption] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Track multiple attention modals
  const [attentionModals, setAttentionModals] = useState<{
    [key: string]: {
      isOpen: boolean;
      visitor: any;
      checkoutReason: string;
    }
  }>({});

  const AttentionModalComponent = ({ visitorId }: { visitorId: string }) => {
    const modal = attentionModals[visitorId];
    if (!modal) return null;

    return (
      <Dialog 
        open={modal.isOpen} 
        onOpenChange={(open) => {
          setAttentionModals(prev => ({
            ...prev,
            [visitorId]: { ...prev[visitorId], isOpen: open }
          }));
        }}
      >
        <DialogContent>
          <DialogTitle>Active Visit Detected</DialogTitle>
          <DialogDescription>
            This visitor has an active visit that needs to be checked out
          </DialogDescription>
          <div className="space-y-4">
            <p className="text-sm text-white/70">{modal.visitor.attention_message}</p>
            <div className="space-y-2">
              <Label>Checkout Reason</Label>
              <Input
                value={modal.checkoutReason}
                onChange={(e) => {
                  setAttentionModals(prev => ({
                    ...prev,
                    [visitorId]: { ...prev[visitorId], checkoutReason: e.target.value }
                  }));
                }}
                placeholder="Enter reason for checking out previous visit"
              />
            </div>
          </div>
          <DialogFooter className="space-x-2">
            <Button variant="ghost" onClick={() => {
              setAttentionModals(prev => {
                const newModals = { ...prev };
                delete newModals[visitorId];
                return newModals;
              });
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleDenyAfterCheckout(visitorId)}
            >
              Checkout & Deny
            </Button>
            <Button 
              onClick={() => handleApproveAfterCheckout(visitorId)}
            >
              Checkout & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const handleApproveAfterCheckout = async (visitorId: string) => {
    const modal = attentionModals[visitorId];
    if (!modal || !modal.checkoutReason) {
      toast({
        title: "Error",
        description: "Please provide a checkout reason",
        variant: "destructive"
      });
      return;
    }

    try {
      // First checkout the previous visit
      const { error: checkoutError } = await supabase
        .from('visitors')
        .update({ 
          checked_out_at: new Date().toISOString(),
          checkout_reason: modal.checkoutReason
        })
        .eq('id', modal.visitor.previous_visit_id);

      if (checkoutError) throw checkoutError;

      // Then approve the new entry
      await handleApproveEntry(modal.visitor.id);
      
      // Remove the modal
      setAttentionModals(prev => {
        const newModals = { ...prev };
        delete newModals[visitorId];
        return newModals;
      });
      
      toast({
        title: "Success",
        description: "Previous visit checked out and new entry approved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process entry",
        variant: "destructive"
      });
    }
  };

  const handleDenyAfterCheckout = async (visitorId: string) => {
    const modal = attentionModals[visitorId];
    if (!modal || !modal.checkoutReason) {
      toast({
        title: "Error",
        description: "Please provide a checkout reason",
        variant: "destructive"
      });
      return;
    }

    try {
      // First checkout the previous visit
      const { error: checkoutError } = await supabase
        .from('visitors')
        .update({ 
          checked_out_at: new Date().toISOString(),
          checkout_reason: modal.checkoutReason
        })
        .eq('id', modal.visitor.previous_visit_id);

      if (checkoutError) throw checkoutError;

      // Then deny the new entry
      await handleDenyEntry(modal.visitor.id);
      
      // Remove the modal
      setAttentionModals(prev => {
        const newModals = { ...prev };
        delete newModals[visitorId];
        return newModals;
      });
      
      toast({
        title: "Success",
        description: "Previous visit checked out and new entry denied",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process entry",
        variant: "destructive"
      });
    }
  };

  const handleVisitorApproval = async (visitor: any) => {
    if (!visitor?.id) {
      toast({
        title: "Error",
        description: "Invalid visitor data",
        variant: "destructive"
      });
      return;
    }

    if (visitor.requires_attention) {
      // Add new attention modal
      setAttentionModals(prev => ({
        ...prev,
        [visitor.id]: {
          isOpen: true,
          visitor,
          checkoutReason: ""
        }
      }));
      return;
    }
    // Proceed with normal approval
    await handleApproveEntry(visitor.id);
  };

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        toast({
          title: "Access Denied",
          description: "Please login to access the dashboard",
          variant: "destructive"
        });
        navigate("/premise-login");
        return;
      }

      const { premise_id, premise_name } = session.user.user_metadata;
      if (!premise_id || !premise_name) {
        toast({
          title: "Error",
          description: "Premise information not found. Please login again.",
          variant: "destructive"
        });
        navigate("/premise-login");
        return;
      }

      // Set premise data directly from auth metadata
      setPremise({ id: premise_id, name: premise_name });

      // Get visitor fields
      const { data: fieldsData } = await supabase
        .from('visitor_fields')
        .select('*')
        .eq('premise_id', premise_id);

      setVisitorFields(fieldsData || defaultVisitorFields);
      setIsLoading(false);
    };

    checkSession();
  }, [navigate, toast]);

  // Only fetch config and visitors when premise is set
  useEffect(() => {
    if (premise?.id) {
      fetchConfig();
      fetchVisitors();
    }
  }, [premise]);

  // Fetch config and QR codes from Supabase
  const fetchConfig = async () => {
    if (!premise?.id) {
      navigate("/");
      return;
    }

    // Fetch QR config
    const { data: qrConfig, error: qrError } = await supabase
      .from('qrcode_forms')
      .select('form_fields, iteration, qrcode_url')
      .eq('premise_id', premise.id)
      .order('iteration', { ascending: false })
      .limit(1)
      .single();

    if (qrError) {
      console.error('QR Config error:', qrError);
      setError("Failed to load QR code configuration");
      setVisitorFields(defaultVisitorFields);
      return;
    }

    // If we have existing configuration, use it
    if (qrConfig?.form_fields) {
      const savedFields = qrConfig.form_fields as VisitorField[];
      // Ensure all default fields exist with their required properties
      const mergedFields = defaultVisitorFields.map(defaultField => {
        const savedField = savedFields.find(f => f.name === defaultField.name);
        // For core fields (name, idnumber, phone), maintain required and visible as true
        if (['name', 'idnumber', 'phone'].includes(defaultField.name)) {
          return { ...defaultField, ...savedField, required: true, visible: true };
        }
        return savedField || defaultField;
      });

      setVisitorFields(mergedFields);
      setIteration(qrConfig.iteration || 1);
      setQrValue(qrConfig.qrcode_url || '');
    } else {
      // Use defaults for new setup
      setVisitorFields(defaultVisitorFields);
      setIteration(1);
    }
  };

  // Set up real-time subscription for premise changes and pending entries
  useEffect(() => {
    if (!premise?.id) return;

    // Subscribe to premise changes
    const premiseSubscription = supabase
      .channel('premises_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'premises',
          filter: `id=eq.${premise.id}`
        },
        (payload) => {
          console.log('Premise change detected:', payload);
          if (payload.eventType === 'DELETE') {
            toast({
              title: "Premise Deleted",
              description: "This premise has been deleted. Redirecting to home...",
              variant: "destructive"
            });
            navigate("/");
          } else {
            // Refresh data for other changes
            fetchConfig();
          }
        }
      )
      .subscribe();

    // Subscribe to pending entries changes
    const pendingEntriesSubscription = supabase
      .channel('pending_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_entries',
          filter: `premise_id=eq.${premise.id}`
        },
        (payload) => {
          console.log('Pending entry change detected:', payload);
          // Refresh visitor list when a new entry is added or updated
          fetchVisitors();
        }
      )
      .subscribe();

    return () => {
      premiseSubscription.unsubscribe();
      pendingEntriesSubscription.unsubscribe();
    };
  }, [premise?.id, navigate, toast]);

  const fetchVisitors = async () => {
    if (!premise?.id) return;
    
    try {
      // Fetch approved visitors
      const { data: approvedVisitors, error: visitorError } = await supabase
        .from("visitors")
        .select("*")
        .eq("premise_id", premise.id)
        .order("checked_in_at", { ascending: false });

      if (visitorError) throw visitorError;

      // Fetch pending entries
      const { data: pendingEntries, error: pendingError } = await supabase
        .from("pending_entries")
        .select("*")
        .eq("premise_id", premise.id)
        .order("submitted_at", { ascending: false });

      if (pendingError) throw pendingError;

      // Combine both sets of data
      const allVisitors = [
        ...(pendingEntries || []).map(entry => ({
          ...entry,
          isPending: true // Add flag to identify pending entries
        })),
        ...(approvedVisitors || [])
      ];

      // Check each pending entry for active visits
      for (const entry of allVisitors) {
        if (entry.isPending) {
          const { data: activeVisit } = await supabase
            .from('visitors')
            .select('checked_in_at')
            .eq('idnumber', entry.idnumber)
            .eq('premise_id', entry.premise_id)
            .is('checked_out_at', null)
            .single();

          if (activeVisit) {
            // Mark entry as requiring attention
            entry.requires_attention = true;
            entry.attention_reason = `Visitor has an unchecked visit from ${new Date(activeVisit.checked_in_at).toLocaleString()}`;
          }
        }
      }

      setVisitors(allVisitors);
    } catch (err) {
      console.error("Error fetching visitors:", err);
      toast({
        title: "Error",
        description: "Failed to fetch visitors",
        variant: "destructive"
      });
    }
  };

  // Load QR code form on mount
  useEffect(() => {
    const loadQRCodeForm = async () => {
      if (!premise?.id) return;

      try {
        // Load latest QR code configuration
        const { data: qrConfig, error: qrError } = await supabase
          .from('qrcode_forms')
          .select('form_fields, iteration, qrcode_url')
          .eq('premise_id', premise.id)
          .order('iteration', { ascending: false })
          .limit(1)
          .single();

        if (qrError) {
          console.error('QR Config error:', qrError);
          setError("Failed to load QR code configuration");
          setVisitorFields(defaultVisitorFields);
          return;
        }

        // If we have existing configuration, use it
        if (qrConfig?.form_fields) {
          const savedFields = qrConfig.form_fields as VisitorField[];
          // Ensure all default fields exist with their required properties
          const mergedFields = defaultVisitorFields.map(defaultField => {
            const savedField = savedFields.find(f => f.name === defaultField.name);
            // For core fields (name, idnumber, phone), maintain required and visible as true
            if (['name', 'idnumber', 'phone'].includes(defaultField.name)) {
              return { ...defaultField, ...savedField, required: true, visible: true };
            }
            return savedField || defaultField;
          });

          setVisitorFields(mergedFields);
          setIteration(qrConfig.iteration || 1);
          setQrValue(qrConfig.qrcode_url || '');
        } else {
          // Use defaults for new setup
          setVisitorFields(defaultVisitorFields);
          setIteration(1);
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        setVisitorFields(defaultVisitorFields);
      }
    };

    loadQRCodeForm();
  }, []);

  // Save field configuration
  const saveFieldConfiguration = async (fields = visitorFields) => {
    if (!premise?.id) {
      toast({
        title: "Error",
        description: "No premise ID found",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Prepare fields - ensure core fields remain required and visible
      const cleanFields = fields.map(field => {
        const isCore = ['name', 'idnumber', 'phone'].includes(field.name);
        return {
          id: field.id,
          name: field.name,
          label: field.label,
          required: isCore ? true : field.required,
          visible: isCore ? true : field.visible
        };
      });

      const newIteration = iteration + 1;
      const qrUrl = `${window.location.origin}/entry?premise_id=${encodeURIComponent(premise.id)}&v=${newIteration}`;

      // Save QR form with field configuration
      const { error: qrError } = await supabase
        .from('qrcode_forms')
        .upsert({
          premise_id: premise.id,
          form_fields: cleanFields,
          qrcode_url: qrUrl,
          iteration: newIteration,
          generated_at: new Date().toISOString()
        });

      if (qrError) {
        console.error('QR form error:', qrError);
        throw qrError;
      }

      setIteration(newIteration);
      setQrValue(qrUrl);
      toast({
        title: "Success",
        description: "Form configuration saved successfully",
      });

      return true;
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save form configuration",
        variant: "destructive"
      });
      return false;
    }
  };

  // Toggle field visibility
  const handleToggleVisible = (id: number) => {
    setVisitorFields(fields =>
      fields.map(field =>
        field.id === id
          ? { ...field, visible: !field.visible, required: !field.visible ? false : field.required }
          : field
      )
    );
    // Reset QR code when fields change
    setQrValue(null);
    setQrGenerated(false);
  };

  // Toggle field required
  const handleToggleRequired = (id: number) => {
    setVisitorFields(fields =>
      fields.map(field =>
        field.id === id && field.visible
          ? { ...field, required: !field.required }
          : field
      )
    );
    // Reset QR code when fields change
    setQrValue(null);
    setQrGenerated(false);
  };

  // Add custom field
  const addCustomField = () => {
    if (!customQuestion.trim()) return;
    const newField = {
      id: visitorFields.length + 1,
      name: `custom_${Date.now()}`,
      label: customQuestion.trim(),
      required: false,
      visible: true
    };
    setVisitorFields(prev => [...prev, newField]);
    setCustomQuestion("");
    // Reset QR code when fields change
    setQrValue(null);
    setQrGenerated(false);
  };

  // Generate QR code
  const handleGenerateOrRegenerateQRCode = async () => {
    try {
      const saved = await saveFieldConfiguration();
      if (!saved) {
        toast({
          title: "Error",
          description: "Failed to save form configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update form configuration",
        variant: "destructive"
      });
    }
  };

  // Handle field updates
  const handleFieldUpdate = async (updatedFields: VisitorField[]) => {
    setVisitorFields(updatedFields);
    // Reset QR state since fields changed
    setQrValue(null);
    setQrGenerated(false);
    
    // Save the changes
    const saved = await saveFieldConfiguration(updatedFields);
    if (!saved) {
      toast({
        title: "Error",
        description: "Failed to save field configuration",
        variant: "destructive"
      });
    }
  };

  // Generate QR code data
  const generateQRData = () => {
    if (!premise?.id) {
      throw new Error('Premise ID not found');
    }
    return `${window.location.origin}/entry?premise_id=${encodeURIComponent(premise.id)}&v=${iteration}`;
  };

  // Download QR code as PNG (single-entry)
  const handleDownloadQR = () => {
    if (!qrGenerated || !qrValue) return;
    const svg = document.getElementById("premise-qr-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + window.btoa(source);
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngFile = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngFile;
        a.download = "premise-qr-code.png";
        a.click();
      }
    };
  };

  // Delete the QR code for the premise (delete row in Supabase)
  const handleDeleteQRCode = async () => {
    setSaving(true);
    try {
      if (!premise?.id) {
        toast({
          title: "Error",
          description: "Premise ID not found.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }
      // Delete the QR code row from Supabase
      const { error } = await supabase
        .from("qrcode_forms")
        .delete()
        .eq("premise_id", premise.id);

      if (error) {
        toast({
          title: "Failed to delete QR code",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setQrValue(null);
        setQrGenerated(false);
        setIteration(1);
        toast({
          title: "QR code deleted!",
          description: "Premise QR code has been deleted.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Approve entry for a visitor
  const handleApproveEntry = async (entryId: string) => {
    try {
      // Get the visitor data first
      const { data: pendingEntry, error: fetchError } = await supabase
        .from('pending_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (fetchError) throw fetchError;

      const now = new Date().toISOString();

      // Create a new visitor record
      const { data: newVisitor, error: insertError } = await supabase
        .from('visitors')
        .insert({
          premise_id: pendingEntry.premise_id,
          name: pendingEntry.name,
          phone: pendingEntry.phone,
          idnumber: pendingEntry.idnumber,
          email: pendingEntry.email,
          checked_in_at: now,
          entry_approved_at: now,
          signature: pendingEntry.signature,
          facephoto: pendingEntry.facephoto,
          idphoto_front: pendingEntry.idphoto_front,
          idphoto_back: pendingEntry.idphoto_back,
          purpose: pendingEntry.purpose,
          department: pendingEntry.department,
          visitingperson: pendingEntry.visitingperson,
          vehicle: pendingEntry.vehicle,
          status: 'approved',
          visitor_data: pendingEntry.visitor_data || {},
          authenticated: pendingEntry.authenticated || false,
          user_id: pendingEntry.user_id,
          auth_user_id: pendingEntry.auth_user_id,
          exit_recorded: false
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update pending entry status to approved
      const { error: updateError } = await supabase
        .from('pending_entries')
        .update({ 
          status: 'approved',
          message: 'Your entry has been approved. Please proceed.'
        })
        .eq('id', entryId);

      if (updateError) throw updateError;

      // Update local state to reflect the approval
      setVisitors(prev => prev.map(visitor => 
        visitor.id === entryId
          ? { 
              ...visitor,
              ...newVisitor,
              status: 'approved',
              checked_in_at: now,
              entry_approved_at: now
            }
          : visitor
      ));

      toast({
        title: "Visitor Approved",
        description: "Visitor has been notified and can now proceed"
      });
    } catch (error: any) {
      console.error('Error approving visitor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve visitor",
        variant: "destructive"
      });
    }
  };

  // Deny entry for a visitor
  const handleDenyEntry = async (entryId: string) => {
    try {
      // Update pending entry status to denied
      const { data: updatedEntry, error: updateError } = await supabase
        .from('pending_entries')
        .update({
          status: 'denied',
          denial_reason: 'Entry denied by admin',
          denied_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state to show denied status
      setVisitors(prevVisitors =>
        prevVisitors.map(v => 
          v.id === entryId 
            ? { ...v, status: 'denied', isPending: false } 
            : v
        )
      );

      toast({
        title: "Entry Denied",
        description: "Visitor entry has been denied"
      });
    } catch (error) {
      console.error('Error denying visitor:', error);
      toast({
        title: "Error",
        description: "Failed to deny visitor entry",
        variant: "destructive"
      });
    }
  };

  // Record exit for a visitor
  const handleVisitorExit = async (visitorId: string) => {
    try {
      const now = new Date().toISOString();

      // Update visitor record with exit time
      const { error: updateError } = await supabase
        .from('visitors')
        .update({ 
          checked_out_at: now,
          exit_recorded: true
        })
        .eq('id', visitorId);

      if (updateError) throw updateError;

      // Update local state
      setVisitors(prev => prev.map(visitor => 
        visitor.id === visitorId
          ? { 
              ...visitor,
              checked_out_at: now,
              exit_recorded: true
            }
          : visitor
      ));

    } catch (error: any) {
      console.error('Error recording visitor exit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record visitor exit",
        variant: "destructive"
      });
    }
  };

  // Calculate average visit time from visit_duration column (in seconds)
  const getAverageVisitTime = () => {
    const completed = visitors.filter(v => v.visit_duration != null);
    if (completed.length === 0) return "--";
    const totalSeconds = completed.reduce((sum, v) => sum + v.visit_duration, 0);
    const avgSeconds = totalSeconds / completed.length;
    const avgMinutes = Math.round(avgSeconds / 60);
    return avgMinutes > 0 ? `${avgMinutes} min` : `${Math.round(avgSeconds)} sec`;
  };

  // --- Settings Tab Handlers ---
  const handleSaveSettings = () => {
    setSettingsSaving(true);
    setTimeout(() => {
      setSettingsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your dashboard settings have been updated.",
      });
    }, 1200);
  };

  // Form preview component
  const FormPreview = ({ fields }: { fields: VisitorField[] }) => {
    const visibleFields = fields.filter(f => f.visible);
  
    return (
      <Card className="bg-secondary/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Form Preview</CardTitle>
          <CardDescription>This is how your form will appear to visitors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Visitor Registration</h3>
            <p className="text-sm text-white/60">Please fill in your details below</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {visibleFields.map(field => (
              <div key={field.name} className="space-y-2">
                <label className="flex items-center space-x-1">
                  <span>{field.label}</span>
                  {field.required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <Input 
                  type={field.type || 'text'}
                  disabled
                  className="bg-white/5 border-white/10 cursor-not-allowed"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <Button disabled className="w-full bg-primary/50 cursor-not-allowed">
            Submit Registration
          </Button>
        </CardContent>
      </Card>
    );
  };

  const [activeTab, setActiveTab] = useState("visitors");
  const [activePremise, setActivePremise] = useState(null);
  const [isPremiumAccount, setIsPremiumAccount] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  return (
    <MainLayout>
      <div className="container mx-auto p-6 pb-24">
        {!isLoading && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-1">{premise?.name || 'Dashboard'}</h1>
              <div className="text-xs text-white/60 mb-1">
                ID: {premise?.id || 'Loading...'}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <Card className="bg-secondary border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                  <div className="text-2xl font-bold">{visitors.length}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-white/60">+12% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
                  <div className="text-2xl font-bold">
                    {visitors.filter(v => !v.checked_out_at).length}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-white/60">Currently in your premise</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Visit Time</CardTitle>
                  <div className="text-2xl font-bold">{getAverageVisitTime()}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-white/60">
                    -5% from last week
                  </p>
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
                  <QrCodeIcon className="w-4 h-4 mr-2" />
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

              {/* Visitors Tab */}
              <TabsContent value="visitors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Visitors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">ID Number</th>
                          <th className="text-left p-2">Phone</th>
                          <th className="text-left p-2">Check-in Time</th>
                          <th className="text-left p-2">Check-out Time</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                          {visitors.map(visitor => (
                            <tr key={visitor.id}>
                              <td className="p-2">{visitor.name || '-'}</td>
                              <td className="p-2">{visitor.idnumber || '-'}</td>
                              <td className="p-2">{visitor.phone || '-'}</td>
                              <td className="p-2">
                                {visitor.checked_in_at ? new Date(visitor.checked_in_at).toLocaleString() : '-'}
                              </td>
                              <td className="p-2">
                                {visitor.checked_out_at ? new Date(visitor.checked_out_at).toLocaleString() : '-'}
                              </td>
                              <td className="p-2">
                                {visitor.status === 'pending' ? (
                                  <span className="text-yellow-500">Pending Approval</span>
                                ) : visitor.status === 'approved' ? (
                                  visitor.exit_recorded ? (
                                    <span className="text-gray-400">Checked Out</span>
                                  ) : (
                                    <span className="text-green-500">Checked In</span>
                                  )
                                ) : visitor.status === 'denied' ? (
                                  <span className="text-red-600">Denied</span>
                                ) : (
                                  <span className="text-gray-400">Unknown</span>
                                )}
                              </td>
                              <td className="p-2">
                                <div className="flex items-center space-x-4">
                                  {visitor.isPending && visitor.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleVisitorApproval(visitor)}
                                        className="text-green-600 hover:text-green-800 font-medium"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleDenyEntry(visitor.id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                      >
                                        Deny
                                      </button>
                                    </>
                                  )}
                                  {!visitor.isPending && visitor.status === "approved" && !visitor.exit_recorded && (
                                    <button
                                      onClick={() => handleVisitorExit(visitor.id)}
                                      className="text-blue-600 hover:text-blue-800 font-medium ml-auto"
                                    >
                                      Record Exit
                                    </button>
                                  )}
                                  {visitor.status === "denied" && (
                                    <span className="text-gray-500 italic text-sm">
                                      Reason: {visitor.denial_reason || "Not specified"}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* QR Code Tab */}
              <TabsContent value="qrcode" className="space-y-4 pb-16">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* LEFT: Required Fields and Advanced Accordion */}
                  <div className="space-y-4">
                    {/* Required Fields */}
                    <Card className="bg-secondary border-white/10">
                      <CardHeader>
                        <CardTitle className="text-xl">Required Information</CardTitle>
                        <CardDescription>
                          Basic visitor information fields
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Basic Fields */}
                          {[
                            { name: "name", label: "Full Name", icon: <UserCheck className="w-4 h-4 text-white" /> },
                            { name: "idnumber", label: "ID Number", icon: <IdCard className="w-4 h-4 text-white" /> },
                            { name: "phone", label: "Phone Number", icon: <Phone className="w-4 h-4 text-white" /> }
                          ].map(field => (
                            <div key={field.name} className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                {field.icon}
                              </div>
                              <span className="whitespace-nowrap">{field.label}</span>
                            </div>
                          ))}

                          {/* Email field with toggles */}
                          <div className="flex items-center justify-between py-2 border-t border-white/10">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                <Mail className="w-4 h-4 text-white" />
                              </div>
                              <span className="whitespace-nowrap">Email Address</span>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-white/60">Visible</span>
                                <Switch
                                  checked={visitorFields.find(f => f.name === "email")?.visible || false}
                                  onCheckedChange={() => {
                                    const fieldId = visitorFields.find(f => f.name === "email")?.id;
                                    if (fieldId) handleToggleVisible(fieldId);
                                  }}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-white/60">Required</span>
                                <Switch
                                  checked={visitorFields.find(f => f.name === "email")?.required || false}
                                  onCheckedChange={() => {
                                    const fieldId = visitorFields.find(f => f.name === "email")?.id;
                                    if (fieldId) handleToggleRequired(fieldId);
                                  }}
                                  disabled={!visitorFields.find(f => f.name === "email")?.visible}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Advanced Fields Accordion */}
                    <Accordion type="single" collapsible className="bg-secondary border-white/10 rounded-lg">
                      <AccordionItem value="advanced" className="border-none">
                        <AccordionTrigger className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>Advanced Fields</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <div className="space-y-4">
                            {/* Custom Question Input */}
                            <div className="space-y-2">
                              <label className="text-sm text-white/70">Add Custom Question</label>
                              <div className="flex space-x-2">
                                <Input
                                  value={customQuestion}
                                  onChange={e => setCustomQuestion(e.target.value)}
                                  placeholder="Enter your question..."
                                  className="flex-1"
                                />
                                <Button
                                  onClick={addCustomField}
                                  disabled={!customQuestion.trim()}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>

                            {/* Advanced Fields List */}
                            {[
                              { name: "purpose", label: "Purpose of Visit", icon: <FileText className="w-4 h-4 text-white" /> },
                              { name: "department", label: "Department", icon: <Building className="w-4 h-4 text-white" /> },
                              { name: "visitingperson", label: "Person Being Visited", icon: <UserRoundCog className="w-4 h-4 text-white" /> },
                              { name: "vehicle", label: "Vehicle Registration Number", icon: <Car className="w-4 h-4 text-white" /> }
                            ].map(field => {
                              const fieldData = visitorFields.find(f => f.name === field.name);
                              if (!fieldData) return null;
                              
                              return (
                                <div key={field.name} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                      {field.icon}
                                    </div>
                                    <span className="whitespace-nowrap">{field.label}</span>
                                  </div>
                                  <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-white/60">Visible</span>
                                      <Switch
                                        checked={fieldData.visible}
                                        onCheckedChange={() => handleToggleVisible(fieldData.id)}
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm text-white/60">Required</span>
                                      <Switch
                                        checked={fieldData.required}
                                        onCheckedChange={() => handleToggleRequired(fieldData.id)}
                                        disabled={!fieldData.visible}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* RIGHT: QR Code Generator */}
                  <Card className="bg-secondary border-white/10 h-fit">
                    <CardHeader>
                      <CardTitle className="text-xl">Premise QR Code</CardTitle>
                      <CardDescription>
                        {qrValue 
                          ? "Scan this QR code to access the visitor form"
                          : "Configure your form fields then generate a QR code"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {qrValue ? (
                        <div className="flex flex-col items-center">
                          <div className="bg-white p-4 rounded-lg mb-4">
                            <QRCode 
                              value={qrValue} 
                              size={200}
                              level="H"
                              style={{ margin: '8px' }}
                            />
                          </div>
                          <div className="space-y-4 w-full">
                            <div className="text-center text-sm text-white/70">
                              Form Version: {iteration}
                            </div>
                            <div className="flex gap-2 justify-center">
                              <Button onClick={handleDownloadQR}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button onClick={handleGenerateOrRegenerateQRCode}>
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Update Form
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteQRCode}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>

                          {/* Form Preview */}
                          <div className="mt-8 w-full">
                            <FormPreview fields={visitorFields} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-8">
                          <p className="text-white/60 mb-4">
                            {visitorFields.some(f => f.visible) 
                              ? "Click generate to create a QR code for your form"
                              : "Enable at least one field to generate a QR code"}
                          </p>
                          <Button 
                            onClick={handleGenerateOrRegenerateQRCode}
                            disabled={!visitorFields.some(f => f.visible)}
                          >
                            <QrCodeIcon className="w-4 h-4 mr-2" />
                            Generate QR Code
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <Card className="bg-secondary border-white/10">
                  <CardHeader>
                    <CardTitle className="text-xl">Analytics</CardTitle>
                    <CardDescription>
                      View visitor trends and analytics for your premise
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-white/60 py-12">
                      Analytics coming soon.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card className="bg-secondary border-white/10 w-2/3">
                  <CardHeader>
                    <CardTitle className="text-xl">Settings</CardTitle>
                    <CardDescription>
                      Manage your premise settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Approval Type Radio Group */}
                      <div className="flex flex-col gap-2">
                        <span className="font-medium mb-1">Approval Required From</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="approvalType"
                              value="security"
                              checked={approvalType === "security"}
                              onChange={() => setApprovalType("security")}
                            />
                            Security
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="approvalType"
                              value="reception"
                              checked={approvalType === "reception"}
                              onChange={() => setApprovalType("reception")}
                            />
                            Reception
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="approvalType"
                              value="host"
                              checked={approvalType === "host"}
                              onChange={() => setApprovalType("host")}
                            />
                            Host
                          </label>
                        </div>
                      </div>
                      <Separator className="border-white/10" />
                      {/* USSD Option */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">USSD Option for Non-Smartphone Check-ins</span>
                        <Switch checked={ussdOption} onCheckedChange={setUssdOption} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="bg-scode-blue hover:bg-scode-blue/90 w-full"
                      onClick={handleSaveSettings}
                      disabled={settingsSaving}
                    >
                      {settingsSaving ? "Saving..." : "Save"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      {/* Render all active attention modals */}
      {Object.keys(attentionModals).map(visitorId => (
        <AttentionModalComponent key={visitorId} visitorId={visitorId} />
      ))}
    </MainLayout>
  );
};

export default Dashboard;
