import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { features } from "./config/features";

const HomePage = lazy(() => import("./pages/HomePage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const Layout = lazy(() => import("./components/Layout"));
const AddProblem = lazy(() => import("./pages/AddProblem"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const ContestList = lazy(() => import("./pages/ContestList"));
const ContestDetails = lazy(() => import("./pages/ContestDetails"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const MockInterviewPage = lazy(() => import("./pages/MockInterviewPage"));
const EditProblem = lazy(() => import("./pages/EditProblem"));
const SubmissionDetails = lazy(() => import("./pages/SubmissionDetails"));
const ProblemsList = lazy(() => import("./pages/ProblemsList"));

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  const pageFallback = (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-start  ">
      <Toaster />
      <Suspense fallback={pageFallback}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={authUser ? <HomePage /> : <LandingPage />}
            />
            <Route
              path="roadmap"
              element={
                authUser
                  ? (features.aiRoadmap ? <Roadmap /> : <Navigate to="/" />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="contests"
              element={
                authUser
                  ? (features.contests ? <ContestList /> : <Navigate to="/" />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="contest/:id"
              element={
                authUser
                  ? (features.contests ? <ContestDetails /> : <Navigate to="/" />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="leaderboard"
              element={
                authUser
                  ? (features.leaderboard ? <LeaderboardPage /> : <Navigate to="/" />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="mock-interview"
              element={authUser ? <MockInterviewPage /> : <Navigate to="/login" />}
            />
            <Route
              path="mock-interview/:id"
              element={authUser ? <MockInterviewPage /> : <Navigate to="/login" />}
            />
            <Route
              path="submission/:id"
              element={authUser ? <SubmissionDetails /> : <Navigate to="/login" />}
            />
            <Route
              path="problems"
              element={authUser ? <ProblemsList /> : <Navigate to="/login" />}
            />
          </Route>
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />

          <Route
            path="/problem/:id"
            element={authUser ? <ProblemPage /> : <Navigate to="/login" />}
          />
          <Route element={<AdminRoute />}>
            <Route
              path="/add-problem"
              element={authUser ? <AddProblem /> : <Navigate to="/login" />}
            />
            <Route
              path="/edit-problem/:id"
              element={authUser ? <EditProblem /> : <Navigate to="/login" />}
            />
          </Route>

          <Route
            path="/profile/:userId?"
            element={authUser ? <Profile /> : <Navigate to="/login" />}
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
