import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Report from "./pages/Report";
import Search from "./pages/Search";
import Track from "./pages/Track";
import ReportDetail from "./pages/ReportDetail";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Moderator from "./pages/Moderator";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Research from "./pages/Research";
import Awareness from "./pages/Awareness";
import ArticleDetail from "./pages/ArticleDetail";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/search" element={<Search />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:id" element={<ReportDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/moderator" element={<Moderator />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/research" element={<Research />} />
        <Route path="/awareness" element={<Awareness />} />
        <Route path="/awareness/:slug" element={<ArticleDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
