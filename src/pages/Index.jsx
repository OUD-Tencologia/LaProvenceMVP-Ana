import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Modal from '../components/ui/Modal';
import ItemCarousel from '../components/ui/ItemCarousel';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import useStore from '../store/useStore';
import { formatMoney } from '../utils/formatters';
import { Link } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import StepsSection from '../components/sections/StepsSection';
import TemplatesSection from '../components/sections/TemplatesSection';
import WeddingGallery from '../components/sections/WeddingGallery';
import FeaturesSection from '../components/sections/FeaturesSection';
import WhySection from '../components/sections/WhySection';
import FAQSection from '../components/sections/FAQSection';
import CTASection from '../components/sections/CTASection';
import SiteFooter from '../components/sections/SiteFooter';
import WABubble from '../components/sections/WABubble';

export default function Index() {
  const navigate = useNavigate();
  const { getListaByCodigo, getPremontadas, getCatalogo } = useStore();
  const { toasts, toast } = useToast();
  const [previewModal, setPreviewModal] = useState(null);

  const premontadas = getPremontadas();
  const catalogo = getCatalogo();

  useEffect(() => {
    function reveal() {
      document.querySelectorAll('.reveal').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) el.classList.add('active');
      });
    }
    window.addEventListener('scroll', reveal);
    reveal();
    return () => window.removeEventListener('scroll', reveal);
  }, []);

  function acessarLista(code) {
    if (!code) { toast('Digite o código da lista.', 'error'); return; }
    const lista = getListaByCodigo(code);
    if (!lista) { toast('Lista não encontrada. Verifique o código.', 'error'); return; }
    navigate('/lista?codigo=' + code.toUpperCase());
  }

  function verItensLista(p) {
    const itens = p.itens.map((id) => catalogo.find((c) => c.id === id)).filter(Boolean);
    setPreviewModal({ ...p, itensCatalog: itens });
  }

  return (
    <>
      <Toast toasts={toasts} />
      <Navbar />
      <HeroSection onAcessarLista={acessarLista} />
      <StepsSection />
      <TemplatesSection premontadas={premontadas} onVerItens={verItensLista} />
      <WeddingGallery />
      <FeaturesSection />
      <WhySection />
      <FAQSection />
      <CTASection />
      <SiteFooter />
      <WABubble />

      <Modal
        open={!!previewModal}
        onClose={() => setPreviewModal(null)}
        title={previewModal ? `Lista ${previewModal.nome}` : ''}
        maxWidth="780px"
        footer={
          <>
            <button className="btn btn-outline-dark btn-sm" onClick={() => setPreviewModal(null)}>Fechar</button>
            {previewModal && (
              <Link to={`/auth?modo=criar&template=${previewModal.id}`} className="btn btn-verde btn-sm">Usar esta lista</Link>
            )}
          </>
        }
      >
        {previewModal && (
          <div className="template-preview-grid">
            {previewModal.itensCatalog.map((item) => (
              <div key={item.id} className="template-preview-card">
                <ItemCarousel item={item} context="prev" />
                <div className="template-preview-card__meta">
                  <div className="template-preview-card__setor">{item.setor}</div>
                  <div className="template-preview-card__name">{item.nome}</div>
                  <div className="template-preview-card__price">{formatMoney(item.preco)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
