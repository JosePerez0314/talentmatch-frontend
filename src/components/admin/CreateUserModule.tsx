import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Shield, Users, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/api/admin.api';
import { UserRole } from '../../types/api.types';
import { ApiError } from '../../services/api/apiClient';

interface FormFields {
    email: string;
    password: string;
    role: UserRole;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

// Función pura extraída para testing aislado (Clean Code)
const validateFields = (fields: FormFields): FormErrors => {
    const errors: FormErrors = {};
    if (!fields.email.trim()) {
        errors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
        errors.email = 'Correo no válido';
    }
    
    if (!fields.password) {
        errors.password = 'La contraseña es obligatoria';
    } else if (fields.password.length < 10) {
        errors.password = 'Mínimo 10 caracteres';
    } else if (!/[A-Z]/.test(fields.password)) {
        errors.password = 'Debe incluir al menos una mayúscula';
    } else if (!/[a-z]/.test(fields.password)) {
        errors.password = 'Debe incluir al menos una minúscula';
    } else if (!/[0-9]/.test(fields.password)) {
        errors.password = 'Debe incluir al menos un número';
    }
    return errors;
};

interface CreateUserModuleProps {
    onCreated: () => void;
}

export const CreateUserModule: React.FC<CreateUserModuleProps> = ({ onCreated }) => {
    const [fields, setFields] = useState<FormFields>({ email: '', password: '', role: 'USER' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const setField = <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
        setFields(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: undefined, general: undefined }));
    };

    const handleSubmit = async () => {
        const errs = validateFields(fields);
        if (Object.keys(errs).length > 0) { 
            setErrors(errs); 
            return; 
        }

        setIsCreating(true);
        setErrors({});
        
        try {
            const { userId } = await adminService.createUser(fields.email.trim(), fields.password);
            
            // Asignación de rol condicional
            if (fields.role === 'ADMIN') {
                await adminService.updateRole(userId, 'ADMIN');
            }
            
            setFields({ email: '', password: '', role: 'USER' });
            setSuccessMsg('Usuario creado exitosamente.');
            setTimeout(() => setSuccessMsg(null), 4000);
            onCreated();
        } catch (err) {
            const msg = err instanceof ApiError && err.status === 409
                ? 'Ese correo ya está registrado en el sistema.'
                : 'Fallo al crear el usuario. Por favor verifica los datos e intenta de nuevo.';
            setErrors({ general: msg });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="px-5 py-3.5 flex items-center gap-3 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-50">
                    <UserPlus size={14} className="text-green-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Registrar nuevo usuario</p>
            </div>

            <div className="p-5 md:p-6">
                {/* Notificaciones globales */}
                {successMsg && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm bg-green-50 border border-green-200 shadow-sm animate-fade-in">
                        <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                        <span className="text-green-800 font-medium">{successMsg}</span>
                    </div>
                )}

                {errors.general && (
                    <div className="px-4 py-3 rounded-xl mb-5 text-sm bg-red-50 border border-red-200 text-red-700 font-medium shadow-sm animate-fade-in">
                        {errors.general}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {/* Campo Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1">
                            Correo electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={fields.email}
                            onChange={e => setField('email', e.target.value)}
                            placeholder="usuario@empresa.com"
                            className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all shadow-sm ${
                                errors.email 
                                    ? 'border-red-300 bg-red-50/50 focus:border-red-500' 
                                    : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                            }`}
                        />
                        {errors.email && <p className="text-red-500 text-[11px] font-medium ml-1 mt-0.5">{errors.email}</p>}
                    </div>

                    {/* Campo Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700 ml-1">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={fields.password}
                                onChange={e => setField('password', e.target.value)}
                                placeholder="Mín. 10 chars, 1 mayús, 1 número"
                                className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm outline-none transition-all shadow-sm ${
                                    errors.password 
                                        ? 'border-red-300 bg-red-50/50 focus:border-red-500' 
                                        : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-[11px] font-medium ml-1 mt-0.5">{errors.password}</p>}
                    </div>

                    {/* Selector de Rol */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-700 ml-1">Nivel de Acceso</label>
                        <div className="flex flex-wrap sm:flex-nowrap gap-3">
                            {(['USER', 'ADMIN'] as UserRole[]).map(roleOption => {
                                const isSelected = fields.role === roleOption;
                                return (
                                    <button
                                        key={roleOption}
                                        type="button"
                                        onClick={() => setField('role', roleOption)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 rounded-xl text-sm font-bold transition-all ${
                                            isSelected
                                                ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        {roleOption === 'ADMIN' ? <Shield size={16} /> : <Users size={16} />}
                                        {roleOption === 'ADMIN' ? 'Administrador' : 'Usuario Estándar'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer/Submit */}
                <div className="flex justify-end mt-8 border-t border-gray-100 pt-5">
                    <button
                        onClick={handleSubmit}
                        disabled={isCreating}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:hover:bg-green-600 transition-colors shadow-sm"
                    >
                        {isCreating
                            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Registrando…</>
                            : <><UserPlus size={16} /> Crear cuenta de usuario</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};