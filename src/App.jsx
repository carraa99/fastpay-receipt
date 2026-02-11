import { Routes, Route } from "react-router-dom";
import AgentReceipt from "./components/AgentReceipt";

function App() {
  return (
    <Routes>
      <Route path="/:fastPayOrderId" element={<AgentReceipt />} />
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500 text-lg">
              Please provide a FastPay Order ID in the URL, e.g.{" "}
              <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                /FP123456
              </code>
            </p>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
