"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProgression } from '@/components/providers/ProgressionContext';
import { chaptersContent } from '@/lib/data';
import { ArrowLeft, Play, Pause } from 'lucide-react';

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { markAsVisited } = useProgression();
  
  const id = params?.id as string;
  const content = chaptersContent[id];

  useEffect(() => {
    if (id) markAsVisited(id);
  }, [id, markAsVisited]);

  if (!content) return <div className="text-white p-10">Chargement...</div>;

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen w-full bg-[#121212] overflow-hidden">
      
      {/* --- CÔTÉ GAUCHE : NARRATION ÉDITORIALE (Texte) --- */}
      {/* Correspond à la partie gauche de la maquette (Source 5) */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-1/2 h-1/2 md:h-full bg-[#121212] text-[#F1FAEE] p-8 md:p-16 flex flex-col justify-center relative z-10"
      >
        {/* Bouton Retour */}
        <button 
          onClick={() => router.push('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-[#457B9D] text-xs uppercase tracking-widest hover:text-[#E67E22] transition-colors"
        >
          <ArrowLeft size={16} /> Retour Constellation
        </button>

        <div className="max-w-lg mx-auto w-full">
          {/* TITRE OUTLINE (Style Maquette) */}
          <h1 className="text-5xl md:text-6xl font-black mb-2 text-outline tracking-wider uppercase">
            {content.title}
          </h1>

          {/* Métadonnées (Bleu) */}
          <p className="text-[#457B9D] text-sm font-bold mb-8">
            De Anonyme, 02-11-2025
          </p>
          
          {/* Contenu Texte */}
          <div className="prose prose-invert prose-lg text-[#F1FAEE]/90 font-serif leading-relaxed text-justify mb-10">
            <p>{content.text}</p>
            <p>
              Lorem ipsum dolor sit amet. Et aliquam atque ad iusto dignissimos qui ratione quos ea tempore harum ab repellat modi. 
              Rem fugiat officiis vel iusto doloribus ea recusandae amet.
            </p>
            <p>
              Qui aliquid quibusdam 33 harum voluptas ea dolor earum ea impedit rerum. Ut vero nesciunt sed iure itaque.
            </p>
          </div>

          {/* PLAYER AUDIO (Style Maquette : Barres bleues) */}
          <div className="mt-auto pt-6 border-t border-[#457B9D]/20">
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-[#457B9D] flex items-center justify-center text-[#121212] hover:bg-[#E67E22] transition-colors">
                <Play size={16} fill="currentColor" />
              </button>
              
              {/* Visualiseur Audio Animé (CSS pur) */}
              <div className="flex items-end gap-1 h-8 flex-1">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-[#457B9D] rounded-t-sm animate-pulse"
                    style={{ 
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.1}s` 
                    }} 
                  />
                ))}
              </div>
            </div>
            <p className="text-[#457B9D] text-xs mt-2 text-right">03:45 / 05:00</p>
          </div>
        </div>
      </motion.div>

      {/* --- CÔTÉ DROIT : RÉALITÉ BRUTE (Média) --- */}
      {/* Correspond à la photo/vidéo à droite (Source 5) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full md:w-1/2 h-1/2 md:h-full relative bg-gray-900 overflow-hidden"
      >
        {/* Filtre noir et blanc pour l'ambiance */}
        <div className="absolute inset-0 bg-black/20 z-10 mix-blend-overlay pointer-events-none" />
        
        {/* Image de fond (Placeholder ou vraie image) */}
        {/* Pour l'instant on simule une photo avec un div gris foncé ou une image locale si tu en as */}
        <div className="w-full h-full bg-[url('/assets/pluie.jpg')] bg-cover bg-center grayscale contrast-125">
             {/* Si pas d'image, ce dégradé fera l'affaire */}
             <div className="w-full h-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center">
                <span className="text-[#F1FAEE] opacity-20 text-4xl tracking-widest font-black uppercase rotate-90">
                  Immersion Visuelle
                </span>
             </div>
        </div>
      </motion.div>

    </div>
  );
}