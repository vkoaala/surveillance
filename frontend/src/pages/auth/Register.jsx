import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/config/api";
import { FaUser, FaLock } from "react-icons/fa";
import Toast from "@/components/ui/Toast";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirm: "",
    });
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
            <div className="w-full max-w-md p-8 bg-[var(--color-card)] rounded-lg shadow-lg">
                {toast && <Toast type={toast.type} message={toast.message} />}
                <h1 className="text-3xl font-bold text-center text-[var(--color-primary)] mb-6">
                    Register
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
                    <div className="relative">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="confirm"
                            value={formData.confirm}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            className="input-field-login"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-register w-full"
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
