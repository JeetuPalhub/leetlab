import React from "react";
import { User, Code, LogOut, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import LogoutButton from "./LogoutButton";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { authUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav className="sticky top-0 z-50 w-full py-3 md:py-5 px-2 md:px-0">
      <div className="flex w-full justify-between mx-auto max-w-4xl bg-black/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-gray-200/10 p-3 md:p-4 rounded-2xl">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 cursor-pointer">
          <img src="/leetlab.svg" className="h-10 w-10 md:h-12 md:w-12 bg-primary/20 text-primary border-none px-1 md:px-2 py-1 md:py-2 rounded-full" />
          <span className="text-base md:text-2xl font-bold tracking-tight text-white hidden sm:block">
            Leetlab
          </span>
        </Link>

        {/* Theme Toggle and User Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle btn-sm md:btn-md"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            )}
          </button>

          {authUser ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-8 md:w-10 rounded-full">
                  <img
                    src={authUser?.image || "https://avatar.iran.liara.run/public/boy"}
                    alt="User Avatar"
                    className="object-cover"
                  />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 space-y-3"
              >
                <li>
                  <p className="text-base font-semibold">{authUser?.name}</p>
                  <hr className="border-gray-200/10" />
                </li>
                <li>
                  <Link to="/profile" className="hover:bg-primary hover:text-white text-base font-semibold">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Link>
                </li>
                {authUser?.role === "ADMIN" && (
                  <li>
                    <Link to="/add-problem" className="hover:bg-primary hover:text-white text-base font-semibold">
                      <Code className="w-4 h-4 mr-1" />
                      Add Problem
                    </Link>
                  </li>
                )}
                <li>
                  <LogoutButton className="hover:bg-primary hover:text-white">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </LogoutButton>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/login" className="btn btn-ghost btn-xs md:btn-sm text-white">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-xs md:btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
