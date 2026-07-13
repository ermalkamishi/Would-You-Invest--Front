import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPitches, setLoading, setHighlightPitchId, clearHighlightPitchId } from '../pitchesSlice';
import { fetchPitches, investInPitch, submitPassReason } from '../pitchesApi';
import PitchCard from './PitchCard';
import InvestModal from '../../wallet/components/InvestModal';
import PassMenu from './PassMenu';
import { Loader2, Presentation } from 'lucide-react';

// Check if an ID looks like a real UUID (from DB) vs a demo short ID like '1', '2'
const isRealPitch = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export default function PitchFeed() {
  const dispatch = useDispatch();
  const { feed, isLoading, highlightPitchId } = useSelector((s) => s.pitches);
  const { token, user } = useSelector((s) => s.auth);

  const [investTarget, setInvestTarget] = useState(null);
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

  // When highlightPitchId is set (e.g. user clicked a live alert),
  // scroll the matching pitch card into view and then clear the highlight.
  useEffect(() => {
    if (!highlightPitchId) return;
    const el = cardRefs.current[highlightPitchId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      dispatch(clearHighlightPitchId());
    }
  }, [highlightPitchId, dispatch, feed]);

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
      } catch {
        // Fallback: update optimistically
        dispatch(setPitches(updateList(feed)));
      }
    } else {
      // Demo pitch — update state locally (no backend call needed)
      dispatch(setPitches(updateList(feed)));
    }
  };

  const handlePass = async (reason) => {
    if (passTarget && reason) {
      await submitPassReason(passTarget.id, reason, token).catch(() => {});
    }
  };

  const pitches = feed;

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
      <div ref={scrollContainerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
        {pitches.map((startup) => (
          <div
            key={startup.id}
            ref={(el) => { cardRefs.current[startup.id] = el; }}
            data-pitch-id={startup.id}
            className="h-full w-full snap-start snap-always flex items-center justify-center py-4 px-4"
          >
            <div className="w-full max-w-[800px] h-full">
              <PitchCard
                startup={startup}
                isActive={startup.id === activePitchId}
                onInvest={(s) => setInvestTarget(s)}
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

      <PassMenu
        isOpen={!!passTarget}
        onClose={() => setPassTarget(null)}
        onPass={handlePass}
      />
    </>
  );
}
