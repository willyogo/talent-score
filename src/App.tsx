import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import UserInfo from './components/UserInfo';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/:fid" element={<UserInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
