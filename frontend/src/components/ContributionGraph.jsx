import React, { useEffect, useState, useMemo } from 'react';
import { useSubmissionStore } from '../store/useSubmissionStore';
import { Calendar, TrendingUp, Flame, Award } from 'lucide-react';

const ContributionGraph = () => {
    const { submissions, getAllSubmissions } = useSubmissionStore();
    const [hoveredDay, setHoveredDay] = useState(null);

    useEffect(() => {
        getAllSubmissions();
    }, [getAllSubmissions]);

    // Generate contribution data from submissions
    const contributionData = useMemo(() => {
        const data = {};
        const today = new Date();

        // Initialize last 365 days with 0
        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            data[key] = { count: 0, accepted: 0, date: key };
        }

        // Count submissions per day
        submissions.forEach((sub) => {
            const date = new Date(sub.createdAt).toISOString().split('T')[0];
            if (data[date]) {
                data[date].count++;
                if (sub.status === 'Accepted') {
                    data[date].accepted++;
                }
            }
        });

        return data;
    }, [submissions]);

    // Calculate stats
    const stats = useMemo(() => {
        const accepted = submissions.filter(s => s.status === 'Accepted').length;
        const total = submissions.length;
        const activeDays = Object.values(contributionData).filter(d => d.count > 0).length;

        // Calculate current streak
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const dates = Object.keys(contributionData).sort().reverse();

        for (const date of dates) {
            if (contributionData[date].count > 0) {
                streak++;
            } else if (date !== today) {
                break;
            }
        }

        return { accepted, total, activeDays, streak };
    }, [submissions, contributionData]);

    // Generate weeks for the graph (last 52 weeks)
    const weeks = useMemo(() => {
        const result = [];
        const today = new Date();

        for (let w = 51; w >= 0; w--) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (w * 7 + (6 - d)));
                const key = date.toISOString().split('T')[0];
                week.push({
                    date: key,
                    ...contributionData[key],
                    dayOfWeek: date.getDay(),
                });
            }
            result.push(week);
        }
        return result;
    }, [contributionData]);

    const getColor = (count) => {
        if (count === 0) return 'bg-base-300';
        if (count < 2) return 'bg-success/30';
        if (count < 4) return 'bg-success/50';
        if (count < 6) return 'bg-success/70';
        return 'bg-success';
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="p-4 bg-base-200">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-primary">Contribution Graph</h2>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="stat bg-base-100 rounded-box p-4 shadow">
                        <div className="stat-figure text-primary"><Award className="w-6 h-6" /></div>
                        <div className="stat-title text-xs">Total Submissions</div>
                        <div className="stat-value text-lg text-primary">{stats.total}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-box p-4 shadow">
                        <div className="stat-figure text-success"><TrendingUp className="w-6 h-6" /></div>
                        <div className="stat-title text-xs">Accepted</div>
                        <div className="stat-value text-lg text-success">{stats.accepted}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-box p-4 shadow">
                        <div className="stat-figure text-warning"><Flame className="w-6 h-6" /></div>
                        <div className="stat-title text-xs">Current Streak</div>
                        <div className="stat-value text-lg text-warning">{stats.streak} days</div>
                    </div>
                    <div className="stat bg-base-100 rounded-box p-4 shadow">
                        <div className="stat-figure text-info"><Calendar className="w-6 h-6" /></div>
                        <div className="stat-title text-xs">Active Days</div>
                        <div className="stat-value text-lg text-info">{stats.activeDays}</div>
                    </div>
                </div>

                {/* Contribution Graph */}
                <div className="card bg-base-100 shadow-xl p-4 overflow-x-auto">
                    {/* Month Labels */}
                    <div className="flex gap-1 mb-1 ml-8 text-xs text-base-content/60">
                        {months.map((month, i) => (
                            <span key={i} className="w-16">{month}</span>
                        ))}
                    </div>

                    {/* Graph */}
                    <div className="flex gap-1">
                        {/* Day Labels */}
                        <div className="flex flex-col gap-1 text-xs text-base-content/60 pr-1">
                            <span className="h-3"></span>
                            <span className="h-3">Mon</span>
                            <span className="h-3"></span>
                            <span className="h-3">Wed</span>
                            <span className="h-3"></span>
                            <span className="h-3">Fri</span>
                            <span className="h-3"></span>
                        </div>

                        {/* Cells */}
                        <div className="flex gap-1">
                            {weeks.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-1">
                                    {week.map((day, di) => (
                                        <div
                                            key={`${wi}-${di}`}
                                            className={`w-3 h-3 rounded-sm ${getColor(day.count)} cursor-pointer transition-all hover:ring-2 hover:ring-primary`}
                                            onMouseEnter={() => setHoveredDay(day)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            title={`${day.date}: ${day.count} submissions`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-2 mt-4 text-xs text-base-content/60">
                        <span>Less</span>
                        <div className="w-3 h-3 rounded-sm bg-base-300"></div>
                        <div className="w-3 h-3 rounded-sm bg-success/30"></div>
                        <div className="w-3 h-3 rounded-sm bg-success/50"></div>
                        <div className="w-3 h-3 rounded-sm bg-success/70"></div>
                        <div className="w-3 h-3 rounded-sm bg-success"></div>
                        <span>More</span>
                    </div>

                    {/* Hover Info */}
                    {hoveredDay && (
                        <div className="mt-2 text-sm text-center text-base-content/70">
                            <span className="font-medium">{hoveredDay.date}</span>: {hoveredDay.count} submissions ({hoveredDay.accepted} accepted)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContributionGraph;
