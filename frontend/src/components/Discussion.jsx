import React, { useState, useEffect } from 'react';
import { useCommentStore } from '../store/useCommentStore';
import { useAuthStore } from '../store/useAuthStore';
import { MessageSquare, Send, Trash2, Reply, ChevronDown, ChevronUp, Sparkles, User, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Discussion = ({ problemId }) => {
    const { comments, getComments, addComment, deleteComment, isLoading, pagination } = useCommentStore();
    const { authUser } = useAuthStore();
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");

    useEffect(() => {
        if (problemId) {
            getComments(problemId);
        }
    }, [problemId, getComments]);

    const handleLoadMore = () => {
        if (pagination.hasMore) {
            getComments(problemId, pagination.currentPage + 1, pagination.limit, true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        await addComment(problemId, newComment);
        setNewComment("");
    };

    const handleReply = async (parentId) => {
        if (!replyContent.trim()) return;
        await addComment(problemId, replyContent, parentId);
        setReplyContent("");
        setReplyTo(null);
    };

    const CommentItem = ({ comment, isReply = false }) => (
        <motion.div
            initial={{ opacity: 0, x: isReply ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group p-6 ${isReply ? 'ml-12 bg-white/5' : 'bg-[#252525]'} rounded-[1.5rem] mb-4 border border-white/5 hover:border-white/10 transition-all shadow-sm`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={comment.user.image || "https://avatar.iran.liara.run/public/boy"}
                            alt="Avatar"
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/10"
                        />
                        {comment.user.role === 'ADMIN' && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 shadow-lg">
                                <Sparkles className="w-2.5 h-2.5 text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-gray-200">{comment.user.name}</span>
                            {comment.user.role === 'ADMIN' && (
                                <span className="text-[10px] font-black uppercase text-yellow-500/80 tracking-tighter">Admin</span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
                {(authUser?.id === comment.userId || authUser?.role === 'ADMIN') && (
                    <button
                        onClick={() => deleteComment(comment.id, problemId)}
                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <p className="text-sm leading-relaxed text-gray-400 mb-4">{comment.content}</p>

            {!isReply && (
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${replyTo === comment.id ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Reply className="w-3.5 h-3.5" />
                        Reply
                    </button>
                </div>
            )}

            <AnimatePresence>
                {replyTo === comment.id && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 flex gap-3 overflow-hidden"
                    >
                        <div className="flex-1 bg-[#1a1a1a] p-1 rounded-xl border border-white/5">
                            <input
                                type="text"
                                placeholder="Write a reply..."
                                className="w-full bg-transparent px-4 py-2.5 text-xs text-gray-300 outline-none"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={() => handleReply(comment.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-6 space-y-4">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} isReply={true} />
                    ))}
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="p-4 bg-[#1a1a1a] min-h-full">
            <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                <div>
                    <h3 className="text-2xl font-black text-gray-100 flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-blue-500" />
                        Discussion
                    </h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                        {pagination?.totalComments || 0} Thoughts Shared
                    </p>
                </div>
            </div>

            {/* Post Comment Input */}
            {authUser ? (
                <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="mb-12 bg-[#252525] p-6 rounded-[2rem] border border-blue-500/20 shadow-xl shadow-blue-500/5"
                >
                    <div className="flex gap-4">
                        <img
                            src={authUser.image || "https://avatar.iran.liara.run/public/boy"}
                            alt="Me"
                            className="w-12 h-12 rounded-xl object-cover ring-4 ring-[#1a1a1a]"
                        />
                        <div className="flex-1 space-y-4">
                            <textarea
                                className="w-full bg-[#1a1a1a] text-gray-200 rounded-2xl p-4 min-h-[100px] outline-none border-2 border-transparent focus:border-blue-500/50 transition-all text-sm resize-none"
                                placeholder="Share your insights with the community..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                                    <Plus className="w-4 h-4" />
                                    Publish Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.form>
            ) : (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-6 rounded-[2rem] text-center mb-12">
                    <p className="font-bold">Join the community to comment</p>
                    <p className="text-xs opacity-60 mt-1 uppercase tracking-widest">Sign in required</p>
                </div>
            )}

            {/* Comments List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
                    <span className="loading loading-spinner loading-lg text-blue-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing feed...</span>
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-2">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}

                    {/* Load More Button */}
                    {pagination.hasMore && (
                        <div className="flex justify-center mt-8 pb-8">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className={`btn rounded-2xl px-12 h-16 border-0 bg-gray-900 text-white font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 ${isLoading ? 'loading' : ''}`}
                            >
                                {isLoading ? 'Synchronizing more nodes...' : 'Discover older thoughts'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center p-20 bg-white/5 rounded-[3rem] border-4 border-dashed border-white/5">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-gray-700" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No discussions yet</p>
                    <p className="text-xs text-gray-600 mt-2">Be the first to share your approach!</p>
                </div>
            )}
        </div>
    );
};

export default Discussion;
