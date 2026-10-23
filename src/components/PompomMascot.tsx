import React, { useState } from 'react';
import { playBoing, playCutePop } from '../utils/audio.ts';

interface PompomMascotProps {
  mood?: 'happy' | 'cheering' | 'water' | 'celebrate';
  size?: 'sm' | 'md' | 'lg';
  speechText?: string;
  interactiveMode?: 'butt' | 'tongue' | 'none';
  // Backward compatibility
  allowToggleBack?: boolean;
}

export const PompomMascot: React.FC<PompomMascotProps> = ({
  mood = 'happy',
  size = 'md',
  speechText,
  interactiveMode,
  allowToggleBack = false,
}) => {
  // Determine mode
  const effectiveMode: 'butt' | 'tongue' | 'none' =
    interactiveMode || (allowToggleBack ? 'butt' : 'none');

  const [isBack, setIsBack] = useState(false);
  const [isTongueOut, setIsTongueOut] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }[size];

  const handleClick = () => {
    if (effectiveMode === 'butt') {
      const next = !isBack;
      setIsBack(next);
      if (next) playBoing();
      else playCutePop();
    } else if (effectiveMode === 'tongue') {
      const next = !isTongueOut;
      setIsTongueOut(next);
      if (next) playBoing();
      else playCutePop();
    }
  };

  let currentSpeech = speechText;
  if (isBack) {
    currentSpeech = 'Oops! Olhou pro meu bumbunzinho! 🍮✨ (o clássico "x" do Purin!)';
  } else if (isTongueOut) {
    currentSpeech = 'Blep! 😋 Curtindo o ritmo e mostrando a linguinha!';
  }

  const isClickable = effectiveMode !== 'none';

  return (
    <div className="flex flex-col items-center justify-center select-none py-1 px-1">
      <div className="flex items-center gap-3 justify-center w-full">
        {/* Mascot Container */}
        <button
          type="button"
          onClick={handleClick}
          disabled={!isClickable}
          aria-label={
            effectiveMode === 'butt'
              ? isBack
                ? 'Pompompurin de costas mostrando o clássico bumbum com x. Clique para virar de frente'
                : 'Pompompurin de frente'
              : effectiveMode === 'tongue'
              ? isTongueOut
                ? 'Pompompurin com olhos fechados e mostrando a linguinha. Clique para abrir os olhos'
                : 'Pompompurin com olhos abertos. Clique para ele fechar os olhos e mostrar a linguinha'
              : 'Mascote Pompompurin'
          }
          className={`relative ${sizeClasses} flex-shrink-0 transition-transform duration-300 ${
            isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
          }`}
        >
          <svg
            viewBox="0 0 140 140"
            className={`w-full h-full drop-shadow-md transition-all duration-300 ${
              isBack || isTongueOut ? 'animate-pudding' : ''
            }`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left Floppy Ear */}
            <path
              d="M 28 42 C 16 48 10 70 18 84 C 24 94 36 92 40 80 C 44 68 40 46 28 42 Z"
              fill="#F6D55C"
              stroke="#7A4B29"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Right Floppy Ear */}
            <path
              d="M 112 42 C 124 48 130 70 122 84 C 116 94 104 92 100 80 C 96 68 100 46 112 42 Z"
              fill="#F6D55C"
              stroke="#7A4B29"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Chubby Round Body */}
            <ellipse
              cx="70"
              cy="76"
              rx="46"
              ry="42"
              fill="#FFE785"
              stroke="#7A4B29"
              strokeWidth="3.5"
            />

            {/* Brown Beret Hat */}
            <path
              d="M 46 36 C 46 24 94 24 94 36 C 94 42 46 42 46 36 Z"
              fill="#6B3E1F"
              stroke="#532F15"
              strokeWidth="2.5"
            />
            {/* Beret stalk */}
            <path
              d="M 70 24 L 70 17"
              stroke="#532F15"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* BACK VIEW (Hidden Easter Egg for Water tab) */}
            {isBack ? (
              <>
                <circle cx="44" cy="84" r="6" fill="#FFA5A5" opacity="0.6" />
                <circle cx="96" cy="84" r="6" fill="#FFA5A5" opacity="0.6" />

                {/* Wagging tail */}
                <path
                  d="M 64 64 C 62 55 76 52 78 62 C 80 70 70 72 64 64 Z"
                  fill="#F6D55C"
                  stroke="#7A4B29"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* THE CLASSIC 'x' / ASTERISK MARK */}
                <g stroke="#7A4B29" strokeWidth="3" strokeLinecap="round">
                  <line x1="65" y1="80" x2="75" y2="90" />
                  <line x1="75" y1="80" x2="65" y2="90" />
                  <line x1="70" y1="78" x2="70" y2="92" />
                  <line x1="63" y1="85" x2="77" y2="85" />
                </g>

                <ellipse cx="48" cy="112" rx="9" ry="6" fill="#F6D55C" stroke="#7A4B29" strokeWidth="2.5" />
                <ellipse cx="92" cy="112" rx="9" ry="6" fill="#F6D55C" stroke="#7A4B29" strokeWidth="2.5" />

                <g fill="#F59E0B">
                  <path d="M 28 66 L 30 70 L 34 71 L 30 73 L 28 77 L 27 73 L 23 71 L 27 70 Z" />
                  <path d="M 112 66 L 114 70 L 118 71 L 114 73 L 112 77 L 111 73 L 107 71 L 111 70 Z" />
                </g>
              </>
            ) : (
              /* FRONT VIEW */
              <>
                {/* Soft Rosy Cheeks */}
                <circle cx="44" cy="80" r="7" fill="#FFA5A5" opacity="0.65" />
                <circle cx="96" cy="80" r="7" fill="#FFA5A5" opacity="0.65" />

                {/* Eyes: closed happily when tongue is out OR celebrate mood */}
                {isTongueOut || mood === 'celebrate' || mood === 'cheering' ? (
                  <>
                    <path
                      d="M 47 70 Q 55 64 63 70"
                      stroke="#532F15"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 77 70 Q 85 64 93 70"
                      stroke="#532F15"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </>
                ) : (
                  <>
                    <circle cx="53" cy="69" r="4" fill="#532F15" />
                    <circle cx="87" cy="69" r="4" fill="#532F15" />
                  </>
                )}

                {/* Nose */}
                <circle cx="70" cy="74" r="3.2" fill="#532F15" />

                {/* Mouth & Tongue */}
                {isTongueOut ? (
                  <>
                    {/* Smiling mouth */}
                    <path
                      d="M 64 77 Q 70 82 76 77"
                      stroke="#532F15"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Cute pink tongue sticking out (blep!) */}
                    <path
                      d="M 66 78 C 66 86 74 86 74 78 Z"
                      fill="#FF85A2"
                      stroke="#7A4B29"
                      strokeWidth="2"
                    />
                    {/* Tongue crease */}
                    <path d="M 70 78 L 70 83" stroke="#D84A70" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ) : (
                  <path
                    d="M 64 78 Q 70 82 70 78 Q 70 82 76 78"
                    stroke="#532F15"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}

                {/* Tiny paws */}
                <ellipse cx="50" cy="110" rx="9" ry="6" fill="#F6D55C" stroke="#7A4B29" strokeWidth="2.5" />
                <ellipse cx="90" cy="110" rx="9" ry="6" fill="#F6D55C" stroke="#7A4B29" strokeWidth="2.5" />

                {/* Cute Pudding slice if mood is celebrate */}
                {mood === 'celebrate' && (
                  <g transform="translate(100, 84) scale(0.42)">
                    <path
                      d="M 10 35 L 20 10 L 60 10 L 70 35 Z"
                      fill="#FFEC9E"
                      stroke="#7A4B29"
                      strokeWidth="3"
                    />
                    <path
                      d="M 20 10 Q 40 8 60 10 Q 62 18 56 20 Q 50 16 42 21 Q 35 15 26 21 Z"
                      fill="#8C491F"
                    />
                    <circle cx="40" cy="5" r="7" fill="#E63946" />
                    <path d="M 42 2 Q 48 -5 54 -4" stroke="#4A2810" strokeWidth="2" fill="none" />
                  </g>
                )}

                {/* Water drop if mood is water */}
                {mood === 'water' && (
                  <g transform="translate(100, 84) scale(0.38)">
                    <path
                      d="M 25 5 C 25 5 5 28 5 40 C 5 55 18 65 30 65 C 42 65 55 55 55 40 C 55 28 25 5 25 5 Z"
                      fill="#60A5FA"
                      stroke="#1D4ED8"
                      strokeWidth="3"
                    />
                    <circle cx="32" cy="40" r="4" fill="#FFFFFF" opacity="0.8" />
                  </g>
                )}
              </>
            )}
          </svg>
        </button>

        {/* Speech Bubble */}
        {currentSpeech && (
          <div className="relative bg-white border-2 border-[#E7D6A5] text-[#5A3317] rounded-2xl px-3.5 py-2 shadow-xs text-xs sm:text-sm font-bold flex-1 max-w-[220px] text-left">
            <span className="block leading-snug">{currentSpeech}</span>
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-white"></div>
            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-[#E7D6A5] -z-10"></div>
          </div>
        )}
      </div>
    </div>
  );
};
