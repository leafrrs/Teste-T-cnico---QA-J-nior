# 🛒 Teste Técnico - QA Júnior | Verzel Store

Este repositório contém os entregáveis do teste técnico para a vaga de **QA Júnior** na **Verzel**, referente à validação da entrega da versão **2.3.0** (Card **VZS-142**).

A entrega adiciona à Verzel Store:
- Aplicação de cupom de desconto no carrinho;
- Regra de frete grátis baseada no subtotal;
- Integrações de cálculo e pedidos via API REST.

---

## 📁 Estrutura do Repositório e Entregáveis

Todos os artefatos solicitados no teste técnico estão organizados na estrutura abaixo:

```text
├── docs/
│   ├── cenarios-de-teste.md    # Cenários de teste detalhados escritos em Gherkin (BDD)
│   ├── execucao-testes.md      # Matriz de execução (manuais, exploratórios, fronteira com PASS/FAIL)
│   ├── bugs.md                 # Relatórios profissionais dos bugs encontrados (BUG-01 e BUG-02)
│   └── evidencias.md           # Compilação e explicação das evidências de teste
├── evidencias/                 # Prints e capturas da interface e respostas da API (DevTools)
├── tests/
│   ├── verzel-store.spec.js    # Automação de testes E2E com Playwright (carrinho, cupom, frete, checkout)
│   └── api.spec.js             # Automação de testes de API com Playwright (produtos e pedidos)
├── playwright.config.js        # Configuração do Playwright
├── package.json                # Dependências e scripts do projeto
└── README.md                   # Apresentação do projeto e instruções de execução
```

---

## 🎯 Resumo da Estratégia de Teste

A validação foi conduzida aplicando as melhores práticas de Engenharia de Qualidade de Software:
1. **Análise de Requisitos e Critérios de Aceite:** Mapeamento de 100% dos critérios (CA01 a CA11).
2. **Técnicas de Caixa-Preta Aplicadas:**
   - **Análise de Valor Limite (Fronteira):** Teste do subtotal em R$ 199,99, R$ 200,00 e R$ 200,01 para a regra do frete grátis, além dos limites de 5 e 6 unidades por produto.
   - **Particionamento por Equivalência:** Validação de cupons válidos, expirados, inexistentes e variações de caixa (maiúsculas/minúsculas) e espaços.
3. **Testes de API e Integração:** Validação das rotas `/api/produtos`, `/api/carrinho/calcular` e `/api/pedidos` via DevTools e chamadas automatizadas.
4. **Testes Exploratórios:** Simulação de alterações dinâmicas no carrinho (remoção de itens, esvaziamento, troca de cupons).

---

## 🐛 Bugs Reportados

Foram identificados e documentados dois defeitos funcionais de alta severidade:

1. **[BUG-01] Cobrança indevida de frete quando subtotal é exatamente R$ 200,00:**
   - **Critério Violado:** CA06 (*"O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive."*).
   - **Problema:** A API e a interface cobram R$ 19,90 de frete e exibem a mensagem contraditória *"Faltam R$ 0,00 para o frete grátis."*.
2. **[BUG-02] API permite criação de pedido com quantidade superior a 5 unidades:**
   - **Critério Violado:** CA10 (*"Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API."*).
   - **Problema:** A regra foi implementada apenas na interface. Uma requisição direta para `POST /api/pedidos` com quantidade 6 retorna HTTP 201 Created e cria o pedido com sucesso.

Os relatórios detalhados com passos para reproduzir, severidade, justificativas e evidências estão disponíveis em [`docs/bugs.md`](docs/bugs.md).

---

## 🤖 Automação de Testes com Playwright

O projeto conta com **12 testes automatizados** (7 testes End-to-End de interface e 5 testes de API), superando amplamente o requisito mínimo de 3 cenários:

