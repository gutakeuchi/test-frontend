import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api/api';

function Pagamento() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [forma, setForma] = useState('');
  const [cartao, setCartao] = useState({ numero: '', validade: '', codigo: '' });
  const [pix, setPix] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const numeroFatura = params.get('numeroFatura');
  const usuario = params.get('username');


  // Buscar pedido fictício pelo ID (como não temos endpoint específico, simula)
  useEffect(() => {
    const buscarPedido = async () => {
      try {
        const resposta = await api.get(`https://api-pedido-erp-gateway-prod.saurus.net.br/api/v2/financeiro/faturas?NumFatura=${numeroFatura}`, {
          headers: {
            aplicacaoId: '061f92f5-f2a2-410a-8e2b-b3a28132c258',
            username: usuario,
          }
        });
        
        const encontrado = resposta.data.list.filter(
          (pedido) => pedido.numeroFatura === numeroFatura)[0]
        if (encontrado) {
          setPedido(encontrado);
        } else {
          setMensagem('Pedido não encontrado');
        }
      } catch (err) {
        console.error('Erro ao carregar pedido:', err);
      }
    };

    buscarPedido();
  }, [id]);

  const handlePagamento = async () => {
    let payload = {
      pedidoId: pedido.id,
      formaPagamento: forma,
      valor: pedido.total,
    };

    if (forma === 'credito' || forma === 'debito') {
      payload = {
        ...payload,
        cartao: { ...cartao }
      };
    } else if (forma === 'pix') {
      payload = {
        ...payload,
        chavePix: pix
      };
    }

    try {
      await api.post('https://api-pedido-erp-gateway-prod.saurus.net.br/api/v2/financeiro/retorno', {
        "faturas": [
          pedido
        ],
        "valorTotal": 0,
        "resultadoTransacao": {
          "idTransacao": "string",
          "nsu": "string",
          "codAut": "string",
          "codControle": "string",
          "dRetorno": "2025-07-13T23:46:24.225Z",
          "numCartao": "string",
          "bandeira": "string",
          "rede": "string",
          "adquirente": "string",
          "valorPagamento": 0,
          "tipoPagamento": 1,
          "qtdeParcelas": 0,
          "dTransacao": "2025-07-13T23:46:24.225Z",
          "status": 0,
          "msgRetorno": "string",
          "arqRetorno": "string"
        }
      }, {
        headers: {
          aplicacaoid: '061f92f5-f2a2-410a-8e2b-b3a28132c258',
          username: usuario,
        }

      });
      alert('Pagamento processado com sucesso!');
      navigate(`/pedidos?username=${usuario}`);
    } catch (err) {
      console.error('Erro no pagamento:', err);
      alert('Erro no pagamento. Tente novamente.');
    }
  };

  if (!pedido) return <p>Carregando pedido...</p>;
  if (mensagem) return <p>{mensagem}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Pagamento do Pedido #{pedido.numeroFatura}</h2>
      <p><strong>Cliente:</strong> {pedido.nomeCliente}</p>
      <p><strong>Total:</strong> R$ {pedido.valorFatura.toFixed(2)}</p>

      <div style={{ marginTop: 20 }}>
        <h3>Forma de Pagamento</h3>
        <label>
          <input type="radio" value="credito" checked={forma === 'credito'} onChange={(e) => setForma(e.target.value)} />
          Crédito
        </label>
        <label>
          <input type="radio" value="debito" checked={forma === 'debito'} onChange={(e) => setForma(e.target.value)} />
          Débito
        </label>
        <label>
          <input type="radio" value="pix" checked={forma === 'pix'} onChange={(e) => setForma(e.target.value)} />
          PIX
        </label>
      </div>

      {forma === 'credito' || forma === 'debito' ? (
        <div style={{ marginTop: 10 }}>
          <h4>Dados do Cartão</h4>
          <input
            type="text"
            placeholder="Número do cartão"
            value={cartao.numero}
            onChange={(e) => setCartao({ ...cartao, numero: e.target.value })}
          /><br />
          <input
            type="text"
            placeholder="Validade (MM/AA)"
            value={cartao.validade}
            onChange={(e) => setCartao({ ...cartao, validade: e.target.value })}
          /><br />
          <input
            type="text"
            placeholder="Código de segurança"
            value={cartao.codigo}
            onChange={(e) => setCartao({ ...cartao, codigo: e.target.value })}
          />
        </div>
      ) : null}

      {forma === 'pix' && (
        <div style={{ marginTop: 10 }}>
          <h4>Chave PIX</h4>
          <input
            type="text"
            placeholder="Chave PIX"
            value={pix}
            onChange={(e) => setPix(e.target.value)}
          />
        </div>
      )}

      <button onClick={handlePagamento} style={{ marginTop: 20 }}>
        Pagar
      </button>
    </div>
  );
}

export default Pagamento;
