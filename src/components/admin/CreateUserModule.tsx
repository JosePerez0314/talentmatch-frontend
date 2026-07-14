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

// Password policy: 10-100 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit (matches POST /api/users)
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
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setIsCreating(true);
        setErrors({});
        try {
            const { userId } = await adminService.createUser(fields.email.trim(), fields.password);
            if (fields.role === 'ADMIN') {
                await adminService.updateRole(userId, 'ADMIN');
            }
            setFields({ email: '', password: '', role: 'USER' });
            setSuccessMsg('Usuario creado correctamente.');
            setTimeout(() => setSuccessMsg(null), 3000);
            onCreated();
        } catch (err) {
            const msg = err instanceof ApiError && err.status === 409
                ? 'Ese correo ya está registrado.'
                : 'No se pudo crear el usuario. Intenta de nuevo.';
            setErrors({ general: msg });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-5 py-3.5 flex items-center gap-3 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-50">
                    <UserPlus size={14} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-700">Crear nuevo usuario</p>
            </div>

            <div className="p-5">
                {successMsg && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm bg-green-50 border border-green-200">
                        <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                        <span className="text-green-800">{successMsg}</span>
                    </div>
                )}

                {errors.general && (
                    <div className="px-4 py-3 rounded-xl mb-4 text-sm bg-red-50 border border-red-200 text-red-700">
                        {errors.general}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">
                            Correo electrónico <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="email"
                            value={fields.email}
                            onChange={e => setField('email', e.target.value)}
                            placeholder="usuario@empresa.com"
                            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-400'}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">
                            Contraseña <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={fields.password}
                                onChange={e => setField('password', e.target.value)}
                                placeholder="Mín. 10 chars, 1 mayús, 1 número"
                                className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm outline-none transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-400'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Role toggle */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Rol asignado</label>
                        <div className="flex gap-2">
                            {(['USER', 'ADMIN'] as UserRole[]).map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setField('role', r)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 rounded-xl text-sm transition-all"
                                    style={fields.role === r
                                        ? { borderColor: '#16A34A', backgroundColor: '#F0FDF4', color: '#14532D' }
                                        : { borderColor: '#E5E7EB', backgroundColor: 'white', color: '#6B7280' }
                                    }
                                >
                                    {r === 'ADMIN' ? <Shield size={13} /> : <Users size={13} />}
                                    {r === 'ADMIN' ? 'Admin' : 'Usuario'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-5">
                    <button
                        onClick={handleSubmit}
                        disabled={isCreating}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {isCreating
                            ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creando…</>
                            : <><UserPlus size={14} /> Crear usuario</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};
