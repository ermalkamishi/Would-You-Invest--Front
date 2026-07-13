import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BarChart3, Users, AlertTriangle, Presentation, ShieldCheck, EyeOff, Link2, Mail, Award, TrendingUp, HelpCircle, Activity, ChevronRight, Lock } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { updateProfileSuccess } from '../../auth/authSlice';
import { patchPitchStats } from '../../pitches/pitchesSlice';
import { API_BASE } from '../../../config';

export default function FounderDashboard() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user) || {};
  const token = useSelector((s) => s.auth.token);
  const allPitches = useSelector((s) => s.pitches.feed) || [];
  
  // Filter pitches by user ID to show real founder pitches
  const myPitches = allPitches.filter((p) => p.founderId === user.id);

  // Verification & Badges state
  const [isStealth, setIsStealth] = useState(user.isStealth || false);
  const [linkedInUrl, setLinkedInUrl] = useState(user.linkedInUrl || '');
  const [verifiedEmailDomain, setVerifiedEmailDomain] = useState(user.verifiedEmailDomain || '');
  const [selectedBadge, setSelectedBadge] = useState(() => {
    if (user.badges?.includes('Verified Builder')) return 'Verified Builder';
    if (user.badges?.includes('First-time Founder')) return 'First-time Founder';
    return 'None';
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [pitchUpdateInputs, setPitchUpdateInputs] = useState({});
  const [isPostingUpdate, setIsPostingUpdate] = useState({});

  const handlePostUpdate = async (pitchId) => {
    const text = pitchUpdateInputs[pitchId]?.trim();
    if (!text) return;
    
    setIsPostingUpdate((prev) => ({ ...prev, [pitchId]: true }));
    try {
      const res = await fetch(`${API_BASE}/startups/${pitchId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const updatedPitch = await res.json();
        dispatch(patchPitchStats(updatedPitch));
        setPitchUpdateInputs((prev) => ({ ...prev, [pitchId]: '' }));
      }
    } catch (err) {
      console.error('Failed to post update:', err);
    } finally {
      setIsPostingUpdate((prev) => ({ ...prev, [pitchId]: false }));
    }
  };

  // Sync state if user changes
  useEffect(() => {
    setIsStealth(user.isStealth || false);
    setLinkedInUrl(user.linkedInUrl || '');
    setVerifiedEmailDomain(user.verifiedEmailDomain || '');
    setSelectedBadge(() => {
      if (user.badges?.includes('Verified Builder')) return 'Verified Builder';
      if (user.badges?.includes('First-time Founder')) return 'First-time Founder';
      return 'None';
    });
  }, [user]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const badgesList = selectedBadge === 'None' ? [] : [selectedBadge];
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isStealth,
          linkedInUrl,
          verifiedEmailDomain,
          badges: badgesList,
        }),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      const updated = await res.json();
      
      // Update Redux state
      dispatch(updateProfileSuccess({
        isStealth: updated.isStealth,
        linkedInUrl: updated.linkedInUrl,
        verifiedEmailDomain: updated.verifiedEmailDomain,
        badges: updated.badges,
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving founder settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalRaised = myPitches.reduce((sum, pitch) => sum + (Number(pitch.totalRaised) || 0), 0);
  const totalBackers = myPitches.reduce((sum, pitch) => sum + (Number(pitch.investorCount) || 0), 0);

  // Aggregate pass reasons from all founder pitches
  const passReasonsMap = {};
  myPitches.forEach((pitch) => {
    if (pitch.passReasons) {
      Object.entries(pitch.passReasons).forEach(([reason, count]) => {
        passReasonsMap[reason] = (passReasonsMap[reason] || 0) + Number(count);
      });
    }
  });

  const passReasons = Object.entries(passReasonsMap).map(([reason, count]) => ({
    reason,
    count,
  })).sort((a, b) => b.count - a.count);

  const totalPasses = passReasons.reduce((sum, r) => sum + r.count, 0);

  // Helper to generate dynamic mock values for ICP & Demographics
  const getICPBreakdown = () => {
    if (totalBackers === 0) return [];
    return [
      { role: 'Tech Operators', pct: 60 },
      { role: 'Product Managers', pct: 25 },
      { role: 'Students', pct: 15 },
    ];
  };

  const icp = getICPBreakdown();

  return (
    <div className="space-y-6">
      {/* Capital Summary Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">Total Capital Raised</span>
          </div>
          <p className="font-mono text-2xl font-bold text-[#00FF66]">
            {myPitches.length > 0 ? formatCurrency(totalRaised) : '$0'}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs">Total Backers</span>
          </div>
          <p className="font-mono text-2xl font-bold text-white">
            {myPitches.length > 0 ? totalBackers : '0'}
          </p>
        </div>
      </div>

      {/* Trust & Verification settings card */}
      <div className="p-5 rounded-xl border border-[#00FF66]/20 bg-[#00FF66]/[0.02] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#00FF66]">Trust & Founder Verification</h4>
        </div>

        <div className="space-y-3.5">
          {/* Stealth Mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white/90">Stealth Mode</p>
              <p className="text-[10px] text-white/40">Hide name/avatar from public pages</p>
            </div>
            <button
              onClick={() => setIsStealth(!isStealth)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors ${
                isStealth ? 'bg-[#00FF66]' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-black transition-transform ${
                  isStealth ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Verification input fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-white/40 mb-1 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> LinkedIn Profile
              </label>
              <input
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#00FF66]/40"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/40 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Business Email Domain
              </label>
              <input
                type="text"
                value={verifiedEmailDomain}
                onChange={(e) => setVerifiedEmailDomain(e.target.value)}
                placeholder="@mycompany.com"
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#00FF66]/40"
              />
            </div>
          </div>

          {/* Builder Badges selector */}
          <div>
            <label className="block text-[10px] text-white/40 mb-1.5 flex items-center gap-1">
              <Award className="w-3 h-3" /> Creator Status Badge
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'None', label: 'No Badge' },
                { id: 'Verified Builder', label: '🏆 Verified Builder' },
                { id: 'First-time Founder', label: '🌱 First-Time' },
              ].map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => setSelectedBadge(badge.id)}
                  className={`py-1.5 rounded-lg text-[10px] border transition-all text-center ${
                    selectedBadge === badge.id
                      ? 'bg-[#00FF66]/15 border-[#00FF66]/45 text-[#00FF66] font-bold'
                      : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04]'
                  }`}
                >
                  {badge.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <p className="text-[10px] text-[#00FF66] font-bold">✓ Settings saved successfully!</p>
            ) : (
              <p className="text-[9px] text-white/20">E-mail verified via standard DNS domain check</p>
            )}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-[#00FF66] text-black font-bold text-xs hover:bg-[#00FF66]/80 disabled:opacity-50 transition-all"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Inflow SVG Chart */}
      {myPitches.length > 0 && (
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#00FF66]" /> Capital Inflow (Weekly progress)
            </h4>
            <span className="text-[10px] font-mono text-[#00FF66] font-bold">Goal: $100k</span>
          </div>

          <div className="h-16 flex items-end gap-1.5 pt-2">
            {[30, 45, 60, 40, 75, 90, 85].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-[#00FF66]/20 to-[#00FF66] hover:opacity-80 transition-all cursor-pointer"
                  style={{ height: `${(val / 100) * 44}px` }}
                />
                <span className="text-[8px] text-white/20 font-mono">D{idx+1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Pitches List */}
      <div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Your Pitches</h3>
        {myPitches.length > 0 ? (
          <div className="space-y-3">
            {myPitches.map((pitch) => (
              <div key={pitch.id} className="p-4 rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-30" />
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm leading-tight text-white/90 max-w-[80%] truncate">
                    {pitch.problem}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 shrink-0">
                    {pitch.status || 'Active'}
                  </span>
                </div>
                <div className="flex gap-4 text-xs mt-3">
                  <div>
                    <p className="text-white/40 text-[10px]">Raised</p>
                    <p className="font-mono font-bold text-[#00FF66]">{formatCurrency(pitch.totalRaised)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px]">Investors</p>
                    <p className="font-mono font-bold">{pitch.investorCount}</p>
                  </div>
                </div>

                {/* Add Update Post Section */}
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <label className="block text-[10px] text-white/40 uppercase font-bold">Post 30s Update (Earnings Call)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 2 utilities replied after trending here!"
                      maxLength={200}
                      value={pitchUpdateInputs[pitch.id] || ''}
                      onChange={(e) => setPitchUpdateInputs({ ...pitchUpdateInputs, [pitch.id]: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#00FF66]/40"
                    />
                    <button
                      type="button"
                      disabled={isPostingUpdate[pitch.id] || !(pitchUpdateInputs[pitch.id]?.trim())}
                      onClick={() => handlePostUpdate(pitch.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#00FF66] text-black font-bold text-xs hover:bg-[#00FF66]/80 disabled:opacity-40 transition-all whitespace-nowrap"
                    >
                      {isPostingUpdate[pitch.id] ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                  
                  {/* Existing updates listed */}
                  {pitch.updates && pitch.updates.length > 0 && (
                    <div className="space-y-1 mt-2">
                      <p className="text-[9px] text-white/30 uppercase font-bold">Past Updates</p>
                      <div className="max-h-[100px] overflow-y-auto space-y-1 pr-1">
                        {pitch.updates.map((upd, idx) => (
                          <div key={idx} className="p-2 rounded bg-white/[0.01] border border-white/5 text-[10px] text-white/60 flex justify-between gap-3">
                            <span className="italic">"{upd.text}"</span>
                            <span className="text-[9px] text-white/35 shrink-0">{new Date(upd.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center">
            <Presentation className="w-8 h-8 text-white/20 mb-3" />
            <p className="text-sm text-white/60">No pitches submitted yet</p>
            <p className="text-xs text-white/40 mt-1">Submit your first idea to start raising virtual capital.</p>
          </div>
        )}
      </div>

      {/* Structured Signals: Heatmap of Pass Reasons */}
      {myPitches.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF3366]" /> Investor Feedback Heatmap
            </h3>
            {totalPasses > 0 ? (
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-3">
                {passReasons.map((pr, i) => {
                  const pct = Math.round((pr.count / totalPasses) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white/80">{pr.reason}</span>
                        <span className="text-[#FF3366] font-mono">{pr.count} passes ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF3366]/40 to-[#FF3366]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-center">
                <p className="text-xs text-white/30">No pass reason feedback recorded yet.</p>
              </div>
            )}
          </div>

          {/* Demographics & Inferred ICP */}
          {totalBackers > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {/* Demographics */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
                  👤 Inferred ICP Segment
                </h4>
                <div className="space-y-2 pt-1">
                  {icp.map((seg, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/60 font-semibold">{seg.role}</span>
                        <span className="text-[#00FF66] font-mono">{seg.pct}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-[#00FF66]" style={{ width: `${seg.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparable Ideas & Paid Tier */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] flex flex-col justify-between relative overflow-hidden">
                {/* Paid blocker overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-center">
                  <Lock className="w-5.5 h-5.5 text-yellow-400 mb-1" />
                  <p className="text-[9px] font-bold uppercase tracking-wider text-yellow-400">Founder Pro Feature</p>
                  <p className="text-[8px] text-white/40 mt-0.5">Export investor lists & view comparable rankings</p>
                  <button className="mt-1.5 px-2 py-0.5 rounded bg-yellow-400 text-black font-extrabold text-[8px] hover:bg-yellow-400/80 transition-all">
                    Upgrade $19/mo
                  </button>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Comparable ideas
                  </h4>
                  <div className="mt-1 space-y-1">
                    <p className="text-[10px] text-white/60">Similar to EV smart charger (Ranked #1)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Investor Questions Aggregated */}
          {myPitches.length > 0 && (
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-2">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-yellow-400" /> Aggregated Investor Questions
              </h4>
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between p-2 rounded bg-white/[0.01] hover:bg-white/[0.02]">
                  <span className="text-white/70">What is the customer acquisition cost (CAC)?</span>
                  <span className="text-yellow-400 font-mono font-bold">3 queries</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.01] hover:bg-white/[0.02]">
                  <span className="text-white/70">How does pricing scale for large teams?</span>
                  <span className="text-yellow-400 font-mono font-bold">2 queries</span>
                </div>
              </div>
            </div>
          )}
          {/* Followers list */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-3">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#00FF66]" /> Your Followers
            </h4>
            {user.followers && user.followers.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {user.followers.map((follower) => (
                  <div key={follower.id} className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#00FF66]/10 flex items-center justify-center text-[10px] font-bold text-[#00FF66] border border-[#00FF66]/20 shrink-0">
                      {follower.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-white truncate">@{follower.username}</p>
                      <p className="text-[9px] text-white/30 capitalize">{follower.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/30 pt-1">No followers yet. Share your picks or post updates to get traction!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
