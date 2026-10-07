# Matriz de Execução de Testes - Verzel Store

Esta matriz detalha os testes manuais e exploratórios executados, classificando-os por tipo (Positivo, Negativo, Fronteira, Exploratório) e registrando o resultado obtido.

---

## 1. Testes Baseados nos Critérios de Aceite (Manuais / Funcionais)

| ID | Critério | Descrição do Teste | Tipo | Resultado Esperado | Resultado Obtido | Status | Bug Relacionado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | CA01 | Aplicar cupom `BEMVINDO10` sobre subtotal R$ 100,00 | Positivo | Desconto de R$ 10,00 | Desconto de R$ 10,00 aplicado | **PASS** | - |
| **TC-02** | CA01 / CA11 | Aplicar cupom `BEMVINDO10` sobre subtotal R$ 59,90 | Positivo / Arredondamento | Desconto de R$ 5,99 (2 casas decimais) | Desconto de R$ 5,99 exibido | **PASS** | - |
| **TC-03** | CA02 | Inserir cupom em minúsculas (`bemvindo10`) e misto | Positivo | Cupom aplicado normalmente | Cupom aplicado normalmente | **PASS** | - |
| **TC-04** | CA02 | Inserir cupom com espaços antes e depois (`" BEMVINDO10 "`) | Positivo | Espaços ignorados; cupom aplicado | Espaços ignorados; cupom aplicado | **PASS** | - |
| **TC-05** | CA02 | Inserir cupom com espaço no meio (`"BEM VINDO10"`) | Negativo | Mensagem "Cupom inválido." | Mensagem "Cupom inválido." exibida | **PASS** | - |
| **TC-06** | CA03 | Aplicar código de cupom inexistente (`BEMVINDO20`) | Negativo | Mensagem "Cupom inválido." e sem desconto | Mensagem exibida; subtotal mantido | **PASS** | - |
| **TC-07** | CA04 | Aplicar cupom expirado (`VERAO2026`) | Negativo | Mensagem "Cupom expirado." e sem desconto | Mensagem exibida; sem desconto | **PASS** | - |
| **TC-08** | CA05 | Tentar aplicar segundo cupom com um já aplicado | Negativo / Regra | Bloquear inserção de novo cupom | Campo de input ocultado; exige clique em "Remover cupom" | **PASS** | - |
| **TC-09** | CA06 | Subtotal superior a R$ 200,00 (ex: R$ 229,90) | Positivo | Frete R$ 0,00 (Grátis) | Frete exibido como "Grátis" | **PASS** | - |
| **TC-10** | CA06 | **Subtotal exatamente R$ 200,00 (Fronteira)** | **Fronteira** | **Frete R$ 0,00 (Grátis)** | **Cobrado frete de R$ 19,90; exibe "Faltam R$ 0,00"** | ❌ **FAIL** | **BUG-01** |
| **TC-11** | CA07 | Subtotal abaixo de R$ 200,00 (ex: R$ 189,90) | Positivo | Frete R$ 19,90; faltam R$ 10,10 | Frete R$ 19,90 cobrado; faltam R$ 10,10 exibido | **PASS** | - |
| **TC-12** | CA08 / CA09 | Subtotal R$ 229,90 com cupom de 10% (R$ 22,99) | Positivo / Regra | Frete Grátis mantido; desconto não incide no frete | Frete Grátis mantido; total R$ 206,91 | **PASS** | - |
| **TC-13** | CA10 | Adicionar 5 unidades de um produto na interface | Fronteira / Positivo | Permitir 5 unidades | Aceitou 5 unidades | **PASS** | - |
| **TC-14** | CA10 | Tentar adicionar 6ª unidade pela interface | Fronteira / Negativo | Bloquear botão e exibir aviso de limite | Botão desabilitado; exibe "Limite de 5 unidades atingido." | **PASS** | - |
| **TC-15** | CA10 | **Enviar quantidade 6 diretamente via API (`POST /pedidos`)** | **Backend / Negativo** | **HTTP 422 com QUANTIDADE_MAXIMA_EXCEDIDA** | **HTTP 201 Created (pedido gerado)** | ❌ **FAIL** | **BUG-02** |

---

## 2. Testes de Checkout e Validações Gerais

| ID | Validação | Descrição do Teste | Resultado Esperado | Resultado Obtido | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-16** | Nome Cliente | Informar apenas o primeiro nome ("Rafael") | Mensagem inline exigindo nome e sobrenome | Exibe "Informe o nome e sobrenome." | **PASS** |
| **TC-17** | Nome Cliente | Informar nome e espaços no fim ("Rafael   ") | Mensagem inline exigindo sobrenome | Exibe "Informe o nome e sobrenome." | **PASS** |
| **TC-18** | E-mail | Informar e-mail sem formato válido ("rafael.teste.com") | Mensagem inline exigindo e-mail válido | Exibe "Informe um e-mail válido." | **PASS** |
| **TC-19** | CEP | Informar CEP com 7 dígitos ("9419883") | Mensagem inline exigindo 8 dígitos | Exibe "Informe um CEP com 8 dígitos." | **PASS** |
| **TC-20** | CEP | Informar CEP válido com hífen ("01310-100") e sem hífen | Permite avançar e concluir pedido | Ambos os formatos aceitos com sucesso | **PASS** |

---

## 3. Testes Exploratórios

| ID | Ideia / Exploração | Comportamento Observado | Avaliação |
| :--- | :--- | :--- | :--- |
| **EXP-01** | Remover produto que mantinha frete grátis, derrubando subtotal para menos de R$ 200,00 | O carrinho recalcula imediatamente e passa a cobrar frete fixo de R$ 19,90 | Comportamento dinâmico correto |
| **EXP-02** | Aplicar cupom com sucesso e em seguida esvaziar todo o carrinho | O carrinho limpa os dados e exibe a mensagem de carrinho vazio amigável | Correto e elegante |
| **EXP-03** | Testar chamadas da API no console para cupons inválidos (`POST /api/pedidos`) | A API responde com HTTP 422 e mensagens de erro estruturadas conforme documentado | Backend consistente |
