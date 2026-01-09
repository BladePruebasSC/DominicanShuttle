import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, X, MessageCircle } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

const autoMessages = [
  {
    text: "Welcome to Dominican Transport Pro! How can we help you?",
    delay: 1000,
  },
  {
    text: "Bienvenido a Dominican Transport Pro! ¿En qué podemos ayudarte?",
    delay: 2000,
  },
];

const quickReplies = [
  "Quiero reservar un traslado",
  "¿Cuáles son sus precios?",
  "¿Tienen disponibilidad?",
  "Necesito información sobre tours",
];

export default function InteractiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: "bot" | "user"; time: string }>>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mostrar mensajes de bienvenida automáticos
      setTimeout(() => {
        setMessages([
          {
            text: "Welcome to Dominican Transport Pro! How can we help you?",
            sender: "bot",
            time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 500);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Agregar mensaje del usuario
    const userMessage = {
      text: messageText,
      sender: "user" as const,
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Respuesta automática del bot
    setTimeout(() => {
      let botResponse = "";
      if (messageText.toLowerCase().includes("reservar") || messageText.toLowerCase().includes("traslado")) {
        botResponse = "Perfecto! Puedes hacer tu reserva directamente desde nuestra página. ¿Te gustaría que te guíe?";
      } else if (messageText.toLowerCase().includes("precio") || messageText.toLowerCase().includes("costo")) {
        botResponse = "Nuestros precios comienzan desde $35 USD para traslados. El precio final depende del tipo de vehículo y la distancia. ¿Quieres que te calcule un precio específico?";
      } else if (messageText.toLowerCase().includes("disponibilidad")) {
        botResponse = "Tenemos disponibilidad 24/7. ¿Para qué fecha necesitas el servicio?";
      } else if (messageText.toLowerCase().includes("tour")) {
        botResponse = "Ofrecemos tours a Isla Saona, 27 Charcos, Zona Colonial y más. ¿Qué tour te interesa?";
      } else {
        botResponse = "Gracias por tu mensaje. Un agente se conectará contigo en breve por WhatsApp. Mientras tanto, puedes visitar nuestra página de reservas.";
      }

      setMessages((prev) => [
        ...prev,
        {
          text: botResponse,
          sender: "bot",
          time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1000);
  };

  const handleQuickReply = (text: string) => {
    handleSend(text);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-glass-dark border border-white/10 shadow-2xl rounded-lg overflow-hidden flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-coco-gold p-3 font-bold text-xs uppercase text-black flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Concierge Desk</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-void/50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-coco-gold text-black"
                      : "bg-white/10 text-white border border-white/20"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">{message.time}</p>
                </div>
              </div>
            ))}
            
            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-2">Respuestas rápidas:</p>
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="block w-full text-left text-xs bg-white/5 hover:bg-coco-gold/20 border border-white/10 rounded px-3 py-2 text-gray-300 hover:text-white transition"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2 border-t border-white/10 flex gap-2 bg-void/50"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 bg-void/50 border border-white/10 rounded px-3 py-2 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-coco-gold"
            />
            <Button
              type="submit"
              size="sm"
              className="bg-coco-gold text-black hover:bg-white px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* WhatsApp Link */}
          <div className="p-2 border-t border-white/10 bg-void/50">
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${encodeURIComponent("Hola, necesito más información sobre sus servicios")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-coco-gold hover:text-coco-gold/80 transition"
            >
              <i className="fab fa-whatsapp"></i>
              <span>Continue on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-coco-gold to-[#b38728] rounded-full flex items-center justify-center text-black text-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-110 transition z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
