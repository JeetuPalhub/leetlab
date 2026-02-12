import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Trophy, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContestCard = ({ contest }) => {
    const isLive = new Date() >= new Date(contest.startTime) && new Date() <= new Date(contest.endTime);
    const isUpcoming = new Date() < new Date(contest.startTime);
    const isFinished = new Date() > new Date(contest.endTime);

    const getStatusColor = () => {
        if (isLive) return 'bg-success text-success-content';
        if (isUpcoming) return 'bg-primary text-primary-content';
        return 'bg-base-300 text-base-content opacity-70';
    };

    const getStatusLabel = () => {
        if (isLive) return 'Live Now';
        if (isUpcoming) return 'Upcoming';
        return 'Finished';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group card bg-base-200 border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-xl overflow-hidden"
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor()}`}>
                        {getStatusLabel()}
                    </span>
                    <div className="flex items-center gap-1 text-xs opacity-50">
                        <Users className="w-3.5 h-3.5" />
                        <span>{contest._count?.registrations || 0} registered</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">
                    {contest.title}
                </h3>
                <p className="text-sm opacity-60 line-clamp-2 mb-6 h-10">
                    {contest.description || "Join this competitive round to test your skills and climb the leaderboard."}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-base-300">
                            <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black opacity-30">Starts</p>
                            <p className="text-xs font-bold">{formatDate(contest.startTime)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-base-300">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black opacity-30">Problems</p>
                            <p className="text-xs font-bold">{contest._count?.problems || 0} Rounds</p>
                        </div>
                    </div>
                </div>

                <Link
                    to={`/contest/${contest.id}`}
                    className="btn btn-primary btn-block group-hover:shadow-[0_0_20px_rgba(var(--p),0.3)] transition-all"
                >
                    {isFinished ? 'View Leaderboard' : 'Enter Contest'}
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {isLive && (
                <div className="absolute top-0 right-0 p-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-success/20 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] font-bold text-success uppercase">Active</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ContestCard;
