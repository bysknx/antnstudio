"use client";

export default function FooterFromPen() {
  return (
    <div className="footer">
      <div className="coordinates-section footer-pen-mono">
        <p>48.7264&deg; N, 2.2770&deg; E</p>
      </div>
      <div className="links-section">
        <a
          href="https://www.instagram.com/antnstudio/"
          target="_blank"
          rel="noreferrer"
        >
          Instagram
        </a>
        <a href="https://x.com/antnstudio" target="_blank" rel="noreferrer">
          X / Twitter
        </a>
        <a
          href="https://www.linkedin.com/in/antnstudio/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
      </div>
      <div className="info-section footer-pen-mono">
        <p>Est. 2025 &bull; antn.studio</p>
      </div>

      <style jsx>{`
        .footer {
          pointer-events: none;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          column-gap: 1rem;
          align-items: center;
          padding: 1.2rem 1.2rem 2rem;
          width: 100vw;
          color: #fff;
        }
        .coordinates-section {
          grid-column: 1 / span 4;
          pointer-events: auto;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        .links-section {
          grid-column: 5 / span 4;
          display: flex;
          justify-content: center;
          gap: 1rem;
          pointer-events: auto;
          font-family:
            "PP Neue Montreal",
            system-ui,
            -apple-system,
            "Segoe UI",
            sans-serif;
          font-size: 13px;
          font-weight: 600;
        }
        .links-section a {
          position: relative;
          color: #fff;
          text-decoration: none;
          mix-blend-mode: difference;
          transition: color 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .links-section a::after {
          content: "";
          position: absolute;
          inset: 0 0 0 auto;
          width: 0;
          background: #fff;
          z-index: -1;
          transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .links-section a:hover {
          color: #000;
        }
        .links-section a:hover::after {
          width: 100%;
        }
        .info-section {
          grid-column: 9 / span 4;
          text-align: right;
          pointer-events: auto;
          font-weight: 400;
          letter-spacing: 0.05em;
        }
        @media (max-width: 900px) {
          .coordinates-section {
            grid-column: 1 / span 6;
          }
          .links-section {
            grid-column: 1 / span 12;
            order: 3;
            margin-top: 6px;
            justify-content: flex-start;
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
