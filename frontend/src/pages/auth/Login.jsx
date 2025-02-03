import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/config/api";
import { FaUser, FaLock } from "react-icons/fa";
import Toast from "@/components/ui/Toast";

const Login = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionStorage.getItem("token")) {
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
            sessionStorage.setItem("token", data.token);
            navigate("/");
        } catch (error) {
            showToast("error", error.message || "Login failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
            <div className="w-full max-w-md p-8 bg-[var(--color-card)] rounded-lg shadow-lg">
                {toast && <Toast type={toast.type} message={toast.message} />}
                <h1 className="text-3xl font-bold text-center text-[var(--color-primary)] mb-6">
                    Login
                </h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            className="input-field-login"
                            required
                        />
                    </div>
                    <div className="relative">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="input-field-login"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-login w-full"
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
