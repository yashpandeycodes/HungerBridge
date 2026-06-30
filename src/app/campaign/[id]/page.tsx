import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import CampaignModel from '@/model/Campaign';
import UserModel from '@/model/User';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, HeartHandshake, Share2, MapPin } from 'lucide-react';

export default async function CampaignPage({ params }: { params: { id: string } }) {
  await dbConnect();
  
  let campaign;
  let ngo;

  try {
    campaign = await CampaignModel.findById(params.id);
    if (campaign) {
      ngo = await UserModel.findById(campaign.ngoId);
    }
  } catch (error) {
    return notFound();
  }

  if (!campaign) {
    return notFound();
  }

  const progress = Math.min((campaign.mealsCollected / campaign.targetMeals) * 100, 100);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="w-full border-0 shadow-2xl rounded-3xl overflow-hidden bg-[hsl(var(--card))]">
          <div className="h-48 brand-gradient relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <Megaphone className="w-20 h-20 text-white/80 drop-shadow-lg relative z-10" />
          </div>
          
          <CardContent className="p-8 md:p-12 relative -mt-10 bg-[hsl(var(--card))] rounded-t-[3rem]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full mb-4">
                  {campaign.status === 'ACTIVE' ? 'Active Campaign' : 'Closed Campaign'}
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {campaign.title}
                </h1>
                {ngo && (
                  <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 font-medium">
                    <HeartHandshake className="w-4 h-4 text-indigo-500" /> Organized by <span className="font-bold text-slate-700 dark:text-slate-300">{ngo.name}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full px-6 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Progress</p>
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{campaign.mealsCollected} <span className="text-lg text-slate-400 dark:text-slate-500 font-medium">/ {campaign.targetMeals} meals</span></p>
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-300">{progress.toFixed(0)}%</p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="brand-gradient h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">About this Campaign</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </div>

              {ngo?.location && (
                <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl flex gap-3 border border-amber-100 dark:border-amber-900/30">
                  <MapPin className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-500 text-sm">Location</h4>
                    <p className="text-amber-700/80 dark:text-amber-400/80 text-sm mt-1">{ngo.location}</p>
                  </div>
                </div>
              )}
            </div>

            {campaign.status === 'ACTIVE' && (
              <div className="mt-10 flex justify-center">
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-10 rounded-full brand-gradient text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all brand-shadow-lg border-0">
                    <HeartHandshake className="mr-2 w-5 h-5" /> Donate Food Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
