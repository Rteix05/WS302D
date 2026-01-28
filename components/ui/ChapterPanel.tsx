"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Howl } from "howler";
import { chaptersContent } from "@/lib/data";
import { useSound } from "@/components/providers/SoundContext";
import { useProgression } from "@/components/providers/ProgressionContext";
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

  const { markAsVisited, unlockNext } = useProgression();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState(""); // Pour l'effet machine à écrire
  const soundRef = useRef<Howl | null>(null);
  const bgMusicRef = useRef<Howl | null>(null);

  // Effet d'ouverture/fermeture du panneau (Whoosh)
  useEffect(() => {
    playWhoosh();
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
      if (chapterId) {
        markChapterAsVisited(chapterId); // Pour le son
        markAsVisited(chapterId); // Pour la progression globale
        unlockNext(chapterId); // Pour débloquer le suivant
      }
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
          playWhoosh();
          onClose();
        }}
        className="absolute top-6 right-6 z-20 text-[#E67E22] border-none bg-transparent hover:scale-110 transition-transform p-2 focus:outline-none"
      >
        <X size={40} strokeWidth={3} />
      </button>

      {/* Contenu scrollable */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-y-auto" // Retrait de flex flex-col pour éviter les conflits de layout
      >
        {/* Conteneur principal : Centrage via Flex sans padding layout conflictuel */}
        <div className="w-full flex flex-col items-center py-12">
          {/* Contenu : Largeur en % pour garantir les marges (responsive) */}
          <div className="w-[90%] md:w-[85%] max-w-5xl">
            
            {/* TITRE */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-center mt-4 mb-16 tracking-wider uppercase leading-[0.9] text-outline min-h-[5rem]">
              {displayedTitle}
              <span className="animate-pulse bg-[#E67E22] w-2 h-12 md:h-20 lg:h-24 inline-block align-middle ml-2"></span>
            </h1>

          {/* IMAGE/VIDEO/IFRAME */}
          {(content.image || content.video || content.iframe) && (
            <div className="mb-16 w-full">
              <div className="relative rounded-[2rem] w-full aspect-video bg-gradient-to-b from-[#457B9D]/10 to-transparent overflow-hidden shadow-2xl">
                {content.image && (
                  <img
                    src={content.image}
                    alt={content.title}
                    className="w-full h-full object-cover rounded-[2rem]"
                  />
                )}
                {content.video && (
                  <video
                    className="w-full h-full object-cover rounded-[2rem]"
                    controls
                    playsInline
                    autoPlay
                  >
                    <source src={content.video} type="video/mp4" />
                  </video>
                )}
                {content.iframe && (
                  <div
                    className="w-full h-full rounded-[2rem]"
                    dangerouslySetInnerHTML={{ __html: content.iframe }}
                  />
                )}
              </div>
            </div>
          )}

            {/* 3. LECTEUR AUDIO */}
            {content.voiceover && (
              <div className="mb-16 w-full">
                <div className="py-4">
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
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      {/* Barre de progression */}
                      <div 
                        className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer group py-2 bg-clip-content" // Zone cliquable augmentée avec py-2 mais visuel fin
                        onClick={(e) => {
                          if (!soundRef.current || !duration) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          // Correction pour ignorer le padding vertical dans le calcul si besoin
                          // Mais ici le rect englobe le padding, donc la width est bonne.
                          // On veut juste la position X.
                          const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
                          soundRef.current.seek(percent * duration);
                          setCurrentTime(percent * duration);
                        }}
                      >
                        {/* Track Visuel */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/20 rounded-full pointer-events-none"></div>

                        {/* Fill & Dot */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-[#E67E22] rounded-full pointer-events-none"
                          style={{
                            width: duration
                              ? `${(currentTime / duration) * 100}%`
                              : "0%",
                          }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F1FAEE] rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform"></div>
                        </div>
                      </div>

                      {/* Temps */}
                      <div className="flex items-center justify-between text-xs font-mono text-[#F1FAEE]/60 tabular-nums">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <Volume2 size={20} className="flex-shrink-0 text-[#F1FAEE]" />
                  </div>
                </div>
              </div>
            )}

            {/* 4. TEXTE */}
            <div className="w-full">
              <div className="prose prose-lg md:prose-xl prose-invert max-w-none text-[#F1FAEE]/90 leading-relaxed font-light">
                {content.text
                  .split("\n\n")
                  .map((paragraph: string, i: number) => (
                    <p
                      key={i}
                      className="mb-8 last:mb-0 text-justify font-serif tracking-wide"
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer avec icône audio si présent */}
      {content.voiceover && (
        <div className="px-6 md:px-8 py-4 border-t border-[#457B9D]/10 bg-gradient-to-t from-[#0a1419] to-transparent"></div>
      )}
    </div>
  );
}
