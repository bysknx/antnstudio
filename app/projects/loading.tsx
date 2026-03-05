// Affiché immédiatement pendant le chargement de la page projects (RSC + données)
export default function ProjectsLoading() {
  return (
    <div className="min-h-[80svh] flex items-center justify-center bg-[#0b0b0b]">
      <div className="font-mono text-white/30 text-xs uppercase tracking-widest animate-pulse">
        Loading
      </div>
    </div>
  );
}
