import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/config/api";
import { FaUser, FaLock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Toast from "@/components/ui/Toast";
import SurveillanceLogo from "@/components/layout/SurveillanceLogo";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirm: "",
    });
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const policy = {
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{12,}$",
        description:
            "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    };

    useEffect(() => {
        if (localStorage.getItem("token")) navigate("/");
    }, [navigate]);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const validatePasswordStrength = (password) => {
        const regex = new RegExp(policy.pattern);
        return regex.test(password);
    };

    const requirements = [
        { label: "At least 12 characters", test: (p) => p.length >= 12 },
        { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
        { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
        { label: "One number", test: (p) => /\d/.test(p) },
        { label: "One special character", test: (p) => /[\W_]/.test(p) },
    ];

    const validateForm = () => {
        if (
            !formData.username.trim() ||
            !formData.password.trim() ||
            !formData.confirm.trim()
        ) {
            showToast("error", "All fields are required.");
            return false;
        }
        if (formData.password !== formData.confirm) {
            showToast("error", "Passwords do not match.");
            return false;
        }
        if (!validatePasswordStrength(formData.password)) {
            showToast("error", policy.description);
            return false;
        }
        return true;
    };

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await registerUser({
                username: formData.username.trim(),
                password: formData.password.trim(),
            });
            showToast("success", "Registration successful. Redirecting to login.");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            showToast("error", error.message || "Registration failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderRequirement = (req) => {
        const passed = req.test(formData.password);
        return (
            <div className="flex items-center space-x-2">
                {passed ? (
                    <FaCheckCircle className="text-green-500" />
                ) : (
                    <FaTimesCircle className="text-red-500" />
                )}
                <span
                    className={`text-sm ${passed ? "text-green-500" : "text-gray-400"}`}
                >
                    {req.label}
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
            <div className="w-full max-w-md px-8 py-10 bg-[var(--color-card)] rounded-lg shadow-lg border border-[var(--color-border)]">
                {toast && <Toast type={toast.type} message={toast.message} />}

                <div className="mb-8 flex justify-center">
                    <SurveillanceLogo />
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaUser className="text-gray-400" />
                        </span>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            className="w-full h-14 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200 placeholder-gray-400"
                            required
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaLock className="text-gray-400" />
                        </span>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full h-14 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200 placeholder-gray-400"
                            required
                        />
                    </div>
                    <div className="p-4 bg-[var(--color-bg)]/50 rounded-md border border-[var(--color-border)]">
                        {requirements.map((req, idx) => (
                            <div key={idx}>{renderRequirement(req)}</div>
                        ))}
                    </div>

                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaLock className="text-gray-400" />
                        </span>
                        <input
                            type="password"
                            name="confirm"
                            value={formData.confirm}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            className="w-full h-14 pl-10 pr-4 rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all duration-200 placeholder-gray-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full h-14 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-2 px-4 transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? "Registering..." : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
