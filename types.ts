import React from 'react';

export interface Offer {
  id: number;
  buyItem: string;
  buyPrice: string;
  freeItem: string;
  freePrice: string;
  emoji: string; // New field for emojis
  icon?: React.ReactNode;
}

export interface Branch {
  name: string;
  address: string;
  phone: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  offerId: number;
  branchName: string;
  appointmentDate: string;
  appointmentTime: string;
  submittedAt: string;
  status: 'New' | 'Contacted' | 'Completed' | 'Abandoned';
  
  // New fields for Retention System
  followUpDate?: string; // The date you plan to call them back
  followUpStatus?: 'Pending' | 'Called' | 'Converted' | 'Missed';
  
  nextFollowUp?: string; // Deprecated in favor of followUpDate, kept for compatibility if needed
  notes?: string; 
}

export interface Visit {
  timestamp: string;
  source: string;
  location?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  type: 'MANUAL' | 'SERVICE';
  targetServiceId?: number;
  manualNumbers?: string;
  intervalDays: number;
  messageTemplate: string;
  active: boolean;
}

export interface AdminSettings {
  googleAnalyticsId: string;
  facebookPixelId: string;
  automationRules: AutomationRule[];
}