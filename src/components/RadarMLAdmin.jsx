import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  BadgePercent,
  CircleCheck,
  CircleDollarSign,
  CloudOff,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  GitBranch,
  Info,
  LoaderCircle,
  Package,
  Plus,
  Radar,
  RefreshCw,
  Rocket,
  Settings,
  ShieldCheck,
  Target,
  Trash2,
  TriangleAlert,
  Workflow,
  X,
} from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const PRODUTOS_INICIAIS = [
  {
    termo: 'smartwatch ultra series 9 nfc bluetooth',
    precoMaximo: 65.0,
    palavrasObrigatorias: ['smartwatch', 'ultra'],
    palavrasProibidas: ['pulseira', 'pelicula', 'capa', 'cabo'],
  },
  {
    termo: 'fone bluetooth tws sem fio gamer',
    precoMaximo: 45.0,
    palavrasObrigatorias: ['fone', 'bluetooth'],
    palavrasProibidas: ['capa', 'case', 'borrachinha'],
  },
  {
    termo: 'carregador turbo 30w tipo c fonte rapida',
    precoMaximo: 38.0,
    palavrasObrigatorias: ['carregador', 'turbo'],
    palavrasProibidas: ['cabo avulso', 'suporte'],
  },
];

const OPORTUNIDADES_INICIAIS = [
  {
    termoBusca: 'smartwatch hello watch 3 amoled nfc',
    custoML: 115.0,
    revendaSugerida: 229.9,
    tendenciaCeara: 'Em Alta 🔥',
    statusConcorrencia: 'Baixa concorrência local ✅',
    scoreOportunidade: 94,
    linkML: 'https://lista.mercadolivre.com.br/smartwatch-amoled-nfc',
  },
  {
    termoBusca: 'fone bluetooth lenovo gm2 pro gamer',
    custoML: 39.0,
    revendaSugerida: 89.9,
    tendenciaCeara: 'Em Alta 🔥',
    statusConcorrencia: 'Alta procura Uber Flash',
    scoreOportunidade: 90,
    linkML: 'https://lista.mercadolivre.com.br/fone-lenovo-gm2-pro',
  },
  {
    termoBusca: 'mini compressor de ar portatil digital 12v',
    custoML: 68.0,
    revendaSugerida: 149.9,
    tendenciaCeara: 'Em Alta 🔥',
    statusConcorrencia: '2 anúncios no Cariri',
    scoreOportunidade: 87,
    linkML: 'https://lista.mercadolivre.com.br/mini-compressor-de-ar-portatil',
  },
];

const GH_API = 'https://api.github.com';
const BRANCH_PADRAO = 'main';

const ARQUIVOS = {
  produtos: 'produtos.json',
  oportunidades: 'oportunidades_crato.json',
};

const CHAVES_STORAGE = {
  produtos: 'faciil.radar.produtos',
  oportunidades: 'faciil.radar.oportunidades',
  config: 'faciil.radar.github',
};

const PALAVRAS_PROIBIDAS_PADRAO = ['capa', 'suporte', 'cabo', 'pelicula'];

const ABAS = [
  { id: 'oportunidades', label: 'Oportunidades', icone: Radar },
  { id: 'fila', label: 'Fila de Produtos', icone: Package },
  { id: 'automacao', label: 'Automação', icone: Workflow },
];

const WORKFLOWS = [
  {
    arquivo: 'monitor.yml',
    titulo: 'Monitor de Preços',
    descricao:
      'Percorre a fila de produtos.json e avisa quando o preço fica abaixo do teto definido. Ideal para rodar de hora em hora.',
    icone: Activity,
  },
  {
    arquivo: 'radar.yml',
    titulo: 'Radar de Oportunidades',
    descricao:
      'Varre o Mercado Livre atrás de produtos com margem alta no Cariri e atualiza oportunidades_crato.json.',
    icone: Radar,
  },
];

const ESTILO_CARD = {
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(15, 23, 42, 0.06)',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
};

const ESTILO_INPUT = {
  backgroundColor: '#F8FAFC',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  color: '#1A2238',
};

const formatadorBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatarMoeda(valor) {
  const numero = Number(valor);
  return formatadorBRL.format(Number.isFinite(numero) ? numero : 0);
}

function dividirPalavras(texto) {
  return String(texto || '')
    .split(',')
    .map((palavra) => palavra.trim())
    .filter(Boolean);
}

function lerStorage(chave, fallback) {
  try {
    const bruto = localStorage.getItem(chave);
    if (!bruto) return fallback;
    return JSON.parse(bruto);
  } catch {
    return fallback;
  }
}

function gravarStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Armazenamento indisponível (modo privado) — segue apenas em memória.
  }
}

function removerStorage(chave) {
  try {
    localStorage.removeItem(chave);
  } catch {
    // ignora
  }
}

function configuracaoInicial() {
  const salva = lerStorage(CHAVES_STORAGE.config, {}) || {};
  const owner = import.meta.env.VITE_GITHUB_OWNER || salva.owner || '';
  const repo = import.meta.env.VITE_GITHUB_REPO || salva.repo || '';
  const token = import.meta.env.VITE_GITHUB_TOKEN || salva.token || '';

  return {
    owner,
    repo,
    token,
    lembrar: Boolean(salva.lembrar && token),
    branch: BRANCH_PADRAO,
  };
}

