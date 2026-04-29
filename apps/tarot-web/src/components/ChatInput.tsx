import { type FormEvent, type KeyboardEvent, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [inputText, setInputText] = useState("");

  const doSend = () => {
    const text = inputText.trim();
    if (text) {
      onSend(text);
      setInputText("");
    }
  };

  const handleSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    doSend();
  };

  const handleKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.key === "Enter" && !evt.shiftKey) {
      evt.preventDefault();
      doSend();
    }
  };

  return (
    <form className="chat-input-bar" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="tarot-chat-input">
        Mensagem para a Roda da Fortuna
      </label>
      <textarea
        id="tarot-chat-input"
        className="chat-textarea"
        placeholder="Sua mensagem para o Guia..."
        value={inputText}
        disabled={disabled}
        rows={1}
        aria-label="Mensagem para a Roda da Fortuna"
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="chat-send-button"
        type="submit"
        disabled={disabled || !inputText.trim()}
        aria-label={disabled ? "Consultando..." : "Enviar mensagem"}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          magic_button
        </span>
      </button>
    </form>
  );
}
