import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { peekedWorksScroll } from "../worksSession.js";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (pathname === "/works" && navigationType === "POP") {
      const y = peekedWorksScroll();
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, left: 0, behavior: "instant" });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, navigationType]);

  return null;
}
