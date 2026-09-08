import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import About from "./pages/About.jsx";
import ArtworkDetail from "./pages/ArtworkDetail.jsx";
import Home from "./pages/Home.jsx";
import StudioArtwork from "./pages/studio/StudioArtwork.jsx";
import StudioLayout from "./pages/studio/StudioLayout.jsx";
import StudioMessages from "./pages/studio/StudioMessages.jsx";
import StudioWorks from "./pages/studio/StudioWorks.jsx";
import Works from "./pages/Works.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/studio" element={<StudioLayout />}>
        <Route index element={<StudioWorks />} />
        <Route path="messages" element={<StudioMessages />} />
        <Route path="new" element={<StudioArtwork />} />
        <Route path=":id" element={<StudioArtwork />} />
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:id" element={<ArtworkDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Navigate to="/works" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
