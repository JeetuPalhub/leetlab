import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, User, Shield, Image, Edit2, Key, Camera, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import ProfileSubmission from "../components/ProfileSubmission";
import ProblemSolvedByUser from "../components/ProblemSolvedByUser";
import PlaylistProfile from "../components/PlaylistProfile";
import BookmarkedProblems from "../components/BookmarkedProblems";
import ContributionGraph from "../components/ContributionGraph";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

const Profile = () => {
  const { authUser, setAuthUser } = useAuthStore();

  // Modal states
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

  // Edit Profile Handler
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

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
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

  // Update Profile Image Handler
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

  // Load all users for admin
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

  // Change User Role Handler
  const handleChangeRole = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }
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

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-start py-6 md:py-10 px-2 md:px-8 w-full">
      {/* Header */}
      <div className="flex flex-row justify-between items-center w-full max-w-4xl mb-6 px-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="btn btn-circle btn-ghost btn-sm md:btn-md">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-primary">Profile</h1>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-2">
        {/* Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4 md:p-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              {/* Avatar with edit button */}
              <div className="relative">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-20 h-20 md:w-24 md:h-24 ring ring-primary ring-offset-base-100 ring-offset-2">
                    {authUser?.image ? (
                      <img src={authUser.image} alt={authUser.name} className="object-cover" />
                    ) : (
                      <span className="text-2xl md:text-3xl">{authUser?.name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="btn btn-circle btn-primary btn-xs absolute bottom-0 right-0"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              {/* Name and Role */}
              <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold">{authUser?.name}</h2>
                <div className="badge badge-primary mt-2">{authUser?.role}</div>
              </div>
            </div>

            <div className="divider"></div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="stat bg-base-200 rounded-box p-4">
                <div className="stat-figure text-primary"><Mail className="w-6 h-6 md:w-8 md:h-8" /></div>
                <div className="stat-title text-xs md:text-sm">Email</div>
                <div className="stat-value text-sm md:text-lg break-all">{authUser?.email}</div>
              </div>

              <div className="stat bg-base-200 rounded-box p-4">
                <div className="stat-figure text-primary"><User className="w-6 h-6 md:w-8 md:h-8" /></div>
                <div className="stat-title text-xs md:text-sm">User ID</div>
                <div className="stat-value text-xs break-all">{authUser?.id?.slice(0, 12)}...</div>
              </div>

              <div className="stat bg-base-200 rounded-box p-4">
                <div className="stat-figure text-primary"><Shield className="w-6 h-6 md:w-8 md:h-8" /></div>
                <div className="stat-title text-xs md:text-sm">Role</div>
                <div className="stat-value text-sm md:text-lg">{authUser?.role}</div>
                <div className="stat-desc text-xs">{authUser?.role === "ADMIN" ? "Full access" : "Limited access"}</div>
              </div>

              <div className="stat bg-base-200 rounded-box p-4">
                <div className="stat-figure text-primary"><Image className="w-6 h-6 md:w-8 md:h-8" /></div>
                <div className="stat-title text-xs md:text-sm">Profile Image</div>
                <div className="stat-value text-sm md:text-lg">{authUser?.image ? "Set" : "Not Set"}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card-actions justify-center md:justify-end mt-6 flex-wrap gap-2">
              <button onClick={() => setShowEditModal(true)} className="btn btn-outline btn-primary btn-sm md:btn-md">
                <Edit2 className="w-4 h-4 mr-1" /> Edit Profile
              </button>
              <button onClick={() => setShowPasswordModal(true)} className="btn btn-primary btn-sm md:btn-md">
                <Key className="w-4 h-4 mr-1" /> Change Password
              </button>
              {authUser?.role === "ADMIN" && (
                <button onClick={handleOpenRoleModal} className="btn btn-secondary btn-sm md:btn-md">
                  <Users className="w-4 h-4 mr-1" /> Manage Users
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submissions and other content */}
      <div className="w-full max-w-6xl mx-auto space-y-6 px-2 md:px-4 pb-8 mt-6">
        <ContributionGraph />
        <ProfileSubmission />
        <ProblemSolvedByUser />
        <BookmarkedProblems />
        <PlaylistProfile />
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Edit Profile</h3>
            <form onSubmit={handleEditProfile}>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Name</span></label>
                <input type="text" className="input input-bordered" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Email</span></label>
                <input type="email" className="input input-bordered" value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : "Save"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowEditModal(false)}></div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Current Password</span></label>
                <input type="password" className="input input-bordered" value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">New Password</span></label>
                <input type="password" className="input input-bordered" value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Confirm Password</span></label>
                <input type="password" className="input input-bordered" value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              </div>
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : "Change"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowPasswordModal(false)}></div>
        </div>
      )}

      {/* Update Image Modal */}
      {showImageModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Update Profile Picture</h3>
            <form onSubmit={handleUpdateImage}>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Image URL</span></label>
                <input type="url" className="input input-bordered" placeholder="https://example.com/image.jpg"
                  value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <label className="label"><span className="label-text-alt">Paste a URL to your profile picture</span></label>
              </div>
              {imageUrl && (
                <div className="mb-4">
                  <img src={imageUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover mx-auto"
                    onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              <div className="modal-action">
                <button type="button" className="btn" onClick={() => setShowImageModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : "Update"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowImageModal(false)}></div>
        </div>
      )}

      {/* Manage Users Modal (Admin) */}
      {showRoleModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Manage User Roles</h3>
            <div className="overflow-x-auto max-h-64">
              <table className="table table-zebra w-full">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Select</th></tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id} className={selectedUser === user.id ? "bg-primary/20" : ""}>
                      <td>{user.name}</td>
                      <td className="text-xs">{user.email}</td>
                      <td><span className={`badge ${user.role === 'ADMIN' ? 'badge-secondary' : 'badge-ghost'}`}>{user.role}</span></td>
                      <td>
                        <input type="radio" name="selectedUser" className="radio radio-primary radio-sm"
                          checked={selectedUser === user.id} onChange={() => setSelectedUser(user.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <select className="select select-bordered" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button className="btn btn-primary" onClick={handleChangeRole} disabled={loading || !selectedUser}>
                {loading ? <span className="loading loading-spinner"></span> : "Update Role"}
              </button>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowRoleModal(false)}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowRoleModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default Profile;