import { useCallback, useEffect, useState } from "react";
import "./index.css";
import slidesfn from "./slides.ts" with { type: "macro" };
import clsx from "clsx";

const { buildDate, slides } = slidesfn();

function Slide({ children, show }: React.PropsWithChildren<{ show: boolean }>) {
  return (
    <div
      className={clsx(
        "absolute inset-0 flex flex-col items-center justify-center",
        show ? "opacity-100" : "opacity-0 pointer-events-none",
        "transition-opacity duration-500 ease-in-out"
      )}
    >
      {children}
    </div>
  );
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

  // Every 20 seconds, go to the next slide.
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [nextSlide]);

  // Every 5 minutes, check if the build date is newer and reload if so.
  useEffect(() => {
    const interval = setInterval(async () => {
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
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [buildDate]);

  return (
    <div className="relative w-screen h-screen bg-black">
      {slides.map((url, index) => (
        <Slide key={index} show={index === currentSlide}>
          <img
            src={url}
            alt={`Slide ${index + 1}`}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </Slide>
      ))}
    </div>
  );
}
