import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, getSettings, saveSettings, getVisits, saveLead, updateLead } from '../services/storageService';
import { Lead, AdminSettings, Visit, AutomationRule } from '../types';
import { OFFERS, BRAND_COLOR } from '../constants';
import { Users, LogOut, CalendarCheck, BarChart3, TrendingUp, Globe, Zap, Upload, Calendar, Bell, ChevronLeft, ChevronRight, CheckSquare, Square, Copy, CheckCircle, MessageSquare, PhoneOutgoing, Repeat, Download, Filter, DollarSign, AlertTriangle, Loader2, Save, Target } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  // Initialize with safe defaults
  const [settings, setSettings] = useState<AdminSettings>({ googleAnalyticsId: '', facebookPixelId: '', automationRules: [] });
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics' | 'tracking' | 'automation' | 'appointments' | 'finance' | 'incomplete'>('leads');
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({ type: 'SERVICE', intervalDays: 7, active: true });
  const [loading, setLoading] = useState(true);
  
  // Bulk Import State
  const [bulkImportServiceId, setBulkImportServiceId] = useState<string>('');
  const [bulkImportData, setBulkImportData] = useState<string>('');

  // Appointment & Retention State
  const [appointmentView, setAppointmentView] = useState<'incoming' | 'retention'>('incoming');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [notesInput, setNotesInput] = useState<{[key: string]: string}>({});
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [filterServiceId, setFilterServiceId] = useState<string>(''); 

  // Financial State
  const [financialTimeframe, setFinancialTimeframe] = useState<'this_month' | 'all_time'>('this_month');

  // Input for scheduling a follow-up date manually
  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(null);
  const [tempFollowUpDate, setTempFollowUpDate] = useState<string>('');

  const navigate = useNavigate();

  const refreshData = useCallback(async () => {
      setLoading(true);
      try {
          const [loadedLeads, loadedSettings, loadedVisits] = await Promise.all([
              getLeads(),
              getSettings(),
              getVisits()
          ]);

          setLeads(Array.isArray(loadedLeads) ? loadedLeads : []);
          setVisits(Array.isArray(loadedVisits) ? loadedVisits : []);
          
          // CRITICAL FIX: Ensure settings properties are never null/undefined to prevent crashes
          setSettings({
              googleAnalyticsId: loadedSettings?.googleAnalyticsId || '',
              facebookPixelId: loadedSettings?.facebookPixelId || '',
              automationRules: Array.isArray(loadedSettings?.automationRules) ? loadedSettings.automationRules : []
          });
          
          const initialNotes: {[key: string]: string} = {};
          if (Array.isArray(loadedLeads)) {
            loadedLeads.forEach(l => {
                if (l.notes) initialNotes[l.id] = l.notes;
            });
          }
          setNotesInput(initialNotes);
      } catch (error) {
          console.error("Failed to load dashboard data", error);
      } finally {
          setLoading(false);
      }
  }, []);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAdminAuthenticated');
    if (!isAuth) {
        navigate('/admin');
        return;
    }
    refreshData();
  }, [navigate, refreshData]);


  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  const handleSettingsSave = async () => {
    await saveSettings(settings);
    alert('Settings saved successfully!');
  };

  const handleNoteSave = async (lead: Lead) => {
      const newNote = notesInput[lead.id];
      const updatedLead = { ...lead, notes: newNote };
      await updateLead(updatedLead);
      refreshData();
  };

  const handleSendReminder = (lead: Lead) => {
      const msg = `Hi ${lead.name}, this is a reminder for your appointment at Lingering Look on ${lead.appointmentDate} at ${lead.appointmentTime}. See you soon!`;
      const url = `https://wa.me/${lead.phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
  };

  const handleSetFollowUp = async (lead: Lead) => {
      if (!tempFollowUpDate) return;
      
      const updatedLead: Lead = {
          ...lead,
          status: 'Completed',
          followUpDate: tempFollowUpDate,
          followUpStatus: 'Pending'
      };
      
      await updateLead(updatedLead);
      setEditingFollowUpId(null);
      setTempFollowUpDate('');
      refreshData();
      alert(`Client moved to Retention Calendar for ${tempFollowUpDate}`);
  };

  const handleRetentionCallAction = async (lead: Lead, action: 'Called' | 'Converted' | 'Missed') => {
      await updateLead({
          ...lead,
          followUpStatus: action
      });
      refreshData();
  };

  const toggleSelectAll = (dateLeads: Lead[]) => {
      if (selectedLeadIds.size === dateLeads.length && dateLeads.length > 0) {
          setSelectedLeadIds(new Set());
      } else {
          const newSet = new Set(dateLeads.map(l => l.id));
          setSelectedLeadIds(newSet);
      }
  };

  const toggleSelectOne = (id: string) => {
      const newSet = new Set(selectedLeadIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedLeadIds(newSet);
  };

  const handleBulkCopy = (leadsToUse: Lead[]) => {
      const selected = leadsToUse.filter(l => selectedLeadIds.has(l.id));
      const numbers = selected.map(l => l.phone).join(',');
      navigator.clipboard.writeText(numbers);
      alert(`Copied ${selected.length} phone numbers to clipboard!`);
  };

  const handleBulkDownload = (leadsToUse: Lead[]) => {
      let listToDownload: Lead[] = [];
      
      if (selectedLeadIds.size > 0) {
          listToDownload = leadsToUse.filter(l => selectedLeadIds.has(l.id));
      } else {
          listToDownload = leadsToUse;
      }

      if (listToDownload.length === 0) {
          alert("No data to download");
          return;
      }

      const csvRows = [
          ['Name', 'Phone', 'Service', 'Price Range', 'Status', 'Date', 'Outcome']
      ];

      listToDownload.forEach(l => {
          const offer = OFFERS.find(o => o.id === l.offerId);
          const name = (l.name || '').replace(/"/g, '""');
          const phone = (l.phone || '').replace(/"/g, '""');
          const service = (offer?.buyItem || 'Unknown').replace(/"/g, '""');
          
          csvRows.push([
              `"${name}"`, 
              `"${phone}"`, 
              `"${service}"`, 
              `"${offer?.buyPrice || '0'}"`,
              l.status || '',
              appointmentView === 'incoming' ? (l.appointmentDate || '') : (l.followUpDate || ''),
              l.followUpStatus || 'Pending'
          ]);
      });

      const csvContent = "data:text/csv;charset=utf-8," 
          + csvRows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `lingering_contacts_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newRule.name || !newRule.messageTemplate) return;

    const rule: AutomationRule = {
        id: crypto.randomUUID(),
        name: newRule.name || 'Untitled Campaign',
        type: newRule.type || 'SERVICE',
        targetServiceId: newRule.targetServiceId,
        manualNumbers: newRule.manualNumbers,
        intervalDays: newRule.intervalDays || 7,
        messageTemplate: newRule.messageTemplate || '',
        active: true
    };

    const updatedRules = [...(settings.automationRules || []), rule];
    const updatedSettings = { ...settings, automationRules: updatedRules };
    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
    setNewRule({ type: 'SERVICE', intervalDays: 7, active: true, name: '', messageTemplate: '' });
  };

  const handleDeleteRule = async (id: string) => {
      const updatedRules = (settings.automationRules || []).filter(r => r.id !== id);
      const updatedSettings = { ...settings, automationRules: updatedRules };
      setSettings(updatedSettings);
      await saveSettings(updatedSettings);
  };

  const handleBulkImport = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!bulkImportServiceId || !bulkImportData) return;

      const lines = bulkImportData.split('\n');
      let addedCount = 0;
      
      for (const line of lines) {
          const parts = line.split(',');
          let name = 'Imported Customer';
          let phone = '';

          if (parts.length > 1) {
              name = parts[0].trim();
              phone = parts[1].trim();
          } else {
              phone = parts[0].trim();
          }

          if (phone) {
              const newLead: Lead = {
                  id: crypto.randomUUID(),
                  name: name,
                  phone: phone,
                  branchName: 'Imported',
                  offerId: parseInt(bulkImportServiceId),
                  appointmentDate: 'N/A',
                  appointmentTime: 'N/A',
                  submittedAt: new Date().toISOString(),
                  status: 'New'
              };
              
              const isSaved = await saveLead(newLead);
              if (isSaved) addedCount++;
          }
      }

      alert(`Import complete.\n✅ Processed: ${addedCount}`);
      setBulkImportData('');
      refreshData();
  };

  const getAnalytics = () => {
    const today = new Date().toLocaleDateString();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const safeVisits = Array.isArray(visits) ? visits : [];

    const visitsToday = safeVisits.filter(v => {
        try { return new Date(v.timestamp).toLocaleDateString() === today; } catch { return false; }
    }).length;
    
    const visits30Days = safeVisits.filter(v => {
        try { return new Date(v.timestamp) >= thirtyDaysAgo; } catch { return false; }
    }).length;
    
    const sources: {[key: string]: number} = {};
    const locations: {[key: string]: number} = {};

    safeVisits.forEach(v => {
      const src = v.source || 'Unknown';
      sources[src] = (sources[src] || 0) + 1;
      const loc = v.location || 'Unknown';
      locations[loc] = (locations[loc] || 0) + 1;
    });

    const sortedSources = Object.entries(sources).sort(([,a], [,b]) => b - a);
    const sortedLocations = Object.entries(locations).sort(([,a], [,b]) => b - a);

    return { visitsToday, visits30Days, total: safeVisits.length, sources: sortedSources, locations: sortedLocations };
  };

  const analytics = getAnalytics();
  const getServiceTotalCount = (offerId: number) => leads.filter(l => l.offerId === offerId).length;

  const getServiceActiveCount = (offerId: number) => {
      return leads.filter(l => {
          if (l.offerId !== offerId) return false;
          if (activeTab === 'incomplete') return l.status === 'Abandoned';
          if (appointmentView === 'incoming') {
              return l.status !== 'Completed' && l.status !== 'Abandoned';
          } else {
              return l.status === 'Completed';
          }
      }).length;
  };

  const parsePrice = (priceStr: string): number => {
      if (!priceStr) return 0;
      try {
          const clean = priceStr.replace(/,/g, '').replace(/[^\d-]/g, '');
          if (clean.includes('-')) {
              const [min, max] = clean.split('-').map(Number);
              return (min + max) / 2;
          }
          return Number(clean);
      } catch {
          return 0;
      }
  };

  const getFinancials = () => {
      let totalPotential = 0;
      let totalActual = 0;
      let totalLoss = 0;
      
      const now = new Date();
      const currentMonthPrefix = now.toISOString().slice(0, 7); // YYYY-MM
      const today = now.toISOString().split('T')[0];
      
      const safeLeads = Array.isArray(leads) ? leads : [];

      const relevantLeads = safeLeads.filter(l => {
          if (l.status === 'Abandoned') return false; 
          if (financialTimeframe === 'all_time') return true;
          // Safety check for appointmentDate
          return l.appointmentDate && l.appointmentDate.startsWith(currentMonthPrefix);
      });

      const breakdown = OFFERS.map(offer => {
          const avgPrice = parsePrice(offer.buyPrice);
          const serviceLeads = relevantLeads.filter(l => Number(l.offerId) === offer.id);
          
          const totalCount = serviceLeads.length;
          const completedCount = serviceLeads.filter(l => l.status === 'Completed').length;
          
          // Safety check for appointmentDate comparison
          const lostCount = serviceLeads.filter(l => 
              l.status !== 'Completed' && 
              l.appointmentDate && 
              l.appointmentDate < today && 
              l.appointmentDate !== 'N/A'
          ).length;

          const potentialRevenue = totalCount * avgPrice;
          const actualRevenue = completedCount * avgPrice;
          const lostRevenue = lostCount * avgPrice;
          
          const pendingCount = totalCount - completedCount - lostCount;

          totalPotential += potentialRevenue;
          totalActual += actualRevenue;
          totalLoss += lostRevenue;

          return {
              ...offer,
              totalCount,
              completedCount,
              lostCount,
              pendingCount,
              avgPrice,
              potentialRevenue,
              actualRevenue,
              lostRevenue
          };
      });

      return { totalPotential, totalActual, totalLoss, breakdown };
  };

  const financials = getFinancials();
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const filteredLeadsForCalendar = leads.filter(l => {
      if (activeTab === 'incomplete') {
          return l.status === 'Abandoned' && l.appointmentDate === selectedDate;
      }
      if (l.status === 'Abandoned') return false; 
      const dateMatch = appointmentView === 'incoming' 
        ? l.appointmentDate === selectedDate
        : l.followUpDate === selectedDate;
      const serviceMatch = filterServiceId === '' || l.offerId.toString() === filterServiceId;
      return dateMatch && serviceMatch;
  });

  const sortedAppointments = [...filteredLeadsForCalendar].sort((a,b) => {
      if (activeTab === 'incomplete') return (b.submittedAt || '').localeCompare(a.submittedAt || '');
      if (appointmentView === 'incoming') return (a.appointmentTime || '').localeCompare(b.appointmentTime || '');
      return (a.name || '').localeCompare(b.name || '');
  });

  const changeMonth = (offset: number) => {
      const newDate = new Date(currentCalendarMonth);
      newDate.setMonth(newDate.getMonth() + offset);
      setCurrentCalendarMonth(newDate);
  };

  const getCalendarCount = (dateStr: string) => {
      return leads.filter(l => {
        if (activeTab === 'incomplete') {
            return l.status === 'Abandoned' && l.appointmentDate === dateStr;
        }
        if (l.status === 'Abandoned') return false;
        if (appointmentView === 'incoming') return l.appointmentDate === dateStr;
        return l.followUpDate === dateStr;
      }).length;
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center">
                  <Loader2 className="w-10 h-10 text-pink-600 animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Loading Database Data...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-[Hind Siliguri]">
      <aside className="bg-white w-full md:w-64 flex-shrink-0 border-r border-gray-200">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
             <span className="text-xl font-bold" style={{ color: BRAND_COLOR }}>Lingering Admin</span>
        </div>
        <div className="p-4 space-y-2">
            <button
                onClick={() => setActiveTab('leads')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'leads' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Users className="w-5 h-5 mr-3" />
                All Clients
            </button>
            <button
                onClick={() => setActiveTab('appointments')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'appointments' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Calendar className="w-5 h-5 mr-3" />
                Schedules & Planner
            </button>
            <button
                onClick={() => { setActiveTab('incomplete'); setSelectedDate(new Date().toISOString().split('T')[0]); }}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'incomplete' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <AlertTriangle className="w-5 h-5 mr-3" />
                Incomplete Bookings
            </button>
             <button
                onClick={() => setActiveTab('finance')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'finance' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <DollarSign className="w-5 h-5 mr-3" />
                Financial Overview
            </button>
            <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <BarChart3 className="w-5 h-5 mr-3" />
                Visitor Analytics
            </button>
            <button
                onClick={() => setActiveTab('tracking')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tracking' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Target className="w-5 h-5 mr-3" />
                Tracking Setup
            </button>
            <button
                onClick={() => setActiveTab('automation')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'automation' ? 'bg-pink-50 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Zap className="w-5 h-5 mr-3" />
                Automation Rules
            </button>
        </div>
        <div className="p-4 mt-auto border-t">
            <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
            </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'finance' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Financial Overview</h2>
                        <p className="text-gray-500">Track earnings, losses, and conversion rates.</p>
                    </div>
                    <div className="flex bg-white rounded-lg shadow-sm border p-1">
                        <button
                            onClick={() => setFinancialTimeframe('this_month')}
                            className={`px-4 py-2 rounded text-sm font-medium transition-all ${financialTimeframe === 'this_month' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            This Month
                        </button>
                        <button
                             onClick={() => setFinancialTimeframe('all_time')}
                            className={`px-4 py-2 rounded text-sm font-medium transition-all ${financialTimeframe === 'all_time' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            All Time
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
                        <p className="text-sm font-bold text-blue-500 uppercase tracking-wide">Projected Income</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{financialTimeframe === 'this_month' ? '📅' : '💰'} {financials.totalPotential.toLocaleString()} BDT</h3>
                        <p className="text-xs text-gray-400 mt-1">Total value of all bookings</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-green-100">
                        <p className="text-sm font-bold text-green-500 uppercase tracking-wide">Actual Income</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-2">✅ {financials.totalActual.toLocaleString()} BDT</h3>
                        <p className="text-xs text-gray-400 mt-1">Value of 'Completed' appointments</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-red-100">
                        <p className="text-sm font-bold text-red-500 uppercase tracking-wide">Lost Income</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-2">📉 {financials.totalLoss.toLocaleString()} BDT</h3>
                        <p className="text-xs text-gray-400 mt-1">Missed/No-show appointments</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-800">Service Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loss</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(financials.breakdown || []).map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.emoji} {item.buyItem}</div>
                                            <div className="text-xs text-gray-500">Avg: {item.avgPrice.toLocaleString()} TK</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.totalCount}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                                                <div 
                                                    className="bg-green-600 h-2.5 rounded-full" 
                                                    style={{ width: `${item.totalCount > 0 ? (item.completedCount / item.totalCount) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1 inline-block">
                                                {item.completedCount} / {item.totalCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {item.actualRevenue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                            {item.lostRevenue.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'analytics' && (
             <div className="space-y-6">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800">Visitor Analytics</h2>
                    <p className="text-gray-500">Track where your customers are coming from.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <p className="text-gray-500 text-sm font-medium">Visits Today</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.visitsToday}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <p className="text-gray-500 text-sm font-medium">Last 30 Days</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.visits30Days}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <p className="text-gray-500 text-sm font-medium">Total Tracked</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.total}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-700">Top Traffic Sources</h3>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(analytics.sources || []).length === 0 ? (
                                    <tr><td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No data available</td></tr>
                                ) : (
                                    (analytics.sources || []).map(([source, count], idx) => (
                                        <tr key={source}>
                                            <td className="px-6 py-4 text-sm text-gray-900 flex items-center">
                                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2 font-bold">{idx + 1}</span>
                                                {source}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-bold">{count}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                         <div className="px-6 py-4 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-700">Top Locations</h3>
                        </div>
                         <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(analytics.locations || []).length === 0 ? (
                                    <tr><td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No data available</td></tr>
                                ) : (
                                    (analytics.locations || []).map(([loc, count], idx) => (
                                        <tr key={loc}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{loc}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-bold">{count}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
             </div>
        )}

        {activeTab === 'tracking' && (
            <div className="space-y-6">
                <div>
                   <h2 className="text-2xl font-bold text-gray-800">Tracking Setup</h2>
                   <p className="text-gray-500">Configure Google Analytics and Facebook Pixel.</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border p-6">
                     <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Tracking IDs</h3>
                     <div className="space-y-4 max-w-lg">
                         <div>
                             <label className="block text-sm font-medium text-gray-700">Google Analytics ID (Measurement ID)</label>
                             <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                    placeholder="G-XXXXXXXXXX"
                                    value={settings.googleAnalyticsId || ''}
                                    onChange={(e) => setSettings({...settings, googleAnalyticsId: e.target.value})}
                                />
                             </div>
                             <p className="text-xs text-gray-500 mt-1">Found in Google Analytics Admin &gt; Data Streams.</p>
                         </div>
                         
                         <div>
                             <label className="block text-sm font-medium text-gray-700">Facebook Pixel ID</label>
                             <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Target className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="focus:ring-pink-500 focus:border-pink-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                    placeholder="123456789012345"
                                    value={settings.facebookPixelId || ''}
                                    onChange={(e) => setSettings({...settings, facebookPixelId: e.target.value})}
                                />
                             </div>
                              <p className="text-xs text-gray-500 mt-1">Found in Facebook Events Manager.</p>
                         </div>

                         <div className="pt-4">
                             <button
                                onClick={handleSettingsSave}
                                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
                             >
                                 <Save className="w-4 h-4 mr-2" />
                                 Save Tracking Settings
                             </button>
                         </div>
                     </div>
                </div>
            </div>
        )}

        {activeTab === 'automation' && (
            <div className="space-y-6">
                <div>
                   <h2 className="text-2xl font-bold text-gray-800">Automation Rules</h2>
                   <p className="text-gray-500">Plan your WhatsApp marketing campaigns.</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Campaign Rule</h3>
                    <form onSubmit={handleAddRule} className="space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                             <input 
                                type="text" 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="e.g. 7-Day Followup"
                                value={newRule.name || ''}
                                onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                                required
                             />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Target Service</label>
                                <select 
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md border"
                                    value={newRule.targetServiceId || ''}
                                    onChange={(e) => setNewRule({...newRule, targetServiceId: parseInt(e.target.value) || undefined})}
                                >
                                    <option value="">Any Service</option>
                                    {OFFERS.map(o => (
                                        <option key={o.id} value={o.id}>{o.emoji} {o.buyItem}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Send After (Days)</label>
                                <input 
                                    type="number" 
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    min="1"
                                    value={newRule.intervalDays}
                                    onChange={(e) => setNewRule({...newRule, intervalDays: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Message Template</label>
                             <textarea 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                rows={3}
                                placeholder="Hi {name}, it's been a while! Come back for 10% off."
                                value={newRule.messageTemplate || ''}
                                onChange={(e) => setNewRule({...newRule, messageTemplate: e.target.value})}
                                required
                             />
                             <p className="text-xs text-gray-500 mt-1">Use <strong>{'{name}'}</strong> as a placeholder for customer name.</p>
                        </div>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none"
                        >
                            Add Rule
                        </button>
                    </form>
                </div>

                <div className="bg-white shadow overflow-hidden rounded-md border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {(settings.automationRules || []).length === 0 ? (
                            <li className="px-6 py-4 text-center text-gray-500">No automation rules configured.</li>
                        ) : (
                            (settings.automationRules || []).map(rule => (
                                <li key={rule.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{rule.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {rule.type === 'SERVICE' ? `Target: ${rule.targetServiceId ? (OFFERS.find(o => o.id === Number(rule.targetServiceId))?.buyItem || 'Unknown') : 'Any Service'}` : 'Manual List'} 
                                            • {rule.intervalDays} days after visit
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 truncate max-w-md">"{rule.messageTemplate}"</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        )}

        {activeTab === 'leads' && (
            <div className="space-y-8">
                <div>
                   <h2 className="text-2xl font-bold text-gray-800">All Clients</h2>
                   <p className="text-gray-500">Master list of everyone who has ever booked or been imported.</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Upload className="w-5 h-5 mr-2" />
                        Bulk Import Customers
                    </h3>
                    <form onSubmit={handleBulkImport} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Assign to Service</label>
                                <select 
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md border"
                                    value={bulkImportServiceId}
                                    onChange={(e) => setBulkImportServiceId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Service Category --</option>
                                    {OFFERS.map(offer => (
                                        <option key={offer.id} value={offer.id}>
                                            {offer.emoji} {offer.buyItem} (Total: {getServiceTotalCount(offer.id)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Data (Name, Phone)</label>
                                <textarea 
                                    rows={3}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    placeholder="Jane Doe, 01700000000&#10;John Smith, 01800000000"
                                    value={bulkImportData}
                                    onChange={(e) => setBulkImportData(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Format: Name, Phone (One per line)</p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none"
                        >
                            Import Data
                        </button>
                    </form>
                </div>
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800">Recent Leads ({leads.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retention Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(leads || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No leads found yet.</td>
                                    </tr>
                                ) : (
                                    leads.map(lead => {
                                        const offer = OFFERS.find(o => o.id === Number(lead.offerId));
                                        return (
                                            <tr key={lead.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                                    <div className="text-sm text-gray-500">{lead.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">Offer #{lead.offerId}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-xs">{offer?.emoji} {offer?.buyItem}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'Completed' ? 'bg-green-100 text-green-800' : lead.status === 'Abandoned' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {lead.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {lead.followUpDate ? (
                                                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                                            Call: {lead.followUpDate}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No plan</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <a 
                                                        href={`https://wa.me/${lead.phone}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="text-green-600 hover:text-green-800 flex items-center"
                                                    >
                                                        <MessageSquare className="w-4 h-4 mr-1" />
                                                        WhatsApp
                                                    </a>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {(activeTab === 'appointments' || activeTab === 'incomplete') && (
             <div className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {activeTab === 'incomplete' 
                                ? 'Incomplete / Abandoned Bookings' 
                                : appointmentView === 'incoming' 
                                    ? 'Appointment Schedule' 
                                    : 'Retention Planner'}
                        </h2>
                        <p className="text-gray-500">
                            {activeTab === 'incomplete'
                                ? 'Users who started filling the form but did not submit.'
                                : appointmentView === 'incoming' 
                                    ? 'View and manage upcoming customer bookings.' 
                                    : 'Call previous clients to offer deals and bring them back.'}
                        </p>
                    </div>
                    {activeTab === 'appointments' && (
                        <div className="bg-gray-200 p-1 rounded-lg flex space-x-1">
                            <button
                                onClick={() => { setAppointmentView('incoming'); setSelectedLeadIds(new Set()); setFilterServiceId(''); }}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    appointmentView === 'incoming' 
                                        ? 'bg-white text-gray-900 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <CalendarCheck className="w-4 h-4 mr-2" />
                                Incoming
                            </button>
                            <button
                                onClick={() => { setAppointmentView('retention'); setSelectedLeadIds(new Set()); setFilterServiceId(''); }}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    appointmentView === 'retention' 
                                        ? 'bg-white text-purple-700 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Repeat className="w-4 h-4 mr-2" />
                                Retention
                            </button>
                        </div>
                    )}
                 </div>

                 <div className={`bg-white rounded-xl shadow-lg border overflow-hidden ${
                     activeTab === 'incomplete' ? 'border-red-200' :
                     appointmentView === 'retention' ? 'border-purple-200' : 'border-gray-200'
                 }`}>
                     <div className={`px-6 py-4 border-b flex items-center justify-between ${
                         activeTab === 'incomplete' ? 'bg-red-50 border-red-200' :
                         appointmentView === 'retention' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
                     }`}>
                         <h3 className={`font-bold text-lg ${
                             activeTab === 'incomplete' ? 'text-red-800' :
                             appointmentView === 'retention' ? 'text-purple-800' : 'text-gray-800'
                         }`}>
                             {currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                         </h3>
                         <div className="flex space-x-2">
                             <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/50 rounded"><ChevronLeft className="w-5 h-5"/></button>
                             <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white/50 rounded"><ChevronRight className="w-5 h-5"/></button>
                         </div>
                     </div>
                     
                     <div className="p-4">
                         <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-2">
                             <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                         </div>
                         <div className="grid grid-cols-7 gap-1">
                             {Array.from({ length: getFirstDayOfMonth(currentCalendarMonth) }).map((_, i) => (
                                 <div key={`empty-${i}`} className="h-20 bg-gray-50/30 rounded-lg"></div>
                             ))}
                             {Array.from({ length: getDaysInMonth(currentCalendarMonth) }).map((_, i) => {
                                 const day = i + 1;
                                 const dateStr = `${currentCalendarMonth.getFullYear()}-${String(currentCalendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                 const count = getCalendarCount(dateStr);
                                 const isSelected = selectedDate === dateStr;
                                 const activeColor = activeTab === 'incomplete' ? 'red' : appointmentView === 'incoming' ? 'pink' : 'purple';
                                 
                                 return (
                                     <div 
                                        key={day} 
                                        onClick={() => { setSelectedDate(dateStr); setSelectedLeadIds(new Set()); }}
                                        className={`h-20 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all ${
                                            isSelected 
                                                ? `bg-${activeColor}-50 border-${activeColor}-500 ring-2 ring-${activeColor}-200` 
                                                : `bg-white border-gray-100 hover:border-${activeColor}-300`
                                        }`}
                                     >
                                         <span className={`text-sm ${isSelected ? `font-bold text-${activeColor}-700` : 'text-gray-700'}`}>{day}</span>
                                         {count > 0 && (
                                             <span className={`mt-1 px-2 py-0.5 text-white text-xs rounded-full shadow-sm ${
                                                 activeTab === 'incomplete' ? 'bg-red-600' :
                                                 appointmentView === 'incoming' ? 'bg-pink-600' : 'bg-purple-600'
                                             }`}>
                                                 {count}
                                             </span>
                                         )}
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 </div>

                 <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col xl:flex-row justify-between xl:items-center gap-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {activeTab === 'incomplete' ? 'Abandoned Carts on' : appointmentView === 'incoming' ? 'Bookings for' : 'Follow-up Calls on'} 
                                    <span className={activeTab === 'incomplete' ? 'text-red-600' : appointmentView === 'incoming' ? 'text-pink-600' : 'text-purple-600'}> {selectedDate}</span>
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {sortedAppointments.length} {activeTab === 'incomplete' ? 'incomplete entries' : appointmentView === 'incoming' ? 'clients scheduled' : 'clients to contact'}
                                </p>
                            </div>
                            <div className="relative md:ml-auto w-full md:w-auto">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                </div>
                                <select 
                                    value={filterServiceId} 
                                    onChange={(e) => setFilterServiceId(e.target.value)}
                                    className="pl-9 pr-8 py-2 w-full md:w-auto min-w-[300px] text-sm border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 border bg-white"
                                >
                                    <option value="">All Services (Show All)</option>
                                    {OFFERS.map(o => (
                                        <option key={o.id} value={o.id}>
                                            {o.emoji} {o.buyItem} ({getServiceActiveCount(o.id)} {activeTab === 'incomplete' ? 'abandoned' : appointmentView === 'incoming' ? 'pending' : 'completed'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {sortedAppointments.length > 0 && (
                         <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-2">
                             <div className="flex items-center border-r pr-3 mr-1">
                                    <button 
                                    onClick={() => toggleSelectAll(sortedAppointments)}
                                    className={`flex items-center text-sm font-medium hover:text-opacity-80 ${activeTab === 'incomplete' ? 'text-red-600' : appointmentView === 'incoming' ? 'text-pink-600' : 'text-purple-600'}`}
                                    >
                                    {selectedLeadIds.size === sortedAppointments.length && sortedAppointments.length > 0 ? (
                                        <CheckSquare className="w-5 h-5 mr-1 fill-current" />
                                    ) : (
                                        <Square className="w-5 h-5 mr-1" />
                                    )}
                                    Select All
                                    </button>
                            </div>

                            {selectedLeadIds.size > 0 ? (
                                <>
                                    <button 
                                        onClick={() => handleBulkCopy(sortedAppointments)}
                                        className="px-3 py-1 bg-white border rounded text-gray-700 hover:bg-gray-100 flex items-center text-sm"
                                        title="Copy Numbers"
                                    >
                                        <Copy className="w-4 h-4 mr-1.5" />
                                        Copy
                                    </button>
                                    <button 
                                        onClick={() => handleBulkDownload(sortedAppointments)}
                                        className="px-3 py-1 bg-white border rounded text-gray-700 hover:bg-gray-100 flex items-center text-sm"
                                        title="Download Selected CSV"
                                    >
                                        <Download className="w-4 h-4 mr-1.5" />
                                        CSV ({selectedLeadIds.size})
                                    </button>
                                </>
                            ) : (
                                 <button 
                                    onClick={() => handleBulkDownload(sortedAppointments)}
                                    className="px-3 py-1 bg-white border rounded text-gray-500 hover:bg-gray-100 flex items-center text-sm"
                                    title="Download All Visible CSV"
                                >
                                    <Download className="w-4 h-4 mr-1.5" />
                                    Download List ({sortedAppointments.length})
                                </button>
                            )}
                         </div>
                    )}

                    <ul className="divide-y divide-gray-200">
                        {sortedAppointments.length === 0 ? (
                            <li className="px-6 py-12 text-center text-gray-500 flex flex-col items-center">
                                <Calendar className="w-10 h-10 text-gray-300 mb-2" />
                                <p>No {activeTab === 'incomplete' ? 'incomplete entries' : appointmentView === 'incoming' ? 'appointments' : 'follow-ups'} found for this date{filterServiceId ? ' with selected service' : ''}.</p>
                            </li>
                        ) : (
                            sortedAppointments.map(lead => {
                                const offer = OFFERS.find(o => o.id === Number(lead.offerId));
                                const isSelected = selectedLeadIds.has(lead.id);
                                return (
                                    <li key={lead.id} className={`p-6 hover:bg-gray-50 transition-colors ${isSelected ? (activeTab === 'incomplete' ? 'bg-red-50/50' : appointmentView === 'incoming' ? 'bg-pink-50/50' : 'bg-purple-50/50') : ''}`}>
                                        <div className="flex flex-col md:flex-row gap-4 items-start">
                                            <div className="pt-2">
                                                <button onClick={() => toggleSelectOne(lead.id)}>
                                                    {isSelected ? (
                                                        <CheckSquare className={`w-5 h-5 ${activeTab === 'incomplete' ? 'text-red-600' : appointmentView === 'incoming' ? 'text-pink-600' : 'text-purple-600'}`} />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex-shrink-0 w-32 md:border-r border-gray-100 pr-4">
                                                {activeTab === 'incomplete' ? (
                                                    <>
                                                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                            Abandoned
                                                        </span>
                                                        <p className="text-xs text-gray-400 mt-1">Left at:<br/>{lead.submittedAt ? new Date(lead.submittedAt).toLocaleTimeString() : 'Unknown'}</p>
                                                    </>
                                                ) : appointmentView === 'incoming' ? (
                                                    <>
                                                        <p className="text-2xl font-bold text-gray-800">{lead.appointmentTime}</p>
                                                        <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">{lead.branchName}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                                                            lead.followUpStatus === 'Converted' ? 'bg-green-100 text-green-800' : 
                                                            lead.followUpStatus === 'Missed' ? 'bg-red-100 text-red-800' : 
                                                            lead.followUpStatus === 'Called' ? 'bg-blue-100 text-blue-800' : 
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {lead.followUpStatus || 'Pending'}
                                                        </span>
                                                        <p className="text-xs text-gray-400 mt-1">Visit was on:<br/>{lead.appointmentDate}</p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-lg font-bold text-gray-900">{lead.name || 'Unknown User'}</h4>
                                                    {appointmentView === 'incoming' && activeTab !== 'incomplete' && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${lead.status === 'Contacted' ? 'bg-blue-100 text-blue-800' : lead.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {lead.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 font-mono">{lead.phone}</p>
                                                <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-700 border border-gray-100 flex items-center">
                                                    <span className="font-semibold text-gray-500 mr-2">Service:</span>
                                                    <span>{offer?.emoji} {offer?.buyItem}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-[250px] w-full border-l border-gray-100 pl-4 md:pl-6">
                                                {activeTab === 'incomplete' ? (
                                                    <div className="space-y-3">
                                                         <button 
                                                            onClick={() => window.open(`tel:${lead.phone}`)}
                                                            className="w-full flex items-center justify-center px-3 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-900"
                                                        >
                                                            <PhoneOutgoing className="w-4 h-4 mr-1" />
                                                            Call to Recover
                                                        </button>
                                                        <button
                                                            onClick={() => handleSendReminder(lead)}
                                                            className="w-full flex items-center justify-center px-3 py-1.5 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Bell className="w-3 h-3 mr-2" />
                                                            Send WhatsApp
                                                        </button>
                                                    </div>
                                                ) : appointmentView === 'incoming' ? (
                                                    <div className="space-y-3">
                                                        {editingFollowUpId === lead.id ? (
                                                            <div className="bg-purple-50 p-2 rounded border border-purple-200 animate-fade-in">
                                                                <p className="text-xs font-bold text-purple-700 mb-1">Set Return Date:</p>
                                                                <input 
                                                                    type="date" 
                                                                    className="w-full text-sm p-1 border rounded mb-2"
                                                                    value={tempFollowUpDate}
                                                                    onChange={(e) => setTempFollowUpDate(e.target.value)}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => handleSetFollowUp(lead)}
                                                                        className="flex-1 bg-purple-600 text-white text-xs py-1 rounded hover:bg-purple-700"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setEditingFollowUpId(null)}
                                                                        className="flex-1 bg-gray-200 text-gray-700 text-xs py-1 rounded hover:bg-gray-300"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSendReminder(lead)}
                                                                    className="w-full flex items-center justify-center px-3 py-1.5 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <Bell className="w-3 h-3 mr-2" />
                                                                    Confirm via WhatsApp
                                                                </button>
                                                                {lead.status !== 'Completed' && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            await updateLead({...lead, status: 'Completed'});
                                                                            refreshData();
                                                                        }}
                                                                        className="w-full flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                                    >
                                                                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                                                                        Mark Completed
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingFollowUpId(lead.id);
                                                                        const d = new Date();
                                                                        d.setDate(d.getDate() + 30);
                                                                        setTempFollowUpDate(d.toISOString().split('T')[0]);
                                                                    }}
                                                                    className="w-full flex items-center justify-center px-3 py-1.5 border border-purple-200 rounded text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100"
                                                                >
                                                                    <Repeat className="w-3 h-3 mr-2" />
                                                                    Add to Retention Calendar
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => window.open(`tel:${lead.phone}`)}
                                                                className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                                            >
                                                                <PhoneOutgoing className="w-4 h-4 mr-1" />
                                                                Call Now
                                                            </button>
                                                        </div>
                                                        <p className="text-xs font-semibold text-gray-500 text-center">Set Outcome:</p>
                                                        <div className="grid grid-cols-3 gap-1">
                                                            <button 
                                                                onClick={() => handleRetentionCallAction(lead, 'Called')}
                                                                className={`text-xs py-1 rounded border ${lead.followUpStatus === 'Called' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                                            >
                                                                Called
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRetentionCallAction(lead, 'Converted')}
                                                                className={`text-xs py-1 rounded border ${lead.followUpStatus === 'Converted' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                                            >
                                                                Booked
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRetentionCallAction(lead, 'Missed')}
                                                                className={`text-xs py-1 rounded border ${lead.followUpStatus === 'Missed' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                                            >
                                                                Missed
                                                            </button>
                                                        </div>
                                                        <textarea 
                                                            className="w-full text-xs border rounded p-1 h-12"
                                                            placeholder="Outcome notes..."
                                                            value={notesInput[lead.id] || ''}
                                                            onChange={(e) => setNotesInput({...notesInput, [lead.id]: e.target.value})}
                                                            onBlur={() => handleNoteSave(lead)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        )}
                    </ul>
                 </div>
             </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;