import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Mail, User, Shield, Image, Edit2, Key, Camera, Users,
  Trophy, Star, Activity, BookOpen, Clock, ChevronRight, CheckCircle2,
  Target, Sparkles, Zap, Flame, Calendar
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import ProfileSubmission from "../components/ProfileSubmission";
import ProblemSolvedByUser from "../components/ProblemSolvedByUser";
import PlaylistProfile from "../components/PlaylistProfile";
import BookmarkedProblems from "../components/BookmarkedProblems";
import ContributionGraph from "../components/ContributionGraph";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const { authUser, setAuthUser, profileData, getProfileData, isProfileLoading } = useAuthStore();
  const { userId } = useParams();
  const [activeView, setActiveView] = useState("dashboard");

  // Modal states
  // ... (keeping other states)
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Form states
  const [editForm, setEditForm] = useState({ name: authUser?.name || "", email: authUser?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [imageUrl, setImageUrl] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("USER");
  const [loading, setLoading] = useState(false);

  const isOwnProfile = !userId || userId === authUser?.id;
  const displayUser = isOwnProfile ? authUser : profileData?.user;

  useEffect(() => {
    getProfileData(userId);
  }, [getProfileData, userId]);

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.put("/user/profile", editForm);
      setAuthUser(res.data.user);
      toast.success("Profile updated successfully!");
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.put("/user/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateImage = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.put("/user/image", { imageUrl });
      setAuthUser(res.data.user);
      toast.success("Profile image updated!");
      setShowImageModal(false);
      setImageUrl("");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update image");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoleModal = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/user/all");
      setAllUsers(res.data.users);
      setShowRoleModal(true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await axiosInstance.put("/user/role", { userId: selectedUser, newRole });
      toast.success("User role updated!");
      const res = await axiosInstance.get("/user/all");
      setAllUsers(res.data.users);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to change role");
    } finally {
      setLoading(false);
    }
  };

  if (isProfileLoading && !profileData) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
        <p className="mt-4 text-gray-500 font-black uppercase tracking-widest text-xs">Authenticating Profile...</p>
      </div>
    );
  }

  const sections = [
    { id: "dashboard", label: "Overview", icon: Activity },
    { id: "submissions", label: "History", icon: Clock },
    { id: "playlists", label: "Playlists", icon: BookOpen },
    { id: "settings", label: "Security", icon: Key },
  ];

  const stats = profileData?.stats || { totalSolved: 0, EASY: 0, MEDIUM: 0, HARD: 0 };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
          <div className="absolute top-40 right-10 w-64 h-64 bg-emerald-500 rounded-full blur-[80px]" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-12">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">SECURE SESSION</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* Profile Identity Section */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:p-12 mb-10 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden bg-gray-100 ring-[8px] ring-gray-900/5 group-hover:ring-blue-600/10 transition-all duration-500">
                {displayUser?.image ? (
                  <img src={displayUser.image} alt={displayUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-5xl font-black">
                    {displayUser?.name?.charAt(0)}
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-black text-gray-900">{displayUser?.name}</h1>
                <span className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {displayUser?.role}
                </span>
              </div>
              <p className="text-gray-500 font-bold flex items-center justify-center lg:justify-start gap-2 mb-6">
                <Mail className="w-4 h-4 text-blue-500" /> {displayUser?.email}
              </p>

              {isOwnProfile && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <button onClick={() => setShowEditModal(true)} className="bg-gray-50 hover:bg-white text-gray-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-transparent hover:border-gray-900 transition-all">
                    Update Profile
                  </button>
                  {authUser?.role === "ADMIN" && (
                    <button onClick={handleOpenRoleModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-200">
                      Manage Ecosystem
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-6">
              {[
                { label: 'Solved', value: stats.totalSolved || 0, icon: Target, color: 'blue' },
                { label: 'Rank', value: '#1,240', icon: Trophy, color: 'yellow' },
                { label: 'Streak', value: '4', icon: Flame, color: 'orange' },
                { label: 'Level', value: '12', icon: Star, color: 'purple' }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 px-6 py-4 rounded-3xl text-center min-w-[120px]">
                  <item.icon className={`w-5 h-5 mx-auto mb-2 text-${item.color}-500`} />
                  <div className="text-xl font-black text-gray-900">{item.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveView(section.id)}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeView === section.id
                ? "bg-gray-900 text-white shadow-2xl shadow-gray-400"
                : "bg-white text-gray-400 hover:text-gray-900 border border-gray-100"
                }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Mastery Distribution */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col justify-center">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" /> Solve Distribution
                  </h3>
                  <div className="space-y-8">
                    {[
                      { label: 'Easy', value: stats.EASY, total: 500, color: 'bg-emerald-500', text: 'text-emerald-500' },
                      { label: 'Medium', value: stats.MEDIUM, total: 300, color: 'bg-yellow-500', text: 'text-yellow-500' },
                      { label: 'Hard', value: stats.HARD, total: 100, color: 'bg-red-500', text: 'text-red-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.text}`}>{item.label}</span>
                          <span className="text-sm font-black text-gray-900">{item.value}<span className="text-gray-300 font-bold ml-1">/ {item.total}</span></span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / item.total) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.2 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="xl:col-span-2 space-y-10">
                  <ContributionGraph userId={userId} />
                </div>
              </div>

              {/* Recent Masteries */}
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-xl font-black mb-0 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" /> Recent Masteries
                  </h3>
                </div>
                <div className="p-8">
                  <ProblemSolvedByUser userId={userId} />
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <Clock className="w-6 h-6 text-blue-500" /> Recent Activity
                  </h3>
                  <button onClick={() => setActiveView('submissions')} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors">
                    Full History
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {profileData?.recentSubmissions?.length > 0 ? (
                    profileData.recentSubmissions.map((sub, idx) => (
                      <div key={idx} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${sub.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {sub.status === 'Accepted' ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{sub.problem.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-[10px] font-black uppercase tracking-tighter ${sub.problem.difficulty === 'EASY' ? 'text-emerald-500' : sub.problem.difficulty === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                {sub.problem.difficulty}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(sub.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border ${sub.status === 'Accepted' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-50' : 'border-red-500/20 text-red-600 bg-red-50'
                          }`}>
                          {sub.status}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center">
                      <p className="text-gray-400 font-bold uppercase tracking-widest">No recent code uploads found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === "submissions" && (
            <motion.div
              key="submissions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ProfileSubmission userId={userId} />
            </motion.div>
          )}

          {activeView === "playlists" && (
            <motion.div
              key="playlists"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <PlaylistProfile />
              <BookmarkedProblems />
            </motion.div>
          )}

          {activeView === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <Key className="w-5 h-5 text-purple-500" /> Account Security
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-gray-900">Access Key Password</h4>
                      <p className="text-xs text-gray-500 font-bold uppercase mt-1">Last changed 2 months ago</p>
                    </div>
                    <button onClick={() => setShowPasswordModal(true)} className="bg-white border-2 border-gray-200 hover:border-gray-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                      Update
                    </button>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-gray-900">Role & Access Matrix</h4>
                      <p className="text-xs text-gray-500 font-bold uppercase mt-1">Current Permission: {authUser?.role}</p>
                    </div>
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100">
                <h3 className="text-lg font-black text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-500 font-bold mb-6">Deactivating your account will permanently purge all solve history and playlist data.</p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-200">
                  Deactivate Core Identity
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals - Reusing existing high-fidelity logic */}
      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">Edit Profile</h3>
            <form onSubmit={handleEditProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Identity Name</label>
                <input type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 font-bold outline-none transition-all" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Communication Email</label>
                <input type="email" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 font-bold outline-none transition-all" value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" className="flex-1 bg-gray-50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest" onClick={() => setShowEditModal(false)}>Recall</button>
                <button type="submit" className="flex-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : "Confirm Update"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
        </div>
      )}

      {/* Other modals omitted for brevity, keeping only the logic that was already high-quality */}
      {showPasswordModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">Update Access Key</h3>
            <form onSubmit={handleChangePassword} className="space-y-6">
              {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                <div key={field} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input type="password" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 font-bold outline-none transition-all"
                    value={passwordForm[field]} onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })} />
                </div>
              ))}
              <div className="flex gap-4 pt-4">
                <button type="button" className="flex-1 bg-gray-50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest" onClick={() => setShowPasswordModal(false)}>Abort</button>
                <button type="submit" className="flex-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : "Save New Key"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}></div>
        </div>
      )}

      {/* Update Image Modal */}
      {showImageModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">Update Avatar Source</h3>
            <form onSubmit={handleUpdateImage} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Public Image URL</label>
                <div className="bg-gray-900 p-1 rounded-2xl flex items-center">
                  <input type="url" className="flex-1 bg-transparent text-white px-6 py-4 font-mono text-xs outline-none" placeholder="https://..."
                    value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                  <button type="submit" className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-500/20" disabled={loading}>
                    <Zap className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {imageUrl && (
                <div className="relative group mx-auto w-32 h-32">
                  <img src={imageUrl} alt="Preview" className="w-full h-full rounded-2xl object-cover ring-4 ring-blue-500/20"
                    onError={(e) => e.target.style.display = 'none'} />
                  <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-100 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              )}
              <button type="button" className="w-full bg-gray-50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest" onClick={() => setShowImageModal(false)}>Close</button>
            </form>
          </div>
          <div className="modal-backdrop bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowImageModal(false)}></div>
        </div>
      )}

      {/* Role Manager */}
      {showRoleModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">Access Level Management</h3>
            <div className="bg-gray-50 rounded-[2rem] overflow-hidden mb-8 border border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100"><th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest">User Identity</th><th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-right">Matrix Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      className={`cursor-pointer transition-colors ${selectedUser === user.id ? "bg-blue-600/5" : "hover:bg-gray-100"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-black text-gray-900">{user.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${user.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{user.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4">
              <select className="flex-1 bg-gray-900 text-white rounded-2xl px-6 py-4 font-black text-xs outline-none appearance-none cursor-pointer" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="USER">Standard Node (USER)</option>
                <option value="ADMIN">Root Access (ADMIN)</option>
              </select>
              <button onClick={handleChangeRole} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200" disabled={loading || !selectedUser}>
                Execute Level Update
              </button>
            </div>
            <button className="w-full mt-6 bg-gray-50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest" onClick={() => setShowRoleModal(false)}>Close Interface</button>
          </div>
          <div className="modal-backdrop bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowRoleModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default Profile;