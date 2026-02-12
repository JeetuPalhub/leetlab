import React, { useEffect, useState } from 'react';
import { X, Plus, Loader } from 'lucide-react';
import { usePlaylistStore } from '../store/usePlaylistStore';

const AddToPlaylistModal = ({ isOpen, onClose, problemId }) => {
  const { playlists, getAllPlaylists, addProblemToPlaylist, createPlaylist, isLoading } = usePlaylistStore();
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      getAllPlaylists();
      setShowCreateNew(false);
      setSelectedPlaylist('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showCreateNew) {
      if (!newPlaylistName.trim()) return;
      const playlist = await createPlaylist({ name: newPlaylistName, description: newPlaylistDescription });
      if (playlist) {
        await addProblemToPlaylist(playlist.id, [problemId]);
      }
    } else {
      if (!selectedPlaylist) return;
      await addProblemToPlaylist(selectedPlaylist, [problemId]);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h3 className="text-xl font-bold">Add to Playlist</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!showCreateNew ? (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Select Playlist</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedPlaylist}
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select a playlist</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center">
                <span className="text-sm text-base-content/50">or</span>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm w-full gap-2"
                onClick={() => setShowCreateNew(true)}
              >
                <Plus className="w-4 h-4" />
                Create New Playlist
              </button>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Playlist Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Enter description (optional)"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-link btn-xs"
                onClick={() => setShowCreateNew(false)}
              >
                Back to selection
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={(!selectedPlaylist && !showCreateNew) || (showCreateNew && !newPlaylistName) || isLoading}
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {showCreateNew ? 'Create & Add' : 'Add to Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;