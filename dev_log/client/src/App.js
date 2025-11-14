import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import CreatePostForm from './components/CreatePostForm';
import PostDetails from "./pages/PostDetails";
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/auth';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/create-post" element={<CreatePostForm />} />
        <Route path="/posts/:id" element={<PostDetails />} /> {/* Fix: Changed /post to /posts */}
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfile/>} />

      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;