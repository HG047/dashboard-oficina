"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Eye, EyeOff, Loader2, Circle, Mail, Lock, User } from 'lucide-react'

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signin') {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem')
        }
        if (formData.password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres')
        }
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName
        })
        if (error) throw error
        setMessage('Verifique seu email para confirmar a conta')
      } else if (mode === 'reset') {
        const { error } = await resetPassword(formData.email)
        if (error) throw error
        setMessage('Instruções de recuperação enviadas para seu email')
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    })
    setError('')
    setMessage('')
  }

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode)
    resetForm()
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Circle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AutoMech Pro</h1>
            <p className="text-slate-400">
              {mode === 'signin' && 'Entre na sua conta'}
              {mode === 'signup' && 'Crie sua conta'}
              {mode === 'reset' && 'Recuperar senha'}
            </p>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome Completo (apenas no cadastro) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Sua senha"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmar Senha (apenas no cadastro) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Confirme sua senha"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              {/* Mensagens */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{message}</p>
                </div>
              )}

              {/* Botão de Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'signin' && 'Entrar'}
                {mode === 'signup' && 'Criar Conta'}
                {mode === 'reset' && 'Enviar Instruções'}
              </button>
            </form>

            {/* Links de navegação */}
            <div className="mt-6 text-center space-y-2">
              {mode === 'signin' && (
                <>
                  <button
                    onClick={() => switchMode('reset')}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Esqueceu sua senha?
                  </button>
                  <div className="text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <button
                      onClick={() => switchMode('signup')}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Cadastre-se
                    </button>
                  </div>
                </>
              )}

              {mode === 'signup' && (
                <div className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <button
                    onClick={() => switchMode('signin')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Faça login
                  </button>
                </div>
              )}

              {mode === 'reset' && (
                <button
                  onClick={() => switchMode('signin')}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Voltar ao login
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-slate-400">
              © 2024 AutoMech Pro. Sistema de gestão para oficinas.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}