import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import AllPlaylists from "./Pages/AllPlaylistpage/AllPlaylists";
// import UploadPage from "./Pages/uploadPage/UploadPage";
// import FullvideoView from "./Components/FullvideoView/FullvideoView";
// import UserChannel from "./Pages/userChannel/UserChannel";
// import ShortsPage from "./Pages/shortsPage/Shortspage";
// import PlaylistPage from "./Pages/PlaylistPage/PlaylistPage";
//Register && login
const RegisterPage = lazy(() => import("./Pages/Registerpage/RegisterPage"));
//Home
const HomePage = lazy(() => import("./Pages/HomePage/HomePage"));
//Shorts
const ShortsPage = lazy(() => import("./Pages/shortsPage/Shortspage"));
//History
const HistoryPage = lazy(() => import("./Pages/HistoryPage/HistoryPage"));
//upload
const UploadPage = lazy(() => import("./Pages/uploadPage/UploadPage"));
//userChannel
const UserChannel = lazy(() => import("./Pages/userChannel/UserChannel"));
//watchlater && liked videos && playlist
const PlaylistPage = lazy(() => import("./Pages/PlaylistPage/PlaylistPage"));
//fullvideo
const FullvideoView = lazy(() =>
  import("./Components/FullvideoView/FullvideoView")
);
const ResultPage = lazy(() => import("./Pages/ResultsPage/ResultsPage"));
//error
const ErrorPage = lazy(() => import("./Pages/ErrorPage/ErrorPage"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/Shorts" element={<ShortsPage />} />
          <Route path="/Subscriptions" element={<ShortsPage />} />
          <Route path="/You" element={<ShortsPage />} />
          <Route path="/Your Channel" element={<ShortsPage />} />
          <Route path="/History" element={<HistoryPage />} />
          <Route path="/Downloads" element={<ShortsPage />} />
          <Route path="/Your Channel" element={<ShortsPage />} />
          <Route path="/Playlist" element={<PlaylistPage />} />
          <Route path="/Playlists" element={<AllPlaylists/>} />
          <Route path="/:username" element={<UserChannel />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/result" element={<ResultPage/>} />
          <Route path="/watch/:id" element={<FullvideoView />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
