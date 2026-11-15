import type { UnitContent } from "./types";

export const unitData: UnitContent = {
  unitNumber: "Módulo 2 · Unidade 3",
  unitTitle: "Aplicações Práticas de RAG e Avaliação",
  unitSubtitle:
    "Do documento ao terminal: identificar, extrair, indexar e perguntar — com Python, LibSQL e fastembed.",
  overview:
    "Nesta unidade o RAG sai do quadro branco e ganha forma em um pipeline real de engenharia de dados. Você aprende a separar o que vai para tabela estruturada (CSV) do que vai para busca vetorial, como evitar trechos órfãos usando cabeçalhos contextuais, como indexar localmente com fastembed + LibSQL e como medir Recall, Precisão, Latência e Trace.",
  simulatorTitle: "Simulador do Pipeline de Dados e RAG Local",
  simulatorSubtitle:
    "Acompanhe o fluxo em duas faixas: da triagem do arquivo bruto até a busca com vector_top_k no LibSQL e observabilidade.",
  simulatorSteps: [
    {
      id: "triagem",
      label: "1. Triagem e Score",
      shortDesc: "Identifica o tipo de documento antes de processar.",
      detail:
        "O documento entra na pasta de entrada e passa por um classificador por palavras-chave e pontuação (score) para saber se é contrato, fatura ou manual.",
      payload: `{
  "arquivo": "contrato_cliente_09.txt",
  "tipo_identificado": "CONTRATO",
  "score_heuristica": 8.5
}`,
    },
    {
      id: "extracao",
      label: "2. Faixa Estruturada (CSV)",
      shortDesc: "Extrai campos fixos com Regex de forma idempotente.",
      detail:
        "Campos exatos (CNPJ, valor, data de vencimento) são capturados por âncora/padrão/grupo e gravados no CSV sem duplicar se o script rodar novamente.",
      payload: `{
  "faixa": "ESTRUTURADA_CSV",
  "campos": { "valor": "R$ 4.200,00", "vencimento": "2026-12-10" },
  "idempotente": true
}`,
    },
    {
      id: "corte",
      label: "3. Corte + Cabeçalho + fastembed",
      shortDesc: "Injeta contexto no topo de cada chunk e gera vetor local.",
      detail:
        "Cada bloco recebe um cabeçalho ('[Doc: contrato_cliente_09 | Cláusula 4]') para nunca ficar órfão e é vetorizado localmente com fastembed.",
      payload: `{
  "cabecalho": "[Contrato 09 | Cláusula 4 - Rescisão]",
  "tokens": 210,
  "modelo_local": "fastembed (384 dims)"
}`,
    },
    {
      id: "libsql",
      label: "4. LibSQL (vector_top_k)",
      shortDesc: "Grava com vector32 e consulta rápido no banco único.",
      detail:
        "Documentos, chunks e vetores ficam em 3 tabelas no LibSQL. Na consulta, vector_top_k traz os trechos mais próximos em milissegundos.",
      payload: `SELECT c.texto, c.origem
FROM vector_top_k('idx_chunks', vector32(?), 4) AS top
JOIN chunks c ON c.rowid = top.id;`,
    },
    {
      id: "avaliacao",
      label: "5. Avaliação e Trace",
      shortDesc: "Mede Recall, Precisão, Latência e Custo por etapa.",
      detail:
        "Em vez de dar uma 'nota única' vaga, o trace registra exatamente quanto tempo levou cada etapa, se o trecho certo veio (Recall) e quanto custou.",
      payload: `{
  "recall_at_4": 1.0,
  "latencia_busca_ms": 18,
  "latencia_llm_ms": 940,
  "trace_id": "tr_4419"
}`,
    },
  ],
  concepts: [
    {
      id: "m2u3c1",
      chapter: "Capítulo 1 & 2 · Arquitetura de Dados",
      title: "O Fluxo em Duas Faixas e as 4 Pastas do Data Lake",
      summary:
        "Separar dados tabulares (CSV) de texto livre (RAG) desde a entrada.",
      fromZero:
        "Nem tudo deve virar vetor! Perguntas como 'Qual a soma das faturas de março?' pertencem a tabelas (CSV/SQL). Perguntas como 'O que diz a cláusula de multa?' pertencem ao RAG. O fluxo em duas faixas organiza a ingestão em 4 pastas (entrada, processados, estruturados/CSV e índice vetorial).",
      inPractice:
        "Ao separar as faixas, você evita que o LLM tente fazer contas de cabeça lendo pedaços de PDF.",
      attention:
        "Tentar responder perguntas de contagem ou soma usando apenas busca vetorial Top-K gera respostas incompletas e erradas.",
      keyTakeaway:
        "Use CSV/SQL para números e listas completas; use RAG vetorial para interpretar textos e regras.",
    },
    {
      id: "m2u3c2",
      chapter: "Capítulo 3 & 4 · Extração e Idempotência",
      title: "Identificação Heurística, Regex e CSV Idempotente",
      summary:
        "Como extrair campos fixos com segurança antes de chamar qualquer IA.",
      fromZero:
        "Antes de gastar tokens, identificamos o tipo de arquivo por palavras-chave e pontuação. Depois usamos Regex (âncora + padrão + grupo) para extrair campos previsíveis como datas, CNPJs e valores.",
      inPractice:
        "O CSV e o banco precisam de idempotência: se você rodar o script de ingestão 3 vezes na mesma pasta, o registro do documento não pode ser duplicado 3 vezes.",
      attention:
        "Heurísticas simples podem falhar se um documento mudar de layout — sempre preveja um plano de exceção para revisão.",
      keyTakeaway:
        "Extração determinística + idempotência garantem base limpa mesmo ao reprocessar arquivos.",
    },
    {
      id: "m2u3c3",
      chapter: "Capítulo 5 · O Corte Certo",
      title: "Tamanho, Fronteiras e o Cabeçalho que Salva a Busca",
      summary:
        "Por que nunca deixar um chunk 'órfão' sem saber de quem ele fala.",
      fromZero:
        "Imagine recortar um parágrafo que diz 'O desconto será de 15% neste plano' sem anotar em cima de qual plano ou contrato ele veio. Se esse pedaço for recuperado sozinho, o modelo não sabe a quem o desconto se aplica!",
      inPractice:
        "Injetar um cabeçalho contextual no início de cada chunk ('[Contrato Alfa | Seção Pagamento]') resolve o problema do trecho órfão e turbina a busca.",
      attention:
        "Cortar texto no meio de palavras ou tabelas sem respeitar fronteiras de parágrafo destrói informações numéricas.",
      keyTakeaway:
        "Todo chunk deve carregar seu próprio cabeçalho de identificação.",
    },
    {
      id: "m2u3c4",
      chapter: "Capítulo 6 · Tokens e fastembed",
      title: "Token não é Palavra e Embeddings Locais com fastembed",
      summary:
        "Entendendo limites da janela e rodando vetorização leve em Python.",
      fromZero:
        "Modelos não leem palavras inteiras — eles quebram o texto em pedaços chamados tokens (em português, 1 palavra costuma dar ~1,3 a 1,5 tokens). Com a biblioteca fastembed, você gera vetores direto no Python local, sem pagar por chamada externa na indexação.",
      inPractice:
        "Respeite a janela máxima do modelo de embedding escolhido: se passar do limite, o final do texto é cortado silenciosamente!",
      attention:
        "Sempre verifique o limite de tokens do modelo de embedding para não perder o fim dos chunks.",
      keyTakeaway:
        "fastembed viabiliza embeddings rápidos, locais e gratuitos para protótipos e sistemas enxutos.",
    },
    {
      id: "m2u3c5",
      chapter: "Capítulo 7 · Banco Unificado",
      title: "LibSQL: Schema em 3 Tabelas, vector32 e vector_top_k",
      summary:
        "Guardando metadados relacionais e vetores no mesmo banco SQLite moderno.",
      fromZero:
        "Em vez de manter dois bancos separados (um SQL para cadastros e outro só para vetores), o LibSQL permite guardar tudo junto em um único arquivo/serviço com 3 tabelas: documentos, chunks e índice vetorial.",
      inPractice:
        "Inserimos vetores com `vector32(...)` e consultamos os vizinhos mais próximos diretamente em SQL usando `vector_top_k(...)`, cruzando com filtros SQL normais.",
      attention:
        "Se você alterar o modelo de embedding ou a estratégia de chunking, o índice vetorial precisa ser reconstruído do zero.",
      keyTakeaway:
        "LibSQL simplifica a arquitetura reunindo SQL tradicional e busca vetorial no mesmo lugar.",
    },
    {
      id: "m2u3c6",
      chapter: "Capítulo 8 & 9 · Arquitetura Limpa",
      title: "Desacoplar para Trocar e Quando NÃO Fazer Chatbot",
      summary:
        "A ordem certa de construção e escolhas de interface que funcionam.",
      fromZero:
        "Construa de baixo para cima: primeiro garanta que a ingestão e a busca no terminal trazem os trechos certos; só depois conecte o LLM e a interface.",
      inPractice:
        "Mantenha o módulo de busca separado do módulo de geração (desacoplado). Assim você troca de provedor de LLM em 5 minutos sem mexer no banco.",
      attention:
        "Nem todo sistema precisa de janela de chat! Às vezes uma tela de busca com resumo ou um relatório automático resolve muito melhor do que um chatbot.",
      keyTakeaway:
        "Valide a busca no terminal antes de construir qualquer interface de chat.",
    },
    {
      id: "m2u3c7",
      chapter: "Capítulo 10 & 11 · Medição Real",
      title: "Por que Nota Única Esconde o Culpado + Trace por Etapa",
      summary:
        "Medindo Recall, Precisão, Latência e o que logar com segurança.",
      fromZero:
        "Dar apenas uma nota '7/10' para o sistema inteiro não ajuda a melhorar nada. Precisamos medir separado: Recall (o trecho certo veio nos K resultados?), Precisão (veio pouco lixo junto?), Latência (quanto tempo cada passo levou?) e Trace completo.",
      inPractice:
        "Logue tempo, quantidade de tokens e IDs dos chunks recuperados por etapa — mas evite gravar dados pessoais sensíveis (CPFs/senhas) em texto aberto nos logs.",
      attention:
        "Sem um conjunto mínimo fixo de avaliação (ex.: 15 a 30 perguntas reais), melhorias no sistema viram apenas chute.",
      keyTakeaway:
        "Trace por etapa mostra exatamente onde o sistema está lento ou errando.",
    },
    {
      id: "m2u3c8",
      chapter: "Capítulo 12 & 13 · Produção",
      title: "Matriz Esforço × Impacto, Versionamento e Erros Caros",
      summary:
        "Como evoluir o RAG sem quebrar a base em produção.",
      fromZero:
        "Versionar significa marcar cada índice com a versão das regras de corte e do modelo usado, permitindo reprocessar documentos de forma controlada quando algo evolui.",
      inPractice:
        "Priorize melhorias pela matriz Esforço × Impacto: muitas vezes melhorar o cabeçalho do chunk e limpar o texto dá 10x mais resultado com menos esforço do que trocar de modelo.",
      attention:
        "Erros que custam caro: não testar perguntas sem resposta, misturar versões de índice e ignorar latência percebida pelo usuário.",
      keyTakeaway:
        "Limpeza de dados, cabeçalho contextual e avaliação contínua são as maiores alavancas de qualidade.",
    },
  ],
  quiz: [
    {
      id: 1,
      question: "Por que um pipeline prático de dados usa um 'fluxo em duas faixas' (CSV + RAG)?",
      options: [
        "Porque tabelas/CSVs respondem bem cálculos e filtros exatos, enquanto RAG interpreta textos longos.",
        "Porque o Python não sabe ler mais de um arquivo por dia.",
        "Para duplicar todo texto em imagens.",
        "Para evitar o uso de bancos de dados.",
      ],
      correctIndex: 0,
      explanation:
        "Perguntas numéricas e agregações exigem dados estruturados (CSV/SQL), enquanto buscas semânticas usam chunks e vetores.",
    },
    {
      id: 2,
      question: "O que significa 'Idempotência' na gravação do CSV e do índice?",
      options: [
        "Apagar todos os arquivos da pasta após a leitura.",
        "Poder reexecutar a ingestão várias vezes sem criar registros duplicados.",
        "Converter textos para letras maiúsculas.",
        "Gerar respostas aleatórias a cada execução.",
      ],
      correctIndex: 1,
      explanation:
        "Sistemas idempotentes permitem reprocessar pastas com segurança sem duplicar linhas ou vetores.",
    },
    {
      id: 3,
      question: "Para que serve 'o cabeçalho que salva a busca' antes de cada chunk?",
      options: [
        "Para deixar o terminal colorido.",
        "Para identificar o documento/seção no topo do trecho, evitando que o chunk fique órfão e sem contexto.",
        "Para aumentar o número de páginas do PDF.",
        "Para esconder o nome do cliente.",
      ],
      correctIndex: 1,
      explanation:
        "Sem cabeçalho, trechos isolados perdem a referência de qual contrato, produto ou capítulo pertencem.",
    },
    {
      id: 4,
      question: "Qual afirmação sobre 'tokens' está correta?",
      options: [
        "1 token equivale sempre a exatamente 10 páginas.",
        "Token não é palavra: modelos dividem palavras em subunidades, e passar do limite da janela corta o texto.",
        "Tokens existem apenas em planilhas do Excel.",
        "Palavras em português não usam tokens.",
      ],
      correctIndex: 1,
      explanation:
        "Respeitar a janela de tokens do modelo de embedding evita truncamento silencioso do final do chunk.",
    },
    {
      id: 5,
      question: "Qual é o papel da biblioteca `fastembed` no laboratório da Unidade 3?",
      options: [
        "Criar slides em PowerPoint.",
        "Gerar embeddings rapidamente no ambiente Python local.",
        "Substituir o navegador Chrome.",
        "Fazer deploy automático na Vercel.",
      ],
      correctIndex: 1,
      explanation:
        "O fastembed permite gerar vetores localmente com leveza e sem dependência de chamadas externas pagas para indexação.",
    },
    {
      id: 6,
      question: "Qual é a principal vantagem de usar o LibSQL no projeto prático?",
      options: [
        "Unir tabelas SQL tradicionais e busca vetorial (`vector32` / `vector_top_k`) no mesmo banco.",
        "Editar vídeos em 4K.",
        "Disparar e-mails em massa sem código.",
        "Remover a necessidade de fazer perguntas.",
      ],
      correctIndex: 0,
      explanation:
        "O LibSQL reúne metadados relacionais e índice vetorial em uma única tecnologia simples de operar.",
    },
    {
      id: 7,
      question: "Por que devemos validar a busca no terminal ANTES de construir a interface de chat?",
      options: [
        "Porque se a recuperação não traz os trechos certos, o chat só vai mascarar o erro com respostas ruins.",
        "Porque navegadores não abrem arquivos JSON.",
        "Para gastar mais tempo sem motivo.",
        "Porque terminais não aceitam acentos.",
      ],
      correctIndex: 0,
      explanation:
        "Testar a recuperação isoladamente garante que o alicerce do RAG está sólido antes de conectar o LLM e a UI.",
    },
    {
      id: 8,
      question: "Por que uma 'nota única' esconde o culpado na avaliação do RAG?",
      options: [
        "Porque não revela se o erro veio da triagem, do corte, da busca (Recall) ou da geração do LLM.",
        "Porque notas de 0 a 10 são ilegais em Python.",
        "Porque o usuário prefere letras em vez de números.",
        "Não esconde, nota única é sempre suficiente.",
      ],
      correctIndex: 0,
      explanation:
        "Avaliar por etapas (Recall, Precisão, Fidelidade e Latência) aponta o gargalo real.",
    },
    {
      id: 9,
      question: "O que deve ser evitado ao registrar logs de observabilidade (trace)?",
      options: [
        "Registrar o tempo de cada etapa.",
        "Expor dados pessoais sensíveis (PII), senhas ou segredos sem mascaramento.",
        "Registrar o ID do chunk recuperado.",
        "Medir quantos tokens foram gastos.",
      ],
      correctIndex: 1,
      explanation:
        "Logs devem dar visibilidade técnica e de custo respeitando a privacidade e a segurança dos dados.",
    },
    {
      id: 10,
      question: "Quando o índice vetorial no LibSQL precisa ser refeito?",
      options: [
        "Toda vez que o usuário faz uma nova pergunta.",
        "Quando mudamos o modelo de embedding ou a estratégia de corte/cabeçalho dos chunks.",
        "Quando trocamos a cor da fonte no site.",
        "Nunca precisa ser refeito.",
      ],
      correctIndex: 1,
      explanation:
        "Mudanças de modelo de vetor ou de chunking exigem versionamento e reprocessamento dos documentos.",
    },
  ],
  memoryPairs: [
    {
      id: "m2u3m1",
      term: "Fluxo em Duas Faixas",
      definition: "Separar extração estruturada (CSV) de busca semântica em texto (RAG).",
    },
    {
      id: "m2u3m2",
      term: "Cabeçalho Contextual",
      definition: "Prefixo com documento e seção no topo do chunk para evitar trechos órfãos.",
    },
    {
      id: "m2u3m3",
      term: "fastembed",
      definition: "Biblioteca Python para gerar vetores localmente com rapidez.",
    },
    {
      id: "m2u3m4",
      term: "LibSQL (vector_top_k)",
      definition: "Banco unificado SQL + vetores para buscar os K vizinhos mais próximos.",
    },
    {
      id: "m2u3m5",
      term: "Recall de Busca",
      definition: "Mede se os trechos que contêm a resposta certa realmente foram recuperados.",
    },
    {
      id: "m2u3m6",
      term: "Trace por Etapa",
      definition: "Registro detalhado de tempo, custo e resultado de cada fase do pipeline.",
    },
  ],
};
