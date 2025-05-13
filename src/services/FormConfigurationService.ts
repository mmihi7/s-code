
import { supabase } from "@/lib/supabaseClient";
import { Json } from "@/integrations/supabase/types";

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

    if (!qrConfig?.form_fields) {
      return null;
    }
    
    // Handle both string and object formats
    let formFields: VisitorField[] = [];
    
    try {
      // If it's a string, parse it
      if (typeof qrConfig.form_fields === 'string') {
        formFields = JSON.parse(qrConfig.form_fields) as VisitorField[];
      } else if (Array.isArray(qrConfig.form_fields)) {
        // If it's already an array, cast it
        formFields = qrConfig.form_fields as unknown as VisitorField[];
      } else {
        console.error('Form fields is not in expected format:', qrConfig.form_fields);
        return null;
      }
      
      // Validate that it's an array of VisitorField objects
      if (!Array.isArray(formFields)) {
        console.error('Parsed form fields is not an array');
        return null;
      }
      
      return formFields;
    } catch (parseError) {
      console.error('Error parsing form_fields:', parseError);
      return null;
    }
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

    // Convert fields to JSON to ensure it matches Supabase type
    const fieldsJson = JSON.parse(JSON.stringify(fields)) as Json;

    // Save using upsert to handle both insert and update cases
    const { error } = await supabase
      .from('qrcode_forms')
      .upsert({
        premise_id: premiseId,
        form_fields: fieldsJson,
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