function codificarBase64(texto) {
  const bytes = new TextEncoder().encode(texto);
  let binario = '';
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte);
  });
  return btoa(binario);
}

function decodificarBase64(base64) {
  const binario = atob(String(base64).replace(/\s/g, ''));
  const bytes = Uint8Array.from(binario, (caractere) => caractere.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function criarErro(mensagem, status = 0) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function mensagemHttp(status) {
  switch (status) {
    case 401:
      return 'Token inválido ou expirado (401).';
    case 403:
      return 'Sem permissão (403). O token precisa de Contents e Actions com escrita.';
    case 404:
      return 'Repositório, arquivo ou workflow não encontrado (404).';
    case 409:
      return 'O arquivo mudou no GitHub (409). Tente novamente.';
    case 422:
      return 'O GitHub rejeitou os dados enviados (422).';
    default:
      return `Falha na API do GitHub (${status}).`;
  }
}

async function chamarGitHub(config, caminho, opcoes = {}) {
  const url = `${GH_API}/repos/${config.owner}/${config.repo}${caminho}`;
  return fetch(url, {
    ...opcoes,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opcoes.headers || {}),
    },
  });
}

async function lerArquivo(config, caminho) {
  const branch = config.branch || BRANCH_PADRAO;
  const resposta = await chamarGitHub(
    config,
    `/contents/${caminho}?ref=${encodeURIComponent(branch)}`
  );

  if (!resposta.ok) {
    throw criarErro(mensagemHttp(resposta.status), resposta.status);
  }

  const dados = await resposta.json();

  try {
    return JSON.parse(decodificarBase64(dados.content));
  } catch {
    throw criarErro(`O arquivo ${caminho} não contém um JSON válido.`);
  }
}

async function lerShaArquivo(config, caminho) {
  const branch = config.branch || BRANCH_PADRAO;
  const resposta = await chamarGitHub(
    config,
    `/contents/${caminho}?ref=${encodeURIComponent(branch)}`
  );

  if (resposta.status === 404) return null;
  if (!resposta.ok) throw criarErro(mensagemHttp(resposta.status), resposta.status);

  const dados = await resposta.json();
  return dados.sha || null;
}

async function gravarArquivo(config, caminho, valor) {
  const conteudo = codificarBase64(`${JSON.stringify(valor, null, 2)}\n`);
  const mensagem = `Atualiza ${caminho} via Painel ADM Faciil`;

  const montarCorpo = (sha) =>
    JSON.stringify({
      message: mensagem,
      content: conteudo,
      ...(sha ? { sha } : {}),
    });

  let sha = await lerShaArquivo(config, caminho);
  let resposta = await chamarGitHub(config, `/contents/${caminho}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: montarCorpo(sha),
  });

  // Conflito: o robô alterou o arquivo enquanto o painel estava aberto.
  if (resposta.status === 409) {
    sha = await lerShaArquivo(config, caminho);
    resposta = await chamarGitHub(config, `/contents/${caminho}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: montarCorpo(sha),
    });
  }

  if (!resposta.ok) {
    throw criarErro(mensagemHttp(resposta.status), resposta.status);
  }

  return resposta.json();
}

