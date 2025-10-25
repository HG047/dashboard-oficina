"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processando callback de autenticação...')
        
        // Verificar se há parâmetros de erro na URL primeiro
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          console.error('Auth callback error from URL:', errorParam, errorDescription)
          setStatus('error')
          
          // Mensagens de erro mais específicas
          if (errorParam === 'access_denied') {
            setMessage('Acesso negado. Você cancelou a confirmação.')
          } else if (errorParam === 'server_error') {
            setMessage('Erro no servidor. Tente novamente mais tarde.')
          } else if (errorDescription) {
            setMessage(errorDescription)
          } else {
            setMessage('Erro ao confirmar conta. Tente novamente.')
          }
          return
        }

        // Tentar obter a sessão atual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus('error')
          setMessage('Erro ao processar confirmação. Tente fazer login novamente.')
          return
        }

        if (sessionData.session) {
          console.log('Sessão encontrada, usuário confirmado:', sessionData.session.user.email)
          setStatus('success')
          setMessage('Conta confirmada com sucesso! Redirecionando...')
          
          // Redirecionar após 2 segundos
          setTimeout(() => {
            router.push('/')
          }, 2000)
          return
        }

        // Se não há sessão, tentar processar o hash da URL
        console.log('Tentando processar hash da URL...')
        const hash = window.location.hash
        
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          const tokenType = hashParams.get('token_type')
          const type = hashParams.get('type')
          
          console.log('Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type })
          
          if (accessToken && refreshToken) {
            try {
              // Definir a sessão manualmente
              const { data: newSessionData, error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              })
              
              if (setSessionError) {
                console.error('Set session error:', setSessionError)
                setStatus('error')
                setMessage('Erro ao confirmar conta. Link pode estar expirado.')
              } else if (newSessionData.session) {
                console.log('Sessão definida com sucesso:', newSessionData.session.user.email)
                setStatus('success')
                
                if (type === 'signup') {
                  setMessage('Conta confirmada com sucesso! Bem-vindo!')
                } else if (type === 'recovery') {
                  setMessage('Email confirmado! Você pode alterar sua senha agora.')
                } else {
                  setMessage('Confirmação realizada com sucesso!')
                }
                
                setTimeout(() => {
                  if (type === 'recovery') {
                    router.push('/auth/reset-password')
                  } else {
                    router.push('/')
                  }
                }, 2000)
              } else {
                setStatus('error')
                setMessage('Não foi possível confirmar a conta.')
              }
            } catch (setSessionErr) {
              console.error('Set session error:', setSessionErr)
              setStatus('error')
              setMessage('Erro ao processar confirmação.')
            }
          } else {
            setStatus('error')
            setMessage('Link de confirmação inválido ou incompleto.')
          }
        } else {
          // Sem hash e sem sessão - provavelmente link inválido
          setStatus('error')
          setMessage('Link de confirmação inválido ou expirado.')
        }
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
        setMessage('Erro inesperado. Tente fazer login novamente.')
      }
    }

    // Aguardar um pouco para garantir que a URL foi totalmente carregada
    const timer = setTimeout(handleAuthCallback, 500)
    
    return () => clearTimeout(timer)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Confirmando conta...</h1>
            <p className="text-gray-600">Aguarde um momento</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Sucesso!</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Erro na confirmação</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/auth')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir para Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}