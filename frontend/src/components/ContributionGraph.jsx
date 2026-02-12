import React, { useEffect, useState, useMemo } from 'react';
import { useSubmissionStore } from '../store/useSubmissionStore';
import { Calendar, TrendingUp, Flame, Award, ChevronRight, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ContributionGraph = ({ userId }) => {
    const { submissions, getAllSubmissions } = useSubmissionStore();
    const [hoveredDay, setHoveredDay] = useState(null);

    useEffect(() => {
        getAllSubmissions(userId);
    }, [getAllSubmissions, userId]);

    const safeGetDate = (dateStr) => {
        try {
            if (!dateStr) return null;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return null;
            return d.toISOString().split('T')[0];
        } catch {
            return null;
        }
    };

    // Generate contribution data from submissions
    const contributionData = useMemo(() => {
        try {
            const data = {};
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);

            for (let i = 364; i >= 0; i--) {
                const date = new Date(todayMidnight);
                date.setDate(date.getDate() - i);
                const key = safeGetDate(date);
                if (key) {
                    data[key] = { count: 0, accepted: 0, date: key };
                }
            }

            if (Array.isArray(submissions)) {
                submissions.forEach((sub) => {
                    const date = safeGetDate(sub.createdAt);
                    if (date && data[date]) {
                        data[date].count++;
                        if (sub.status === 'Accepted') {
                            data[date].accepted++;
                        }
                    }
                });
            }

            return data;
        } catch (e) {
            console.error("Error in contributionData useMemo:", e);
            return {};
        }
    }, [submissions]);

    // Calculate stats
    const stats = useMemo(() => {
        const defaultStats = { accepted: 0, total: 0, activeDays: 0, streak: 0 };
        if (!Array.isArray(submissions) || !contributionData) {
            return defaultStats;
        }

        try {
            const accepted = submissions.filter(s => s && s.status === 'Accepted').length;
            const total = submissions.length;
            const activeDays = Object.values(contributionData).filter(d => d && d.count > 0).length;

            let streak = 0;
            const today = safeGetDate(new Date());
            const dates = Object.keys(contributionData).sort().reverse();

            for (const date of dates) {
                const dayData = contributionData[date];
                if (dayData && dayData.count > 0) {
                    streak++;
                } else if (date !== today) {
                    break;
                }
            }

            return { accepted, total, activeDays, streak };
        } catch (error) {
            console.error("Error calculating stats:", error);
            return defaultStats;
        }
    }, [submissions, contributionData]);

    // Generate weeks for the graph (last 52 weeks)
    const weeks = useMemo(() => {
        try {
            const result = [];
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);

            for (let w = 51; w >= 0; w--) {
                const week = [];
                for (let d = 0; d < 7; d++) {
                    const date = new Date(todayMidnight);
                    date.setDate(date.getDate() - (w * 7 + (6 - d)));
                    const key = safeGetDate(date);
                    const dayData = (key && contributionData[key]) || { count: 0, accepted: 0, date: key || 'Invalid Date' };
                    week.push({
                        ...dayData,
                        dayOfWeek: date.getDay(),
                    });
                }
                result.push(week);
            }
            return result;
        } catch (e) {
            console.error("Error in weeks useMemo:", e);
            return [];
        }
    }, [contributionData]);

    const getColor = (count) => {
        if (count === 0) return 'bg-gray-100';
        if (count < 2) return 'bg-emerald-200';
        if (count < 4) return 'bg-emerald-400';
        if (count < 6) return 'bg-emerald-600';
        return 'bg-emerald-800';
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    try {
        return (
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-blue-500" /> Pulse Graph
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Annual Activity Vector</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase text-gray-900">{stats.streak || 0} Day Streak</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'Total Logs', value: stats.total || 0, icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { label: 'Accepted', value: stats.accepted || 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { label: 'Max Streak', value: stats.streak || 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
                            { label: 'Active Days', value: stats.activeDays || 0, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' }
                        ].map((item, i) => (
                            <div key={i} className={`${item.bg} px-6 py-4 rounded-3xl border border-white shadow-sm`}>
                                <item.icon className={`w-4 h-4 mb-2 ${item.color}`} />
                                <div className="text-lg font-black text-gray-900">{item.value}</div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Graph Area */}
                    <div className="overflow-x-auto no-scrollbar pb-6">
                        <div className="inline-block min-w-max">
                            <div className="flex gap-1 mb-2 ml-10">
                                {months.map((month, i) => (
                                    <span key={i} className="w-10 text-[9px] font-black uppercase text-gray-300">{month}</span>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <div className="flex flex-col gap-1 text-[9px] font-black uppercase text-gray-300 pr-2 text-right w-8">
                                    <span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span>
                                </div>

                                <div className="flex gap-1.5">
                                    {weeks.map((week, wi) => (
                                        <div key={wi} className="flex flex-col gap-1.5">
                                            {week.map((day, di) => (
                                                <motion.div
                                                    key={`${wi}-${di}`}
                                                    whileHover={{ scale: 1.4, zIndex: 10 }}
                                                    className={`w-3.5 h-3.5 rounded-md ${getColor(day?.count || 0)} cursor-crosshair transition-all shadow-sm`}
                                                    onMouseEnter={() => setHoveredDay(day)}
                                                    onMouseLeave={() => setHoveredDay(null)}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-gray-400">Activity Level</span>
                            <div className="flex items-center gap-1">
                                <div className="w-2.5 h-2.5 rounded-sm bg-gray-100" />
                                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200" />
                                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800" />
                            </div>
                        </div>

                        <AnimatePresence>
                            {hoveredDay && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-xl flex items-center gap-3"
                                >
                                    <span className="text-[10px] font-black text-blue-400">{hoveredDay.date}</span>
                                    <div className="w-px h-3 bg-white/20" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{hoveredDay.count || 0} Submissions</span>
                                    {(hoveredDay.accepted || 0) > 0 && (
                                        <span className="text-[10px] font-black text-emerald-400 tracking-tighter">({hoveredDay.accepted} Accepted)</span>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Critical error rendering ContributionGraph:", error);
        return (
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100">
                <p className="text-gray-400 text-xs font-black uppercase">Graph temporarily offline</p>
            </div>
        );
    }
};

export default ContributionGraph;
