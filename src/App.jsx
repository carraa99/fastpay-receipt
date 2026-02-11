import { Routes, Route } from "react-router-dom";
import AgentReceipt from "./components/AgentReceipt";

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-gray-500 text-lg">Page not found</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/:fastPayOrderId" element={<AgentReceipt />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
