import { ShieldCheck, Eye, Database, Lock, UserCheck, RefreshCw, Clock, Globe } from 'lucide-react';

const sections = [
  {
    icon: Eye,
    title: '1. Information We Collect',
    content: `When you use CapTab, we collect information to provide and improve our services. This includes: (a) Account Information — your username, chosen role (Founder or Investor), and password hash when you register; (b) Usage Data — how you interact with pitches, which simulated investments you make, how long you engage with content, and navigation patterns within the Platform; (c) Device & Technical Data — your IP address, browser type, operating system, and device identifiers, collected automatically when you access the Platform; (d) Content You Submit — pitch descriptions, investment decisions, and any other content you voluntarily upload or share on the Platform.`,
  },
  {
    icon: Database,
    title: '2. How We Use Your Information',
    content: `We use the information we collect to: (a) operate and maintain the CapTab Platform; (b) personalize your experience, including the pitch feed and leaderboard rankings; (c) analyze usage trends and improve Platform features; (d) detect, prevent, and respond to fraudulent activity, abuse, or security incidents; (e) communicate important updates, such as changes to these policies or new Platform features; (f) conduct internal research and data analysis to understand what makes a startup pitch resonate with virtual investors. We do not sell your personal data to third parties.`,
  },
  {
    icon: Lock,
    title: '3. Data Security',
    content: `CapTab takes reasonable technical and organizational measures to protect your data from unauthorized access, loss, alteration, or disclosure. These measures include encrypted data transmission (HTTPS), hashed password storage, access controls limiting who within our team can access user data, and regular security reviews. However, no method of transmission over the internet or method of electronic storage is 100% secure. We cannot guarantee absolute security and encourage users to use strong, unique passwords.`,
  },
  {
    icon: UserCheck,
    title: '4. Your Rights & Choices',
    content: `Depending on your location, you may have certain rights regarding your personal data, including: (a) Access — the right to request a copy of the data we hold about you; (b) Correction — the right to request that inaccurate data be corrected; (c) Deletion — the right to request that your account and associated data be deleted; (d) Objection — the right to object to certain processing of your data; (e) Portability — the right to request your data in a structured, machine-readable format. To exercise any of these rights, please submit a written request through your account settings. We will respond within the timeframe required by applicable law.`,
  },
  {
    icon: Globe,
    title: '5. Cookies & Tracking Technologies',
    content: `CapTab uses cookies and similar tracking technologies to enhance your experience and analyze usage patterns. These include: (a) Essential Cookies — required for the Platform to function, such as session authentication tokens; (b) Analytics Cookies — used to understand how users navigate the Platform so we can improve it; (c) Preference Cookies — used to remember your settings and preferences across sessions. You can control cookie behavior through your browser settings. Disabling essential cookies may impair Platform functionality.`,
  },
  {
    icon: ShieldCheck,
    title: '6. Third-Party Services',
    content: `CapTab may integrate with third-party services for analytics, hosting, or authentication. These third parties have their own privacy policies and we encourage you to review them. We do not control the data practices of third-party services. We only share data with third parties where necessary to provide the Platform's services, and we require any such parties to respect the security of your data and treat it in accordance with applicable law.`,
  },
  {
    icon: RefreshCw,
    title: '7. Data Retention',
    content: `We retain your personal data for as long as your account remains active or as necessary to provide you with the Platform's services. If you request deletion of your account, we will delete or anonymize your personal data within a reasonable timeframe, except where we are required to retain it for legitimate legal, regulatory, or security purposes. Virtual portfolio data, anonymized pitch interaction data, and aggregated analytics may be retained indefinitely in de-identified form.`,
  },
  {
    icon: Eye,
    title: "8. Children's Privacy",
    content: `CapTab is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected personal data from a user under 18 without appropriate consent, we will take steps to delete that information as promptly as possible. If you are a parent or guardian and believe your child has provided personal information to CapTab without your consent, please contact us through the Platform's support channels.`,
  },
  {
    icon: Globe,
    title: '9. International Data Transfers',
    content: `CapTab operates globally and your data may be transferred to and processed in countries other than your own. These countries may have data protection laws that differ from those in your jurisdiction. Where required by applicable law, we apply appropriate safeguards, such as standard contractual clauses, to protect your data during international transfers. By using CapTab, you consent to such transfers subject to these safeguards.`,
  },
  {
    icon: Clock,
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. When we make material changes, we will notify you by posting a notice on the Platform or by other appropriate means. Your continued use of CapTab after we post changes constitutes your acceptance of the updated policy. We recommend reviewing this policy periodically.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12 pb-24">
      {/* Hero */}
      <div className="relative mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/20 mb-6">
          <ShieldCheck className="w-8 h-8 text-[#00FF66]" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Your privacy matters to us. This policy explains exactly what data we collect, why we collect it, and how we protect it.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/30">
          <Clock className="w-3 h-3" />
          Last updated: July 2026
        </div>
      </div>

      {/* Commitment banner */}
      <div className="mb-10 p-4 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#00FF66] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#00FF66] mb-1">Our Privacy Commitment</p>
          <p className="text-xs text-white/50">We never sell your personal data. We collect only what is necessary to run the Platform, and we protect it with industry-standard security practices.</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-6 hover:border-white/15 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#00FF66]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#00FF66]" />
                </div>
                <h2 className="text-base font-semibold text-white">{section.title}</h2>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">{section.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
