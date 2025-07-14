import { useState } from 'react';
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const response = await api.post('https://api-pedido-erp-gateway-prod.saurus.net.br/api/v2/auth', {
        usuario: usuario,
        senha: senha,
        aplicacaoId: '061f92f5-f2a2-410a-8e2b-b3a28132c258',
      });

      console.log('Login OK:', response.data);
      login();
      navigate(`/pedidos?username=${usuario}`);
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