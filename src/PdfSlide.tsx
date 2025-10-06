import { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs" with { type: "file" };

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export default function PdfSlide({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 800,
    h: typeof window !== "undefined" ? window.innerHeight : 600,
  });
  const [pageSize, setPageSize] = useState<{ w: number; h: number } | null>(
    null
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setContainerSize({ w: cr.width, h: cr.height });
      }
    });

    ro.observe(el);
    // initialize
    setContainerSize({ w: el.clientWidth, h: el.clientHeight });

    return () => ro.disconnect();
  }, []);

  const handlePageLoad = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageSize({ w: viewport.width, h: viewport.height });
  };

  let renderWidth = containerSize.w;
  if (pageSize) {
    const scale = Math.min(
      containerSize.w / pageSize.w,
      containerSize.h / pageSize.h
    );
    renderWidth = Math.max(1, Math.floor(pageSize.w * scale));
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full flex items-center justify-center"
    >
      <div
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Document file={url} loading="Loading PDF...">
          <Page
            pageNumber={1}
            width={renderWidth}
            onLoadSuccess={handlePageLoad}
          />
        </Document>
      </div>
    </div>
  );
}
