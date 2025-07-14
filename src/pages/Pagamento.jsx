import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../Pagamento.css';

function Pagamento() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const username = params.get('username');
  const numeroFaturaUnica = params.get('numeroFatura');
  const numerosFaturas = params.get('numerosFaturas'); // múltiplas

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formaPagamento, setFormaPagamento] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [codigoSeguranca, setCodigoSeguranca] = useState('');

  // Estado para controlar animação/status do pagamento
  const [statusPagamento, setStatusPagamento] = useState('idle'); // 'idle' | 'processing' | 'success'

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        setError(null);

        const resposta = await api.get(
          'https://api-pedido-erp-gateway-prod.saurus.net.br/api/v2/financeiro/faturas',
          {
            headers: {
              aplicacaoId: '061f92f5-f2a2-410a-8e2b-b3a28132c258',
              username: username,
            },
          }
        );

        let listaFaturas = [];
        if (numeroFaturaUnica) {
          listaFaturas = resposta.data.list.filter(
            (p) => p.numeroFatura === numeroFaturaUnica
          );
        } else if (numerosFaturas) {
          const faturasArray = numerosFaturas.split(',');
          listaFaturas = resposta.data.list.filter((p) =>
            faturasArray.includes(p.numeroFatura)
          );
        }

        if (listaFaturas.length > 0) {
          setPedidos(listaFaturas);
        } else {
          setError('Pedido(s) não encontrado(s).');
        }
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        setError('Erro ao buscar pedidos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [numeroFaturaUnica, numerosFaturas, username]);

  const valorTotal = pedidos.reduce((acc, p) => acc + p.valorFatura, 0);

  const handlePagamento = async () => {
    if (!formaPagamento) {
      alert('Selecione uma forma de pagamento.');
      return;
    }

    if (formaPagamento === 'PIX' && chavePix.trim() === '') {
      alert('Informe a chave PIX.');
      return;
    }

    if (
      (formaPagamento === 'Crédito' || formaPagamento === 'Débito') &&
      (numeroCartao.trim() === '' ||
        validade.trim() === '' ||
        codigoSeguranca.trim() === '')
    ) {
      alert('Preencha todos os dados do cartão.');
      return;
    }

    // Inicia animação de processamento
    setStatusPagamento('processing');

    // Simula o tempo de processamento (ex: 2.5 segundos)
    setTimeout(async () => {
      try {
        await api.post(
          'https://api-pedido-erp-gateway-prod.saurus.net.br/api/v2/financeiro/retorno',
          {
            faturas: pedidos,
            valorTotal: valorTotal,
            resultadoTransacao: {
              idTransacao: 'abc123',
              status: 0,
              tipoPagamento: formaPagamento === 'PIX' ? 1 : 2,
              valorPagamento: valorTotal,
              dTransacao: new Date().toISOString(),
              msgRetorno: 'Transação simulada com sucesso.',
            },
          },
          {
            headers: {
              aplicacaoId: '061f92f5-f2a2-410a-8e2b-b3a28132c258',
              username: username,
            },
          }
        );

        // Após sucesso, muda status para success
        setStatusPagamento('success');

        // Redireciona após 2.5s
        setTimeout(() => {
          navigate(`/pedidos?username=${username}`);
        }, 2500);
      } catch (err) {
        console.error('Erro no envio da transação:', err);
        alert('Erro no pagamento. Tente novamente.');
        setStatusPagamento('idle'); // volta para estado inicial
      }
    }, 2500);
  };

  if (loading) return <p>Carregando dados do(s) pedido(s)...</p>;
  if (error) return <p>{error}</p>;

  // Renderiza a animação e mensagens conforme o status
  if (statusPagamento === 'processing') {
  return (
    <div
      className="pagamento-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div className="loading-spinner" />
      <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
        Pagamento em andamento...
      </p>
    </div>
  );
}

if (statusPagamento === 'success') {
  return (
    <div
      className="pagamento-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
        padding: '2rem',
        textAlign: 'center',
        color: '#FF0000', 
      }}
    >
      <i
        className="fas fa-check-circle"
        style={{ fontSize: '4rem', marginBottom: '1rem' }}
      />
      <p
        style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          marginBottom: '0.5rem',
        }}
      >
        Pagamento efetuado com sucesso!
      </p>
      <p>Aguarde, você será redirecionado...</p>
    </div>
  );
}

  return (
    <div className="pagamento-container">
      <div className="pagamento-card">
        <h2 className="titulo">
          Pagamento de {pedidos.length > 1 ? 'Pedidos' : 'Pedido'}
        </h2>

        {pedidos.map((p) => (
          <div key={p.numeroFatura} style={{ marginBottom: '1rem' }}>
            <p>
              <strong>Pedido:</strong> {p.numeroFatura}
            </p>
            <p>
              <strong>Cliente:</strong> {p.pessoa.nome}
            </p>
            <p>
              <strong>Valor:</strong> R$ {p.valorFatura.toFixed(2)}
            </p>
            <hr />
          </div>
        ))}

        <div className="caixa">
          <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem' }}>
            Valor Total: R$ {valorTotal.toFixed(2)}
          </p>
        </div>

        <div className="secao-forma">
          <label>
            <strong>Forma de Pagamento</strong>
          </label>
          <div className="forma-opcoes">
            <label>
              <input
                type="radio"
                name="pagamento"
                value="Crédito"
                checked={formaPagamento === 'Crédito'}
                onChange={(e) => setFormaPagamento(e.target.value)}
              />
              <span style={{ marginLeft: '0.5rem' }}>
                <i className="fas fa-credit-card" style={{ marginRight: '0.4rem' }}></i>
                Crédito
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="pagamento"
                value="Débito"
                checked={formaPagamento === 'Débito'}
                onChange={(e) => setFormaPagamento(e.target.value)}
              />
              <span style={{ marginLeft: '0.5rem' }}>
                <i className="fas fa-credit-card" style={{ marginRight: '0.4rem' }}></i>
                Débito
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="pagamento"
                value="PIX"
                checked={formaPagamento === 'PIX'}
                onChange={(e) => setFormaPagamento(e.target.value)}
              />
              <span style={{ marginLeft: '0.5rem' }}>
                <i className="fas fa-qrcode" style={{ marginRight: '0.4rem' }}></i>
                PIX
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="pagamento"
                value="Boleto"
                checked={formaPagamento === 'Boleto'}
                onChange={(e) => setFormaPagamento(e.target.value)}
              />
              <span style={{ marginLeft: '0.5rem' }}>
                <i className="fa-solid fa-file-invoice" style={{ marginRight: '0.4rem' }}></i>
                Boleto
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="pagamento"
                value="Dinheiro"
                checked={formaPagamento === 'Dinheiro'}
                onChange={(e) => setFormaPagamento(e.target.value)}
              />
              <span style={{ marginLeft: '0.5rem' }}>
                <i
                  className="fa-solid fa-money-bill-wave"
                  style={{ marginRight: '0.4rem' }}
                ></i>
                Dinheiro
              </span>
            </label>
          </div>
        </div>

        {formaPagamento === 'PIX' && (
          <div className="secao-input">
            <label>Chave PIX</label>
            <input
              type="text"
              placeholder="Chave PIX"
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
            />
          </div>
        )}

        {(formaPagamento === 'Crédito' || formaPagamento === 'Débito') && (
          <div className="secao-input">
            <label>Número do cartão</label>
            <input
              type="text"
              placeholder="Número do cartão"
              value={numeroCartao}
              onChange={(e) => setNumeroCartao(e.target.value)}
            />
            <label>Validade (MM/AA)</label>
            <input
              type="text"
              placeholder="MM/AA"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
            />
            <label>Código de segurança</label>
            <input
              type="text"
              placeholder="CVV"
              value={codigoSeguranca}
              onChange={(e) => setCodigoSeguranca(e.target.value)}
            />
          </div>
        )}

        <button className="botao-pagar" onClick={handlePagamento}>
          Pagar R$ {valorTotal.toFixed(2)}
        </button>
      </div>
    </div>
  );
}

export default Pagamento;
