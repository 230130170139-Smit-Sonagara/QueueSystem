import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Kiosk from './pages/Kiosk';
import TVDisplay from './pages/TVDisplay';
import AdminDashboard from './pages/AdminDashboard';
import AgentWindow from './pages/AgentWindow';
import LiveStatus from './pages/LiveStatus';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/kiosk" element={<Kiosk />} />
      <Route path="/tv" element={<TVDisplay />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/agent" element={<AgentWindow />} />
      <Route path="/status/:tokenId" element={<LiveStatus />} />
    </Routes>
  );
}

export default App;
