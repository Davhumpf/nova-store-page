import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Message {
  text: string;
  isUser: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
}

const rotativeSuggestions = [
  'Puedes buscar la plataforma que gustes como "netflix" "prime"',
  'Puedes buscar la categoría que desees como "video" "música" "otros"',
  'Escribe el nombre de tu plataforma favorita',
  '¿Buscas planes individuales o familiares?'
];

const ChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: '¡Hola! ¿Qué estás buscando hoy?', isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [lastQuery, setLastQuery] = useState(''); 
  const [products, setProducts] = useState<Product[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const navigate   = useNavigate();
  const location   = useLocation();

  // Rotación de sugerencias
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrentSuggestion(i => (i + 1) % rotativeSuggestions.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // Scroll al final al abrir o enviar
  useEffect(() => {
    if (isOpen && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  // Carga productos desde Firestore
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const list: Product[] = [];
        snap.forEach(doc => {
          list.push({ id: doc.id, ...(doc.data() as any) });
        });
        setProducts(list);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    })();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setMessages(m => [...m, { text: userMessage, isUser: true }]);
    setLastQuery(userMessage);
    setInputText('');

    setTimeout(() => {
      processQuery(userMessage);
    }, 500);
  };

  const processQuery = (query: string) => {
    const q = query.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );

    if (filtered.length > 0) {
      setMessages(m => [
        ...m,
        { text: `He encontrado ${filtered.length} productos que podrían interesarte. ¿Quieres ver los resultados?`, isUser: false }
      ]);
      setSuggestions(['Ver resultados', 'Seguir buscando']);
    } else {
      setMessages(m => [
        ...m,
        { text: 'No he encontrado productos que coincidan exactamente. ¿Quieres probar con otra búsqueda?', isUser: false }
      ]);
      setSuggestions(['Explorar categorías', 'Buscar otra cosa']);
    }
  };

  const handleSuggestionClick = (s: string) => {
    setMessages(m => [...m, { text: s, isUser: true }]);

    if (s === 'Ver resultados') {
      const q = encodeURIComponent(lastQuery.trim());
      navigate(`/?search=${q}`);
      setTimeout(() => {
        setMessages(m => [...m, { text: '¡Aquí tienes los resultados!', isUser: false }]);
        setSuggestions([]);
        setTimeout(() => setIsOpen(false), 1000);
      }, 300);
    } else if (s === 'Explorar categorías') {
      setMessages(m => [...m, { text: '¿Qué categoría te gustaría explorar? Tenemos video, música, deportes y más.', isUser: false }]);
      setSuggestions(['Video', 'Música', 'Deportes', 'Otros']);
    } else if (['Video','Música','Deportes','Otros'].includes(s)) {
      navigate(`/?search=${encodeURIComponent(s.toLowerCase())}`);
      setTimeout(() => {
        setMessages(m => [...m, { text: `Explorando la categoría ${s}...`, isUser: false }]);
        setSuggestions([]);
        setTimeout(() => setIsOpen(false), 1000);
      }, 300);
    } else if (s === 'Buscar otra cosa') {
      setTimeout(() => {
        setMessages(m => [...m, { text: '¿Qué te gustaría buscar ahora?', isUser: false }]);
        setSuggestions([]);
      }, 300);
    } else {
      setTimeout(() => {
        setMessages(m => [...m, { text: '¿En qué más puedo ayudarte hoy?', isUser: false }]);
        setSuggestions([]);
      }, 300);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(o => !o)}
          className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg ${
            isOpen ? 'bg-[#FD0]' : 'bg-[#FFD600]'
          } text-[#1F1F1F] hover:bg-[#FFC400] transition transform hover:scale-105`}
          aria-label="Chat assistant"
        >
          {isOpen ? <X size={28}/> : <MessageCircle size={28}/>}
        </button>
        {!isOpen && (
          <div className="absolute bottom-20 right-0 bg-white p-3 rounded-lg shadow-lg max-w-xs animate-fadeIn">
            <div className="text-sm text-[#FFD600] mb-1 font-medium">Sugerencia:</div>
            <p className="text-sm text-gray-600">{rotativeSuggestions[currentSuggestion]}</p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45"/>
          </div>
        )}
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-gradient-to-b from-[#1F1B24] to-[#111111] rounded-2xl shadow-2xl overflow-hidden z-50 border border-[#333333] animate-slideInUp">
          {/* Header */}
          <div className="bg-[#FFD600] text-[#1F1F1F] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle size={20} className="mr-2"/>
              <h3 className="font-semibold">Asistente Nova</h3>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20}/></button>
          </div>

          {/* Messages */}
          <div ref={chatBoxRef} className="h-80 overflow-y-auto p-4 flex flex-col space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.isUser ? 'justify-end':'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  m.isUser ? 'bg-[#FFD600] text-[#1F1F1F]':'bg-[#2C2C2C] text-[#E0E0E0]'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="bg-[#2C2C2C] hover:bg-[#3C3C3C] text-[#FFD600] text-sm px-3 py-1 rounded-full"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-[#333333] p-3 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Escribe tu búsqueda..."
              className="flex-1 bg-[#2C2C2C] text-[#E0E0E0] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="ml-2 bg-[#FFD600] text-[#1F1F1F] p-2 rounded-full hover:bg-[#FFC400] disabled:opacity-50"
            >
              <Send size={18}/>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBubble;
