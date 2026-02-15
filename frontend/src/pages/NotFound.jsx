import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-error/10 rounded-full">
                        <AlertTriangle className="w-16 h-16 text-error" />
                    </div>
                </div>
                <h1 className="text-6xl font-black text-base-content mb-4">404</h1>
                <h2 className="text-2xl font-bold text-base-content/80 mb-2">
                    Page Not Found
                </h2>
                <p className="text-base-content/60 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="btn btn-primary gap-2"
                >
                    <Home className="w-5 h-5" />
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
