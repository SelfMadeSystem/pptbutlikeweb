import { useCallback, useEffect, useRef, useState } from "react";
import "./index.css";
import slidesfn from "./slides.ts" with { type: "macro" };
import clsx from "clsx";
import PdfSlide from "./PdfSlide";

const { buildDate, slides } = slidesfn();

function SlideWrapper({
  children,
  show,
}: React.PropsWithChildren<{ show: boolean }>) {
  return (
    <div
      className={clsx(
        "absolute inset-0 flex flex-col items-center justify-center overflow-hidden",
        show ? "opacity-100" : "opacity-0 pointer-events-none",
        "transition-opacity duration-500 ease-in-out"
      )}
    >
      {children}
    </div>
  );
}

function Slide({
  url,
  show,
  onEnded,
}: {
  url: string;
  show: boolean;
  onEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) {
      if (!show) return;
      const timeout = setTimeout(() => {
        onEnded();
      }, 5000);
      return () => clearTimeout(timeout);
    }

    console.log({ v, show });

    if (!show) {
      v.pause();
      return;
    }

    v.currentTime = 0;
    v.play().catch((e) => {
      console.error("Error playing video:", e);
    });

    const handleEnded = () => {
      onEnded();
    };

    v.addEventListener("ended", handleEnded);
    return () => {
      v.pause();
      v.removeEventListener("ended", handleEnded);
    };
  }, [show]);
  if (/\.(png|jpe?g|gif|webp)$/i.test(url)) {
    return (
      <img
        src={url}
        alt="Slide"
        className="absolute inset-0 w-full h-full object-contain"
      />
    );
  } else if (/\.mp4$/i.test(url)) {
    return (
      <video
        ref={videoRef}
        src={url}
        className="absolute inset-0 w-full h-full object-contain"
        autoPlay
        muted
        playsInline
      />
    );
  } else if (/\.pdf$/i.test(url)) {
    return <PdfSlide url={url} />;
  } else {
    return <div className="text-white">Unsupported slide format: {url}</div>;
  }
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((s) => (s + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((s) => (s - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Handle keyboard events for navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    },
    [nextSlide, prevSlide]
  );

  // Attach the event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Every 5 minutes, check if the build date is newer and reload if so.
  useEffect(() => {
    const interval = setInterval(
      async () => {
        console.log("Checking for new build...");
        try {
          const res = await fetch("/build-date");
          if (res.ok) {
            const serverBuildDate = parseInt(await res.text(), 36);
            if (serverBuildDate > buildDate) {
              console.log("New build detected, reloading...");
              window.location.reload();
            }
          }
        } catch (e) {
          console.error("Error fetching build date:", e);
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [buildDate]);

  return (
    <div className="relative w-screen h-screen bg-black">
      {slides.map((url, index) => (
        <SlideWrapper key={index} show={index === currentSlide}>
          <Slide url={url} show={index === currentSlide} onEnded={nextSlide} />
        </SlideWrapper>
      ))}
    </div>
  );
}
