import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { setPitches, setLoading, setHighlightPitchId, clearHighlightPitchId } from '../pitchesSlice';
import { fetchPitches, fetchPitchById, investInPitch, divestFromPitch, submitPassReason } from '../pitchesApi';
import { fetchUserPortfolio, fetchUserProfile } from '../../auth/authApi';
import { setPortfolio } from '../../auth/authSlice';
import { setBalance } from '../../wallet/walletSlice';
import PitchCard from './PitchCard';
import InvestModal from '../../wallet/components/InvestModal';
import DivestModal from '../../wallet/components/DivestModal';
import PassMenu from './PassMenu';
import { Loader2, Presentation } from 'lucide-react';

// Check if an ID looks like a real UUID (from DB) vs a demo short ID like '1', '2'
const isRealPitch = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export default function PitchFeed() {
  const dispatch = useDispatch();
  const { feed, isLoading, highlightPitchId } = useSelector((s) => s.pitches);
  const { token, user } = useSelector((s) => s.auth);

  const [searchParams] = useSearchParams();
  const urlPitchId = searchParams.get('pitch');
  const targetPitchId = urlPitchId || highlightPitchId;

  const [investTarget, setInvestTarget] = useState(null);
  const [divestTarget, setDivestTarget] = useState(null);
  const [passTarget, setPassTarget] = useState(null);
  const [activePitchId, setActivePitchId] = useState(null);
  // Map of pitchId -> DOM ref for each card row
  const cardRefs = useRef({});
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    async function load() {
      dispatch(setLoading(true));
      try {
        const data = await fetchPitches('hot');
        dispatch(setPitches(data || []));
      } catch (err) {
        console.error('Failed to load pitches:', err);
        dispatch(setPitches([]));
      } finally {
        dispatch(setLoading(false));
      }
    }
    load();
  }, [dispatch]);

  // Track active pitch in viewport for auto-play
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || feed.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pitchId = entry.target.getAttribute('data-pitch-id');
            setActivePitchId(pitchId);
          }
        });
      },
      {
        root: container,
        threshold: 0.55, // Trigger when card occupies > 55% of scroller height
      }
    );

    const els = Object.values(cardRefs.current);
    els.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      els.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [feed]);

  // If a specific pitch is requested that is not in the default feed, fetch it
  useEffect(() => {
    if (targetPitchId && feed.length > 0 && !feed.some((p) => p.id === targetPitchId)) {
      if (isRealPitch(targetPitchId)) {
        fetchPitchById(targetPitchId)
          .then((single) => {
            if (single?.id) {
              dispatch(setPitches([single, ...feed]));
            }
          })
          .catch(console.error);
      }
    }
  }, [targetPitchId, feed, dispatch]);

  // Order pitches so the targeted idea is immediately at index 0 (top of viewport)
  const orderedPitches = useMemo(() => {
    if (!targetPitchId || !feed || feed.length === 0) return feed;
    const target = feed.find((p) => p.id === targetPitchId);
    if (!target) return feed;
    const others = feed.filter((p) => p.id !== targetPitchId);
    return [target, ...others];
  }, [feed, targetPitchId]);

  // When targeted idea changes or mounts, snap directly to it
  useEffect(() => {
    if (targetPitchId && orderedPitches.length > 0) {
      setActivePitchId(targetPitchId);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      dispatch(clearHighlightPitchId());
    }
  }, [targetPitchId, orderedPitches, dispatch]);

  const handleInvest = async (startupId, amount) => {
    const updateList = (list) => list.map((p) => {
      if (p.id !== startupId) return p;
      const oldPrice = Number(p.currentPrice);
      const newPrice = parseFloat((oldPrice * (1 + amount / 100000)).toFixed(4));
      return {
        ...p,
        totalRaised: Number(p.totalRaised) + amount,
        investorCount: Number(p.investorCount) + 1,
        currentPrice: newPrice,
      };
    });

    if (isRealPitch(startupId)) {
      // Real pitch in the DB — call the backend, then update local state
      try {
        const updated = await investInPitch(startupId, amount, user?.id, token);
        dispatch(setPitches(feed.map((p) => p.id === startupId ? { ...p, ...updated } : p)));
        if (user?.id) {
          const [port, profile] = await Promise.all([
            fetchUserPortfolio(user.id),
            fetchUserProfile(user.id),
          ]);
          dispatch(setPortfolio(port));
          if (profile?.walletBalance !== undefined) {
            dispatch(setBalance(Number(profile.walletBalance)));
          }
        }
      } catch {
        // Fallback: update optimistically
        dispatch(setPitches(updateList(feed)));
      }
    } else {
      // Demo pitch — update state locally (no backend call needed)
      dispatch(setPitches(updateList(feed)));
    }
  };

  const handleDivest = async (startupId, shares, returnAmount) => {
    const updateList = (list) => list.map((p) => {
      if (p.id !== startupId) return p;
      const nextRaised = Math.max(0, Number(p.totalRaised) - returnAmount);
      const k = 0.0015;
      const newPrice = parseFloat(Math.max(0.01, k * Math.sqrt(nextRaised)).toFixed(4));
      return {
        ...p,
        totalRaised: nextRaised,
        currentPrice: newPrice,
      };
    });

    if (isRealPitch(startupId)) {
      try {
        const res = await divestFromPitch(startupId, shares, token);
        if (res?.startup) {
          dispatch(setPitches(feed.map((p) => p.id === startupId ? { ...p, ...res.startup } : p)));
        }
        if (user?.id) {
          const [port, profile] = await Promise.all([
            fetchUserPortfolio(user.id),
            fetchUserProfile(user.id),
          ]);
          dispatch(setPortfolio(port));
          if (profile?.walletBalance !== undefined) {
            dispatch(setBalance(Number(profile.walletBalance)));
          }
        }
      } catch {
        dispatch(setPitches(updateList(feed)));
      }
    } else {
      dispatch(setPitches(updateList(feed)));
    }
  };

  const handlePass = async (reason) => {
    const passedId = passTarget?.id;
    
    if (passTarget && reason) {
      // Fire and forget, don't await to keep UI snappy
      submitPassReason(passTarget.id, reason, token).catch(() => {});
    }

    // Automatically scroll to the next pitch
    if (passedId) {
      const idx = orderedPitches.findIndex((p) => p.id === passedId);
      if (idx !== -1 && idx < orderedPitches.length - 1) {
        const nextPitch = orderedPitches[idx + 1];
        const nextEl = cardRefs.current[nextPitch.id];
        if (nextEl) {
          nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  const pitches = orderedPitches;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#00FF66] animate-spin" />
        <span className="ml-2 text-white/40">Loading pitches...</span>
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8 max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center mb-5 text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.1)] mx-auto">
          <Presentation className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">No pitches yet</h3>
        <p className="text-xs text-white/40 leading-relaxed">
          Be the first to share your vision! Switch to a Founder account and submit your pitch to get real-time market signal.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory overscroll-contain touch-pan-y no-scrollbar scroll-smooth"
        style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
      >
        {pitches.map((startup) => (
          <div
            key={startup.id}
            ref={(el) => { cardRefs.current[startup.id] = el; }}
            data-pitch-id={startup.id}
            className="h-full w-full snap-start snap-always flex items-center justify-center py-1.5 px-2 sm:py-3 sm:px-4 shrink-0 min-h-0"
          >
            <div className="w-full max-w-[760px] h-full flex flex-col min-h-0">
              <PitchCard
                startup={startup}
                isActive={startup.id === activePitchId}
                onInvest={(s) => setInvestTarget(s)}
                onDivest={(s, holding) => setDivestTarget({ ...holding, ...s, sharesBought: holding.sharesBought || holding.shares })}
                onPass={(s) => setPassTarget(s)}
              />
            </div>
          </div>
        ))}
      </div>

      <InvestModal
        isOpen={!!investTarget}
        onClose={() => setInvestTarget(null)}
        startup={investTarget}
        onInvest={handleInvest}
      />

      <DivestModal
        isOpen={!!divestTarget}
        onClose={() => setDivestTarget(null)}
        holding={divestTarget}
        onDivest={handleDivest}
      />

      <PassMenu
        isOpen={!!passTarget}
        onClose={() => setPassTarget(null)}
        onPass={handlePass}
      />
    </>
  );
}
