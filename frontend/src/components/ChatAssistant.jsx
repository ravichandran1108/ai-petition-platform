import React, { useState } from 'react';
import axios from 'axios';

const ChatAssistant = ({ petition }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'assistant',
      text: 'Hi! I can help you understand this petition, improve its wording, or plan how to get more support. Ask me anything.'
    }
  ]);
  const [sending, setSending] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { from: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await axios.post('/api/chat', {
        message: trimmed,
        petitionTitle: petition?.title,
        petitionDescription: petition?.description
      });
      const replyText = res.data?.reply || "Sorry, I couldn't generate a helpful answer right now.";
      setMessages((prev) => [...prev, { from: 'assistant', text: replyText }]);
    } catch (err) {
      console.error('Error talking to chat assistant', err);
      setMessages((prev) => [
        ...prev,
        {
          from: 'assistant',
          text: 'Something went wrong while processing your question. Please try again in a moment.'
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 1050
      }}
    >
      {open && (
        <div className="card shadow-lg mb-2" style={{ width: '320px', maxHeight: '420px' }}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Petition Chat Assistant</span>
            <button
              type="button"
              className="btn-close btn-sm"
              aria-label="Close"
              onClick={handleToggle}
            ></button>
          </div>
          <div
            className="card-body d-flex flex-column"
            style={{ padding: '0.75rem', height: '320px' }}
          >
            <div
              className="flex-grow-1 mb-2"
              style={{ overflowY: 'auto', fontSize: '0.9rem' }}
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`mb-2 d-flex ${
                    m.from === 'user' ? 'justify-content-end' : 'justify-content-start'
                  }`}
                >
                  <div
                    className={`px-2 py-1 rounded ${
                      m.from === 'user' ? 'bg-primary text-white' : 'bg-light'
                    }`}
                    style={{ maxWidth: '85%' }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="d-flex gap-1">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ask about this petition..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="btn btn-sm btn-primary"
                disabled={sending}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
      <button
        type="button"
        className="btn btn-primary rounded-circle shadow"
        style={{ width: '3rem', height: '3rem' }}
        onClick={handleToggle}
      >
        <span className="visually-hidden">Open chat</span>
        <i className="bi bi-chat-dots"></i>
      </button>
    </div>
  );
};

export default ChatAssistant;

