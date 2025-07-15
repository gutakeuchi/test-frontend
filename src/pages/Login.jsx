import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import '../Login.css';


function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [aplicacoes, setAplicacoes] = useState([]);
  const [aplicacaoSelecionada, setAplicacaoSelecionada] = useState('061f92f5-f2a2-410a-8e2b-b3a28132c258');
  const [aplicacaoSelecionada2, setAplicacaoSelecionada2] = useState('061f92f5-f2a2-410a-8e2b-b3a28132c258'); 

  /*  
    na api somente a licença 900 está funcionando na hora de passar a aplicacaoId, por isso tive que criar uma segunda
    variável chamada aplicacaoSelecionada2 para poder manter a aplicacaoSelecionada estática ao mesmo tempo que simula 
    a seleção.
  */

  useEffect(() => {
    async function fetchAplicacoes() {
      try {
        const response = await api.get('/api/v2/aplicacoes');
        setAplicacoes(response.data);
        // Opcional: selecionar a aplicação que tem consultaInicial === true por padrão
        const inicial = response.data.find(app => app.consultaInicial);
        // if (inicial) setAplicacaoSelecionada(inicial.id);
      } catch (err) {
        console.error('Erro ao buscar aplicações:', err);
      }
    }
    fetchAplicacoes();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const response = await api.post('https://api-pedido-erp-gateway-prod.saurus.net.br/api/v2/auth', {
        usuario: usuario,
        senha: senha,
        aplicacaoId: aplicacaoSelecionada,
      });

      console.log('Login OK:', response.data);
      login();

      navigate(`/pedidos?username=${usuario}&aplicacaoId=${aplicacaoSelecionada}`);
    } catch (err) {
      console.error('Erro no login:', err.response?.data || err.message);
      setErro('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleLogin}>
          { <div className="form-group">
            <label htmlFor="selectAplicacao">Aplicação</label>
            <select
              id="selectAplicacao"
              value={aplicacaoSelecionada2}
              onChange={(e) => setAplicacaoSelecionada2(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Selecione a aplicação --
              </option>
              {aplicacoes.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.nomeReferencia}
                </option>
              ))}
            </select>
          </div> }
          <div className="form-group">
            <label>Usuário</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          {erro && <p className="erro">{erro}</p>}
          <button type="submit" className="login-button">Acessar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;