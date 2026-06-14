

export function GraduationCapBg({ reduced }: { reduced?: boolean }) {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Animated gradient for the cap (static for reduced motion) */}
        <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3A52A6">
            {!reduced && (
              <animate
                attributeName="stop-color"
                values="#3A52A6;#5C76C4;#F8FAFC;#3A52A6"
                dur="8s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="50%" stopColor="#5C76C4">
            {!reduced && (
              <animate
                attributeName="stop-color"
                values="#5C76C4;#F8FAFC;#3A52A6;#5C76C4"
                dur="8s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor="#F8FAFC">
            {!reduced && (
              <animate
                attributeName="stop-color"
                values="#F8FAFC;#3A52A6;#5C76C4;#F8FAFC"
                dur="8s"
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>
        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Cap top (mortarboard) */}
      <polygon
        points="100,20 180,55 100,90 20,55"
        fill="url(#capGradient)"
        filter="url(#glow)"
        style={{ animation: "soft-pulse 4s ease-in-out infinite" }}
      />

      {/* Cap base/head part */}
      <ellipse cx="100" cy="85" rx="35" ry="30" fill="url(#capGradient)" opacity="0.8" />

      {/* Tassel string */}
      <path
        d="M100,55 Q115,70 110,100"
        stroke="url(#capGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      >
        {!reduced && (
          <animate
            attributeName="d"
            values="M100,55 Q115,70 110,100;M100,55 Q120,75 115,105;M100,55 Q115,70 110,100"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Tassel end */}
      <circle cx="110" cy="105" r="6" fill="url(#capGradient)">
        {!reduced && (
          <>
            <animate attributeName="cx" values="110;115;110" dur="3s" repeatCount="indefinite" />
            <animate attributeName="cy" values="105;110;105" dur="3s" repeatCount="indefinite" />
          </>
        )}
      </circle>
    </svg>
  )
}

export function GraduationCap3D({ reduced }: { reduced?: boolean }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Rich 3D Gradients */}
        <linearGradient id="boardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" /> {/* Blue-600 */}
          <stop offset="50%" stopColor="#3B82F6" /> {/* Blue-500 */}
          <stop offset="100%" stopColor="#1E40AF" /> {/* Blue-800 */}
        </linearGradient>
        
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" /> {/* Blue-900 (Darker for depth) */}
          <stop offset="100%" stopColor="#172554" /> {/* Blue-950 */}
        </linearGradient>

        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" /> {/* Blue-300 highlight */}
          <stop offset="50%" stopColor="#3B82F6" /> {/* Blue-500 */}
          <stop offset="100%" stopColor="#1E40AF" /> {/* Blue-800 shadow */}
        </linearGradient>

        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g transform="translate(200, 150) rotate(15)">
        {/* Skullcap (Base) */}
        <path 
          d="M-50,15 Q0,45 50,15 L50,0 Q0,30 -50,0 Z" 
          fill="#1E3A8A" 
          opacity="0.6"
        />

        {/* Mortarboard (Diamond Top) - 3D Perspective */}
        <path
          d="M0,-60 L130,0 L0,60 L-130,0 Z"
          fill="url(#boardGradient)"
          stroke="#3B82F6"
          strokeWidth="0.5"
        />
        
        {/* Mortarboard Edge (Thickness) */}
        <path
          d="M-130,0 L0,60 L130,0 L130,5 L0,65 L-130,5 Z"
          fill="url(#edgeGradient)"
        />

        {/* Central Button */}
        <circle cx="0" cy="0" r="6" fill="url(#accentGradient)" filter="url(#softGlow)" />

        {/* Tassel Cord - Animated Physics (static for reduced motion) */}
        <g>
           {!reduced && (
             <animateTransform
                attributeName="transform"
                type="rotate"
                values="-2 0 0; 2 0 0; -2 0 0"
                dur="4s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                opacity="0.7"
             />
           )}
           
           {/* String */}
           <path
            d="M0,0 Q30,20 60,60"
            fill="none"
            stroke="#1E40AF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
           />

           {/* Tassel Fringe */}
           <circle cx="60" cy="60" r="8" fill="url(#accentGradient)" />
           <path
            d="M55,65 L52,90 M60,68 L60,95 M65,65 L68,90"
            stroke="#1E40AF"
            strokeWidth="2"
            opacity="0.7"
           />
        </g>
      </g>
    </svg>
  )
}
