
import React, { useEffect } from 'react';
import { useFormConfiguration } from '@/hooks/useFormConfiguration';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Lock, AlertCircle } from "lucide-react";
import { type VisitorField } from '@/services/FormConfigurationService';

interface FormConfigurationProps {
  premiseId: string;
  isPremium?: boolean;
  onTogglePremium?: () => void;
}

const FormConfiguration: React.FC<FormConfigurationProps> = ({ 
  premiseId,
  isPremium = false,
  onTogglePremium
}) => {
  const {
    fields,
    loading,
    saving,
    loadConfiguration,
    saveConfiguration,
    updateField,
    addField,
    removeField
  } = useFormConfiguration(premiseId);

  useEffect(() => {
    if (premiseId) {
      loadConfiguration();
    }
  }, [premiseId, loadConfiguration]);

  const handleSave = async () => {
    await saveConfiguration(fields);
  };

  const handleAddField = () => {
    addField({
      name: `custom_${Date.now()}`,
      label: "New Field",
      required: false,
      visible: true,
      premium: false,
      custom: true,
      type: 'text'
    });
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Loading form configuration...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>QR Code Form Configuration</CardTitle>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-scode-blue hover:bg-scode-blue/90"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            {fields.map((field) => (
              <div 
                key={field.id} 
                className={`p-4 rounded-lg border ${
                  field.premium && !isPremium 
                    ? 'bg-yellow-500/10 border-yellow-500/30' 
                    : 'bg-secondary border-white/10'
                }`}
              >
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="text-base font-medium"
                        placeholder="Field Label"
                      />
                      
                      {field.premium && !isPremium && (
                        <div className="flex items-center text-yellow-500">
                          <Lock size={16} className="mr-1" />
                          <span className="text-xs">Premium</span>
                        </div>
                      )}
                    </div>
                    
                    <Input
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      className="text-sm mb-2"
                      placeholder="Field Name (technical)"
                      disabled={!field.custom}
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) => 
                          updateField(field.id, { required: checked === true })
                        }
                      />
                      <Label htmlFor={`required-${field.id}`} className="text-sm">Required</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`visible-${field.id}`}
                        checked={field.visible}
                        onCheckedChange={(checked) => 
                          updateField(field.id, { visible: checked === true })
                        }
                      />
                      <Label htmlFor={`visible-${field.id}`} className="text-sm">Visible</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`premium-${field.id}`}
                        checked={field.premium}
                        onCheckedChange={(checked) => 
                          updateField(field.id, { premium: checked === true })
                        }
                      />
                      <Label htmlFor={`premium-${field.id}`} className="text-sm">Premium</Label>
                    </div>
                    
                    {field.custom && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        className="ml-auto"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
                
                {field.premium && !isPremium && (
                  <div className="mt-3 p-2 bg-yellow-500/20 rounded border border-yellow-500/30 text-sm flex items-start">
                    <AlertCircle size={16} className="text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      This is a premium feature. 
                      <Button 
                        variant="link" 
                        className="text-yellow-500 p-0 h-auto text-sm"
                        onClick={onTogglePremium}
                      >
                        Upgrade now
                      </Button> 
                      to enable this field.
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={handleAddField}
            >
              <Plus size={16} className="mr-2" />
              Add Custom Field
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormConfiguration;
