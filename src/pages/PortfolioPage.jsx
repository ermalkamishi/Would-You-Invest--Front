import CryptoInvestmentDashboard from '../features/portfolio/components/CryptoInvestmentDashboard';

export default function PortfolioPage() {
  return (
    <div className="w-full min-h-[calc(100dvh-112px)] md:min-h-[calc(100dvh-56px)] bg-[hsl(240,15%,4%)]">
      <CryptoInvestmentDashboard />
    </div>
  );
}
