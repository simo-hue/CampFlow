import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 20,
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: 8, // Rounded corners like the app logo
                }}
            >
                {/* Lucide "Tent" icon SVG */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3.5 21 14 3" />
                    <path d="M20.5 21 10 3" />
                    <path d="M15.5 21 12 15l-3.5 6" />
                    <path d="M2 21h20" />
                </svg>
            </div>
        ),
        {
            // For convenience, we can re-use the exported dimensions structure
            ...size,
        }
    );
}
