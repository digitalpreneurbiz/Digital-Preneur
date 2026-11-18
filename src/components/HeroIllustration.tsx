import React from 'react';

export const HeroIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Isometric room/counter floor */}
      <path
        d="M120 176L28 124L120 72L212 124L120 176Z"
        fill="#E9EFEA"
      />
      <path
        d="M120 176L28 124V132L120 184L212 132V124L120 176Z"
        fill="#C9D8D2"
      />
      {/* Back isometric walls */}
      <path
        d="M28 124V46L120 -6V72L28 124Z"
        fill="#B6CEC7"
        fillOpacity="0.45"
      />
      <path
        d="M120 72V-6L212 46V124L120 72Z"
        fill="#99BCB3"
        fillOpacity="0.35"
      />
      {/* Wall window highlight */}
      <path
        d="M144 36L184 58V94L144 72V36Z"
        fill="#FFFFFF"
        fillOpacity="0.55"
      />

      {/* Cashier Counter Desk */}
      <path
        d="M66 118L128 83L174 109L112 144L66 118Z"
        fill="#F8FAF8"
      />
      <path
        d="M66 118L112 144V166L66 140V118Z"
        fill="#D6E4DF"
      />
      <path
        d="M112 144L174 109V131L112 166V144Z"
        fill="#8BB5AA"
      />
      {/* Counter accent stripe */}
      <path
        d="M112 150L174 115V120L112 155V150Z"
        fill="#14534B"
      />

      {/* POS Terminal / Monitor on Desk */}
      <path
        d="M104 98L124 87L136 94L116 105L104 98Z"
        fill="#1E3A36"
      />
      {/* Screen */}
      <path
        d="M108 72L134 57V84L108 99V72Z"
        fill="#0F2D29"
      />
      <path
        d="M111 74L131 62V82L111 94V74Z"
        fill="#44B89B"
      />
      {/* Screen UI lines */}
      <path d="M114 77L127 69" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M114 83L123 78" stroke="#D1FAE5" strokeWidth="2" strokeLinecap="round" />

      {/* Thermal Receipt Paper popping out */}
      <path
        d="M138 78L152 70V92L138 100V78Z"
        fill="#FFFFFF"
      />
      <path d="M141 81L149 76" stroke="#14534B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M141 86L147 82" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M141 91L149 86" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Gold Coin Stack (Financial Ledger accent) */}
      <ellipse cx="88" cy="116" rx="10" ry="5.5" fill="#D97706" />
      <rect x="78" y="111" width="20" height="5" fill="#D97706" />
      <ellipse cx="88" cy="111" rx="10" ry="5.5" fill="#F59E0B" />
      <rect x="78" y="106" width="20" height="5" fill="#F59E0B" />
      <ellipse cx="88" cy="106" rx="10" ry="5.5" fill="#FBBF24" />

      {/* Floating Ledger Card */}
      <g transform="translate(52 44)">
        <rect x="0" y="0" width="44" height="30" rx="6" fill="#FFFFFF" fillOpacity="0.95" />
        <rect x="6" y="7" width="16" height="4" rx="2" fill="#14534B" />
        <rect x="6" y="15" width="28" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="6" y="21" width="20" height="3" rx="1.5" fill="#CBD5E1" />
      </g>

      {/* Small decorative potted plant on floor */}
      <path d="M174 128L186 128L184 140L176 140Z" fill="#B45309" />
      <ellipse cx="180" cy="128" rx="6" ry="2.5" fill="#92400E" />
      <path d="M180 128C176 118 172 114 176 108C180 112 182 120 180 128Z" fill="#2A8C7D" />
      <path d="M180 128C184 118 190 115 186 109C182 112 180 120 180 128Z" fill="#1E6B5F" />
    </svg>
  );
};
