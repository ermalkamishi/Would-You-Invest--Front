import { useEffect, useState } from 'react';
import { Shield, TrendingUp, Users, Target, CheckCircle, Ban, RefreshCw, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

import { API_BASE } from '../config';

export default function AdminPanelDashboard() {
  const [pitches, setPitches] = useState([]);
  const [metrics, setMetrics] = useState({ activeUsers: 0, totalUsers: 0, circulatingCapital: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived metrics
  const totalDeployed = pitches.reduce((sum, p) => sum + (Number(p.totalRaised) || 0), 0);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [pitchesRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE}/startups?allStatuses=true`),
        fetch(`${API_BASE}/auth/metrics`)
      ]);

      if (!pitchesRes.ok || !metricsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [pitchesData, metricsData] = await Promise.all([
        pitchesRes.json(),
        metricsRes.json()
      ]);

      setPitches(pitchesData);
      setMetrics(metricsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/startups/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      
      // Update local state to reflect change instantly
      setPitches((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#00FF66]" />
          Platform Control Center
        </h1>
        <p className="text-white/50 mt-1">Global platform metrics and content moderation queue.</p>
      </div>

      {/* Module 1: Macro Metric Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {/* Metric 1 */}
        <div className="bg-[hsl(240,10%,6%)] border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <TrendingUp className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-white/50 mb-1">Total Circulating Capital</p>
          <p className="text-3xl font-mono font-bold text-[#00FF66]">{formatCurrency(metrics.circulatingCapital)}</p>
          <p className="text-xs text-white/30 mt-2">Sum of all user wallets</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[hsl(240,10%,6%)] border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Target className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-white/50 mb-1">Total Deployed Capital</p>
          <p className="text-3xl font-mono font-bold text-white">{formatCurrency(totalDeployed)}</p>
          <p className="text-xs text-white/30 mt-2">Capital locked in active startup pitches</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[hsl(240,10%,6%)] border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Users className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-white/50 mb-1">Platform Activity</p>
          <div className="flex items-baseline gap-4 mt-1">
            <div>
              <p className="text-3xl font-mono font-bold text-white">{metrics.activeUsers}</p>
              <p className="text-[10px] text-[#00FF66] uppercase tracking-wider mt-1">Active Users</p>
            </div>
            <div className="text-white/20 text-2xl font-light">/</div>
            <div>
              <p className="text-3xl font-mono font-bold text-white">{pitches.length}</p>
              <p className="text-[10px] text-[#00FF66] uppercase tracking-wider mt-1">Total Pitches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module 2: Moderation Queue */}
      <div className="bg-[hsl(240,10%,6%)] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Moderation Queue</h2>
          <button 
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-white/60 ${isLoading ? 'animate-spin text-[#00FF66]' : ''}`} />
          </button>
        </div>
        
        {error ? (
          <div className="p-8 text-center text-[#FF3366]">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Startup</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Raised</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pitches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/40 text-sm">
                      No pitches found in database.
                    </td>
                  </tr>
                ) : (
                  pitches.map((pitch) => {
                    const isTakedown = pitch.status === 'takedown';
                    const isVerified = pitch.status === 'verified';
                    return (
                      <tr key={pitch.id} className={`hover:bg-white/[0.02] transition-colors ${isTakedown ? 'opacity-50' : ''}`}>
                        <td className="p-4">
                          <p className="font-bold text-sm text-white line-clamp-1">{pitch.problem}</p>
                          <p className="text-xs text-white/40 mt-1 line-clamp-1">{pitch.solution}</p>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] bg-white/10 text-white/70">
                            {pitch.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-sm">
                          {formatCurrency(pitch.totalRaised)}
                        </td>
                        <td className="p-4">
                          {isTakedown ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#FF3366] bg-[#FF3366]/10 px-2 py-1 rounded">
                              <Ban className="w-3 h-3" /> Taken Down
                            </span>
                          ) : isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-1 rounded">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex text-[10px] uppercase font-bold text-white/40 bg-white/5 px-2 py-1 rounded">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Verify Button */}
                            {!isVerified && (
                              <button
                                onClick={() => handleUpdateStatus(pitch.id, 'verified')}
                                className="px-3 py-1.5 rounded-md bg-[#00FF66]/10 hover:bg-[#00FF66]/20 text-[#00FF66] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#00FF66]/20"
                                title="Mark as Verified Builder"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Verify
                              </button>
                            )}
                            
                            {/* Take Down / Restore Button */}
                            {isTakedown ? (
                              <button
                                onClick={() => handleUpdateStatus(pitch.id, 'pending')}
                                className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(pitch.id, 'takedown')}
                                className="px-3 py-1.5 rounded-md bg-[#FF3366]/10 hover:bg-[#FF3366]/20 text-[#FF3366] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#FF3366]/20"
                                title="Hide from global feed"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Take Down
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
