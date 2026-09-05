import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MainView from "./views/MainView";
import CaregiverView from "./views/CaregiverView";

export default function App() {
  return (
    <BrowserRouter>
      <div className="size-full flex flex-col">
        {/* Minimal nav bar */}
        <nav className="flex-none h-10 flex items-center gap-6 px-4 bg-gray-950 border-b border-gray-800 text-xs">
          <span className="font-bold tracking-wider text-white">SWARA</span>
          <Link
            to="/"
            className="text-gray-400 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          >
            Communication
          </Link>
          <Link
            to="/caregiver"
            className="text-gray-400 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          >
            Caregiver View →
          </Link>
        </nav>

        <div className="flex-1 min-h-0">
          <Routes>
            <Route path="/" element={<MainView />} />
            <Route path="/caregiver" element={<CaregiverView />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
