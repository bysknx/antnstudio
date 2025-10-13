"use client";

export default function FooterFromPen() {
  return (
    <footer className="footer-wrap">
      <div className="footer-grid">
        <div className="mono left">48.7264° N, 2.2770° E</div>
        <div className="links">
          <a href="https://www.instagram.com/antnstudio/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://x.com/antnstudio" target="_blank" rel="noreferrer">X / Twitter</a>
          <a href="https://www.linkedin.com/in/antnstudio/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
        <div className="mono right">Est. 2025 • antn.studio</div>
      </div>

      <style jsx>{`
        @import url('https://fonts.cdnfonts.com/css/thegoodmonolith');
        @import url('https://fonts.cdnfonts.com/css/pp-neue-montreal');
      
        :global(:root){
          --footer-dot: rgba(255,255,255,.08);
        }
        .footer-wrap{
          pointer-events:none; /* on laisse les liens cliquables via .links */
          padding: 10px 16px 14px;
          background: transparent;
        }
        .footer-grid{
          pointer-events: none;
          display:grid; grid-template-columns: repeat(12,1fr);
          align-items:end; gap: 1rem;
          width:100%;
        }
        .mono{
          font-family: "TheGoodMonolith", ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 400; font-size: 12px; letter-spacing: 0.01em;
          color:#fff; opacity:.95;
        }
        .left{ grid-column: 1 / span 4; }
        .right{ grid-column: 9 / span 4; text-align:right; }
        .links{
          grid-column: 5 / span 4;
          display:flex; justify-content:center; gap:1.2rem;
          pointer-events:auto; /* cliquable */
        }
        .links a{
          position:relative; display:inline-block;
          font-family: "PP Neue Montreal", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          font-weight: 700; font-size: 13px; color: #fff;
          text-decoration:none; line-height: 1; padding: 2px 4px;
          transition: color .28s ease;
          mix-blend-mode: normal;
        }
        /* fond blanc qui se déploie (gauche -> droite) et le texte devient noir progressivement */
        .links a::after{
          content:""; position:absolute; inset:0 auto 0 0; width:0;
          background:#fff; z-index:-1;
          transition: width .34s cubic-bezier(.34,1.56,.64,1);
        }
        .links a:hover{ color:#000; }
        .links a:hover::after{ width:100%; }
        @media (max-width: 900px){
          .left{ grid-column: 1 / span 6; }
          .links{ grid-column: 1 / span 12; order:3; margin-top:6px; }
          .right{ grid-column: 7 / span 6; text-align:right; }
        }
      `}</style>
    </footer>
  );
}
