import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ImportPage from "@/pages/ImportPage";
import BenchmarkPage from "@/pages/BenchmarkPage";
import EditorPage from "@/pages/EditorPage";
import SubtitlesPage from "@/pages/SubtitlesPage";
import MaterialsPage from "@/pages/MaterialsPage";
import ExportPage from "@/pages/ExportPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ImportPage />} />
        <Route path="/benchmark" element={<BenchmarkPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/subtitles" element={<SubtitlesPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/export" element={<ExportPage />} />
      </Routes>
    </Router>
  );
}
