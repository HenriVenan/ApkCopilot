import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/ui/Field';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './Login.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [operatorId, setOperatorId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from || '/cards';

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulates a network round-trip so the screen behaves like a real
    // authentication step; swap the inside for a real API call later.
    setTimeout(() => {
      const result = login(operatorId, password);
      setLoading(false);
      if (result.ok) {
        navigate(redirectTo, { replace: true });
      } else {
        setError(result.error);
      }
    }, 400);
  }

  return (
    <div className={styles.screen}>
      <div className={`${styles.card} panel`}>
        <div className={styles.radarWrap}>
          <div className={styles.radar} aria-hidden="true" />
        </div>

        <div className={styles.eyebrow}>Torre de Controle</div>
        <h1 className={styles.title}>APK CargioTran</h1>
        <p className={styles.subtitle}>Identifique-se para acessar os canais de operação</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Field label="Matrícula do operador">
            <Input
              type="text"
              placeholder="ex: OP-1042"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </Field>

          <Field label="Senha" className="field">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.submit}>
            <Button type="submit" variant="primary" block disabled={loading}>
              {loading ? 'Verificando…' : 'Entrar na torre'}
            </Button>
          </div>
        </form>

        <p className={styles.hint}>
          Demo local · matrícula com 3+ caracteres, senha com 4+ caracteres
        </p>
      </div>
    </div>
  );
}
