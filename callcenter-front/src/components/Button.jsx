function Button({ text, color }) {
  return (
    <button
      style={{
        backgroundColor: color,
        color: "white",
        border: "none",
        padding: "12px 24px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer"
      }}
    >
      {text}
    </button>
  );
}

export default Button;