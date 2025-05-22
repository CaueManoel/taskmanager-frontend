import React, { useState, useEffect } from "react";
import { FaHome, FaStickyNote, FaPlusCircle, FaBell, FaCog, FaSignOutAlt, FaTimes } from "react-icons/fa";

function Home() {
    const [showModal, setShowModal] = useState(false);
    const [boardName, setBoardName] = useState("");
    const [boardDesc, setBoardDesc] = useState("");
    const [editingColumn, setEditingColumn] = useState(null);
    const [newCardText, setNewCardText] = useState("");
    const [showBoardsModal, setShowBoardsModal] = useState(false);
    const [boards, setBoards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [cards, setCards] = useState([]);
    const [draggedCardId, setDraggedCardId] = useState(null);
    const [editingCardId, setEditingCardId] = useState(null);
    const [editedCardContent, setEditedCardContent] = useState("");

    const saveInlineEdit = async (cardId, status) => {
        try {
            const response = await fetch(`http://localhost:8080/api/cards/update/${cardId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conteudo: editedCardContent,
                    status,
                }),
            });

            if (!response.ok) throw new Error("Erro ao salvar edição");

            setCards(prev =>
                prev.map(card =>
                    card.id === cardId ? { ...card, conteudo: editedCardContent } : card
                )
            );
        } catch (error) {
            alert("Erro ao salvar edição: " + error.message);
        } finally {
            setEditingCardId(null);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    useEffect(() => {
        if (selectedBoard && selectedBoard.id) {
            fetchCards(selectedBoard.id);
        }
    }, [selectedBoard]);

    const handleLogout = () => {
        window.location.href = "/login";
    };

    const handleHome = () => {
        window.location.href = "/home";
    };

    const handleNewBoard = () => {
        setShowModal(true);
    };

    const createBoard = async () => {
        if (!boardName.trim()) {
            alert("Informe o nome do quadro");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/boards/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: boardName, description: boardDesc }),
            });

            if (!response.ok) throw new Error("Erro ao criar o quadro");

            await fetchBoards();

            setShowModal(false);
            setBoardName("");
            setBoardDesc("");
        } catch (error) {
            alert(error.message);
        }
    };

    const fetchBoards = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/boards/get");
            if (!response.ok) {
                throw new Error("Erro ao buscar quadros");
            }
            const data = await response.json();
            setBoards(data);

            if (data.length > 0) {
                const isSelectedBoardValid = selectedBoard && data.some(board => board.id === selectedBoard.id);

                if (!isSelectedBoardValid) {
                    setSelectedBoard(data[0]);
                }
            } else {
                setSelectedBoard(null);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const fetchCards = async (boardId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/cards/board/${boardId}`);
            if (!response.ok) throw new Error("Erro ao buscar cards");
            const data = await response.json();
            console.log("Cards recebidos:", data);
            setCards(data);
        } catch (error) {
            console.error("Erro ao buscar cards:", error);
            alert(error.message);
        }
    };

    const saveCard = async (column) => {
        if (!newCardText.trim()) {
            alert("Informe o conteúdo do card");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/cards/create/${selectedBoard.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conteudo: newCardText,
                    status: column
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao salvar card");
            }

            await fetchCards(selectedBoard.id);

            setNewCardText("");
            setEditingColumn(null);
        } catch (error) {
            console.error("Erro detalhado:", error);
            alert(`Erro ao salvar card: ${error.message}`);
        }
    };

    const handleDrop = async (e, newStatus, newConteudo) => {
        e.preventDefault();

        const cardId = e.dataTransfer.getData("cardId");
        const currentStatus = e.dataTransfer.getData("currentStatus");
        const currentConteudo = e.dataTransfer.getData("currentConteudo");

        if (currentStatus === newStatus) return;

        if (!newConteudo || newConteudo.trim() === "" || newConteudo === null || newConteudo === undefined) {
            newConteudo = currentConteudo;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/cards/update/${cardId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                    conteudo: newConteudo
                }),
            });

            if (!response.ok) throw new Error("Erro ao atualizar o card");

            setCards(prevCards =>
                prevCards.map(card =>
                    card.id === parseInt(cardId) ? { ...card, status: newStatus, conteudo: newConteudo } : card
                )
            );
        } catch (error) {
            console.error("Erro ao mover o card:", error);
            alert("Não foi possível mover o card.");
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.navbar}>
                <div style={styles.logo}>Task<span style={styles.logoHighlight}>Manager</span></div>

                <div style={styles.rightArea}>
                    <button style={styles.logoutButton} onClick={handleLogout} title="Sair"><FaSignOutAlt /></button>
                </div>
            </header>

            <main style={styles.boardContainer}>
                {selectedBoard ? (
                    <>
                        <h2
                            style={{
                                ...styles.boardTitle,
                                display: "flex",
                                justifyContent: "center",
                                gap: "8px",
                                alignItems: "center",
                                marginBottom: "12px",
                            }}
                        >
                            <span>{selectedBoard.name}</span>
                            <span style={{ color: "#777", fontStyle: "italic", fontSize: "11px", marginTop: "2px", }}>
                                | {selectedBoard.description}
                            </span>
                        </h2>

                        <div style={styles.columns}>
                            {["TO DO", "DOING", "TESTING", "DONE", "DELETED"].map((col) => (
                                <div
                                    key={col}
                                    style={styles.column}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, col)}
                                >
                                    <h3 style={styles.columnTitle}>{col}</h3>

                                    {cards
                                        .filter(card => card.status === col)
                                        .map(card => (
                                            <div
                                                key={card.id}
                                                style={{
                                                    ...styles.card,
                                                    ...(draggedCardId === card.id && styles.cardDragging),
                                                }}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData("cardId", card.id);
                                                    e.dataTransfer.setData("currentStatus", card.status);
                                                    e.dataTransfer.setData("currentConteudo", card.conteudo);
                                                    setDraggedCardId(card.id);
                                                }}
                                                onDragEnd={() => setDraggedCardId(null)}
                                            >
                                                {editingCardId === card.id ? (
                                                    <textarea
                                                        value={editedCardContent}
                                                        onChange={(e) => setEditedCardContent(e.target.value)}
                                                        onBlur={() => saveInlineEdit(card.id, card.status)}
                                                        autoFocus
                                                        style={styles.cardInput}
                                                    />
                                                ) : (
                                                    <div onClick={() => {
                                                        setEditingCardId(card.id);
                                                        setEditedCardContent(card.conteudo);
                                                    }}>
                                                        {card.conteudo}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    }
                                    {editingColumn === col ? (
                                        <div style={{ marginTop: 10 }}>
                                            <textarea
                                                style={styles.cardInput}
                                                placeholder="Digite o conteúdo..."
                                                value={newCardText}
                                                onChange={(e) => setNewCardText(e.target.value)}
                                            />
                                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                                                <button style={styles.cardSave} onClick={() => saveCard(col)}>Salvar</button>
                                                <button
                                                    style={styles.cardCancel}
                                                    onClick={() => {
                                                        setEditingColumn(null);
                                                        setNewCardText("");
                                                    }}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button style={styles.addCardButton} onClick={() => setEditingColumn(col)}>
                                            + Adicionar card
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <h2 style={{ textAlign: "center", color: "#777", fontStyle: "italic" }}>
                        Não existe quadro.
                    </h2>
                )}
            </main>

            <div style={styles.floatingMenu}>
                <button style={styles.menuIcon} onClick={handleHome}><FaHome /></button>
                <button
                    style={styles.menuIcon}
                    onClick={() => setShowBoardsModal(true)}
                >
                    <FaStickyNote />
                </button>
                <button style={styles.menuIcon} onClick={handleNewBoard}><FaPlusCircle /></button>
            </div>

            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <button style={styles.closeModal} onClick={() => setShowModal(false)}>
                            <FaTimes />
                        </button>
                        <h3 style={{ marginBottom: 30, marginTop: -30, }}>Novo Quadro</h3>
                        <input
                            type="text"
                            placeholder="Nome"
                            value={boardName}
                            onChange={(e) => setBoardName(e.target.value)}
                            style={styles.modalInput}
                        />
                        <textarea
                            placeholder="Descrição"
                            value={boardDesc}
                            onChange={(e) => setBoardDesc(e.target.value)}
                            style={styles.modalTextarea}
                        />
                        <button style={styles.modalSubmit} onClick={createBoard}>Criar</button>
                    </div>
                </div>
            )}
            {showBoardsModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <button
                            style={styles.closeModal}
                            onClick={() => setShowBoardsModal(false)}
                        >
                            <FaTimes />
                        </button>
                        <h3 style={{ marginBottom: 30, marginTop: -29, }}>Quadros Criados</h3>
                        {boards.length === 0 ? (
                            <p style={{ color: "#777", fontStyle: "italic" }}>
                                Nenhum quadro criado.
                            </p>
                        ) : (
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {boards.map((board) => (
                                    <li
                                        key={board.id}
                                        style={{ marginBottom: 15, cursor: "pointer" }}
                                        onClick={() => {
                                            setSelectedBoard(board);
                                            fetchCards(board.id);
                                            setShowBoardsModal(false);
                                        }}
                                    >
                                        <strong style={{ color: "#4facfe", textDecoration: "underline" }}>
                                            {board.name}
                                        </strong>
                                        <p style={{ margin: "5px 0", color: "#555", fontSize: "12px" }}>
                                            {board.description}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f4f4f4",
    },
    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    logo: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333",
    },
    logoHighlight: {
        color: "#4facfe",
    },
    rightArea: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    button: {
        backgroundColor: "#4facfe",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "10px 18px",
        cursor: "pointer",
        fontSize: "14px",
        marginRight: "30px",
    },
    logoutButton: {
        backgroundColor: "#F5FFFA",
        color: "#4facfe",
        border: "none",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        fontSize: "18px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    mainContent: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    welcome: {
        fontSize: "20px",
        color: "#666",
    },
    floatingMenu: {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(to right, #F5FFFA, #E0FFFF)",
        padding: "10px 20px",
        borderRadius: "30px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        display: "flex",
        gap: "25px",
        alignItems: "center",
        zIndex: 1000,
    },
    menuIcon: {
        background: "none",
        border: "none",
        fontSize: "22px",
        color: "#4facfe",
        cursor: "pointer",
        transition: "transform 0.2s",
    },
    boardContainer: {
        flex: 1,
        padding: "20px 40px",
        backgroundColor: "#f9f9f9",
        overflowX: "auto",
        display: "flex",
        flexDirection: "column",
    },
    boardTitle: {
        fontSize: "16px",
        fontWeight: "bold",
        marginBottom: "0px",
        color: "#333",
        textAlign: "center",
    },
    columns: {
        display: "flex",
        gap: "27px",
        justifyContent: "center",
        flexGrow: 1,
        overflowX: "auto",
        paddingBottom: "20px",
        maxWidth: "100vw",
    },
    column: {
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "15px",
        width: "180px",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "70vh",
        overflowY: "auto",
    },
    columnTitle: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#4facfe",
        textAlign: "center",
    },
    cardPlaceholder: {
        fontStyle: "italic",
        color: "#aaa",
        textAlign: "center",
        marginTop: "auto",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    modal: {
        backgroundColor: "#fff",
        padding: "50px 20px",
        borderRadius: "10px",
        width: "300px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    },
    closeModal: {
        position: "absolute",
        top: "20px",
        right: "10px",
        background: "none",
        border: "none",
        fontSize: "25px",
        color: "#999",
        cursor: "pointer",
    },
    modalInput: {
        marginBottom: "12px",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
    },
    modalTextarea: {
        marginBottom: "15px",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
        resize: "none",
    },
    modalSubmit: {
        padding: "10px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#4facfe",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
    },
    addCardButton: {
        padding: "6px 10px",
        border: "none",
        borderRadius: "6px",
        backgroundColor: "#f0f0f0",
        color: "#333",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "13px",
        transition: "background 0.3s",
        fontStyle: "italic",
    },
    cardInput: {
        width: "90%",
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
        resize: "none",
    },
    cardSave: {
        width: "78%",
        backgroundColor: "#4facfe",
        color: "white",
        border: "none",
        borderRadius: "5px",
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: "14px",
    },
    cardCancel: {
        backgroundColor: "#eee",
        color: "#444",
        border: "none",
        borderRadius: "5px",
        padding: "6px 10px",
        cursor: "pointer",
        fontSize: "14px",
    },
    card: {
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4f2fe 100%)",
        fontSize: "14px",
        height: "auto",
        padding: "12px 15px",
        marginBottom: "12px",
        borderRadius: "10px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.08)",
        cursor: "grab",
        transition: "all 0.3s ease",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
        ":hover": {
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
            background: "linear-gradient(135deg, #e4f2fe 0%, #d1e9ff 100%)",
        },
        ":active": {
            cursor: "grabbing",
            transform: "scale(0.99) translateY(0)",
            boxShadow: "0 2px 3px rgba(0, 0, 0, 0.1)",
        },
    },
    cardDragging: {
        opacity: 0.5,
        transform: "scale(1.05)",
        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    },
};

export default Home;