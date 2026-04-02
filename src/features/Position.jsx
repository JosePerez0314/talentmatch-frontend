import React, { useState } from "react";
// Componentes
import Sidebar from "../components/Sidebar";
//Assets
import iconCheck from "../assets/icons/icon_check_blue.svg"

const Position = () => {
    // --- Estado del Formulario ---
    const [formData, setFormData] = useState({
        role: "",
        experience: "0",
        mandatoryTech: [],
        optionalTech: [],
        softSkills: [],
        description: "",
        education: "",
        languages: [],
    });

    // --- Ayudantes de Interfaz ---
    const [tempInputs, setTempInputs] = useState({
        mandatoryTech: "",
        optionalTech: "",
        softSkills: "",
        languages: "",
    });

    const [errors, setErrors] = useState({});
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    // Lógica para añadir píldoras
    const handleAddPill = (field, value) => {
        const trimmedValue = value.trim();
        if (trimmedValue && !formData[field].includes(trimmedValue)) {
            setFormData((prev) => ({
                ...prev,
                [field]: [...prev[field], trimmedValue],
            }));
            setTempInputs((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const removePill = (field, index) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    // Validación Principal
    const validateForm = () => {
        const newErrors = {};
        if (!formData.role.trim()) newErrors.role = "este campo es obligatorio";
        if (formData.mandatoryTech.length === 0) newErrors.mandatoryTech = "este campo es obligatorio";
        if (formData.softSkills.length === 0) newErrors.softSkills = "este campo es obligatorio";
        if (!formData.description.trim()) newErrors.description = "este campo es obligatorio";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = (e) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);
        if (validateForm()) {
            console.log("Formulario válido. Datos:", formData);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F0F0F5] font-sans text-[#1F1F1F]">
            <Sidebar />

            <main className="flex-1 p-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto">

                    <form
                        onSubmit={handleContinue}
                        className="bg-white rounded-[32px] p-12 shadow-sm border border-gray-100">
                        {/* Título Principal dentro del cuadro blanco */}
                        <h1 className="text-2xl font-extrabold mb-10 text-center tracking-tight uppercase">
                            Configuración de Posiciones
                        </h1>

                        {/* --- SECCIÓN: DETALLES DEL ROL --- */}
                        <section className="mb-12">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-8 pb-3 border-b border-gray-50">
                                Detalles del rol
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold">¿Cuál es el puesto que buscas?</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Senior Frontend Developer"
                                        className={`p-4 bg-[#F8F9FA] border rounded-xl outline-none focus:border-[#447ECA] transition-all placeholder:text-gray-400 font-medium ${hasAttemptedSubmit && errors.role ? 'border-red-500' : 'border-[#D4D4DA]'}`}
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                                    {hasAttemptedSubmit && errors.role && <span className="text-red-500 text-xs font-bold italic">{errors.role}</span>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold">Años de experiencia</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-4 bg-[#F8F9FA] border border-[#D4D4DA] rounded-xl outline-none focus:border-[#447ECA] cursor-pointer appearance-none text-gray-600 font-medium"
                                            value={formData.experience}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}>
                                            <option value="0">Ninguno</option>
                                            {[...Array(10)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1} Año{i + 1 > 1 ? 's' : ''}</option>
                                            ))}
                                            <option value="10+">10+ Años</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* --- SECCIÓN: HABILIDADES Y CUALIFICACIONES --- */}
                        <section className="mb-12">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-8 pb-3 border-b border-gray-50">
                                Habilidades y cualificaciones
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                                {[
                                    { label: "Habilidades técnicas obligatorias", id: "mandatoryTech", placeholder: "Ej. React, Tailwind..." },
                                    { label: "Habilidades técnicas opcionales", id: "optionalTech", placeholder: "Ej. Github, Figma..." },
                                    { label: "Habilidades blandas", id: "softSkills", placeholder: "Ej. Liderazgo, Empatía..." },
                                ].map((field) => (
                                    <div key={field.id} className="flex flex-col gap-2">
                                        <label className="text-sm font-bold">{field.label}</label>
                                        <div className={`flex flex-wrap gap-2 p-3 bg-[#F8F9FA] border rounded-xl min-h-[60px] focus-within:border-[#447ECA] transition-all ${hasAttemptedSubmit && errors[field.id] ? 'border-red-500' : 'border-[#D4D4DA]'}`}>
                                            {formData[field.id].map((pill, i) => (
                                                <span key={i} className="bg-[#96FFC1] text-black text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-2 uppercase">
                                                    {pill}
                                                    <button type="button" onClick={() => removePill(field.id, i)} className="hover:text-red-600 font-bold">×</button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                placeholder={formData[field.id].length === 0 ? field.placeholder : ""}
                                                className="flex-1 bg-transparent outline-none text-sm min-w-[140px] placeholder:text-gray-400 font-medium"
                                                value={tempInputs[field.id]}
                                                onChange={(e) => setTempInputs({ ...tempInputs, [field.id]: e.target.value })}
                                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPill(field.id, e.target.value))}
                                                onBlur={(e) => handleAddPill(field.id, e.target.value)} />
                                        </div>
                                        {hasAttemptedSubmit && errors[field.id] && <span className="text-red-500 text-xs font-bold italic">{errors[field.id]}</span>}
                                    </div>
                                ))}

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold">Describe el puesto solicitado</label>
                                    <textarea
                                        maxLength={3000}
                                        rows={4}
                                        placeholder="Escribe aquí las responsabilidades del cargo..."
                                        className={`p-4 bg-[#F8F9FA] border rounded-xl outline-none focus:border-[#447ECA] resize-none transition-all placeholder:text-gray-400 font-medium ${hasAttemptedSubmit && errors.description ? 'border-red-500' : 'border-[#D4D4DA]'}`}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    <div className="flex justify-between items-center">
                                        {hasAttemptedSubmit && errors.description && <span className="text-red-500 text-xs font-bold italic">{errors.description}</span>}
                                        <span className="text-[10px] text-gray-400 font-extrabold ml-auto uppercase">{formData.description.length} / 3000</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* --- SECCIÓN: EDUCACIÓN E IDIOMAS --- */}
                        <section className="mb-12">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-8 pb-3 border-b border-gray-50">
                                Educación e idiomas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold">Educación necesaria</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Ingeniería de Software..."
                                        className="p-4 bg-[#F8F9FA] border border-[#D4D4DA] rounded-xl outline-none focus:border-[#447ECA] placeholder:text-gray-400 font-medium"
                                        value={formData.education}
                                        onChange={(e) => setFormData({ ...formData, education: e.target.value })} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold">Idiomas</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-[#F8F9FA] border border-[#D4D4DA] rounded-xl min-h-[60px] focus-within:border-[#447ECA]">
                                        {formData.languages.map((pill, i) => (
                                            <span key={i} className="bg-[#96FFC1] text-black text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-2 uppercase">
                                                {pill}
                                                <button type="button" onClick={() => removePill("languages", i)} className="font-bold">×</button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            placeholder={formData.languages.length === 0 ? "Ej. Inglés C1..." : ""}
                                            className="flex-1 bg-transparent outline-none text-sm min-w-[140px] placeholder:text-gray-400 font-medium"
                                            value={tempInputs.languages}
                                            onChange={(e) => setTempInputs({ ...tempInputs, languages: e.target.value })}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPill("languages", e.target.value))}
                                            onBlur={(e) => handleAddPill("languages", e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* --- ACCIÓN --- */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-[#447ECA] text-white px-20 py-4 rounded-xl font-extrabold text-[13px] shadow-lg hover:bg-[#3669ab] active:scale-[0.97] transition-all uppercase tracking-wider">
                                Crear Posición
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Position;