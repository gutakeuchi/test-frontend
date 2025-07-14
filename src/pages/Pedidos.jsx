import { useEffect, useState } from 'react';
import api from '../api/api';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Pedidos.css';

function Pedidos() {
  const [pedidos, setPedidos] = useState(null);
  const [filtroCNPJ, setFiltroCNPJ] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [pedidosSelecionados, setPedidosSelecionados] = useState([]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const usuario = params.get('username');

  const navigate = useNavigate();

  const carregarPedidos = async () => {
    try {
      const response = await api.get(
        `https://api-pedido-erp-gateway-prod.saurus.net.br/api/v2/financeiro/faturas?Page=${pagina}&PageSize=10`,
        {
          headers: {
            aplicacaoId: '061f92f5-f2a2-410a-8e2b-b3a28132c258',
            username: usuario,
          },
        }
      );

      setPedidos(response.data);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, [pagina]);

  const handleBuscar = (e) => {
    e.preventDefault();
    carregarPedidos();
  };

  const handlePagamento = (numeroFatura) => {
    navigate(`/pagamento?numeroFatura=${numeroFatura}&username=${usuario}`);
  };

  const handleSelecionar = (pedido) => {
    setPedidosSelecionados((prev) => {
      const jaSelecionado = prev.find((p) => p.numeroFatura === pedido.numeroFatura);
      if (jaSelecionado) {
        return prev.filter((p) => p.numeroFatura !== pedido.numeroFatura);
      } else {
        return [...prev, pedido];
      }
    });
  };

  const totalSelecionado = pedidosSelecionados.reduce(
    (acc, pedido) => acc + pedido.valorFatura,
    0
  );

  const handlePagamentoSelecionados = () => {
    const numeros = pedidosSelecionados.map((p) => p.numeroFatura).join(',');
    navigate(`/pagamento?numerosFaturas=${numeros}&username=${usuario}`);
  };

  const isSelecionado = (numeroFatura) =>
    pedidosSelecionados.some((p) => p.numeroFatura === numeroFatura);

  return (
    <div className="pedidos-container">
      <h2>Pedidos Pendentes</h2>

      <form onSubmit={handleBuscar} className="filtros-form">
        <input
          type="text"
          placeholder="CNPJ"
          value={filtroCNPJ}
          onChange={(e) => setFiltroCNPJ(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <input
          type="text"
          placeholder="Código"
          value={filtroCodigo}
          onChange={(e) => setFiltroCodigo(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      {pedidos && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {pedidos.totalResults === 0 && <p>Nenhum pedido encontrado.</p>}

          {pedidos.list.map((pedido) => (
            <li key={pedido.numeroFatura} className="pedido-item">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={isSelecionado(pedido.numeroFatura)}
                  onChange={() => handleSelecionar(pedido)}
                />
                <div>
                  <strong>Pedido:</strong> {pedido.numeroFatura}
                  <br />
                  <strong>Cliente:</strong> {pedido.pessoa.nome}
                  <br />
                  <strong>Total:</strong> R$ {pedido.valorFatura.toFixed(2)}
                  <br />
                  <button type="button" onClick={() => handlePagamento(pedido.numeroFatura)}>
                    Pagar Individual
                  </button>
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}

      {pedidosSelecionados.length > 0 && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>
            <strong>Total Selecionado:</strong> R$ {totalSelecionado.toFixed(2)}
          </p>
          <button className="botao-pagar" onClick={handlePagamentoSelecionados}>
            Pagar Selecionados ({pedidosSelecionados.length})
          </button>
        </div>
      )}

      <div className="paginacao">
        <button onClick={() => setPagina((p) => Math.max(p - 1, 1))}>Anterior</button>
        <span>Página {pagina}</span>
        <button onClick={() => setPagina((p) => p + 1)}>Próxima</button>
      </div>
    </div>
  );
}

export default Pedidos;
