import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("http://localhost:8080/api/users/login", {
                email,
                password,
            });

            console.log("Login bem-sucedido:", response.data);
            navigate("/home");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("Email ou senha incorreta.");
            } else {
                setError("Erro ao tentar fazer login.");
            }
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.form}>
                <h2 style={styles.heading}>Login</h2>

                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />

                <button type="submit" style={styles.button}>
                    Entrar
                </button>

                <p style={styles.registerText}>
                    Não tem conta?{' '}
                    <span
                        style={styles.registerLink}
                        onClick={() => window.location.href = "/register"}
                    >
                        Cadastre-se
                    </span>
                </p>

                {error && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <div style={styles.icon}>🚫</div>
                            <p style={styles.errorText}>{error}</p>
                            <button style={styles.modalButton} onClick={() => setError("")}>OK</button>
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
        height: "300px",
    },
    heading: {
        textAlign: "center",
        marginBottom: "30px",
    },
    input: {
        width: "92%",
        marginBottom: "30px",
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
    error: {
        color: "red",
        textAlign: "center",
        marginBottom: "15px",
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

export default Login;