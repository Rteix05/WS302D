"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Howl } from "howler";
import { chaptersContent } from "@/lib/data";
import { useSound } from "@/components/providers/SoundContext";
import { X, Play, Pause, Volume2 } from "lucide-react";

interface ChapterPanelProps {
  chapterId: string | null;
  onClose: () => void;
}

export default function ChapterPanel({
  chapterId,
  onClose,
}: ChapterPanelProps) {
  const content = chapterId ? (chaptersContent as any)[chapterId] : null;

  // Hooks pour les sons
  const {
    playWhoosh,
    playClick2,
    playText,
    chapterVisited,
    markChapterAsVisited,
  } = useSound();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState(""); // Pour l'effet machine à écrire
  const soundRef = useRef<Howl | null>(null);
  const bgMusicRef = useRef<Howl | null>(null);

  // Effet d'ouverture/fermeture du panneau (Whoosh)
  useEffect(() => {
    playWhoosh();
    return () => {
      playWhoosh(); // Jouer aussi à la fermeture
    };
  }, []);

  // Gestion de la musique de fond du chapitre
  useEffect(() => {
    if (content?.bgMusic) {
      bgMusicRef.current = new Howl({
        src: [content.bgMusic],
        html5: true,
        volume: 0.3,
        loop: false, // "pas besoin de le loop" selon consignes
      });
      bgMusicRef.current.play();
    }

    return () => {
      bgMusicRef.current?.unload();
    };
  }, [content?.bgMusic]);

  // Effet Machine à écrire pour le titre
  useEffect(() => {
    if (!content?.title) return;

    setDisplayedTitle("");
    const fullTitle = content.title;
    let i = 0;

    const interval = setInterval(() => {
      if (i < fullTitle.length) {
        i++;
        setDisplayedTitle(fullTitle.slice(0, i));
        playText();
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [content?.title]);

  // Initialiser le lecteur audio Howler (Voiceover)
  useEffect(() => {
    if (!content?.voiceover) {
      soundRef.current = null;
      return;
    }

    soundRef.current = new Howl({
      src: [content.voiceover],
      format: ["mp3"],
      onload: () => {
        setDuration(soundRef.current?.duration() || 0);
      },
      onplay: () => setIsPlaying(true),
      onstop: () => {
        setIsPlaying(false);
        setCurrentTime(0);
      },
      onpause: () => setIsPlaying(false),
      onend: () => setIsPlaying(false),
    });

    // Auto-play à chaque ouverture
    const timer = setTimeout(() => {
      if (soundRef.current) {
        // Stop any previous instance just in case
        soundRef.current.stop();
        soundRef.current.play();
      }
      if (chapterId) markChapterAsVisited(chapterId);
    }, 1800);

    return () => {
      clearTimeout(timer);
      soundRef.current?.unload();
    };
  }, [content?.voiceover, chapterId]);

  // Mettre à jour le temps courant
  useEffect(() => {
    const interval = setInterval(() => {
      if (soundRef.current && isPlaying) {
        setCurrentTime(soundRef.current.seek());
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayPause = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!chapterId || !content) {
    return null;
  }

  return (
    <div
      className="h-full flex flex-col bg-[#121212] border-l border-[#457B9D]/20 shadow-2xl overflow-hidden"
      style={{
        boxShadow:
          "0 0 30px rgba(69, 123, 157, 0.3), inset 0 0 30px rgba(69, 123, 157, 0.1)",
      }}
    >
      {/* Bouton Fermer */}
      <button
        onClick={() => {
          playClick2();
          onClose();
        }}
        className="absolute top-6 right-6 z-20 text-white hover:text-[#E67E22] transition-colors p-2"
      >
        <X size={28} strokeWidth={2} />
      </button>

      {/* Contenu scrollable */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex flex-col overflow-y-auto"
      >
        {/* Wrapper avec padding global */}
        <div className="px-6 md:px-10 py-6">
          {/* TITRE AVEC EFFET MACHINE À ÉCRIRE */}
          <h1 className="text-5xl md:text-6xl font-black text-center mt-6 mb-10 tracking-wider uppercase leading-tight text-outline min-h-[3.6rem]">
            {displayedTitle}
            <span className="animate-pulse bg-[#E67E22] w-1 h-12 inline-block align-middle ml-2"></span>
          </h1>

          {/* IMAGE/VIDEO/IFRAME */}
          {(content.image || content.video || content.iframe) && (
            <div className="relative rounded-lg h-64 md:h-80 bg-gradient-to-b from-[#457B9D]/10 to-transparent overflow-hidden mb-8">
              {content.image && (
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
              {content.video && (
                <video
                  className="w-full h-full object-cover rounded-lg"
                  controls
                  playsInline
                  autoPlay
                >
                  <source src={content.video} type="video/mp4" />
                </video>
              )}
              {content.iframe && (
                <div
                  className="w-full h-full rounded-lg"
                  dangerouslySetInnerHTML={{ __html: content.iframe }}
                />
              )}
            </div>
          )}

          {/* 3. LECTEUR AUDIO (si voice-over) */}
          {content.voiceover && (
            <div className="mx-8 md:mx-12 mb-10 p-8 bg-gradient-to-br from-[#0a1419] via-[#0f1e28] to-[#0a1419] rounded-2xl shadow-2xl backdrop-blur-sm">
              {/* Label élégant */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs text-[#F1FAEE] font-medium tracking-[0.2em] uppercase">
                  Narration Audio
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Bouton Play/Pause moderne */}
                <button
                  onClick={togglePlayPause}
                  className="group relative flex-shrink-0 w-16 h-16 rounded-full bg-transparent border-none text-[#E67E22] flex items-center justify-center hover:scale-105 hover:shadow-xl hover:shadow-[#E67E22]/40 transition-all duration-300 ease-out"
                >
                  <div className="absolute inset-0 rounded-full bg-[#E67E22]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {isPlaying ? (
                    <Pause size={26} fill="currentColor" strokeWidth={0} />
                  ) : (
                    <Play
                      size={26}
                      fill="currentColor"
                      strokeWidth={0}
                      className="ml-1"
                    />
                  )}
                </button>

                {/* Informations et barre de progression */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Barre de progression moderne avec effet glassmorphism */}
                  <div className="relative group">
                    <div
                      className="w-full h-2 bg-[#457B9D]/40 rounded-full overflow-hidden cursor-pointer transition-all duration-200"
                      onClick={(e) => {
                        if (!soundRef.current || !duration) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        soundRef.current.seek(percent * duration);
                        setCurrentTime(percent * duration);
                      }}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-[#457B9D] via-[#5a94b8] to-[#E67E22] rounded-full transition-all duration-200 relative"
                        style={{
                          width: duration
                            ? `${(currentTime / duration) * 100}%`
                            : "0%",
                        }}
                      >
                        {/* Dot indicateur */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#F1FAEE] rounded-full shadow-lg shadow-[#E67E22]/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  </div>

                  {/* Temps */}
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs text-[#F1FAEE] font-mono tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-xs text-[#F1FAEE] font-mono tabular-nums">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                <Volume2 size={20} className="flex-shrink-0 text-[#F1FAEE]" />
              </div>
            </div>
          )}

          {/* 4. TEXTE */}
          <div className="px-12 md:px-20 py-12 pb-24 flex-1">
            <div className="py-24 prose prose-invert text-[#F1FAEE]/85 leading-relaxed space-y-10">
              {content.text
                .split("\n\n")
                .map((paragraph: string, i: number) => (
                  <p
                    key={i}
                    className="text-sm md:text-base font-serif text-justify px-6"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        </div>{" "}
        {/* Fermeture du wrapper avec padding global */}
      </motion.div>

      {/* Footer avec icône audio si présent */}
      {content.voiceover && (
        <div className="px-6 md:px-8 py-4 border-t border-[#457B9D]/10 bg-gradient-to-t from-[#0a1419] to-transparent"></div>
      )}
    </div>
  );
}
