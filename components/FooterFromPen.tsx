"use client";

export default function FooterFromPen() {
  return (
    <footer className="footer">
      <div className="coordinates-section">
        <p>48.7264° N, 2.2770° E</p>
      </div>
      <div className="links-section">
        <a href="https://www.instagram.com/antnstudio/" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href="https://x.com/antnstudio" target="_blank" rel="noreferrer">
          X / Twitter
        </a>
        <a href="https://www.linkedin.com/in/antnstudio/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
      <div className="info-section">
        <p>Est. 2025 • antn.studio</p>
      </div>

      <style jsx>{`
        @import url('https://fonts.cdnfonts.com/css/thegoodmonolith');
        @import url('https://fonts.cdnfonts.com/css/pp-neue-montreal');
      
        :global(:root){
          --footer-dot: rgba(255,255,255,.08);
        }
        .footer{
          pointer-events: none;
          display:grid;
          grid-template-columns: repeat(12, 1fr);
          column-gap: 1rem;
          align-items:end;
          width:100%;
          padding: 1.2rem;
          color:#fff;
        }
        .coordinates-section,
        .info-section{
          font-family: "TheGoodMonolith", ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 400;
          font-size: 12px;
          letter-spacing: 0.01em;
          opacity:.95;
        }
        .coordinates-section{ grid-column: 1 / span 4; }
        .info-section{
          grid-column: 9 / span 4;
          text-align:right;
        }
        .links-section{
          grid-column: 5 / span 4;
          display:flex;
          justify-content:center;
          gap:1rem;
          pointer-events:auto;
        }
        .links-section a{
          position:relative;
          display:inline-block;
          font-family: "PP Neue Montreal", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          font-weight: 700; font-size: 13px; color: #fff;
          text-decoration:none; line-height: 1; padding: 2px 4px;
          transition: color .28s ease;
          mix-blend-mode: difference;
        }
        .links-section a::after{
          content:""; position:absolute; inset:0 auto 0 0; width:0;
          background:#fff; z-index:-1;
          transition: width .34s cubic-bezier(.34,1.56,.64,1);
        }
        .links-section a:hover{ color:#000; }
        .links-section a:hover::after{ width:100%; }
        @media (max-width: 900px){
          .coordinates-section{ grid-column: 1 / span 6; }
          .links-section{
            grid-column: 1 / span 12;
            order:3;
            justify-content:flex-start;
            margin-top:6px;
            gap:1.2rem;
          }
          .info-section{ grid-column: 7 / span 6; }
        }
      `}</style>
    </footer>
  );
}
