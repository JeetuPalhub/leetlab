import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useProblemStore } from "../store/useProblemStore";
import ProblemsTable from "../components/ProblemTable";
import {
  Loader,
  Sparkles,
  Trophy,
  Target,
  BookOpen,
  Brain,
  Swords,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { features } from "../config/features";

const HomePage = () => {
  const { getAllProblems, problems, isProblemsLoading, getDailyChallenge, dailyChallenge } = useProblemStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    getAllProblems();
    if (features.dailyChallenges) {
      getDailyChallenge();
    }
  }, [getAllProblems, getDailyChallenge]);

  if (isProblemsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const easyProblems = problems.filter((p) => p.difficulty === "EASY").length;
  const mediumProblems = problems.filter((p) => p.difficulty === "MEDIUM").length;
  const hardProblems = problems.filter((p) => p.difficulty === "HARD").length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/20 via-secondary/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10s]" />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-12 pb-16">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 shadow-inner"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Welcome back, {authUser?.name || "Developer"}!</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                Master the
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent px-2">
                  Code
                </span>
                <span className="block mt-4">One Problem at a Time</span>
              </h1>

              <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 bg-base-200/30 backdrop-blur-sm border border-base-300/30 p-8 rounded-3xl">
                <div className="text-center group cursor-default">
                  <div className="text-3xl md:text-5xl font-black text-base-content group-hover:text-primary transition-colors">{problems.length}</div>
                  <div className="text-xs uppercase tracking-widest font-bold text-base-content/40 mt-1">Problems</div>
                </div>
                <div className="h-12 w-px bg-base-300/50 hidden md:block"></div>
                <div className="text-center">
                  <div className="text-3xl md:text-5xl font-black text-success">{easyProblems}</div>
                  <div className="text-xs uppercase tracking-widest font-bold text-success/50 mt-1">Easy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-5xl font-black text-warning">{mediumProblems}</div>
                  <div className="text-xs uppercase tracking-widest font-bold text-warning/50 mt-1">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-5xl font-black text-error">{hardProblems}</div>
                  <div className="text-xs uppercase tracking-widest font-bold text-error/50 mt-1">Hard</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Daily Challenge Section */}
        {features.dailyChallenges && dailyChallenge && (
          <section className="pb-16 px-4">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <Link to={`/problem/${dailyChallenge.problemId}`} className="block group">
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 border border-base-300 p-1 shadow-2xl transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-primary/20">
                    <div className="bg-base-100/40 backdrop-blur-2xl rounded-[2.3rem] p-8 md:p-10 relative overflow-hidden">
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />

                      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="px-3 py-1 bg-primary text-primary-content text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-primary/30">
                              Daily Challenge
                            </div>
                            <div className="flex items-center gap-1.5 text-primary">
                              <Trophy className="w-4 h-4" />
                              <span className="text-sm font-black">+{dailyChallenge.points || 10}</span>
                            </div>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 group-hover:text-primary transition-colors leading-tight">
                            {dailyChallenge.problem?.title || "Today's Challenge"}
                          </h2>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className={`font-black uppercase tracking-widest px-3 py-1 rounded-full text-[10px] border ${dailyChallenge.problem?.difficulty === "EASY" ? "text-success border-success/30 bg-success/5" :
                                dailyChallenge.problem?.difficulty === "MEDIUM" ? "text-warning border-warning/30 bg-warning/5" :
                                  "text-error border-error/30 bg-error/5"
                              }`}>
                              {dailyChallenge.problem?.difficulty || "MEDIUM"}
                            </span>
                            <div className="flex gap-2">
                              {dailyChallenge.problem?.tags?.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-base-content/40 font-medium">#{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="btn btn-primary btn-lg rounded-2xl px-10 border-none bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-xl shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all">
                          Solve Challenge
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Feature Grid */}
        <section className="pb-16">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { to: "/roadmap", icon: Brain, label: "AI Roadmap", color: "primary", show: features.aiRoadmap },
                { to: "/mock-interview", icon: Swords, label: "Interview", color: "accent", show: true },
                { to: "/contests", icon: Target, label: "Contests", color: "secondary", show: features.contests },
                { to: "/leaderboard", icon: Trophy, label: "Ranking", color: "warning", show: features.leaderboard }
              ].filter(f => f.show).map((feat, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Link
                    to={feat.to}
                    className="group flex flex-col p-6 rounded-3xl bg-base-200/40 backdrop-blur-sm border border-base-300/50 hover:border-primary/50 transition-all duration-300 h-full relative overflow-hidden"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-${feat.color}/10 flex items-center justify-center text-${feat.color} mb-4 group-hover:scale-110 transition-transform`}>
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-lg group-hover:text-primary transition-colors">{feat.label}</span>
                    <ArrowRight className="absolute bottom-6 right-6 w-4 h-4 text-base-content/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Problems List Section */}
        <section className="pb-24">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Challenge Yourself</h2>
                  <p className="text-base-content/50 font-medium">Curated collection of {problems.length} computational problems</p>
                </div>
                <div className="hidden md:block h-px flex-1 mx-8 bg-gradient-to-r from-base-300 to-transparent"></div>
              </div>

              {problems.length > 0 ? (
                <motion.div
                  className="rounded-[2rem] border border-base-300 overflow-hidden bg-base-100 shadow-2xl relative"
                  whileInView={{ scale: [0.98, 1], opacity: [0, 1] }}
                >
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent opacity-50"></div>
                  <ProblemsTable problems={problems} />
                </motion.div>
              ) : (
                <div className="text-center py-24 bg-base-200/50 rounded-[2.5rem] border-2 border-dashed border-base-300">
                  <BookOpen className="w-16 h-16 text-base-content/10 mx-auto mb-6" />
                  <p className="text-xl font-bold text-base-content/40">No problems available yet</p>
                  <p className="text-sm text-base-content/30 mt-2">Come back later or explore other features</p>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
