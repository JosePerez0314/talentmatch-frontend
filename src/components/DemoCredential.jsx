import React from "react";

/**
 * DemoCredential Component
 * Renders the gray pill-shaped box with demo credentials.
 * Designed to be nested inside the main login container.
 */
const DemoCredential = () => {
    return (
        <div className="mt-8 w-full animate-fade-in">
            {/* Light gray background with soft borders for a clean integration */}
            <div className="bg-gray-300 rounded-2xl px-5 py-3.5 border border-[#E4E7EB]">
                <p className="text-center text-[12px] font-medium text-black leading-relaxed font-sans">
                    Demo: user <strong className="text-blue-900 font-black">admin</strong> / password <strong className="text-blue-900 font-black">admin123</strong>
                </p>
            </div>
        </div>
    );
};

export default DemoCredential;