### Testes End-to-End (E2E) - `tests/verzel-store.spec.js`
- **CT01:** Aplicação do cupom `BEMVINDO10`, cálculo de 10% de desconto e concessão de frete grátis para subtotal > R$ 200.
- **CT02:** Tentativa de aplicação de cupom inexistente com validação da mensagem de erro e manutenção do total (locators restritos ao container de resumo).
- **CT03:** Bloqueio e desabilitação do botão ao atingir o limite de 5 unidades na interface (CA10).
- **CT04:** Fluxo completo de compra (adicionar item, ir ao carrinho, preencher checkout e confirmar pedido).
- **CT05:** *(Falha esperada - BUG-01)* Validação de frete grátis com subtotal de exatamente R$ 200,00 na interface. Marcado com `test.fail()` para documentar o defeito na suíte.
- **CT06:** Aplicação de cupom com variação de caixa e espaços nas extremidades (`"  bemvindo10  "`), validando o desconto de R$ 10,00 (CA02).
- **CT07:** Validação de que apenas um cupom pode ser aplicado por vez, garantindo ocultação do campo `#campo-cupom` e visibilidade do botão "Remover cupom" (CA05).

### Testes de API - `tests/api.spec.js`
- **API-01:** `GET /api/produtos` com validação de status 200 e integridade do catálogo de produtos.
- **API-02:** `POST /api/pedidos` rejeitando cupom inexistente com status 422 (`CUPOM_INVALIDO`).
- **API-03:** `POST /api/pedidos` rejeitando cupom expirado com status 422 (`CUPOM_EXPIRADO`).
- **API-04:** *(Falha esperada - BUG-01)* `POST /api/carrinho/calcular` com subtotal de R$ 200,00 (1x P005 + 2x P008), esperando frete 0, freteGratis true e total 200. Marcado com `test.fail()`.
- **API-05:** *(Falha esperada - BUG-02)* `POST /api/pedidos` com quantidade 6 (P001 x6), esperando status 422 e código `QUANTIDADE_MAXIMA_EXCEDIDA`. Marcado com `test.fail()`.

> **Nota sobre `test.fail()`:** Os testes CT05, API-04 e API-05 reproduzem diretamente os bugs encontrados e afirmam o comportamento esperado correto. Ao marcá-los com `test.fail()`, o Playwright espera a falha na asserção enquanto o defeito persistir, mantendo a suíte de integração contínua (CI) verde enquanto documenta a regressão de forma executável.

### Como Executar os Testes

#### Pré-requisitos:
- [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).
- Google Chrome instalado.

#### 1. Instalar as dependências:
```bash
npm install
```

#### 2. Executar todos os testes automatizados:
```bash
npm test
```
*(ou `npx playwright test`)*

#### 3. Visualizar o relatório interativo HTML dos testes:
```bash
npm run test:report
```

---

## 📌 Limitações e Próximos Passos

- **Ambiente Compartilhado:** Como a loja roda em ambiente compartilhado sem persistência de estado entre requisições, testes destrutivos, testes de carga e testes de estresse não foram executados, respeitando as regras do teste técnico.
- **Correção dos Bugs:** Assim que as correções do BUG-01 (`subtotal >= 200`) e BUG-02 (validação de quantidade máxima no backend) forem deployadas, basta remover as anotações `test.fail()` dos testes CT05, API-04 e API-05 para que eles passem normalmente como testes de regressão.
- **Pipeline de CI/CD:** Como próximo passo, pode-se integrar a execução dos testes via GitHub Actions a cada pull request ou push na branch principal.

---

## 🧠 Declaração de Uso de Inteligência Artificial

Em conformidade com as instruções do processo seletivo da Verzel, declara-se a utilização de Inteligência Artificial (Google Gemini / Assistente IA) sob o seguinte formato de mentoria e co-pilotagem técnica:

- **Aprendizado e Mentoria de Conceitos:** Uso da IA para aprofundamento de conceitos teóricos de QA (Análise de Valor Limite, formulação BDD/Gherkin, classificação de bugs por severidade e prioridade).
- **Descoberta e Discussão Técnica:** A IA atuou questionando cenários e orientando a inspeção dos dados no DevTools (Network/Console), enquanto a execução dos passos, a tomada de decisão sobre o que testar e a constatação dos comportamentos reais foram conduzidas ativamente pelo candidato.
- **Auxílio na Automação:** Apoio na estruturação inicial dos scripts do Playwright e definição de locators resilientes.
- **Revisão e Formatação:** Suporte na formatação padronizada dos documentos em Markdown.

A análise crítica das regras de negócio, a validação de cada critério de aceite e a comprovação dos bugs reportados representam a atuação prática do candidato durante o teste técnico.
#   T e s t e - T - c n i c o - - - Q A - J - n i o r  
 