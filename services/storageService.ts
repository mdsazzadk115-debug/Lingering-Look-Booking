import { Lead, AdminSettings, Visit } from "../types";

// For local development with Vite proxy, use '/api.php'
// For production, this must match where you upload the file.
const API_URL = '/api.php'; 

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const response = await fetch(`${API_URL}?action=get_leads`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
};

export const saveLead = async (lead: Lead): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}?action=save_lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error saving lead:", error);
    return false;
  }
};

export const updateLead = async (updatedLead: Lead): Promise<void> => {
  try {
    await fetch(`${API_URL}?action=update_lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedLead)
    });
  } catch (error) {
    console.error("Error updating lead:", error);
  }
};

export const getSettings = async (): Promise<AdminSettings> => {
  try {
    const response = await fetch(`${API_URL}?action=get_settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return await response.json();
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { 
      googleAnalyticsId: '',
      facebookPixelId: '',
      automationRules: []
    };
  }
};

export const saveSettings = async (settings: AdminSettings): Promise<void> => {
  try {
    await fetch(`${API_URL}?action=save_settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

export const trackVisit = async (sourceParam: string | null, locationData: string = 'Unknown'): Promise<void> => {
  let finalSource = 'Direct / Unknown';

  if (sourceParam) {
    finalSource = sourceParam;
  } else if (document.referrer) {
    const referrer = document.referrer.toLowerCase();
    if (referrer.includes('facebook.com') || referrer.includes('fb.com')) {
      finalSource = 'Facebook (Organic)';
    } else if (referrer.includes('instagram.com')) {
      finalSource = 'Instagram (Organic)';
    } else if (referrer.includes('google.com')) {
      finalSource = 'Google (Organic)';
    } else if (referrer.includes('youtube.com')) {
      finalSource = 'YouTube';
    } else {
      try {
        const url = new URL(document.referrer);
        finalSource = url.hostname;
      } catch (e) {
        finalSource = 'External Website';
      }
    }
  }

  const visitData = {
    timestamp: new Date().toISOString(),
    source: finalSource,
    location: locationData
  };
  
  try {
    await fetch(`${API_URL}?action=track_visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData)
    });
  } catch (error) {
    console.error("Error tracking visit:", error);
  }
};

export const getVisits = async (): Promise<Visit[]> => {
  try {
    const response = await fetch(`${API_URL}?action=get_visits`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching visits:", error);
    return [];
  }
};
