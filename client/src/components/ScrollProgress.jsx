import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    let frame = 0;

    function read() {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${value})`;
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(read);
    }

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="progress" aria-hidden="true">
      <span ref={barRef} />
    </div>
  );
}
