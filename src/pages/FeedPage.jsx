import PitchFeed from '../features/pitches/components/PitchFeed';

export default function FeedPage() {
  return (
    <div className="w-full flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-[hsl(240,15%,4%)]">
      <PitchFeed />
    </div>
  );
}
