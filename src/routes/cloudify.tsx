import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Search,
  Plus,
  Trash2,
  Edit,
  Music,
  ArrowLeft,
  Settings,
  Upload,
  Loader2,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles
} from "lucide-react";

export const Route = createFileRoute("/cloudify")({
  head: () => ({
    meta: [
      { title: "Cloudify — iOS Premium Music Player" },
      { name: "description", content: "iOS-themed premium cloud music library. Stream and discover independent artist releases." },
    ],
  }),
  component: CloudifyMusicPage,
});

interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  createdAt: string;
}

const getAvatarColor = (title: string) => {
  const colors = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function CloudifyMusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Admin Mode States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminToken, setAdminToken] = useState("");

  // Upload Form States
  const [newTitle, setNewTitle] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit Form States
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [updating, setUpdating] = useState(false);

  // Audio Player States
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    fetchSongs();
    
    // Check if admin token is saved in localStorage
    const savedToken = localStorage.getItem("cloudify_admin_token");
    if (savedToken === "as@vercel") {
      setIsAdmin(true);
      setAdminToken("as@vercel");
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Update audio controls
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Auto play next song on end
      audioRef.current.addEventListener("ended", () => {
        handleNextSong();
      });
      
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
      });
    }

    if (currentSong) {
      const prevSrc = audioRef.current.src;
      if (prevSrc !== currentSong.audioUrl) {
        audioRef.current.src = currentSong.audioUrl;
        audioRef.current.load();
      }
      
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback error:", e));
        startProgressTimer();
      } else {
        audioRef.current.pause();
        stopProgressTimer();
      }
    } else {
      audioRef.current.pause();
      stopProgressTimer();
    }
  }, [currentSong, isPlaying]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const startProgressTimer = () => {
    stopProgressTimer();
    progressIntervalRef.current = window.setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 250);
  };

  const stopProgressTimer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cloudify/songs");
      if (res.ok) {
        const data = await res.json();
        setSongs(data.songs || []);
      }
    } catch (e) {
      console.error("Failed to load songs:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "as@vercel") {
      setIsAdmin(true);
      setAdminToken("as@vercel");
      localStorage.setItem("cloudify_admin_token", "as@vercel");
      setShowAdminPanel(true);
      setSearchQuery("");
      alert("Admin Panel Unlocked!");
    }
  };

  // Helper to upload files to Catbox uploader proxy
  const uploadToCatbox = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/public/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handleUploadSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArtist.trim() || !coverFile || !audioFile) {
      setUploadError("Please fill all fields and select files.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(10); // Start indicator

    try {
      // 1. Upload Cover Image to Catbox
      setUploadProgress(30);
      const coverUrl = await uploadToCatbox(coverFile);

      // 2. Upload Audio file to Catbox
      setUploadProgress(60);
      const audioUrl = await uploadToCatbox(audioFile);

      setUploadProgress(85);

      // 3. Save details to custom Cloudify MongoDB
      const res = await fetch("/api/cloudify/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          artist: newArtist.trim(),
          coverUrl,
          audioUrl,
          auth: adminToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create db song entry.");

      setUploadProgress(100);
      setNewTitle("");
      setNewArtist("");
      setCoverFile(null);
      setAudioFile(null);
      fetchSongs();
      alert("Song uploaded successfully!");
      setShowAdminPanel(false);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload song.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return;

    try {
      const res = await fetch("/api/cloudify/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          auth: adminToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed.");

      if (currentSong?.id === id) {
        setIsPlaying(false);
        setCurrentSong(null);
      }
      fetchSongs();
      alert("Song deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete song.");
    }
  };

  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setEditTitle(song.title);
    setEditArtist(song.artist);
  };

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong || !editTitle.trim() || !editArtist.trim()) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/cloudify/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSong.id,
          title: editTitle.trim(),
          artist: editArtist.trim(),
          auth: adminToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Edit failed.");

      setEditingSong(null);
      fetchSongs();
      alert("Song updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update song details.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleNextSong = () => {
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    if (currentIndex === -1) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = songs.length - 1;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col font-sans relative overflow-hidden select-none pb-24">
      {/* Background iOS Blur Spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="px-5 py-4.5 border-b border-zinc-900/60 backdrop-blur-xl sticky top-0 z-40 bg-[#000000]/80 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="size-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all text-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Music className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-black tracking-tight leading-none">CLOUDIFY</h1>
              <p className="text-[9px] text-zinc-500 font-black tracking-widest uppercase mt-0.5">iOS Apple Music Library</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="px-3.5 h-8.5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-[11px] font-black tracking-wider uppercase flex items-center gap-1 shadow-lg hover:brightness-110"
            >
              <Settings className="size-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
          <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Premium Edge
          </span>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-6 space-y-6 overflow-y-auto">
        
        {/* iOS Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative select-none max-w-lg mx-auto">
          <Search className="absolute left-3.5 top-2.5 size-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search songs, artists, or type keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-zinc-900 border border-zinc-800/60 rounded-xl pl-10 pr-4 text-[12.5px] font-bold text-white placeholder-zinc-500 outline-none focus:border-pink-500/30 transition-all"
          />
        </form>

        {/* Featured Songs Grid (if no search active) */}
        {!searchQuery && songs.length > 0 && (
          <div className="space-y-3 select-none">
            <h2 className="text-[15.5px] font-black tracking-tight text-zinc-400 uppercase tracking-widest pl-1">Featured Releases</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {songs.slice(0, 4).map(song => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className="group bg-zinc-950/60 border border-zinc-900 rounded-2xl p-3 space-y-3 cursor-pointer hover:bg-zinc-900/40 transition-all select-none hover:scale-[1.02] shadow-md"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-square bg-zinc-900 shadow-inner">
                      <img src={song.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="size-11 rounded-full bg-white/95 text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95">
                          {isCurrent && isPlaying ? <Pause className="size-5 fill-black" /> : <Play className="size-5 fill-black ml-0.5" />}
                        </div>
                      </div>
                      {isCurrent && isPlaying && (
                        <div className="absolute bottom-2.5 right-2.5 size-7 rounded-full bg-pink-500 flex items-center justify-center shadow-md animate-pulse">
                          <span className="size-2 rounded-full bg-white animate-ping" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[12.5px] font-black text-white truncate leading-tight group-hover:text-pink-500 transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-[10.5px] font-bold text-zinc-500 truncate mt-0.5">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Songs List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center select-none pl-1">
            <h2 className="text-[15.5px] font-black tracking-tight text-zinc-400 uppercase tracking-widest">
              {searchQuery ? "Search Results" : "All Library Songs"}
            </h2>
            <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full font-black border border-zinc-800">
              {filteredSongs.length} Tracks
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-pink-500" />
              <p className="text-[11.5px] text-zinc-500 font-bold mt-2 select-none">Accessing Cloudify CDN database...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-20 select-none border border-zinc-900 rounded-2xl bg-zinc-950/20">
              <Music className="size-10 text-zinc-700 mx-auto mb-2" />
              <p className="text-[13px] font-black text-zinc-400">Library Empty</p>
              <p className="text-[11px] text-zinc-600 max-w-xs mx-auto mt-0.5 leading-normal">
                {searchQuery ? "No matches found. Try entering another song name." : "No songs have been loaded into this Cloudify node database yet."}
              </p>
            </div>
          ) : (
            <div className="bg-zinc-950/30 border border-zinc-900/60 rounded-2xl p-2 select-text divide-y divide-zinc-900/40">
              {filteredSongs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className="flex items-center gap-3.5 p-3 cursor-pointer hover:bg-zinc-900/35 transition-all select-none group"
                  >
                    {/* Index or active status */}
                    <span className="text-[11.5px] font-bold text-zinc-600 w-4.5 text-center flex-shrink-0 group-hover:text-pink-500">
                      {isCurrent && isPlaying ? (
                        <span className="size-2 rounded-full bg-pink-500 inline-block animate-ping" />
                      ) : (
                        idx + 1
                      )}
                    </span>

                    {/* Album Cover */}
                    <img
                      src={song.coverUrl}
                      className="size-11 rounded-lg object-cover bg-zinc-900 border border-zinc-800 shadow-sm flex-shrink-0"
                      alt="Album Cover"
                    />

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-[13px] font-black leading-tight truncate ${isCurrent ? "text-pink-500" : "text-white"}`}>
                        {song.title}
                      </h4>
                      <p className="text-[11px] font-bold text-zinc-500 truncate mt-0.5">{song.artist}</p>
                    </div>

                    {/* Admin actions if enabled */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditSong(song)}
                          className="size-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
                          title="Edit Details"
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          className="size-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 flex items-center justify-center text-rose-500 transition-all active:scale-95"
                          title="Delete Track"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ───────────────── iOS BOTTOM PERSISTENT MUSIC PLAYER BAR ───────────────── */}
      {currentSong && (
        <div 
          onClick={() => setExpandedPlayer(true)}
          className="fixed bottom-4 left-4 right-4 bg-zinc-950/85 backdrop-blur-xl border border-zinc-800/80 rounded-[20px] p-2.5 shadow-2xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all z-40 select-none animate-slide-in max-w-lg mx-auto"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img src={currentSong.coverUrl} className="size-11 rounded-xl object-cover border border-zinc-800 shadow-md flex-shrink-0" alt="Cover" />
            <div className="truncate">
              <h4 className="text-[12.5px] font-black text-white truncate leading-tight">{currentSong.title}</h4>
              <p className="text-[10px] font-bold text-zinc-500 truncate mt-0.5">{currentSong.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={handlePrevSong}
              className="size-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-90 transition-all"
            >
              <SkipBack className="size-5 fill-zinc-400" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="size-9.5 rounded-full bg-white text-black flex items-center justify-center active:scale-90 shadow-md transition-all"
            >
              {isPlaying ? <Pause className="size-4.5 fill-black" /> : <Play className="size-4.5 fill-black ml-0.5" />}
            </button>
            <button
              onClick={handleNextSong}
              className="size-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white active:scale-90 transition-all"
            >
              <SkipForward className="size-5 fill-zinc-400" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────── iOS EXPANDED PLAYER SCREEN ───────────────── */}
      {expandedPlayer && currentSong && (
        <div className="fixed inset-0 bg-[#000000] z-50 flex flex-col p-6 animate-slide-in select-text relative">
          {/* Cover Art Glowing Reflection */}
          <div
            className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full blur-[100px] opacity-40 pointer-events-none transition-all duration-1000"
            style={{ backgroundImage: `radial-gradient(circle, ${getAvatarColor(currentSong.title)} 0%, transparent 70%)` }}
          />

          {/* Header */}
          <div className="flex justify-between items-center select-none z-10">
            <button
              onClick={() => setExpandedPlayer(false)}
              className="size-9.5 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center hover:bg-zinc-900 active:scale-90 transition-all"
            >
              <ChevronDown className="size-5 text-zinc-400" />
            </button>
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest select-none">Now Playing</span>
            <div className="size-9.5" /> {/* Spacer */}
          </div>

          {/* Album Cover Art */}
          <div className="flex-1 flex items-center justify-center py-6 z-10">
            <div className="w-full max-w-[260px] aspect-square rounded-[24px] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:scale-[1.01] transition-transform select-none">
              <img src={currentSong.coverUrl} className="w-full h-full object-cover" alt="Album Cover" />
            </div>
          </div>

          {/* Meta & Seekbar Panel */}
          <div className="space-y-6 pb-8 z-10 max-w-md mx-auto w-full">
            <div>
              <h3 className="text-[20px] font-black text-white leading-tight break-words">{currentSong.title}</h3>
              <p className="text-[14px] font-bold text-pink-500 mt-1">{currentSong.artist}</p>
            </div>

            {/* Seek Bar */}
            <div className="space-y-1 select-none">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500 outline-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
              </div>
            </div>

            {/* Media Controls */}
            <div className="flex justify-center items-center gap-8 select-none">
              <button
                onClick={handlePrevSong}
                className="size-12 rounded-full flex items-center justify-center hover:bg-zinc-900 active:scale-90 transition-all text-zinc-400 hover:text-white"
              >
                <SkipBack className="size-7 fill-current" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="size-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 shadow-xl transition-all"
              >
                {isPlaying ? <Pause className="size-7 fill-black" /> : <Play className="size-7 fill-black ml-1" />}
              </button>
              <button
                onClick={handleNextSong}
                className="size-12 rounded-full flex items-center justify-center hover:bg-zinc-900 active:scale-90 transition-all text-zinc-400 hover:text-white"
              >
                <SkipForward className="size-7 fill-current" />
              </button>
            </div>

            {/* Volume Panel */}
            <div className="flex items-center gap-3.5 select-none pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ───────────────── iOS ADMIN PANEL OVERLAY ───────────────── */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800/80 rounded-[28px] p-6 shadow-2xl space-y-4 animate-spring-scale select-text">
            <div className="flex justify-between items-center select-none">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-pink-500" />
                <span className="text-[13px] font-black uppercase text-zinc-400 tracking-wider">Cloudify Admin Control</span>
              </div>
              <button
                onClick={() => {
                  setShowAdminPanel(false);
                  setUploadError(null);
                }}
                className="text-zinc-500 hover:text-white"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {uploadError && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-500 text-[12px] font-bold p-3 flex items-start gap-2">
                <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSong} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Song Title</label>
                <input
                  type="text"
                  placeholder="e.g. Starboy"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-9 bg-zinc-900 border border-zinc-800/60 rounded-xl px-3 text-[12.5px] font-bold text-white outline-none focus:border-pink-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Artist Name</label>
                <input
                  type="text"
                  placeholder="e.g. The Weeknd"
                  required
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  className="w-full h-9 bg-zinc-900 border border-zinc-800/60 rounded-xl px-3 text-[12.5px] font-bold text-white outline-none focus:border-pink-500/30"
                />
              </div>

              {/* Cover File Select */}
              <div className="space-y-1 select-none">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Album Cover (Image)</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="flex-1 text-[11px] text-zinc-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
                  />
                  {coverFile && <CheckCircle className="size-4.5 text-emerald-500 self-center" />}
                </div>
              </div>

              {/* Audio File Select */}
              <div className="space-y-1 select-none">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Song Track (Audio)</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="audio/*"
                    required
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="flex-1 text-[11px] text-zinc-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
                  />
                  {audioFile && <CheckCircle className="size-4.5 text-emerald-500 self-center" />}
                </div>
              </div>

              {uploading && (
                <div className="space-y-1 select-none pt-1">
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500 block text-right">Uploading CDN: {uploadProgress}%</span>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full h-10 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-[12px] uppercase tracking-wider disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
              >
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                <span>Upload & Publish Song</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────── iOS EDIT SONG INFO MODAL ───────────────── */}
      {editingSong && (
        <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800/80 rounded-[28px] p-6 shadow-2xl space-y-4 animate-spring-scale select-text">
            <div className="flex justify-between items-center select-none">
              <span className="text-[13px] font-black uppercase text-zinc-400 tracking-wider">Edit Song Info</span>
              <button onClick={() => setEditingSong(null)} className="text-zinc-500 hover:text-white">
                <X className="size-4.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSong} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Song Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-9 bg-zinc-900 border border-zinc-800/60 rounded-xl px-3 text-[12.5px] font-bold text-white outline-none focus:border-pink-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider block">Artist Name</label>
                <input
                  type="text"
                  required
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full h-9 bg-zinc-900 border border-zinc-800/60 rounded-xl px-3 text-[12.5px] font-bold text-white outline-none focus:border-pink-500/30"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full h-10 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-[12px] uppercase tracking-wider disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
              >
                {updating ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
