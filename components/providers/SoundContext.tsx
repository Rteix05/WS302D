"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";

type SoundContextType = {
  playClick: () => void;
  playClick2: () => void;
  playHover: () => void;
  playText: () => void;
  playWhoosh: () => void;
  playAmbiance: () => void;
  stopAmbiance: () => void;
  fadeAmbianceOut: () => void;
  fadeAmbianceIn: () => void;
  chapterVisited: (id: string) => boolean;
  markChapterAsVisited: (id: string) => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const ambianceRef = useRef<Howl | null>(null);
  const sfxRef = useRef<{ [key: string]: Howl }>({});
  const [visitedChapters, setVisitedChapters] = useState<Set<string>>(
    new Set(),
  );

  // Initialisation des sons
  useEffect(() => {
    // SFX
    sfxRef.current = {
      click: new Howl({ src: ["/audio/sfx/click.opus"], volume: 0.5 }),
      click2: new Howl({ src: ["/audio/sfx/click2.opus"], volume: 0.5 }),
      hover: new Howl({ src: ["/audio/sfx/hover.opus"], volume: 0.2 }), // Volume plus bas pour le hover
      text: new Howl({ src: ["/audio/sfx/text.opus"], volume: 0.3 }),
      whoosh: new Howl({ src: ["/audio/sfx/whoosh.opus"], volume: 0.4 }),
    };

    // Ambiance
    ambianceRef.current = new Howl({
      src: ["/audio/ambiance/main_ambiance.ogg"],
      loop: true,
      volume: 0, // Commence à 0 pour le fade in
      autoplay: false,
    });

    return () => {
      Howler.unload();
    };
  }, []);

  const playClick = () => sfxRef.current.click?.play();
  const playClick2 = () => sfxRef.current.click2?.play();
  const playHover = () => {
    // Stop le son actuel pour permettre de le relancer immédiatement (effet "reset")
    sfxRef.current.hover?.stop();
    sfxRef.current.hover?.play();
  };
  const playText = () => sfxRef.current.text?.play();
  const playWhoosh = () => sfxRef.current.whoosh?.play();

  const playAmbiance = () => {
    const sound = ambianceRef.current;
    if (sound && !sound.playing()) {
      sound.play();
      sound.fade(0, 0.5, 3000); // Fade in 3s vers 0.5 (volume max ambiance)
    }
  };

  const stopAmbiance = () => {
    const sound = ambianceRef.current;
    if (sound && sound.playing()) {
      sound.fade(sound.volume(), 0, 2000); // Fade out 2s
      setTimeout(() => {
        if (sound.volume() === 0) sound.stop();
      }, 2000);
    }
  };

  // Pause ambiance (fade out) sans stop complet (ex: ouverture chapitre)
  const fadeAmbianceOut = () => {
    const sound = ambianceRef.current;
    if (sound && sound.playing()) {
      sound.fade(sound.volume(), 0, 2000);
    }
  };

  // Resume ambiance (fade in)
  const fadeAmbianceIn = () => {
    const sound = ambianceRef.current;
    if (sound && sound.playing()) {
      sound.fade(0, 0.5, 3000);
    } else if (sound) {
      sound.play(); // Si stoppé
      sound.fade(0, 0.5, 3000);
    }
  };

  const markChapterAsVisited = (id: string) => {
    setVisitedChapters((prev) => new Set(prev).add(id));
  };

  const chapterVisited = (id: string) => visitedChapters.has(id);

  return (
    <SoundContext.Provider
      value={{
        playClick,
        playClick2,
        playHover,
        playText,
        playWhoosh,
        playAmbiance,
        stopAmbiance,
        fadeAmbianceOut,
        fadeAmbianceIn,
        chapterVisited,
        markChapterAsVisited,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
