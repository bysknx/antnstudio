"use client";
import React from "react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean; details?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, details: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Log minimal en console (diagnostic)
    // eslint-disable-next-line no-console
    console.error("[HeroBoundary] error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null; // on masque, le loader a déjà disparu
    }
    return this.props.children;
  }
}
