import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#06b6d4',
          borderRadius: '6px',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* QR-like pattern */}
          <rect x="2" y="2" width="3" height="3" fill="white" />
          <rect x="2" y="6" width="3" height="3" fill="white" />
          <rect x="6" y="2" width="3" height="3" fill="white" />
          <rect x="23" y="2" width="3" height="3" fill="white" />
          <rect x="23" y="6" width="3" height="3" fill="white" />
          <rect x="19" y="2" width="3" height="3" fill="white" />
          <rect x="2" y="19" width="3" height="3" fill="white" />
          <rect x="2" y="23" width="3" height="3" fill="white" />
          <rect x="6" y="23" width="3" height="3" fill="white" />

          {/* Center dots */}
          <rect x="11" y="11" width="2" height="2" fill="white" />
          <rect x="15" y="11" width="2" height="2" fill="white" />
          <rect x="11" y="15" width="2" height="2" fill="white" />
          <rect x="15" y="15" width="2" height="2" fill="white" />

          {/* Random dots */}
          <rect x="10" y="6" width="2" height="2" fill="white" />
          <rect x="14" y="2" width="2" height="2" fill="white" />
          <rect x="18" y="10" width="2" height="2" fill="white" />
          <rect x="10" y="18" width="2" height="2" fill="white" />
          <rect x="18" y="22" width="2" height="2" fill="white" />

          {/* Motorcycle wheel */}
          <circle cx="21" cy="21" r="4" fill="#ec4899" />
          <circle cx="21" cy="21" r="2" fill="#06b6d4" />
          <circle cx="21" cy="21" r="1" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
