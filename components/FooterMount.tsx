"use client";

import dynamic from "next/dynamic";
const FooterFromPen = dynamic(() => import("./FooterFromPen"), { ssr: false });

export default function FooterMount() {
  return <FooterFromPen />;
}
