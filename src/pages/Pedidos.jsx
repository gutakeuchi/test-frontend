import { useEffect, useState } from 'react';
import api from '../api/api';
import { useNavigate, useLocation } from 'react-router-dom';

function Pedidos() {
  const [pedidos, setPedidos] = useState(null);
  const [filtroCNPJ, setFiltroCNPJ] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [pagina, setPagina] = useState(1);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const usuario = params.get('username');

  const navigate = useNavigate();

  const carregarPedidos = async () => {
    try {
      const response = await api.get(`https://api-pedido-erp-gateway-prod.saurus.net.br/api/v2/financeiro/faturas?Page=${pagina}&PageSize=${10}`, {
        headers: {
          aplicacaoId: '061f92f5-f2a2-410a-8e2b-b3a28132c258',
          username: usuario,
        }
      });

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

  const handlePagamento = (numeroFatura, usuario) => {
    navigate(`/pagamento?numeroFatura=${numeroFatura}&username=${usuario}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Pedidos Pendentes</h2>

      <form onSubmit={handleBuscar} style={{ marginBottom: 20 }}>
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
        <ul>
          {pedidos["totalResults"] === 0 && <p>Nenhum pedido encontrado.</p>}

          {pedidos["list"].map((pedido) => (
            <li key={pedido.numeroFatura} style={{ marginBottom: 10 }}>
              <strong>Pedido:</strong> {pedido.numeroFatura} | <strong>Cliente:</strong> {pedido.pessoa.nome}<br />
              <strong>Total:</strong> R$ {pedido.valorFatura.toFixed(2)}<br />
              <button onClick={() => handlePagamento(pedido.numeroFatura, usuario)}>Pagar</button>
            </li>
          ))}
        </ul>
      )}

      {<div style={{ marginTop: 20 }}>
        <button onClick={() => setPagina((p) => Math.max(p - 1, 1))}>Anterior</button>
        <span style={{ margin: '0 10px' }}>Página {pagina}</span>
        <button onClick={() => setPagina((p) => p + 1)}>Próxima</button>
      </div>}
    </div>
  );
}

export default Pedidos;