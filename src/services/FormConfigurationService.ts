
import { supabase } from "@/lib/supabaseClient";

// Define the visitor field type
export interface VisitorField {
  id: number;
  name: string;
  label: string;
  required: boolean;
  visible: boolean;
  premium?: boolean;
  custom?: boolean;
  type?: string;
}

// Default visitor fields
export const getDefaultFormFields = (): VisitorField[] => [
  { id: 1, name: "name", label: "Full Name", required: true, visible: true, premium: false },
  { id: 2, name: "idnumber", label: "ID Number", required: true, visible: true, premium: false },
  { id: 3, name: "phone", label: "Phone Number", required: true, visible: true, premium: false },
  { id: 4, name: "email", label: "Email Address", required: false, visible: true, premium: false },
  { id: 5, name: "purpose", label: "Purpose of Visit", required: false, visible: false, premium: true },
  { id: 6, name: "department", label: "Department", required: false, visible: false, premium: true },
  { id: 7, name: "visitingperson", label: "Person Being Visited", required: false, visible: false, premium: true },
  { id: 8, name: "vehicle", label: "Vehicle Registration Number", required: false, visible: false, premium: true }
];

// Load form configuration from the database
export async function loadFormConfiguration(premiseId: string): Promise<VisitorField[] | null> {
  try {
    const { data: qrConfig, error } = await supabase
      .from('qrcode_forms')
      .select('form_fields')
      .eq('premise_id', premiseId)
      .order('iteration', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error loading form configuration:', error);
      return null;
    }

    // Type assertion for form_fields
    const formFields = qrConfig?.form_fields as VisitorField[] | undefined;
    
    if (!formFields || !Array.isArray(formFields)) {
      return null;
    }
    
    return formFields;
  } catch (error) {
    console.error('Error in loadFormConfiguration:', error);
    return null;
  }
}

// Save form configuration to the database
export async function saveFormConfiguration(
  premiseId: string, 
  fields: VisitorField[]
): Promise<{ success: boolean; message?: string; qrUrl?: string; iteration?: number }> {
  try {
    // Get current iteration
    const { data: currentConfig } = await supabase
      .from('qrcode_forms')
      .select('iteration')
      .eq('premise_id', premiseId)
      .order('iteration', { ascending: false })
      .limit(1)
      .single();

    const newIteration = (currentConfig?.iteration || 0) + 1;
    
    // Generate QR URL
    const qrUrl = `${window.location.origin}/entry?premise_id=${encodeURIComponent(premiseId)}&v=${newIteration}`;

    // Save using upsert to handle both insert and update cases
    const { error } = await supabase
      .from('qrcode_forms')
      .upsert({
        premise_id: premiseId,
        form_fields: fields,
        qrcode_url: qrUrl,
        iteration: newIteration,
        generated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving form configuration:', error);
      return { success: false, message: error.message };
    }

    return { 
      success: true, 
      message: "Form configuration saved successfully",
      qrUrl,
      iteration: newIteration
    };
  } catch (error: any) {
    console.error('Error in saveFormConfiguration:', error);
    return { success: false, message: error.message || "An unknown error occurred" };
  }
}
