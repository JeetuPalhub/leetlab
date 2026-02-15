import React from "react";

/**
 * Loading Skeleton Placeholder
 * @param {string} className - Additional Tailwind classes for size/position
 * @param {boolean} circle - Whether to make it circular
 */
const Skeleton = ({ className, circle = false }) => (
    <div
        className={`animate-pulse bg-gray-700/40 ${circle ? "rounded-full" : "rounded"
            } ${className}`}
    />
);

export default Skeleton;
