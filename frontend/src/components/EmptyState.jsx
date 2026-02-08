import React from "react";
import {
    FileQuestion,
    Search,
    Inbox,
    BookOpen,
    Code,
    Users,
    FolderOpen,
    Sparkles
} from "lucide-react";

/**
 * Premium EmptyState component
 * used to display beautifully styled empty states throughout the application.
 */

const iconMap = {
    problems: FileQuestion,
    search: Search,
    inbox: Inbox,
    submissions: Code,
    playlists: FolderOpen,
    solved: BookOpen,
    users: Users,
};

const EmptyState = ({
    type = "inbox",
    title = "No data found",
    description = "There's nothing here yet.",
    action = null,
    actionLabel = "Get Started"
}) => {
    const Icon = iconMap[type] || Inbox;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 transform transition-all duration-1000 animate-pulse"></div>

                {/* Icon Container with Glassmorphism */}
                <div className="relative bg-base-100/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 transform hover:scale-110 transition-transform duration-300">
                    <Icon className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(var(--p),0.5)]" />

                    {/* Small decorative sparkle icon */}
                    <div className="absolute -top-2 -right-2 bg-secondary rounded-full p-2 shadow-lg animate-bounce">
                        <Sparkles className="w-4 h-4 text-secondary-content" />
                    </div>
                </div>
            </div>

            <div className="max-w-md">
                <h3 className="text-2xl font-black text-base-content mb-3 tracking-tight">
                    {title}
                </h3>
                <p className="text-base-content/60 text-lg leading-relaxed mb-8">
                    {description}
                </p>

                {action && (
                    <button
                        onClick={action}
                        className="btn btn-primary btn-lg px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group"
                    >
                        <span className="group-hover:translate-x-1 transition-transform inline-block">
                            {actionLabel}
                        </span>
                    </button>
                )}
            </div>

            {/* Background pattern or subtle hint */}
            {!action && (
                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                </div>
            )}
        </div>
    );
};

export default EmptyState;
