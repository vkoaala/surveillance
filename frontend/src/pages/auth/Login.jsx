import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/config/api";
import { FaUser, FaLock } from "react-icons/fa";
import Toast from "@/components/ui/Toast";
import SurveillanceLogo from "@/components/layout/SurveillanceLogo";

const Login = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/");
        }
    }, [navigate]);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const validateForm = () => {
        if (!formData.username.trim() || !formData.password.trim()) {
            showToast("error", "Username and password are required.");
            return false;
        }
        return true;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const data = await loginUser({
                username: formData.username.trim(),
                password: formData.password.trim(),
            });
            localStorage.setItem("token", data.token);
            navigate("/");
        } catch (error) {
            showToast("error", error.message || "Login failed.");
        } finally {
            setIsLoading(false);
        }
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
                    <button
                        type="submit"
                        className="w-full h-14 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-2 px-4 transition-all duration-200 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
