import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

const SECRET_CODE = 'cderf';
const MAX_TIME_BETWEEN_KEYS = 2000; // 2 segundos entre teclas

export function useSecretCode() {
  const [, setLocation] = useLocation();
  const [sequence, setSequence] = useState<string>('');
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // Si pasó mucho tiempo desde la última tecla, resetear la secuencia
      if (currentTime - lastKeyTime > MAX_TIME_BETWEEN_KEYS) {
        setSequence('');
      }
      
      // Ignorar teclas especiales (Ctrl, Alt, Shift, etc.)
      if (e.key.length === 1) {
        const key = e.key.toLowerCase();
        const newSequence = (sequence + key).slice(-SECRET_CODE.length);
        setSequence(newSequence);
        setLastKeyTime(currentTime);
        
        // Verificar si la secuencia coincide (case-insensitive)
        if (newSequence === SECRET_CODE) {
          setLocation('/admin');
          setSequence(''); // Resetear después de activar
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [sequence, lastKeyTime, setLocation]);

  return null;
}
