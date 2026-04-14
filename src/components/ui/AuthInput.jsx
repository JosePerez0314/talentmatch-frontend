import React from "react";

const AuthInput = ({ label, icon, name, type = "text", value, onChange, placeholder, ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      {/* 'htmlFor' must match the input's 'id' for accessibility (A11y) */}
      <label htmlFor={name} className="text-sm font-medium text-gray-400 ml-1">
        {label}
      </label>

      <div className="relative group">
        {/* Icon dinamic */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <img
            src={icon}
            alt=""
            className="h-5 w-5 opacity-40 group-focus-within:opacity-100 transition-opacity"
          />
        </div>

        {/* Input with centralized classes */}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props} // Allows passing required, autoFocus
          className="w-full py-4 pl-12 pr-6 bg-white border border-gray-200 rounded-xl outline-none transition-all 
                     focus:ring-2 focus:ring-[#447ECA]/20 focus:border-[#447ECA]
                     placeholder:text-gray-300"
        />
      </div>
    </div>
  );
};

export default AuthInput;