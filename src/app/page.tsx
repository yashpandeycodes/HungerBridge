import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeartHandshake, Megaphone, Truck, CheckCircle, Users, Zap } from "lucide-react";

async function getImpactStats() {
  try {
    const res = await fetch(
     `/api/impact`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return json.success
      ? json.data
      : { totalDonations: 0, completedDeliveries: 0, activeCampaigns: 0, totalMealsServed: 0, totalFoodRescuedKg: 0, volunteerHours: 0 };
  } catch {
    return { totalDonations: 0, completedDeliveries: 0, activeCampaigns: 0, totalMealsServed: 0, totalFoodRescuedKg: 0, volunteerHours: 0 };
  }
}

export default async function Home() {
  const stats = await getImpactStats();

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] transition-colors duration-500 text-[hsl(var(--foreground))]">
      <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-14 h-16 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95">
        <Link className="flex items-center gap-2.5 shrink-0" href="/">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center brand-shadow shrink-0">
            <HeartHandshake className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl text-[hsl(var(--foreground))] tracking-tight">
            HungerBridge
          </span>
        </Link>
        <nav className="flex gap-2 sm:gap-6 items-center shrink-0">
          <Link href="#how-it-works" className="hidden lg:block text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            How It Works
          </Link>
          <Link href="#impact" className="hidden lg:block text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            Impact
          </Link>
          <Link href="#roles" className="hidden lg:block text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            Who We Serve
          </Link>
          <ThemeToggle />
          <Link href="/sign-in">
            <Button variant="ghost" className="font-semibold rounded-lg text-sm sm:text-base px-2 sm:px-4">
              Log In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="brand-gradient hover:brightness-110 text-white border-0 brand-shadow rounded-lg px-3 sm:px-4 text-sm sm:text-base transition-all">
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">Join the Cause</span>
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center text-center px-4 md:px-6 py-20 md:py-28 relative overflow-hidden grain-bg">
        {/* Single radial glow — the ONLY decorative glow on this entire page */}
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.16),_transparent_70%)] pointer-events-none" />

        <div className="space-y-8 max-w-4xl relative z-10">
          <h1 className="text-5xl font-extrabold tracking-[-0.04em] leading-[0.95] sm:text-6xl md:text-7xl text-[hsl(var(--foreground))]">
            Rescue Food. <br className="hidden sm:block" />
            <span className="brand-gradient-text">Fight Hunger.</span>
          </h1>

          <p className="mx-auto max-w-[700px] text-[hsl(var(--muted-foreground))] md:text-xl leading-8 font-medium">
            A community-driven platform connecting food donors, NGOs, and volunteers. Don&apos;t let surplus food go to waste when it can feed a community.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="w-full sm:w-auto brand-gradient hover:brightness-110 text-white text-lg px-10 py-6 rounded-xl brand-shadow-lg border-0 transition-all"
              >
                Donate Food Now
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-10 py-6 rounded-xl border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-all"
              >
                Register as NGO / Volunteer
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full max-w-5xl mt-28 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Real-time Metrics
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))]">Live Impact Dashboard</h2>
          </div>

          <div className="glass-panel brand-shadow-lg rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[hsl(var(--border))]">
              <div className="px-2 first:pl-0">
                <div className="text-4xl font-black text-[hsl(var(--foreground))] tabular-nums">
                  {stats.totalMealsServed.toLocaleString()}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 font-semibold uppercase tracking-wide">Meals Served</p>
              </div>
              <div className="px-4">
                <div className="text-4xl font-black text-[hsl(var(--foreground))] tabular-nums">
                  {stats.totalFoodRescuedKg.toLocaleString()}
                  <span className="text-lg font-bold text-sky-500 ml-1">kg</span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 font-semibold uppercase tracking-wide">Food Rescued</p>
              </div>
              <div className="px-4">
                <div className="text-4xl font-black text-[hsl(var(--foreground))] tabular-nums">
                  {stats.activeCampaigns}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 font-semibold uppercase tracking-wide">Active Campaigns</p>
              </div>
              <div className="px-4">
                <div className="text-4xl font-black text-[hsl(var(--foreground))] tabular-nums">
                  {stats.volunteerHours}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 font-semibold uppercase tracking-wide">Volunteer Hours</p>
              </div>
            </div>
          </div>
        </div>

        <section id="how-it-works" className="w-full py-24 px-4 md:px-6 bg-[hsl(var(--muted))] mt-28">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center md:text-left">
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">The Process</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                From surplus to served, in four steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
              {[
                {
                  step: "01",
                  title: "Donor Lists Food",
                  description: "Upload a photo — our AI identifies food type, estimates quantity, and fills the form automatically.",
                  icon: <HeartHandshake className="w-5 h-5" />,
                },
                {
                  step: "02",
                  title: "NGO Claims Donation",
                  description: "Verified NGOs and food banks browse live listings and claim donations that match their campaign needs.",
                  icon: <Megaphone className="w-5 h-5" />,
                },
                {
                  step: "03",
                  title: "Volunteer Picks Up",
                  description: "A matched volunteer accepts the mission, picks up from the donor, and updates delivery status in real time.",
                  icon: <Truck className="w-5 h-5" />,
                },
                {
                  step: "04",
                  title: "NGO Confirms Delivery",
                  description: "The NGO marks delivery received. The volunteer earns karma points. The donor gets an impact certificate.",
                  icon: <CheckCircle className="w-5 h-5" />,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative pl-8 pr-6 py-8 border-l border-[hsl(var(--border))] first:border-l-0 md:first:border-l"
                >
                  <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-[hsl(var(--foreground))] text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="impact" className="w-full py-24 px-4 md:px-6 bg-[hsl(222,47%,5%)] dark:bg-[hsl(222,47%,4%)] text-center">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3">Our Impact</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-16 tracking-tight">
              Every number is a meal. Every meal is a life.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { value: stats.totalMealsServed.toLocaleString(), label: "Meals Served", suffix: "" },
                { value: stats.totalFoodRescuedKg.toLocaleString(), label: "Kilograms Rescued", suffix: "kg" },
                { value: stats.activeCampaigns.toString(), label: "Active Campaigns", suffix: "" },
                { value: stats.volunteerHours.toString(), label: "Volunteer Hours", suffix: "" },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-5xl md:text-6xl font-black text-white tabular-nums">
                    {stat.value}
                    {stat.suffix && <span className="text-2xl font-bold text-sky-400 ml-1">{stat.suffix}</span>}
                  </div>
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="w-full py-24 px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center md:text-left">
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">Who We Serve</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                Three roles, one mission
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  role: "Donor",
                  icon: <HeartHandshake className="w-6 h-6" />,
                  tagline: "Turn surplus into sustenance",
                  features: ["AI-powered food photo analysis", "Automatic urgency detection", "Donation lifecycle tracking", "Downloadable impact certificate", "Support specific NGO campaigns"],
                  cta: "Start Donating",
                  colorClass: "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
                },
                {
                  role: "NGO / Food Bank",
                  icon: <Megaphone className="w-6 h-6" />,
                  tagline: "Coordinate relief at scale",
                  features: ["Browse and claim live donations", "AI-generated campaign descriptions", "Volunteer assignment dashboard", "Real-time delivery tracking", "Beneficiary impact reporting"],
                  cta: "Register Your NGO",
                  colorClass: "bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400",
                  featured: true,
                },
                {
                  role: "Volunteer",
                  icon: <Users className="w-6 h-6" />,
                  tagline: "Be a hero in your city",
                  features: ["Browse available pickup missions", "Accept missions with one tap", "Earn karma and impact badges", "Leaderboard recognition", "Personal delivery history"],
                  cta: "Volunteer Now",
                  colorClass: "bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl border p-8 flex flex-col gap-6 ${
                    card.featured
                      ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/20"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                  }`}
                >
                  {card.featured && (
                    <div className="absolute -top-3 left-8">
                      <span className="brand-gradient text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Most Active
                      </span>
                    </div>
                  )}
                  <div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${card.colorClass}`}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">{card.role}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 font-medium">{card.tagline}</p>
                  </div>

                  <ul className="space-y-3 flex-1">
                    {card.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-3 text-sm text-[hsl(var(--foreground))]">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/sign-up">
                    <Button
                      className={`w-full font-bold rounded-lg h-10 text-sm border-0 transition-all ${
                        card.featured
                          ? "brand-gradient hover:brightness-110 text-white brand-shadow"
                          : "bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--foreground))]"
                      }`}
                    >
                      {card.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-20 px-4 md:px-6 bg-[hsl(var(--muted))]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center md:text-left">
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">AI-Powered</p>
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                Automation that saves time and food
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[hsl(var(--foreground))] text-lg mb-2">AI Food Vision Analysis</h3>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                    Donors upload a food photo and our Gemini Vision model automatically identifies the food type, estimates the quantity, and suggests the best category — turning a 3-minute form into a 10-second submission.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[hsl(var(--foreground))] text-lg mb-2">AI Campaign Assistant</h3>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                    NGOs can generate high-conversion social media appeals and donor outreach messages in seconds. Paste food details, click generate — get a ready-to-publish campaign description with hashtags and call to action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-28 px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 mx-auto">
              <HeartHandshake className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
              The food exists. The need exists.<br />
              <span className="brand-gradient-text">Be the bridge.</span>
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-lg font-medium max-w-xl mx-auto">
              Join thousands of donors, NGOs, and volunteers working together to eliminate food waste and feed communities — one delivery at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/sign-up">
                <Button className="brand-gradient hover:brightness-110 text-white font-bold px-8 h-12 rounded-xl brand-shadow-lg border-0 text-base transition-all">
                  Join HungerBridge Free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" className="font-semibold px-8 h-12 rounded-xl border-[hsl(var(--border))] text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 w-full shrink-0 px-6 md:px-14 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
        <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          © {new Date().getFullYear()} HungerBridge.
        </p>
        <div className="flex gap-6 justify-center">
          <span className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-indigo-500 cursor-pointer transition-colors">Terms of Service</span>
          <span className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-indigo-500 cursor-pointer transition-colors">Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}