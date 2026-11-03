import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";

import DictationPage from "./components/Dictation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dictation" element={<DictationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
