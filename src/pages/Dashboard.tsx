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
import { VisitorField, getDefaultFormFields } from "@/services/FormConfigurationService";
import { Json } from "@/integrations/supabase/types";

// Define additional types needed for the Dashboard
interface Visitor {
  id: string;
  name?: string;
  phone?: string;
  idnumber?: string;
  email?: string;
  checked_in_at?: string;
  checked_out_at?: string;
  status?: string;
  premise_id?: string;
  isPending?: boolean;
  requires_attention?: boolean;
  attention_reason?: string;
  exit_recorded?: boolean;
  department?: string;
  purpose?: string;
  visitingperson?: string;
  vehicle?: string;
  denial_reason?: string;
  previous_visit_id?: string;
  previous_entry_time?: string;
  facephoto?: string;
  idphoto_front?: string;
  idphoto_back?: string;
  visitor_data?: any;
  authenticated?: boolean;
  user_id?: string;
  auth_user_id?: string;
}

interface Premise {
  id: string;
  name: string;
  // Add other premise fields as needed
}

interface AttentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitor: Visitor;
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
              <p><strong>Previous Entry:</strong> {visitor?.previous_entry_time ? new Date(visitor.previous_entry_time).toLocaleString() : 'Unknown'}</p>
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

  const [premise, setPremise] = useState<Premise | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visitorFields, setVisitorFields] = useState<VisitorField[]>([]);
  const [saving, setSaving] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [iteration, setIteration] = useState<number>(1);
  const [customQuestion, setCustomQuestion] = useState("");
  const [visitors, setVisitors] = useState<Visitor[]>([]);
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
      visitor: Visitor;
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
            <p className="text-sm text-white/70">{modal.visitor.attention_reason}</p>
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

  const handleVisitorApproval = async (visitor: Visitor) => {
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

      // Get visitor fields from premises or QR forms
      const { data: qrConfig } = await supabase
        .from('qrcode_forms')
        .select('form_fields, iteration, qrcode_url')
        .eq('premise_id', premise_id)
        .order('iteration', { ascending: false })
        .limit(1)
        .single();

      if (qrConfig?.form_fields) {
        try {
          // Use type assertion and ensure it's an array
          let fieldsData: VisitorField[];
          
          if (typeof qrConfig.form_fields === 'string') {
            fieldsData = JSON.parse(qrConfig.form_fields as string) as VisitorField[];
          } else if (Array.isArray(qrConfig.form_fields)) {
            fieldsData = qrConfig.form_fields as unknown as VisitorField[];
          } else {
            console.error('Unexpected form fields format:', qrConfig.form_fields);
            fieldsData = getDefaultFormFields();
          }
          
          setVisitorFields(Array.isArray(fieldsData) ? fieldsData : getDefaultFormFields());
          setIteration(qrConfig.iteration || 1);
          setQrValue(qrConfig.qrcode_url || null);
          setQrGenerated(!!qrConfig.qrcode_url);
        } catch {
          setVisitorFields(getDefaultFormFields());
        }
      } else {
        setVisitorFields(getDefaultFormFields());
      }

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
      setVisitorFields(getDefaultFormFields());
      return;
    }

    // If we have existing configuration, use it
    if (qrConfig?.form_fields) {
      try {
        // Handle both string and object formats
        let parsedFields: VisitorField[];
        
        if (typeof qrConfig.form_fields === 'string') {
          parsedFields = JSON.parse(qrConfig.form_fields) as VisitorField[];
        } else if (Array.isArray(qrConfig.form_fields)) {
          parsedFields = qrConfig.form_fields as unknown as VisitorField[];
        } else {
          console.error('Invalid form fields format:', qrConfig.form_fields);
          setVisitorFields(getDefaultFormFields());
          return;
        }

        if (Array.isArray(parsedFields)) {
          // Ensure all default fields exist with their required properties
          const mergedFields = getDefaultFormFields().map(defaultField => {
            const savedField = parsedFields.find((f: any) => f.name === defaultField.name);
            // For core fields (name, idnumber, phone), maintain required and visible as true
            if (['name', 'idnumber', 'phone'].includes(defaultField.name)) {
              return { ...defaultField, ...savedField, required: true, visible: true };
            }
            return savedField || defaultField;
          });

          setVisitorFields(mergedFields);
          setIteration(qrConfig.iteration || 1);
          setQrValue(qrConfig.qrcode_url || '');
          setQrGenerated(!!qrConfig.qrcode_url);
        } else {
          setVisitorFields(getDefaultFormFields());
        }
      } catch (err) {
        console.error("Error parsing form fields:", err);
        setVisitorFields(getDefaultFormFields());
      }
    } else {
      // Use defaults for new setup
      setVisitorFields(getDefaultFormFields());
      setIteration(1);
      setQrGenerated(false);
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

      // Combine both sets of data with proper typing
      const typedApprovedVisitors = approvedVisitors ? approvedVisitors as unknown as Visitor[] : [];
      const typedPendingEntries = pendingEntries ? pendingEntries.map(entry => ({
        ...entry,
        isPending: true
      } as unknown as Visitor)) : [];

      const allVisitors = [
        ...typedPendingEntries,
        ...typedApprovedVisitors
      ];

      // Check each pending entry for active visits
      for (const entry of allVisitors) {
        if (entry.isPending && entry.idnumber) {
          const { data: activeVisit } = await supabase
            .from('visitors')
            .select('id, checked_in_at')
            .eq('idnumber', entry.idnumber)
            .eq('premise_id', entry.premise_id)
            .is('checked_out_at', null)
            .single();

          if (activeVisit) {
            // Mark entry as requiring attention
            entry.requires_attention = true;
            entry.attention_reason = `Visitor has an unchecked visit from ${new Date(activeVisit.checked_in_at || '').toLocaleString()}`;
            entry.previous_visit_id = activeVisit.id;
            entry.previous_entry_time = activeVisit.checked_in_at;
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
          setVisitorFields(getDefaultFormFields());
          return;
        }

        // If we have existing configuration, use it
        if (qrConfig?.form_fields) {
          try {
            // Handle both string and object formats
            let parsedFields: VisitorField[];
            
            if (typeof qrConfig.form_fields === 'string') {
              parsedFields = JSON.parse(qrConfig.form_fields) as VisitorField[];
            } else if (Array.isArray(qrConfig.form_fields)) {
              parsedFields = qrConfig.form_fields as unknown as VisitorField[];
            } else {
              console.error('Invalid form fields format:', qrConfig.form_fields);
              setVisitorFields(getDefaultFormFields());
              return;
            }
            
            if (Array.isArray(parsedFields)) {
              // Ensure all default fields exist with their required properties
              const mergedFields: VisitorField[] = getDefaultFormFields().map(defaultField => {
                const savedField = parsedFields.find((f: any) => f.name === defaultField.name);
                // For core fields (name, idnumber, phone), maintain required and visible as true
                if (['name', 'idnumber', 'phone'].includes(defaultField.name)) {
                  return { ...defaultField, ...savedField, required: true, visible: true };
                }
                return savedField || defaultField;
              });

              setVisitorFields(mergedFields);
              setIteration(qrConfig.iteration || 1);
              setQrValue(qrConfig.qrcode_url || '');
              setQrGenerated(!!qrConfig.qrcode_url);
            } else {
              console.error("Form fields is not an array:", parsedFields);
              setVisitorFields(getDefaultFormFields());
            }
          } catch (err) {
            console.error("Error parsing form fields:", err);
            setVisitorFields(getDefaultFormFields());
          }
        } else {
          // Use defaults for new setup
          setVisitorFields(getDefaultFormFields());
          setIteration(1);
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        setVisitorFields(getDefaultFormFields());
      }
    };

    loadQRCodeForm();
  }, [premise?.id]);

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
      setSaving(true);
      // Prepare fields - ensure core fields remain required and visible
      const cleanFields = fields.map(field => {
        const isCore = ['name', 'idnumber', 'phone'].includes(field.name);
        return {
          id: field.id,
          name: field.name,
          label: field.label,
          required: isCore ? true : field.required,
          visible: isCore ? true : field.visible,
          premium: field.premium,
          custom: field.custom,
          type: field.type
        };
      });

      const newIteration = iteration + 1;
      const qrUrl = `${window.location.origin}/entry?premise_id=${encodeURIComponent(premise.id)}&v=${newIteration}`;

      // Save QR form with field configuration using upsert
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
      setQrGenerated(true);
      toast({
        title: "Success",
        description: "Form configuration saved successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save form configuration",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
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
      visible: true,
      custom: true
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
      const newVisitorData: any = {
        premise_id: pendingEntry.premise_id,
        name: pendingEntry.name,
        phone: pendingEntry.phone,
        idnumber: pendingEntry.idnumber,
        email: pendingEntry.email,
        checked_in_at: now,
        entry_approved_at: now,
        signature: pendingEntry.signature,
        purpose: pendingEntry.purpose,
        department: pendingEntry.department,
        visitingperson: pendingEntry.visitingperson,
        vehicle: pendingEntry.vehicle,
        status: 'approved',
        visitor_data: {},
        authenticated: pendingEntry.authenticated || false,
        user_id: pendingEntry.user_id
      };

      // Add optional fields if they exist
      if (pendingEntry.facephoto) newVisitorData.facephoto = pendingEntry.facephoto;
      if (pendingEntry.idphoto_front) newVisitorData.idphoto_front = pendingEntry.idphoto_front;
      if (pendingEntry.idphoto_back) newVisitorData.idphoto_back = pendingEntry.idphoto_back;

      const { data: newVisitor, error: insertError } = await supabase
        .from('visitors')
        .insert(newVisitorData);

      if (insertError) throw insertError;

      // Delete the pending entry
      const { error: deleteError } = await supabase
        .from('pending_entries')
        .delete()
        .eq('id', entryId);

      if (deleteError) throw deleteError;

      // Refresh the visitor list
      fetchVisitors();

      toast({
        title: "Entry Approved",
        description: "Visitor entry has been approved",
      });
    } catch (error: any) {
      console.error("Error approving entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve visitor entry",
        variant: "destructive"
      });
    }
  };

  // Deny entry for a visitor
  const handleDenyEntry = async (entryId: string, reason: string = "Entry denied by admin") => {
    try {
      // Update the pending entry
      const { error: updateError } = await supabase
        .from('pending_entries')
        .update({
          status: 'denied',
          denial_reason: reason,
          processed_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (updateError) throw updateError;

      // Refresh the visitor list
      fetchVisitors();

      toast({
        title: "Entry Denied",
        description: "Visitor entry has been denied",
      });
    } catch (error: any) {
      console.error("Error denying entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to deny visitor entry",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      {/* ... keep existing code for rendering the dashboard UI */}
    </MainLayout>
  );
};

export default Dashboard;
