"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchSuspicious = async () => {
    try {
      const res = await fetch('/api/admin/moderate');
      const json = await res.json();
      if (json.success) setDonations(json.data);
    } catch (e) {
      toast.error("Failed to load suspicious donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspicious();
  }, []);

  const handleAction = async (id: string, action: 'APPROVE' | 'DELETE') => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: id, action })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Donation ${action === 'APPROVE' ? 'approved' : 'deleted'}`);
        setDonations(prev => prev.filter(d => d._id !== id));
      } else {
        toast.error(json.message);
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Moderation</h1>
            <p className="text-slate-500 dark:text-slate-400">Review flagged and suspicious donations</p>
          </div>
        </div>

        {donations.length === 0 ? (
          <Card className="border-0 shadow-lg bg-[hsl(var(--card))]">
            <CardContent className="p-16 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">All clear!</h3>
              <p className="text-slate-500">There are no suspicious donations to review.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {donations.map(donation => (
              <Card key={donation._id} className="border border-red-200 dark:border-red-900/30 bg-[hsl(var(--card))] shadow-sm overflow-hidden">
                <div className="bg-red-50 dark:bg-red-900/10 p-4 border-b border-red-100 dark:border-red-900/20 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm uppercase tracking-widest">
                    <ShieldAlert className="w-4 h-4" /> Flagged for Review
                  </div>
                  <div className="text-sm font-bold text-slate-500">
                    Trust Score: <span className="text-red-600">{donation.trustScore}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Donor Info</h4>
                        <p className="font-medium text-slate-900 dark:text-white">{donation.donorId?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-600">{donation.donorId?.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Donation Details</h4>
                        <p className="font-medium text-slate-900 dark:text-white">{donation.foodCategory} from {donation.foodSource}</p>
                        <p className="text-sm text-slate-600">Quantity: {donation.quantity}</p>
                        <p className="text-sm text-slate-600">Location: {donation.pickupLocation}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center gap-4">
                      <Button 
                        onClick={() => handleAction(donation._id, 'APPROVE')}
                        disabled={processingId === donation._id}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" /> Mark as Safe (Approve)
                      </Button>
                      <Button 
                        onClick={() => handleAction(donation._id, 'DELETE')}
                        disabled={processingId === donation._id}
                        variant="destructive"
                        className="w-full h-12 font-bold"
                      >
                        <Trash2 className="w-5 h-5 mr-2" /> Remove Fraudulent Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
