import { Scale, ShieldCheck, AlertTriangle, FileText, Clock, Globe } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: `By accessing or using CapTab ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this Platform. These terms apply to all visitors, users, founders, and investors who access the Platform.`,
  },
  {
    icon: AlertTriangle,
    title: '2. Nature of the Platform — Not Financial Advice',
    content: `CapTab is an entertainment and simulation platform. All capital shown, invested, or earned on this Platform is virtual and has no real-world monetary value. Nothing on CapTab constitutes financial advice, investment advice, legal advice, or any other professional advice. All "investments" are simulated using fictional currency for the purpose of market signal research and entertainment. CapTab is not a registered broker-dealer, investment adviser, or financial institution. We strongly encourage users to consult a licensed financial professional before making real-world investment decisions.`,
  },
  {
    icon: ShieldCheck,
    title: '3. User Eligibility',
    content: `You must be at least 18 years of age to use CapTab. By creating an account, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms. Users under 18 are strictly prohibited from creating accounts or using any features of the Platform.`,
  },
  {
    icon: Globe,
    title: '4. User Accounts & Responsibilities',
    content: `When you create an account on CapTab, you are responsible for maintaining the confidentiality of your credentials and all activities that occur under your account. You agree to: (a) provide accurate and current information during registration; (b) promptly update your information if it changes; (c) notify us immediately of any unauthorized access to your account; (d) not transfer or sell your account to any third party. CapTab reserves the right to terminate accounts that violate these Terms or engage in fraudulent, abusive, or harmful behavior.`,
  },
  {
    icon: FileText,
    title: '5. Founder Submissions',
    content: `Founders who submit pitch content to the Platform grant CapTab a non-exclusive, royalty-free, worldwide license to display, distribute, and promote that content within the Platform. Founders represent that their submissions: (a) do not infringe on any third-party intellectual property rights; (b) are not false, misleading, or defamatory; (c) do not contain unlawful content; (d) comply with all applicable laws and regulations. CapTab reserves the right to remove any pitch content at its sole discretion without notice.`,
  },
  {
    icon: Scale,
    title: '6. Virtual Currency & Simulated Investments',
    content: `CapTab issues virtual currency ("CapCoins") to users upon account creation. This virtual currency: (a) has no real monetary value; (b) cannot be exchanged for real money or assets; (c) cannot be transferred to other users outside of the simulation; (d) may be reset, adjusted, or removed at any time at CapTab's discretion. Any virtual gains or losses are entirely simulated and do not reflect actual market outcomes or guarantee future returns.`,
  },
  {
    icon: AlertTriangle,
    title: '7. Prohibited Conduct',
    content: `Users are strictly prohibited from: (a) attempting to manipulate pitch rankings or virtual market data; (b) using automated tools, bots, or scripts to interact with the Platform; (c) impersonating any person or entity; (d) uploading or sharing illegal, harmful, or offensive content; (e) attempting to reverse-engineer, scrape, or extract data from the Platform without authorization; (f) using the Platform for any commercial purposes not explicitly authorized by CapTab. Violations may result in immediate account suspension or permanent ban.`,
  },
  {
    icon: ShieldCheck,
    title: '8. Intellectual Property',
    content: `All content, features, and functionality on CapTab — including but not limited to text, graphics, logos, icons, software, and design — are owned by CapTab or its licensors and are protected by applicable intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from any portion of the Platform without prior written consent from CapTab.`,
  },
  {
    icon: Clock,
    title: '9. Modifications to the Service',
    content: `CapTab reserves the right to modify, suspend, or discontinue any aspect of the Platform at any time without prior notice. We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms. We recommend reviewing these Terms periodically.`,
  },
  {
    icon: Scale,
    title: '10. Limitation of Liability',
    content: `To the maximum extent permitted by law, CapTab and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform, even if CapTab has been advised of the possibility of such damages. The Platform is provided "as is" without warranty of any kind, express or implied.`,
  },
  {
    icon: Globe,
    title: '11. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction in which CapTab operates, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration, except where prohibited by law.`,
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12 pb-24">
      {/* Hero */}
      <div className="relative mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/20 mb-6">
          <Scale className="w-8 h-8 text-[#00FF66]" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Please read these terms carefully before using CapTab. By accessing our platform, you agree to be bound by these conditions.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/30">
          <Clock className="w-3 h-3" />
          Last updated: July 2026
        </div>
      </div>

      {/* Disclaimer banner */}


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