async function dispararWorkflow(config, arquivo) {
  const branch = config.branch || BRANCH_PADRAO;
  const resposta = await chamarGitHub(config, `/actions/workflows/${arquivo}/dispatches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: branch }),
  });

  if (resposta.status !== 204) {
    throw criarErro(mensagemHttp(resposta.status), resposta.status);
  }
}

async function buscarDados(config) {
  const resultados = await Promise.allSettled([
    lerArquivo(config, ARQUIVOS.produtos),
    lerArquivo(config, ARQUIVOS.oportunidades),
  ]);

  const falha = resultados.find(
    (resultado) => resultado.status === 'rejected' && resultado.reason?.status !== 404
  );

  if (falha) throw falha.reason;

  return {
    produtos: resultados[0].status === 'fulfilled' ? resultados[0].value : null,
    oportunidades: resultados[1].status === 'fulfilled' ? resultados[1].value : null,
  };
}

function corDoScore(score) {
  if (score >= 90) return { texto: '#047857', fundo: '#D1FAE5' };
  if (score >= 80) return { texto: '#B45309', fundo: '#FEF3C7' };
  return { texto: '#475569', fundo: '#F1F5F9' };
}

function ResumoCard({ icone: Icone, rotulo, valor, detalhe, cor, fundo }) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3" style={ESTILO_CARD}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: fundo, color: cor }}
      >
        <Icone size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
          {rotulo}
        </p>
        <p className="text-xl font-black leading-tight" style={{ color: '#1A2238' }}>
          {valor}
        </p>
        {detalhe && (
          <p className="text-xs" style={{ color: '#64748B' }}>
            {detalhe}
          </p>
        )}
      </div>
    </div>
  );
}

function EstadoVazio({ icone: Icone, titulo, descricao }) {
  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center text-center gap-2"
      style={ESTILO_CARD}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: '#F1F5F9', color: '#94A3B8' }}
      >
        <Icone size={22} />
      </div>
      <p className="text-sm font-black" style={{ color: '#1A2238' }}>
        {titulo}
      </p>
      <p className="text-xs max-w-sm" style={{ color: '#64748B' }}>
        {descricao}
      </p>
    </div>
  );
}

export default function RadarMLAdmin() {
  const { showConfirm } = useAlert();

  const [abaAtiva, setAbaAtiva] = useState('oportunidades');
  const [produtos, setProdutos] = useState(() =>
    lerStorage(CHAVES_STORAGE.produtos, PRODUTOS_INICIAIS)
  );
  const [oportunidades, setOportunidades] = useState(() =>
    lerStorage(CHAVES_STORAGE.oportunidades, OPORTUNIDADES_INICIAIS)
  );

  const [termo, setTermo] = useState('');
  const [precoMaximo, setPrecoMaximo] = useState('');
  const [obrigatorias, setObrigatorias] = useState('');
  const [proibidas, setProibidas] = useState('');

  const [ghConfig, setGhConfig] = useState(configuracaoInicial);
  const [configForm, setConfigForm] = useState(() => configuracaoInicial());
  const [modalAberto, setModalAberto] = useState(false);
  const [mostrarToken, setMostrarToken] = useState(false);
  const [conectado, setConectado] = useState(false);
  const [carregando, setCarregando] = useState(() => {
    const config = configuracaoInicial();
    return Boolean(config.owner && config.repo && config.token);
  });
  const [conectando, setConectando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [executando, setExecutando] = useState(null);
  const [erroConexao, setErroConexao] = useState('');
  const [erroModal, setErroModal] = useState('');
  const [toast, setToast] = useState(null);

  const toastTimer = useRef(null);
  const configRef = useRef(ghConfig);

  useEffect(() => {
    const config = configRef.current;
    if (!config.owner || !config.repo || !config.token) return undefined;

    let ativo = true;

    (async () => {
      try {
        const dados = await buscarDados(config);
        if (!ativo) return;

        if (Array.isArray(dados.produtos)) {
          setProdutos(dados.produtos);
          gravarStorage(CHAVES_STORAGE.produtos, dados.produtos);
        }
        if (Array.isArray(dados.oportunidades)) {
          setOportunidades(dados.oportunidades);
          gravarStorage(CHAVES_STORAGE.oportunidades, dados.oportunidades);
        }

        setConectado(true);
        setErroConexao('');
      } catch (erro) {
        if (!ativo) return;
        setConectado(false);
        setErroConexao(erro.message || 'Não foi possível conectar ao GitHub.');
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const notificar = (mensagem, tipo = 'sucesso') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ mensagem, tipo });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  const persistirConfig = (config) => {
    if (config.lembrar) {
      gravarStorage(CHAVES_STORAGE.config, config);
      return;
    }
    gravarStorage(CHAVES_STORAGE.config, {
      owner: config.owner,
      repo: config.repo,
      token: '',
      lembrar: false,
      branch: config.branch,
    });
  };

  const aplicarDados = (dados, { notificarSucesso = true } = {}) => {
    if (Array.isArray(dados.produtos)) {
      setProdutos(dados.produtos);
      gravarStorage(CHAVES_STORAGE.produtos, dados.produtos);
    }
    if (Array.isArray(dados.oportunidades)) {
      setOportunidades(dados.oportunidades);
      gravarStorage(CHAVES_STORAGE.oportunidades, dados.oportunidades);
    }
    setConectado(true);
    setErroConexao('');
    if (notificarSucesso) notificar('Dados atualizados a partir do GitHub.');
  };

  const abrirModal = () => {
    setConfigForm(ghConfig);
    setErroModal('');
    setMostrarToken(false);
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (conectando) return;
    setModalAberto(false);
    setErroModal('');
  };

  const handleConectar = async (evento) => {
    evento.preventDefault();

    const config = {
      owner: configForm.owner.trim(),
      repo: configForm.repo.trim(),
      token: configForm.token.trim(),
      lembrar: Boolean(configForm.lembrar),
      branch: BRANCH_PADRAO,
    };

    if (!config.owner || !config.repo || !config.token) {
      setErroModal('Preencha o usuário/organização, o repositório e o token.');
      return;
    }

    setConectando(true);
    setErroModal('');

    try {
      const dados = await buscarDados(config);

      setGhConfig(config);
      configRef.current = config;
      persistirConfig(config);
      aplicarDados(dados, { notificarSucesso: false });
      setModalAberto(false);
      notificar(
        Array.isArray(dados.produtos)
          ? 'GitHub conectado com sucesso!'
          : 'GitHub conectado. produtos.json será criado no primeiro salvamento.'
      );
    } catch (erro) {
      setConectado(false);
      setErroModal(erro.message || 'Não foi possível conectar ao GitHub.');
    } finally {
      setConectando(false);
    }
  };

  const recarregarDoGitHub = async () => {
    if (!ghConfig.owner || !ghConfig.repo || !ghConfig.token) {
      notificar('Conecte o GitHub para atualizar os dados do robô.', 'info');
      abrirModal();
      return;
    }

    setCarregando(true);
    try {
      const dados = await buscarDados(ghConfig);
      aplicarDados(dados);
    } catch (erro) {
      setConectado(false);
      setErroConexao(erro.message || 'Falha ao atualizar os dados.');
      notificar(erro.message || 'Falha ao atualizar os dados.', 'erro');
    } finally {
      setCarregando(false);
    }
  };

  const handleDesconectar = () => {
    showConfirm(
      'Desconectar do GitHub? A fila continuará salva apenas neste navegador.',
      () => {
        const vazia = {
          owner: '',
          repo: '',
          token: '',
          lembrar: false,
          branch: BRANCH_PADRAO,
        };
        setGhConfig(vazia);
        configRef.current = vazia;
        setConfigForm(vazia);
        removerStorage(CHAVES_STORAGE.config);
        setConectado(false);
        setErroConexao('');
        notificar('GitHub desconectado. Painel em modo local.', 'info');
      },
      'Desconectar GitHub',
      true
    );
  };

  const salvarProdutos = async (novaLista, mensagemSucesso) => {
    setProdutos(novaLista);
    gravarStorage(CHAVES_STORAGE.produtos, novaLista);

    if (!ghConfig.owner || !ghConfig.repo || !ghConfig.token) {
      notificar('Salvo localmente! Conecte o GitHub para o robô enxergar a fila.', 'info');
      return false;
    }

    setSalvando(true);
    try {
      await gravarArquivo(ghConfig, ARQUIVOS.produtos, novaLista);
      setConectado(true);
      setErroConexao('');
      notificar(mensagemSucesso || 'Fila sincronizada com o GitHub!');
      return true;
    } catch (erro) {
      notificar(`Salvo localmente, mas o GitHub recusou: ${erro.message}`, 'erro');
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const handleAdicionarProduto = async (evento) => {
    evento.preventDefault();

    const termoLimpo = termo.trim();
    const preco = Number.parseFloat(String(precoMaximo).replace(',', '.'));

    if (!termoLimpo) {
      notificar('Informe o termo de busca.', 'erro');
      return;
    }
    if (!Number.isFinite(preco) || preco <= 0) {
      notificar('Informe um preço máximo válido.', 'erro');
      return;
    }
    if (produtos.some((item) => item.termo?.toLowerCase() === termoLimpo.toLowerCase())) {
      notificar('Esse termo já está na fila.', 'info');
      return;
    }

    const novoItem = {
      termo: termoLimpo,
      precoMaximo: Number(preco.toFixed(2)),
      palavrasObrigatorias: dividirPalavras(obrigatorias),
      palavrasProibidas: dividirPalavras(proibidas),
    };

    await salvarProdutos([novoItem, ...produtos], 'Termo adicionado à fila do robô!');
    setTermo('');
    setPrecoMaximo('');
    setObrigatorias('');
    setProibidas('');
  };

  const handleRemoverProduto = (indice) => {
    const item = produtos[indice];
    showConfirm(
      `Remover "${item?.termo || 'este termo'}" da fila do robô?`,
      async () => {
        const novaLista = produtos.filter((_, posicao) => posicao !== indice);
        await salvarProdutos(novaLista, 'Termo removido da fila.');
      },
      'Remover termo',
      true
    );
  };

  const handleEnviarRadarParaMonitor = async (oportunidade) => {
    const termoBusca = String(oportunidade.termoBusca || '').trim();
    if (!termoBusca) return;

    if (produtos.some((item) => item.termo?.toLowerCase() === termoBusca.toLowerCase())) {
      notificar('Esse termo já está na fila do robô.', 'info');
      setAbaAtiva('fila');
      return;
    }

    const custo = Number(oportunidade.custoML) || 0;
    const precoAlvo = Math.max(1, Math.round(custo * 0.9 * 100) / 100);

    const novoItem = {
      termo: termoBusca,
      precoMaximo: precoAlvo,
      palavrasObrigatorias: termoBusca.split(/\s+/).filter(Boolean).slice(0, 2),
      palavrasProibidas: PALAVRAS_PROIBIDAS_PADRAO,
    };

    setAbaAtiva('fila');
    await salvarProdutos(
      [novoItem, ...produtos],
      `"${termoBusca}" adicionado ao Caçador de Cupons!`
    );
  };

  const handleDisparar = async (fluxo) => {
    if (!ghConfig.owner || !ghConfig.repo || !ghConfig.token) {
      notificar('Conecte seu GitHub primeiro para disparar o robô.', 'erro');
      abrirModal();
      return;
    }

    setExecutando(fluxo.arquivo);
    try {
      await dispararWorkflow(ghConfig, fluxo.arquivo);
      notificar(`${fluxo.titulo} iniciado! Acompanhe a execução em Actions no GitHub.`);
    } catch (erro) {
      notificar(erro.message || 'Não foi possível disparar o workflow.', 'erro');
    } finally {
      setExecutando(null);
    }
  };

  const totalOportunidades = oportunidades.length;

  const scoreMedio = totalOportunidades
    ? Math.round(
        oportunidades.reduce(
          (soma, oportunidade) => soma + (Number(oportunidade.scoreOportunidade) || 0),
          0
        ) / totalOportunidades
      )
    : 0;

  const margens = oportunidades.map((oportunidade) => {
    const custo = Number(oportunidade.custoML) || 0;
    const revenda = Number(oportunidade.revendaSugerida) || 0;
    return revenda > 0 ? ((revenda - custo) / revenda) * 100 : 0;
  });

  const margemMedia = margens.length
    ? margens.reduce((soma, margem) => soma + margem, 0) / margens.length
    : 0;

  const lucroMedio = totalOportunidades
    ? oportunidades.reduce((soma, oportunidade) => {
        const custo = Number(oportunidade.custoML) || 0;
        const revenda = Number(oportunidade.revendaSugerida) || 0;
        return soma + (revenda - custo);
      }, 0) / totalOportunidades
    : 0;

  const tokenMascarado = ghConfig.token
    ? `${ghConfig.token.slice(0, 6)}••••${ghConfig.token.slice(-4)}`
    : 'não configurado';

  const iconeToast =
    toast?.tipo === 'erro' ? (
      <TriangleAlert size={16} style={{ color: '#FCA5A5' }} />
    ) : toast?.tipo === 'info' ? (
      <Info size={16} style={{ color: '#FFB347' }} />
    ) : (
      <CircleCheck size={16} style={{ color: '#6EE7B7' }} />
    );

  return (
    <div className="-m-4 lg:-m-8 p-4 lg:p-8 min-h-full" style={{ backgroundColor: '#F4F6F9' }}>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
            >
              <Radar size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-tight" style={{ color: '#1A2238' }}>
                Radar ML &amp; Cariri
              </h1>
              <p className="text-sm mt-1" style={{ color: '#64748B' }}>
                Oportunidades do Mercado Livre e fila do robô de cupons.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{
                backgroundColor: conectado ? '#ECFDF5' : '#FFF7ED',
                color: conectado ? '#047857' : '#B45309',
                border: `1px solid ${conectado ? '#A7F3D0' : '#FED7AA'}`,
              }}
            >
              {carregando ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : conectado ? (
                <CircleCheck size={14} />
              ) : (
                <CloudOff size={14} />
              )}
              {carregando ? 'Sincronizando...' : conectado ? 'GitHub conectado' : 'Modo local'}
            </span>

            <button
              type="button"
              onClick={recarregarDoGitHub}
              disabled={carregando}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1A2238',
                border: '1px solid rgba(15,23,42,0.08)',
              }}
            >
              <RefreshCw size={14} className={carregando ? 'animate-spin' : ''} />
              Atualizar
            </button>

            <button
              type="button"
              onClick={abrirModal}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-105"
              style={{ backgroundColor: '#1A2238', color: '#FFFFFF' }}
            >
              <Settings size={14} />
              Configurar GitHub
            </button>
          </div>
        </div>

        {erroConexao && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
            role="alert"
          >
            <TriangleAlert size={18} className="shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#991B1B' }}>
                Não foi possível carregar do GitHub
              </p>
              <p className="text-xs mt-1" style={{ color: '#B91C1C' }}>
                {erroConexao} Os dados locais continuam disponíveis.
              </p>
            </div>
          </div>
        )}

        <div
          className="rounded-2xl p-1.5 flex gap-1 overflow-x-auto"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(15,23,42,0.06)' }}
          role="tablist"
          aria-label="Seções do Radar ML"
        >
          {ABAS.map((aba) => {
            const Icone = aba.icone;
            const ativa = abaAtiva === aba.id;
            return (
              <button
                key={aba.id}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => setAbaAtiva(aba.id)}
                className="flex-1 min-w-max inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={
                  ativa ? { backgroundColor: '#FFB347', color: '#1A2238' } : { color: '#64748B' }
                }
              >
                <Icone size={16} />
                {aba.label}
                {aba.id === 'fila' && (
                  <span
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-black"
                    style={{
                      backgroundColor: ativa ? 'rgba(26,34,56,0.12)' : '#F1F5F9',
                      color: ativa ? '#1A2238' : '#64748B',
                    }}
                  >
                    {produtos.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {abaAtiva === 'oportunidades' && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <ResumoCard
                icone={Radar}
                rotulo="Oportunidades"
                valor={totalOportunidades}
                detalhe="mapeadas no radar"
                cor="#B45309"
                fundo="#FEF3C7"
              />
              <ResumoCard
                icone={Target}
                rotulo="Score médio"
                valor={scoreMedio}
                detalhe="de 100 pontos"
                cor="#047857"
                fundo="#D1FAE5"
              />
              <ResumoCard
                icone={BadgePercent}
                rotulo="Margem média"
                valor={`${margemMedia.toFixed(0)}%`}
                detalhe="sobre a revenda"
                cor="#1D4ED8"
                fundo="#EFF6FF"
              />
              <ResumoCard
                icone={CircleDollarSign}
                rotulo="Lucro médio"
                valor={formatarMoeda(lucroMedio)}
                detalhe="por unidade"
                cor="#047857"
                fundo="#ECFDF5"
              />
            </div>

            {oportunidades.length === 0 ? (
              <EstadoVazio
                icone={Radar}
                titulo="Nenhuma oportunidade carregada"
                descricao="Rode o workflow radar.yml ou atualize os dados do GitHub para popular oportunidades_crato.json."
              />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {oportunidades.map((oportunidade, indice) => {
                  const score = Number(oportunidade.scoreOportunidade) || 0;
                  const custo = Number(oportunidade.custoML) || 0;
                  const revenda = Number(oportunidade.revendaSugerida) || 0;
                  const lucro = revenda - custo;
                  const margem = revenda > 0 ? (lucro / revenda) * 100 : 0;
                  const cores = corDoScore(score);

                  return (
                    <article
                      key={`${oportunidade.termoBusca || 'oportunidade'}-${indice}`}
                      className="rounded-2xl p-5 flex flex-col gap-4"
                      style={ESTILO_CARD}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3
                            className="text-base font-black leading-snug"
                            style={{ color: '#1A2238' }}
                          >
                            {oportunidade.termoBusca}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {oportunidade.tendenciaCeara && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold"
                                style={{ backgroundColor: '#FFF7ED', color: '#B45309' }}
                              >
                                <Flame size={12} />
                                {oportunidade.tendenciaCeara}
                              </span>
                            )}
                            {oportunidade.statusConcorrencia && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold"
                                style={{ backgroundColor: '#F1F5F9', color: '#475569' }}
                              >
                                <Activity size={12} />
                                {oportunidade.statusConcorrencia}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          className="shrink-0 text-center px-3 py-2 rounded-xl"
                          style={{ backgroundColor: cores.fundo }}
                        >
                          <p
                            className="text-lg font-black leading-none"
                            style={{ color: cores.texto }}
                          >
                            {score}
                          </p>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wide mt-1"
                            style={{ color: cores.texto }}
                          >
                            score
                          </p>
                        </div>
                      </div>

                      <dl className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl p-2.5" style={{ backgroundColor: '#F8FAFC' }}>
                          <dt
                            className="text-[10px] font-bold uppercase"
                            style={{ color: '#94A3B8' }}
                          >
                            Custo ML
                          </dt>
                          <dd className="text-sm font-black" style={{ color: '#1A2238' }}>
                            {formatarMoeda(custo)}
                          </dd>
                        </div>
                        <div className="rounded-xl p-2.5" style={{ backgroundColor: '#F8FAFC' }}>
                          <dt
                            className="text-[10px] font-bold uppercase"
                            style={{ color: '#94A3B8' }}
                          >
                            Revenda
                          </dt>
                          <dd className="text-sm font-black" style={{ color: '#1A2238' }}>
                            {formatarMoeda(revenda)}
                          </dd>
                        </div>
                        <div className="rounded-xl p-2.5" style={{ backgroundColor: '#ECFDF5' }}>
                          <dt
                            className="text-[10px] font-bold uppercase"
                            style={{ color: '#047857' }}
                          >
                            Lucro
                          </dt>
                          <dd className="text-sm font-black" style={{ color: '#047857' }}>
                            {formatarMoeda(lucro)}
                          </dd>
                        </div>
                      </dl>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span style={{ color: '#64748B' }}>Margem estimada</span>
                          <span
                            className="font-black"
                            style={{ color: margem >= 45 ? '#047857' : '#B45309' }}
                          >
                            {margem.toFixed(0)}%
                          </span>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: '#F1F5F9' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, margem))}%`,
                              backgroundColor: margem >= 45 ? '#10B981' : '#F59E0B',
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                        <button
                          type="button"
                          onClick={() => handleEnviarRadarParaMonitor(oportunidade)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-105"
                          style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                        >
                          <Plus size={16} />
                          Enviar para o Caçador
                        </button>
                        <a
                          href={oportunidade.linkML}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-slate-50"
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#1A2238',
                            border: '1px solid rgba(15,23,42,0.12)',
                          }}
                        >
                          Ver no ML
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {abaAtiva === 'fila' && (
          <section className="space-y-4">
            <div className="rounded-2xl p-4 flex items-start gap-3" style={ESTILO_CARD}>
              <GitBranch size={18} className="shrink-0 mt-0.5" style={{ color: '#B45309' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#1A2238' }}>
                  Fila lida de produtos.json
                </p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                  {produtos.length} termo{produtos.length === 1 ? '' : 's'} monitorado
                  {produtos.length === 1 ? '' : 's'}. Cada alteração é enviada para o repositório
                  assim que o GitHub está conectado.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <form
                onSubmit={handleAdicionarProduto}
                className="rounded-2xl p-5 space-y-3 h-fit"
                style={ESTILO_CARD}
              >
                <div>
                  <h2 className="text-base font-black" style={{ color: '#1A2238' }}>
                    Novo termo de busca
                  </h2>
                  <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                    O robô só alerta se o anúncio bater com estas regras.
                  </p>
                </div>

                <label className="block">
                  <span className="text-[11px] font-bold uppercase" style={{ color: '#94A3B8' }}>
                    Termo
                  </span>
                  <input
                    type="text"
                    value={termo}
                    onChange={(evento) => setTermo(evento.target.value)}
                    placeholder="ex.: fone bluetooth tws"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={ESTILO_INPUT}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold uppercase" style={{ color: '#94A3B8' }}>
                    Preço máximo (R$)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={precoMaximo}
                    onChange={(evento) => setPrecoMaximo(evento.target.value)}
                    placeholder="45.00"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={ESTILO_INPUT}
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold uppercase" style={{ color: '#94A3B8' }}>
                    Palavras obrigatórias
                  </span>
                  <input
                    type="text"
                    value={obrigatorias}
                    onChange={(evento) => setObrigatorias(evento.target.value)}
                    placeholder="fone, bluetooth"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={ESTILO_INPUT}
                  />
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                    Separe por vírgula.
                  </span>
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold uppercase" style={{ color: '#94A3B8' }}>
                    Palavras proibidas
                  </span>
                  <input
                    type="text"
                    value={proibidas}
                    onChange={(evento) => setProibidas(evento.target.value)}
                    placeholder="capa, suporte, cabo"
                    className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={ESTILO_INPUT}
                  />
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>
                    Separe por vírgula.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={salvando}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                >
                  {salvando ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {salvando ? 'Salvando...' : 'Adicionar à fila'}
                </button>
              </form>

              <div className="lg:col-span-2 space-y-3">
                {produtos.length === 0 ? (
                  <EstadoVazio
                    icone={Package}
                    titulo="Fila vazia"
                    descricao="Adicione o primeiro termo no formulário ao lado ou envie uma oportunidade do radar."
                  />
                ) : (
                  produtos.map((item, indice) => (
                    <div
                      key={`${item.termo}-${indice}`}
                      className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                      style={ESTILO_CARD}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black break-words" style={{ color: '#1A2238' }}>
                          {item.termo}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span
                            className="px-2 py-1 rounded-lg text-[11px] font-bold"
                            style={{ backgroundColor: '#FFF7ED', color: '#B45309' }}
                          >
                            até {formatarMoeda(item.precoMaximo)}
                          </span>
                          {(item.palavrasObrigatorias || []).map((palavra) => (
                            <span
                              key={`obrigatoria-${palavra}`}
                              className="px-2 py-1 rounded-lg text-[11px] font-bold"
                              style={{ backgroundColor: '#ECFDF5', color: '#047857' }}
                            >
                              + {palavra}
                            </span>
                          ))}
                          {(item.palavrasProibidas || []).map((palavra) => (
                            <span
                              key={`proibida-${palavra}`}
                              className="px-2 py-1 rounded-lg text-[11px] font-bold"
                              style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}
                            >
                              − {palavra}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoverProduto(indice)}
                        title="Remover da fila"
                        aria-label={`Remover ${item.termo} da fila`}
                        className="self-start sm:self-center p-2.5 rounded-xl transition-all hover:bg-red-50"
                        style={{ color: '#DC2626', backgroundColor: '#FEF2F2' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {abaAtiva === 'automacao' && (
          <section className="space-y-4">
            <div className="rounded-2xl p-5 space-y-4" style={ESTILO_CARD}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#F1F5F9', color: '#1A2238' }}
                  >
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black" style={{ color: '#1A2238' }}>
                      Conexão com o GitHub
                    </h2>
                    <p className="text-xs" style={{ color: '#64748B' }}>
                      {conectado
                        ? 'Painel e robô sincronizados.'
                        : 'Modo local — nada é enviado para o repositório.'}
                    </p>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold self-start"
                  style={{
                    backgroundColor: conectado ? '#ECFDF5' : '#FFF7ED',
                    color: conectado ? '#047857' : '#B45309',
                    border: `1px solid ${conectado ? '#A7F3D0' : '#FED7AA'}`,
                  }}
                >
                  {conectado ? <CircleCheck size={14} /> : <CloudOff size={14} />}
                  {conectado ? 'Conectado' : 'Desconectado'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#94A3B8' }}>
                    Repositório
                  </p>
                  <p className="text-sm font-bold break-all" style={{ color: '#1A2238' }}>
                    {ghConfig.owner && ghConfig.repo ? `${ghConfig.owner}/${ghConfig.repo}` : '—'}
                  </p>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                  <p className="text-[10px] font-bold uppercase" style={{ color: '#94A3B8' }}>
                    Token
                  </p>
                  <p className="text-sm font-bold break-all" style={{ color: '#1A2238' }}>
                    {tokenMascarado}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={abrirModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-105"
                  style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                >
                  <Settings size={16} />
                  Configurar
                </button>
                <button
                  type="button"
                  onClick={recarregarDoGitHub}
                  disabled={carregando}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#1A2238',
                    border: '1px solid rgba(15,23,42,0.12)',
                  }}
                >
                  <RefreshCw size={16} className={carregando ? 'animate-spin' : ''} />
                  Testar conexão
                </button>
                {ghConfig.token && (
                  <button
                    type="button"
                    onClick={handleDesconectar}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-red-100"
                    style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
                  >
                    <X size={16} />
                    Desconectar
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {WORKFLOWS.map((fluxo) => {
                const Icone = fluxo.icone;
                const emExecucao = executando === fluxo.arquivo;
                return (
                  <div
                    key={fluxo.arquivo}
                    className="rounded-2xl p-5 flex flex-col gap-3"
                    style={ESTILO_CARD}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}
                      >
                        <Icone size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black" style={{ color: '#1A2238' }}>
                          {fluxo.titulo}
                        </h3>
                        <code className="text-[11px]" style={{ color: '#94A3B8' }}>
                          {fluxo.arquivo}
                        </code>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed flex-1" style={{ color: '#64748B' }}>
                      {fluxo.descricao}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleDisparar(fluxo)}
                      disabled={Boolean(executando)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#1A2238', color: '#FFFFFF' }}
                    >
                      {emExecucao ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Rocket size={16} />
                      )}
                      {emExecucao ? 'Disparando...' : 'Executar agora'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}
            >
              <ShieldCheck size={18} className="shrink-0 mt-0.5" style={{ color: '#B45309' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#92400E' }}>
                  Sobre o token do GitHub
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: '#B45309' }}>
                  Use um token fine-grained limitado a este repositório, com Contents (leitura e
                  escrita) e Actions (leitura e escrita). Variáveis VITE_ ficam visíveis no bundle
                  público do site — se o painel for acessível na web, prefira digitar o token aqui e
                  deixar &quot;Lembrar neste navegador&quot; desmarcado.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={fecharModal}
            aria-hidden="true"
          />
          <div
            className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6"
            style={{ backgroundColor: '#FFFFFF' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="radar-config-titulo"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="radar-config-titulo"
                  className="text-lg font-black"
                  style={{ color: '#1A2238' }}
                >
                  Conectar ao GitHub
                </h2>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                  O painel lê e grava produtos.json e oportunidades_crato.json no repositório.
                </p>
              </div>
              <button
                type="button"
                onClick={fecharModal}
                className="p-2 rounded-xl hover:bg-slate-100"
                aria-label="Fechar configuração"
                style={{ color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConectar} className="space-y-3 mt-5">
              <label className="block">
                <span className="text-[11px] font-bold uppercase" style={{ color: '#94A3B8' }}>
                  Usuário ou organização
                </span>
                <input
                  type="text"
                  value={configForm.owner}
                  onChange={(evento) =>
                    setConfigForm((atual) => ({ ...atual, owner: evento.target.value }))
                  }
                  placeholder="claudiocsx"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={ESTILO_INPUT}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase" style={{ color: '#94A3B8' }}>
                  Repositório
                </span>
                <input
                  type="text"
                  value={configForm.repo}
                  onChange={(evento) =>
                    setConfigForm((atual) => ({ ...atual, repo: evento.target.value }))
                  }
                  placeholder="faciil"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={ESTILO_INPUT}
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase" style={{ color: '#94A3B8' }}>
                  Token de acesso
                </span>
                <div className="relative mt-1">
                  <input
                    type={mostrarToken ? 'text' : 'password'}
                    value={configForm.token}
                    onChange={(evento) =>
                      setConfigForm((atual) => ({ ...atual, token: evento.target.value }))
                    }
                    placeholder="github_pat_..."
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full px-3 py-2.5 pr-11 rounded-xl text-sm outline-none"
                    style={ESTILO_INPUT}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarToken((atual) => !atual)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-200"
                    aria-label={mostrarToken ? 'Ocultar token' : 'Mostrar token'}
                    style={{ color: '#64748B' }}
                  >
                    {mostrarToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label
                className="flex items-start gap-2 rounded-xl p-3"
                style={{ backgroundColor: '#F8FAFC' }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(configForm.lembrar)}
                  onChange={(evento) =>
                    setConfigForm((atual) => ({ ...atual, lembrar: evento.target.checked }))
                  }
                  className="mt-0.5"
                />
                <span className="text-xs" style={{ color: '#475569' }}>
                  Lembrar neste navegador (salva o token no localStorage). Desmarcado, o token some
                  ao fechar a aba.
                </span>
              </label>

              {erroModal && (
                <div
                  className="rounded-xl p-3 flex items-start gap-2"
                  style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
                  role="alert"
                >
                  <TriangleAlert
                    size={16}
                    className="shrink-0 mt-0.5"
                    style={{ color: '#DC2626' }}
                  />
                  <p className="text-xs" style={{ color: '#B91C1C' }}>
                    {erroModal}
                  </p>
                </div>
              )}

              <p className="text-[11px] leading-relaxed" style={{ color: '#94A3B8' }}>
                Se VITE_GITHUB_OWNER, VITE_GITHUB_REPO e VITE_GITHUB_TOKEN estiverem no .env, o
                formulário já vem preenchido. Sem token, o painel funciona em modo local.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={conectando}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:bg-slate-50 disabled:opacity-60"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    border: '1px solid rgba(15,23,42,0.12)',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={conectando}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#FFB347', color: '#1A2238' }}
                >
                  {conectando && <LoaderCircle size={16} className="animate-spin" />}
                  {conectando ? 'Conectando...' : 'Conectar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-5 right-5 left-5 sm:left-auto z-[70] sm:max-w-sm rounded-2xl p-4 flex items-start gap-3 shadow-xl"
          style={{ backgroundColor: '#1A2238', color: '#FFFFFF' }}
          role="status"
          aria-live="polite"
        >
          <span className="mt-0.5 shrink-0">{iconeToast}</span>
          <p className="text-sm font-semibold flex-1">{toast.mensagem}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-white/10 shrink-0"
            aria-label="Fechar aviso"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
