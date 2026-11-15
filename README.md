# Módulo 2 · Unidade 3 — Aplicações Práticas de RAG e Avaliação

Página didática interativa de apoio aos alunos do **Curso de Formação em IA Generativa**.

## Sobre esta Unidade
Esta unidade leva o RAG para a prática de engenharia: fluxo em duas faixas (CSV estruturado vs. índice vetorial), identificação heurística, extração com Regex idempotente, corte com cabeçalho contextual, embeddings locais com **fastembed**, banco unificado **LibSQL** (`vector32` e `vector_top_k`), arquitetura desacoplada, métricas por etapa (*Recall*, Precisão, Latência) e *Trace*.

### Recursos da Aplicação
- **Simulador Visual Dinâmico**: Fluxo animado completo da ingestão ao *trace* de avaliação no LibSQL.
- **Conteúdo Interativo**: Tópicos com explicações *Do Zero*, *Na Prática*, *Atenção / Risco* e *Ponto-chave*.
- **Quiz de Fixação**: 10 perguntas com feedback imediato e explicação.
- **Jogo da Memória**: Combinação de conceitos e definições da unidade.

## Stack Tecnológica
- **Next.js** (App Router com `output: "export"` para deploy estático)
- **Tailwind CSS**
- **Lucide React**

## Como executar localmente
```bash
npm install
npm run dev
```

## Publicação na Vercel
Importe o repositório no GitHub, selecione o diretório `MOD4/M2U3-WEB` como **Root Directory** e faça o deploy (sem necessidade de banco de dados ou variáveis de ambiente).

---
© 2026 **CucandoTI** — Todos os direitos reservados.
