import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Verificar si ya está autenticado al cargar
  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    const authTime = localStorage.getItem('admin_auth_time');
    
    if (authStatus === 'true' && authTime) {
      // Verificar si la autenticación no ha expirado (24 horas)
      const now = Date.now();
      const authTimestamp = parseInt(authTime);
      const hoursSinceAuth = (now - authTimestamp) / (1000 * 60 * 60);
      
      if (hoursSinceAuth < 24) {
        setIsAuthenticated(true);
      } else {
        // Limpiar autenticación expirada
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_time');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verificar la clave de acceso
    if (accessKey.toLowerCase() === 'cderf') {
      setIsAuthenticated(true);
      // Guardar autenticación en localStorage con timestamp
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_auth_time', Date.now().toString());
    } else {
      setAttempts(prev => prev + 1);
      setError('Clave de acceso incorrecta');
      
      // Bloquear después de 5 intentos
      if (attempts >= 4) {
        setError('Demasiados intentos fallidos. Acceso bloqueado temporalmente.');
        setTimeout(() => {
          setAttempts(0);
          setError('');
        }, 30000); // Bloquear por 30 segundos
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_time');
    setAccessKey('');
    setError('');
    setAttempts(0);
  };

  // Si está autenticado, mostrar el contenido
  if (isAuthenticated) {
    return (
      <div className="relative">
        {/* Botón de logout */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="bg-white/90 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50"
          >
            <Lock className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
        
        {children}
      </div>
    );
  }

  // Mostrar formulario de autenticación
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acceso Administrativo
          </CardTitle>
          <CardDescription className="text-gray-600">
            Ingresa la clave de acceso para continuar
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="accessKey" className="text-sm font-medium text-gray-700">
                Clave de Acceso
              </label>
              <div className="relative">
                <Input
                  id="accessKey"
                  type={showPassword ? 'text' : 'password'}
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Ingresa la clave de acceso"
                  className="pr-10"
                  disabled={attempts >= 5}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {attempts > 0 && attempts < 5 && (
              <Alert>
                <AlertDescription>
                  Intentos fallidos: {attempts}/5
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={attempts >= 5 || !accessKey.trim()}
            >
              <Lock className="h-4 w-4 mr-2" />
              Acceder al Dashboard
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Dashboard de Administración de Imágenes
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Dominican Shuttle
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
