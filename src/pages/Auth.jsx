import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import useStore from '../store/useStore'
import { useToast } from '../hooks/useToast'
import Toast from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import { maskPhone, validatePassword } from '../utils/validators'
import { authService } from '../services/auth.js'
import { premontadasService } from '../services/premontadas.js'
import { listasService } from '../services/listas.js'

export default function Auth() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser, login } = useStore()
  const { toasts } = useToast()

  const modo = params.get('modo')
  const templateParam = params.get('template')

  const [tab, setTab] = useState(modo === 'criar' ? 'criar' : 'entrar')
  const [selectedTemplate, setSelectedTemplate] = useState(templateParam || null)
  const [fotoBase64, setFotoBase64] = useState(null)
  const [premontadas, setPremontadas] = useState([])

  const [loginForm, setLoginForm] = useState({ email: '', senha: '' })
  const [loginErrors, setLoginErrors] = useState({})
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginSenha, setShowLoginSenha] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const [regForm, setRegForm] = useState({ nomeNoiva: '', nomeNoivo: '', email: '', tel: '', data: '', senha: '', lgpd: false })
  const [regErrors, setRegErrors] = useState({})
  const [regLoading, setRegLoading] = useState(false)
  const [showRegSenha, setShowRegSenha] = useState(false)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  useEffect(() => {
    if (currentUser && ['noivo', 'gestor'].includes(currentUser.role)) {
      navigate(currentUser.role === 'gestor' ? '/admin' : '/dashboard')
    }
  }, [currentUser, navigate])

  useEffect(() => {
    premontadasService.getAll().then(setPremontadas).catch(() => {})
  }, [])

  async function handleLogin() {
    const errs = {}
    if (!loginForm.email) errs.email = 'Informe seu e-mail'
    if (!loginForm.senha) errs.senha = 'Informe sua senha'
    setLoginErrors(errs)
    if (Object.keys(errs).length) return
    setLoginLoading(true)
    try {
      const { user } = await authService.login(loginForm.email, loginForm.senha)
      login(user)
      navigate(user.role === 'gestor' ? '/admin' : '/dashboard')
    } catch (e) {
      setLoginErrors({ geral: e.message })
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleRegister() {
    const errs = {}
    if (!regForm.nomeNoiva || !regForm.nomeNoivo) errs.nome = 'Informe o nome de ambos os noivos'
    if (!regForm.email || !regForm.email.includes('@')) errs.email = 'E-mail inválido'
    if (!validatePassword(regForm.senha)) errs.senha = 'Mínimo 8 caracteres, 1 maiúscula e 1 número'
    if (!regForm.data) errs.geral = 'Informe a data do casamento.'
    if (!regForm.lgpd) errs.geral = 'Você precisa aceitar a política de privacidade.'
    setRegErrors(errs)
    if (Object.keys(errs).length) return

    setRegLoading(true)
    try {
      const nome = `${regForm.nomeNoiva} & ${regForm.nomeNoivo}`
      const { user } = await authService.register({
        nome_noiva: regForm.nomeNoiva,
        nome_noivo: regForm.nomeNoivo,
        email: regForm.email,
        telefone: regForm.tel || null,
        data_casamento: regForm.data || null,
        password: regForm.senha,
      })
      // The session cookie is already set; create the list before navigation.
      const lista = await listasService.create({
        user_id: user.id,
        nome_noivos: nome,
        telefone: regForm.tel || null,
        data_casamento: regForm.data || null,
        foto_casal: fotoBase64 || null,
      })

      if (selectedTemplate && lista?.id) {
        try {
          const itensPm = await premontadasService.getItens(selectedTemplate)
          await Promise.all(itensPm.map((item) => listasService.addItem(lista.id, item.id)))
        } catch { /* não bloqueia o cadastro */ }
      }

      login(user)
      navigate('/dashboard?novo=1')
    } catch (e) {
      setRegErrors({ geral: e.message })
    } finally {
      setRegLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Informe um e-mail válido')
      return
    }
    setForgotLoading(true)
    setForgotError('')
    try {
      await authService.forgotPassword(forgotEmail)
      setForgotSent(true)
    } catch (e) {
      setForgotError(e.message)
    } finally {
      setForgotLoading(false)
    }
  }

  function handleFotoUpload(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 800
        let { width, height } = img
        if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE }
        else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE }
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        setFotoBase64(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <Toast toasts={toasts} />
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-content">
            <h1 className="script auth-title-script">O amor merece ser celebrado</h1>
            <p>Monte, personalize e compartilhe a lista dos seus sonhos com quem você ama.</p>
          </div>
        </div>

        <div className="auth-right">
          <Link to="/" className="auth-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
            Voltar
          </Link>
          <div className="auth-logo">
            <img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ width: 180, height: 'auto' }} />
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'entrar' ? ' active' : ''}`} onClick={() => setTab('entrar')}>Entrar</button>
            <button className={`auth-tab${tab === 'criar' ? ' active' : ''}`} onClick={() => setTab('criar')}>Criar Conta</button>
          </div>

          {/* Login */}
          <div className={`auth-form${tab === 'entrar' ? ' active' : ''}`}>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              {loginErrors.email && <span className="form-error show">{loginErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <input type={showLoginSenha ? 'text' : 'password'} placeholder="Sua senha" value={loginForm.senha}
                  onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  style={{ paddingRight: '2.5rem' }} />
                <button type="button" aria-label={showLoginSenha ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowLoginSenha((v) => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-suave)', padding: 0 }}>
                  {showLoginSenha
                    ? <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
                    : <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                  }
                </button>
              </div>
              {loginErrors.senha && <span className="form-error show">{loginErrors.senha}</span>}
            </div>
            <div className="auth-forgot-row">
              <button type="button" className="auth-forgot-link" onClick={() => setShowForgotModal(true)}>Esqueci minha senha</button>
            </div>
            {loginErrors.geral && <span className="form-error show" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>{loginErrors.geral}</span>}
            <button className="btn btn-verde" style={{ width: '100%' }} onClick={handleLogin} disabled={loginLoading}>
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          {/* Register */}
          <div className={`auth-form${tab === 'criar' ? ' active' : ''}`}>
            <div className="auth-names-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nome completo da noiva</label>
                <input type="text" placeholder="Ex: Ana Souza" value={regForm.nomeNoiva}
                  onChange={(e) => setRegForm({ ...regForm, nomeNoiva: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nome completo do noivo</label>
                <input type="text" placeholder="Ex: Lucas Lima" value={regForm.nomeNoivo}
                  onChange={(e) => setRegForm({ ...regForm, nomeNoivo: e.target.value })} />
              </div>
            </div>
            {regErrors.nome && <span className="form-error show">{regErrors.nome}</span>}

            <div className="form-group">
              <label>Seu e-mail</label>
              <input type="email" placeholder="seu@email.com" value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
              {regErrors.email && <span className="form-error show">{regErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input type="text" placeholder="(00) 00000-0000" value={regForm.tel}
                onChange={(e) => setRegForm({ ...regForm, tel: maskPhone(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Data do casamento</label>
              <input type="date" className="date-input" min={minDate} max="9999-12-31" value={regForm.data}
                onChange={(e) => {
                  const val = e.target.value
                  const year = val.split('-')[0]
                  if (year && year.length > 4) return
                  setRegForm({ ...regForm, data: val })
                }} />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <input type={showRegSenha ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={regForm.senha}
                  onChange={(e) => setRegForm({ ...regForm, senha: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                  style={{ paddingRight: '2.5rem' }} />
                <button type="button" aria-label={showRegSenha ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowRegSenha((v) => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-suave)', padding: 0 }}>
                  {showRegSenha
                    ? <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
                    : <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                  }
                </button>
              </div>
              {regErrors.senha && <span className="form-error show">{regErrors.senha}</span>}
            </div>

            <div className="auth-template-section">
              <p className="label-caps" style={{ marginBottom: '1rem' }}>Deseja começar com uma lista pré-montada?</p>
              {premontadas.filter((p) => p.popular).map((p) => (
                <button type="button" key={p.id} className={`template-card auth-template-opt${selectedTemplate === p.id ? ' selected' : ''}`}
                  onClick={() => setSelectedTemplate(p.id)}>
                  <div className="auth-template-opt__info">
                    <div className="label-caps auth-template-opt__badge">{p.badge}</div>
                    <strong className="auth-template-opt__name">{p.nome}</strong>
                    <div className="auth-template-opt__count">{(p.itens || []).length} itens pré-selecionados</div>
                  </div>
                  <div className={`auth-radio${selectedTemplate === p.id ? ' checked' : ''}`} />
                </button>
              ))}
              <button type="button" className={`template-card auth-template-opt${selectedTemplate === '' ? ' selected' : ''}`}
                onClick={() => setSelectedTemplate('')}>
                <div className="auth-template-opt__info">
                  <strong className="auth-template-opt__name">Começar do zero</strong>
                  <div className="auth-template-opt__count">Adicione os itens pelo catálogo depois</div>
                </div>
                <div className={`auth-radio${selectedTemplate === '' ? ' checked' : ''}`} />
              </button>
              <p className="auth-template-hint">Opcional. Você pode personalizar depois no catálogo.</p>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label>Foto do Casal <span className="auth-foto-optional">(Opcional)</span></label>
              <input type="file" id="reg-foto" accept="image/*" style={{ display: 'none' }} onChange={handleFotoUpload} />
              {!fotoBase64 ? (
                <label htmlFor="reg-foto" className="auth-photo-empty">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.4 }}><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" /></svg>
                  Clique para adicionar uma foto do casal
                  <span className="auth-photo-empty__hint">JPG ou PNG · será usada no Story Instagram</span>
                </label>
              ) : (
                <img src={fotoBase64} onClick={() => document.getElementById('reg-foto').click()}
                  className="auth-photo-preview" alt="Preview" title="Clique para trocar a foto" />
              )}
            </div>

            <div className="auth-lgpd-row form-group">
              <input type="checkbox" id="reg-lgpd" checked={regForm.lgpd}
                onChange={(e) => setRegForm({ ...regForm, lgpd: e.target.checked })}
                style={{ width: 'auto', marginTop: 2 }} />
              <label htmlFor="reg-lgpd" className="auth-lgpd-label">
                Li e aceito a <button type="button" style={{ background: 'none', border: 'none', padding: 0, color: 'var(--verde)', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit' }} onClick={() => setShowPrivacyModal(true)}>Política de Privacidade</button> e o uso dos meus dados conforme descrito.
              </label>
            </div>
            {regErrors.geral && <span className="form-error show" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>{regErrors.geral}</span>}
            <button className="btn btn-verde" style={{ width: '100%', marginTop: '1rem' }} onClick={handleRegister} disabled={regLoading}>
              {regLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Política de Privacidade"
        maxWidth="620px"
        footer={
          <button type="button" className="btn btn-verde btn-sm" style={{ width: '100%' }} onClick={() => setShowPrivacyModal(false)}>
            Fechar
          </button>
        }
      >
        <div style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--texto)', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            A <strong>La Provence</strong> valoriza a privacidade dos seus clientes e está comprometida com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>

          <p style={{ fontWeight: 700, color: 'var(--verde)', marginBottom: '0.4rem', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>1. Dados coletados</p>
          <p style={{ marginBottom: '1rem' }}>
            Coletamos os seguintes dados fornecidos voluntariamente no cadastro: nome do casal, endereço de e-mail, telefone e foto do casal (opcional). Esses dados são necessários para a criação e gestão da lista de presentes.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--verde)', marginBottom: '0.4rem', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>2. Finalidade do uso</p>
          <p style={{ marginBottom: '1rem' }}>
            Seus dados são utilizados exclusivamente para: criação e gerenciamento da lista de casamento; comunicação com os noivos sobre presentes e compras realizadas; personalização da experiência na plataforma.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--verde)', marginBottom: '0.4rem', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>3. Compartilhamento de dados</p>
          <p style={{ marginBottom: '1rem' }}>
            Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais. Os dados podem ser acessados apenas pela equipe autorizada da La Provence para fins operacionais.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--verde)', marginBottom: '0.4rem', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>4. Armazenamento e segurança</p>
          <p style={{ marginBottom: '1rem' }}>
            Seus dados são armazenados em servidores seguros e protegidos por medidas técnicas e organizacionais adequadas para prevenir acesso não autorizado, perda ou divulgação indevida.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--verde)', marginBottom: '0.4rem', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>5. Seus direitos</p>
          <p style={{ marginBottom: '1rem' }}>
            Nos termos da LGPD, você tem direito a: acessar seus dados; corrigir informações incorretas; solicitar a exclusão dos seus dados; revogar o consentimento a qualquer momento. Para exercer esses direitos, entre em contato conosco.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--verde)', marginBottom: '0.4rem', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>6. Contato</p>
          <p style={{ marginBottom: '0' }}>
            Em caso de dúvidas sobre esta Política de Privacidade, entre em contato com a La Provence através dos nossos canais oficiais de atendimento.
          </p>
        </div>
      </Modal>

      <Modal
        open={showForgotModal}
        onClose={() => { setShowForgotModal(false); setForgotSent(false); setForgotEmail(''); setForgotError('') }}
        title="Esqueci minha senha"
        maxWidth="380px"
        footer={
          forgotSent ? (
            <button type="button" className="btn btn-verde btn-sm" style={{ width: '100%' }} onClick={() => { setShowForgotModal(false); setForgotSent(false); setForgotEmail('') }}>
              Fechar
            </button>
          ) : (
            <button type="button" className="btn btn-verde btn-sm" style={{ width: '100%' }} onClick={handleForgotPassword} disabled={forgotLoading}>
              {forgotLoading ? 'Enviando...' : 'Enviar link'}
            </button>
          )
        }
      >
        {forgotSent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--texto)' }}>
              Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--texto-suave)', marginTop: '0.5rem' }}>
              Verifique sua caixa de entrada e spam.
            </p>
          </div>
        ) : (
          <div style={{ padding: '0.5rem 0' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', marginBottom: '1rem' }}>
              Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
            </p>
            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
              />
              {forgotError && <span className="form-error show">{forgotError}</span>}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
