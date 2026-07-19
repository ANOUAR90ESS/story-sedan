import React, { useEffect, useState } from "react";
import { fetchHeyGenAvatars, fetchHeyGenVoices } from "../services/heygenService";
import { Mic, UserSquare, Loader2, AlertTriangle } from "lucide-react";

export function HeyGenConfig() {
  const [avatars, setAvatars] = useState<any[]>([]);
  const [voices, setVoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    localStorage.getItem("heygen_avatar_id") || "f34f8d0d40a646af8e640ba2e3873cea"
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    localStorage.getItem("heygen_voice_id") || "AlQ0ntbSy8M9v4PUN6ZR"
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [fetchedAvatars, fetchedVoices] = await Promise.all([
          fetchHeyGenAvatars(),
          fetchHeyGenVoices(),
        ]);
        setAvatars(fetchedAvatars);
        setVoices(fetchedVoices);
      } catch (err: any) {
        setError(err.message || "Failed to fetch HeyGen data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAvatarId(val);
    localStorage.setItem("heygen_avatar_id", val);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedVoiceId(val);
    localStorage.setItem("heygen_voice_id", val);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-widest text-amber-accent flex items-center gap-2 font-black px-1">
          <UserSquare size={12} /> HeyGen Configuration
        </label>
        {loading && <Loader2 size={12} className="animate-spin text-amber-accent" />}
      </div>
      
      {error && (
        <div className="text-[10px] text-red-400 flex items-center gap-2 px-1">
          <AlertTriangle size={12} /> {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-[9px] text-gray-500 px-1 mb-1 block uppercase tracking-widest font-black">
            Default Host Avatar
          </label>
          <select
            value={selectedAvatarId}
            onChange={handleAvatarChange}
            className="w-full bg-black/40 border border-amber-accent/20 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-accent/50 transition-colors"
          >
            {avatars.length === 0 && <option value={selectedAvatarId}>Loading or Default ({selectedAvatarId.substring(0, 8)}...)</option>}
            {avatars.map((a: any) => (
              <option key={a.avatar_id} value={a.avatar_id}>
                {a.avatar_name || a.avatar_id} {a.gender ? `(${a.gender})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[9px] text-gray-500 px-1 mb-1 block uppercase tracking-widest font-black flex items-center gap-1">
            <Mic size={10} /> Default Narrator Voice
          </label>
          <select
            value={selectedVoiceId}
            onChange={handleVoiceChange}
            className="w-full bg-black/40 border border-amber-accent/20 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-accent/50 transition-colors"
          >
            {voices.length === 0 && <option value={selectedVoiceId}>Loading or Default ({selectedVoiceId.substring(0, 8)}...)</option>}
            {voices.map((v: any) => (
              <option key={v.voice_id} value={v.voice_id}>
                {v.name || v.voice_id} {v.language ? `(${v.language})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
