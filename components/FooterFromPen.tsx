"use client";

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function FooterFromPen() {
  return (
    <div className="footer">
      <div className="coordinates-section">
        <p>48.7264&deg; N, 2.2770&deg; E</p>
      </div>
      <div className="links-section">
        <a
          href="https://www.instagram.com/antnstudio/"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
        >
          <InstagramIcon />
        </a>
        <a
          href="https://www.tiktok.com/@antnstudio"
          target="_blank"
          rel="noreferrer"
          aria-label="TikTok"
        >
          <TikTokIcon />
        </a>
      </div>
      <div className="info-section">
        <p>Est. 2025 &bull; antn.studio</p>
      </div>

      <style jsx>{`
        .footer {
          pointer-events: none;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          column-gap: 1rem;
          align-items: center;
          padding: 1.2rem;
          width: 100%;
          max-width: 100vw;
          box-sizing: border-box;
          color: #fff;
          font-size: 14px;
        }
        .coordinates-section,
        .info-section {
          font-family: "TheGoodMonolith", monospace;
          font-weight: 400;
        }
        .coordinates-section {
          grid-column: 1 / span 4;
          pointer-events: auto;
        }
        .coordinates-section p,
        .info-section p {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .links-section {
          grid-column: 5 / span 4;
          display: flex;
          justify-content: center;
          gap: 1rem;
          pointer-events: auto;
          font-family: "PP Neue Montreal", system-ui, sans-serif;
          font-size: 14px;
          font-weight: 700;
        }
        .links-section a {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          text-decoration: none;
          transition:
            color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            opacity 0.3s ease;
        }
        .links-section a:hover {
          opacity: 0.8;
        }
        .links-section a:active {
          opacity: 0.6;
        }
        .info-section {
          grid-column: 9 / span 4;
          text-align: right;
          pointer-events: auto;
        }
        @media (max-width: 900px) {
          .footer {
            grid-template-rows: auto auto auto;
          }
          .coordinates-section {
            grid-column: 1 / span 6;
          }
          .links-section {
            grid-column: 1 / span 12;
            order: 3;
            margin-top: 6px;
            justify-content: center;
            gap: 1.2rem;
          }
          .info-section {
            grid-column: 7 / span 6;
          }
        }
      `}</style>
    </div>
  );
}
