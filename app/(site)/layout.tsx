import LoadingAscii from "@/components/LoadingAscii";
import ChromeFrame from "@/components/ChromeFrame";
import FooterMount from "@/components/FooterMount";
import { VideoDataProvider } from "@/components/VideoDataProvider";
import Header from "../header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoadingAscii />
      <Header />
      <VideoDataProvider>
        <ChromeFrame>{children}</ChromeFrame>
      </VideoDataProvider>
      <FooterMount />
    </>
  );
}
