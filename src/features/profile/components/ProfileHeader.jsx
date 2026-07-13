import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Rocket, Camera, Clock } from 'lucide-react';
import { updateAvatar, updateProfileSuccess } from '../../auth/authSlice';
import { API_BASE } from '../../../config';

const CLOUD_NAME = 'za2oklbi';
const UPLOAD_PRESET = 'captab_avatars';
const COOLDOWN_DAYS = 30;

function getDaysRemaining(lastChangedAt) {
  if (!lastChangedAt) return 0;
  const last = new Date(lastChangedAt).getTime();
  const now = Date.now();
  const daysSince = (now - last) / (1000 * 60 * 60 * 24);
  const remaining = COOLDOWN_DAYS - daysSince;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}

export default function ProfileHeader({ user }) {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const avatarLastChangedAt = user?.avatarLastChangedAt || useSelector((s) => s.auth.avatarLastChangedAt);
  const fileInputRef = useRef(null);

  const isFounder = user?.role === 'founder';
  const RoleIcon = isFounder ? Rocket : Users;

  const daysRemaining = getDaysRemaining(avatarLastChangedAt);
  const canChange = daysRemaining === 0;

  const handleClick = () => {
    if (canChange) {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type & size (max 5MB)
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      return;
    }

    // Upload directly to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        const now = new Date();
        const patchRes = await fetch(`${API_BASE}/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            avatarUrl: data.secure_url,
            avatarLastChangedAt: now,
          }),
        });
        if (patchRes.ok) {
          const updatedUser = await patchRes.json();
          dispatch(updateAvatar(data.secure_url));
          dispatch(updateProfileSuccess(updatedUser));
        } else {
          console.error('Failed to update avatar on backend');
          alert('Cloudinary upload succeeded, but saving to profile failed.');
        }
      } else {
        console.error('Cloudinary upload failed:', data);
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please check your connection.');
    }

    // Reset file input so same file can be re-selected if needed
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center text-center p-6 mb-6 rounded-xl border border-white/10 bg-white/[0.03]">
      
      {/* Avatar with clickable overlay */}
      <div
        onClick={handleClick}
        className={`relative w-20 h-20 rounded-full mb-4 shadow-[0_0_20px_rgba(0,255,102,0.2)] border-2 overflow-hidden ${
          canChange
            ? 'border-[#00FF66]/50 cursor-pointer group'
            : 'border-white/20 cursor-not-allowed'
        }`}
      >
        {/* Avatar image or initial */}
        <div className="w-full h-full bg-[#00FF66]/20 flex items-center justify-center">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-[#00FF66]">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </div>

        {/* Hover overlay: camera icon if allowed, countdown if locked */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-200 ${
          canChange
            ? 'bg-black/60 opacity-0 group-hover:opacity-100'
            : 'bg-black/70 opacity-0 group-hover:opacity-100'
        }`}>
          {canChange ? (
            <Camera className="w-6 h-6 text-white" />
          ) : (
            <>
              <Clock className="w-5 h-5 text-yellow-400 mb-0.5" />
              <span className="text-[9px] text-yellow-400 font-semibold leading-tight">{daysRemaining}d</span>
            </>
          )}
        </div>
      </div>

      {/* Cooldown notice below avatar */}
      {!canChange && (
        <p className="text-[10px] text-yellow-400/70 mb-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Photo locked for {daysRemaining} more day{daysRemaining !== 1 ? 's' : ''}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <h2 className="text-2xl font-bold tracking-tight mb-1">@{user?.username || 'user'}</h2>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 mt-2">
        <RoleIcon className="w-3.5 h-3.5 text-[#00FF66]" />
        <span className="text-xs font-medium uppercase tracking-wider text-[#00FF66]">
          {isFounder ? 'Founder' : 'Angel Investor'}
        </span>
      </div>
    </div>
  );
}
