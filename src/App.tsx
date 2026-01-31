import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { BoardPage } from './pages/BoardPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChangelogPage } from './pages/ChangelogPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<AuthPage initialMode="signup" />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/auth" element={<AuthPage initialMode="signup" />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/space/:slug" element={<BoardPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

