import React, { InputHTMLAttributes, ReactNode } from "react";


interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
  name: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ 
  label, 
  icon, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-2 text-left">
      <label htmlFor={name} className="text-sm font-medium text-gray-400 ml-1">
        {label}
      </label>

      <div className="relative group">
        {/* Contenedor icono dinamico */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity">
          {icon}
        </div>

        {/* Input clases centralizada */}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
          className="w-full py-4 pl-12 pr-6 bg-white border border-gray-200 rounded-xl outline-none transition-all 
                     focus:ring-2 focus:ring-[#447ECA]/20 focus:border-[#447ECA]
                     placeholder:text-gray-300 text-gray-700 font-medium"
        />
      </div>
    </div>
  );
};

export default AuthInput;