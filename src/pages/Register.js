import React, { useState } from "react";
import axios from "axios";

function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const response = await axios.post(
                "http://localhost:8080/api/users/register",
                form
            );
            setMessage("Cadastro realizado com sucesso!");
            setIsSuccess(true);
            setForm({ name: "", email: "", password: "" });
        } catch (error) {
            setMessage(
                "Erro ao cadastrar: " +
                (error.response?.data?.message || error.message)
            );
            setIsSuccess(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.heading}>Cadastro</h2>

                <input
                    name="name"
                    placeholder="Nome"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Senha"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <button type="submit" style={styles.button}>
                    Cadastrar
                </button>

                <p style={styles.registerText}>
                    Já tem conta?{' '}
                    <span
                        style={styles.registerLink}
                        onClick={() => window.location.href = "/login"}
                    >
                        Login
                    </span>
                </p>

                {message && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <div style={styles.icon}>{isSuccess ? "✅" : "❌"}</div>
                            <p style={styles.errorText}>{message}</p>
                            <button
                                style={styles.modalButton}
                                onClick={() => setMessage("")}
                                type="button"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to right, #DCDCDC, #C0C0C0)",
    },
    form: {
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)",
        width: "300px",
    },
    heading: {
        textAlign: "center",
        marginBottom: "30px",
    },
    input: {
        width: "92%",
        marginBottom: "20px",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "14px",
    },
    button: {
        width: "100%",
        backgroundColor: "#4facfe",
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    modal: {
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        textAlign: "center",
        maxWidth: "300px",
    },
    errorText: {
        fontSize: "17px",
        marginTop: "40px",
        marginBottom: "35px",
        color: "#000000",
        fontWeight: "bold",
    },
    modalButton: {
        padding: "14px 32px",
        backgroundColor: "#808080",
        border: "none",
        borderRadius: "4px",
        color: "#fff",
        cursor: "pointer",
    },
    icon: {
        fontSize: "70px",
        marginBottom: "15px",
    },
    registerText: {
        textAlign: 'center',
        marginTop: '15px',
        fontSize: '14px',
        color: '#333',
    },

    registerLink: {
        color: '#4facfe',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
};

export default Register;