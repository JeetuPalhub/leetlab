import React, { useEffect, useState } from 'react';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { Link } from 'react-router-dom';
import {
  BookOpen, ChevronDown, ChevronUp, Clock, List, Tag,
  ExternalLink, Trash2, Plus, Play, Sparkles, Folder,
  ChevronRight, MoreVertical, LayoutGrid, ListIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PlaylistProfile = () => {
  const { getAllPlaylists, playlists, deletePlaylist, isLoading } = usePlaylistStore();
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    getAllPlaylists();
  }, [getAllPlaylists]);

  const togglePlaylist = (id) => {
    setExpandedPlaylist(expandedPlaylist === id ? null : id);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'text-emerald-500 bg-emerald-50';
      case 'MEDIUM': return 'text-amber-500 bg-amber-50';
      case 'HARD': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  if (isLoading && playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="loading loading-spinner text-blue-600"></span>
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Collections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Folder className="w-6 h-6 text-blue-500" /> Curated Playlists
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">Your Personal Archive</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Collection
          </button>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-300">
            <BookOpen className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No active collections</h3>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">Group problems to streamline your training regime</p>
          <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
            Initialize First Playlist
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "space-y-6"}>
          {playlists.map((playlist) => (
            <motion.div
              layout
              key={playlist.id}
              className={`bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden group hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 ${expandedPlaylist === playlist.id ? 'ring-4 ring-blue-600/5 border-blue-600/10' : ''
                }`}
            >
              <div className="p-8">
                {/* Item Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-900 flex items-center justify-center text-white shadow-xl shadow-gray-300">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{playlist.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                          <List className="w-3 h-3" /> {playlist.problems.length} Nodes
                        </span>
                        <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(playlist.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => deletePlaylist(playlist.id)} className="p-3 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => togglePlaylist(playlist.id)} className={`p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all ${expandedPlaylist === playlist.id ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-gray-900" />
                    </button>
                  </div>
                </div>

                {playlist.description && (
                  <p className="text-sm text-gray-500 font-bold mb-8 px-2 leading-relaxed">
                    {playlist.description}
                  </p>
                )}

                <AnimatePresence>
                  {expandedPlaylist === playlist.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-6 border-t border-gray-50"
                    >
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Problem Composition</h4>

                      {playlist.problems.length === 0 ? (
                        <div className="bg-gray-50 p-6 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-gray-400">Empty Collection Vector</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {playlist.problems.map((item) => (
                            <Link
                              key={item.id}
                              to={`/problem/${item.problem.id}`}
                              className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group/item"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover/item:text-blue-500 transition-colors">
                                  <Play className="w-3 h-3 fill-current" />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-gray-900">{item.problem.title}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${getDifficultyColor(item.problem.difficulty)}`}>
                                      {item.problem.difficulty}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover/item:text-gray-900 transition-all translate-x-0 group-hover/item:translate-x-1" />
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="pt-6 flex justify-end">
                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors">
                          <Plus className="w-4 h-4" /> Add Problems to collection
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistProfile;