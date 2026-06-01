import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authService } from '../services/auth.js'
import { validatePassword } from '../utils/validators'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!validatePassword(password)) {
      setError('Mínimo 8 caracteres, 1 maiúscula e 1 número')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-right" style={{ margin: 'auto' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--texto-suave)', marginBottom: '1.5rem' }}>Link inválido ou expirado.</p>
            <Link to="/auth" className="btn btn-verde btn-sm">Voltar para o login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1 className="script auth-title-script">O amor merece ser celebrado</h1>
          <p>Monte, personalize e compartilhe a lista dos seus sonhos com quem você ama.</p>
        </div>
      </div>

      <div className="auth-right">
        <Link to="/auth" className="auth-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          Voltar
        </Link>
        <div className="auth-logo">
          <img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ width: 180, height: 'auto' }} />
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--texto)', marginBottom: '1.5rem' }}>
              Senha redefinida com sucesso!
            </p>
            <button className="btn btn-verde" style={{ width: '100%' }} onClick={() => navigate('/auth')}>
              Ir para o login
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Redefinir senha</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', marginBottom: '1.5rem' }}>
              Crie uma nova senha para a sua conta.
            </p>

            <div className="auth-form active">
              <div className="form-group">
                <label>Nova senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPass((v) => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-suave)', padding: 0 }}>
                    {showPass
                      ? <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
                      : <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                    }
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirmar nova senha</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              {error && <span className="form-error show" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>{error}</span>}
              <button className="btn btn-verde" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
