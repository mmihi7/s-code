
import { useState, useCallback } from 'react';
import { 
  saveFormConfiguration, 
  loadFormConfiguration, 
  getDefaultFormFields,
  type VisitorField 
} from '@/services/FormConfigurationService';
import { useToast } from "@/components/ui/use-toast";

export const useFormConfiguration = (premiseId: string) => {
  const [fields, setFields] = useState<VisitorField[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load form configuration from the database
  const loadConfiguration = useCallback(async () => {
    if (!premiseId) return;
    
    setLoading(true);
    try {
      const loadedFields = await loadFormConfiguration(premiseId);
      setFields(loadedFields || getDefaultFormFields());
    } catch (error) {
      console.error("Error loading form configuration:", error);
      toast({
        title: "Error",
        description: "Failed to load form configuration",
        variant: "destructive"
      });
      setFields(getDefaultFormFields());
    } finally {
      setLoading(false);
    }
  }, [premiseId, toast]);

  // Save form configuration to the database
  const saveConfiguration = useCallback(async (updatedFields: VisitorField[]) => {
    if (!premiseId) {
      toast({
        title: "Error",
        description: "Premise ID is required to save form configuration",
        variant: "destructive"
      });
      return false;
    }
    
    setSaving(true);
    try {
      const result = await saveFormConfiguration(premiseId, updatedFields);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Form configuration saved successfully",
        });
        setFields(updatedFields);
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save form configuration",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error saving form configuration:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the form configuration",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [premiseId, toast]);

  // Update a single field
  const updateField = useCallback((id: number, updates: Partial<VisitorField>) => {
    setFields(prevFields => prevFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  }, []);

  // Add a new field
  const addField = useCallback((field: Omit<VisitorField, 'id'>) => {
    setFields(prevFields => [
      ...prevFields,
      { ...field, id: Math.max(0, ...prevFields.map(f => f.id)) + 1 }
    ]);
  }, []);

  // Remove a field
  const removeField = useCallback((id: number) => {
    setFields(prevFields => prevFields.filter(field => field.id !== id));
  }, []);

  return {
    fields,
    setFields,
    loading,
    saving,
    loadConfiguration,
    saveConfiguration,
    updateField,
    addField,
    removeField
  };
};
