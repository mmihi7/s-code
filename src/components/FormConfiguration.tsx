
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  Sparkles,
  Building,
  FileText,
  UserRoundCog,
  Car,
  IdCard,
  Mail,
  Phone,
  UserCheck
} from "lucide-react";
import { VisitorField } from '@/services/FormConfigurationService';
import { useFormConfiguration } from '@/hooks/useFormConfiguration';
import { toast } from "@/components/ui/use-toast";
import QRCode from "react-qr-code";

interface FormConfigurationProps {
  premiseId: string;
  initialFields?: VisitorField[];
  onUpdate?: (fields: VisitorField[]) => void;
}

const FormConfiguration: React.FC<FormConfigurationProps> = ({ 
  premiseId, 
  initialFields,
  onUpdate 
}) => {
  const {
    fields,
    setFields,
    loading,
    saving,
    loadConfiguration,
    saveConfiguration,
    updateField,
    addField,
    removeField
  } = useFormConfiguration(premiseId);

  const [customQuestion, setCustomQuestion] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  
  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  // Set initial fields if provided
  useEffect(() => {
    if (initialFields && initialFields.length > 0) {
      setFields(initialFields);
    }
  }, [initialFields, setFields]);

  // Toggle field visibility
  const handleToggleVisible = (id: number) => {
    updateField(id, { 
      visible: !fields.find(f => f.id === id)?.visible,
      required: !fields.find(f => f.id === id)?.visible ? false : fields.find(f => f.id === id)?.required
    });
    // Reset QR code when fields change
    setQrValue(null);
    setQrGenerated(false);
  };

  // Toggle field required
  const handleToggleRequired = (id: number) => {
    const field = fields.find(f => f.id === id);
    if (field?.visible) {
      updateField(id, { required: !field.required });
      // Reset QR code when fields change
      setQrValue(null);
      setQrGenerated(false);
    }
  };

  // Add custom field
  const handleAddCustomField = () => {
    if (!customQuestion.trim()) return;
    
    addField({
      name: `custom_${Date.now()}`,
      label: customQuestion.trim(),
      required: false,
      visible: true,
      custom: true
    });
    
    setCustomQuestion("");
    // Reset QR code when fields change
    setQrValue(null);
    setQrGenerated(false);
  };

  // Generate or regenerate QR code
  const handleGenerateQR = async () => {
    const result = await saveConfiguration(fields);
    if (result.success) {
      setQrValue(result.qrUrl || null);
      setQrGenerated(true);
    }
    
    // Notify parent if needed
    if (onUpdate) {
      onUpdate(fields);
    }
  };

  // Download QR code as PNG
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

  if (loading) {
    return <div>Loading form configuration...</div>;
  }

  return (
    <div className="space-y-6">
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
                ].map(fieldInfo => {
                  const field = fields.find(f => f.name === fieldInfo.name);
                  if (!field) return null;
                  
                  return (
                    <div key={field.name} className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        {fieldInfo.icon}
                      </div>
                      <span className="whitespace-nowrap">{field.label}</span>
                    </div>
                  );
                })}

                {/* Email field with toggles */}
                {(() => {
                  const emailField = fields.find(f => f.name === "email");
                  if (!emailField) return null;
                  
                  return (
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
                            checked={emailField.visible}
                            onCheckedChange={() => handleToggleVisible(emailField.id)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-white/60">Required</span>
                          <Switch
                            checked={emailField.required}
                            onCheckedChange={() => handleToggleRequired(emailField.id)}
                            disabled={!emailField.visible}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
                        onClick={handleAddCustomField}
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
                  ].map(fieldInfo => {
                    const field = fields.find(f => f.name === fieldInfo.name);
                    if (!field) return null;
                    
                    return (
                      <div key={field.name} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                            {fieldInfo.icon}
                          </div>
                          <span className="whitespace-nowrap">{field.label}</span>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-white/60">Visible</span>
                            <Switch
                              checked={field.visible}
                              onCheckedChange={() => handleToggleVisible(field.id)}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-white/60">Required</span>
                            <Switch
                              checked={field.required}
                              onCheckedChange={() => handleToggleRequired(field.id)}
                              disabled={!field.visible}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Fields - if any */}
                  {fields.filter(f => f.custom).map(field => (
                    <div key={field.name} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <span className="whitespace-nowrap">{field.label}</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-white/60">Visible</span>
                          <Switch
                            checked={field.visible}
                            onCheckedChange={() => handleToggleVisible(field.id)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-white/60">Required</span>
                          <Switch
                            checked={field.required}
                            onCheckedChange={() => handleToggleRequired(field.id)}
                            disabled={!field.visible}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Save & Generate QR Button */}
          <Button 
            onClick={handleGenerateQR} 
            className="w-full"
            disabled={saving}
          >
            {saving ? "Saving..." : qrGenerated ? "Regenerate QR Code" : "Generate QR Code"}
          </Button>
        </div>

        {/* RIGHT: QR Code and Form Preview */}
        <div className="space-y-4">
          {qrGenerated && qrValue ? (
            <Card className="bg-secondary border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Premise QR Code</CardTitle>
                <CardDescription>
                  Place this QR code at your premise entry points
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <QRCode 
                    id="premise-qr-svg"
                    value={qrValue || ""}
                    size={220}
                    level="H"
                  />
                </div>
                <Button 
                  onClick={handleDownloadQR} 
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-secondary/50 border-white/10 flex flex-col items-center justify-center p-8 min-h-[360px]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <QRCode className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No QR Code Generated</h3>
                <p className="text-white/60 mb-6">Configure your form fields and generate a QR code</p>
              </div>
            </Card>
          )}

          {/* Form Preview */}
          <FormPreview fields={fields} />
        </div>
      </div>
    </div>
  );
};

export default FormConfiguration;
