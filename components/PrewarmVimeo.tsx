"use client";
import { useEffect } from "react";
export default function PrewarmVimeo() {
  useEffect(() => {
    fetch("/api/vimeo", { cache: "no-store" }).catch(() => {});
  }, []);
  return null;
}
