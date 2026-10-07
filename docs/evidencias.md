# Evidências de Teste - Verzel Store (Versão 2.3.0)

Este documento reúne os registros visuais e técnicos coletados durante a execução dos testes manuais, exploratórios e de API.

---

## 1. Evidências dos Bugs Encontrados

### BUG-01: Cobrança indevida de frete quando subtotal é exatamente R$ 200,00
- **Visão da Interface:** O carrinho atinge subtotal de R$ 200,00, exibe a mensagem "Faltam R$ 0,00 para o frete grátis.", porém cobra R$ 19,90 de frete.
  - Imagem: `../evidencias/evidencia-bug-01-carrinho-200.png`

- **Visão da API (`POST /api/carrinho/calcular`):** A resposta confirma `frete: 19.9` e `freteGratis: false`, mesmo com `valorFaltanteFreteGratis: 0`.
  - Imagem: `../evidencias/evidencia-bug-01-api-calcular.png`

---

### BUG-02: Bypass de limite de 5 unidades na API (`POST /api/pedidos`)
- **Visão da API (`POST /api/pedidos`):** Requisição enviando quantidade 6 de um produto é aceita com HTTP 201 Created e gera pedido fictício (`VZ-403520`), violando o CA10 no backend.
  - Imagem: `../evidencias/evidencia-bug-02-api-quantidade-6.png`

---

## 2. Evidências de Testes Aprovados (PASS)

### CA10: Limite de 5 unidades respeitado na Interface
- O botão "Adicionar ao carrinho" é desabilitado e a mensagem "Limite de 5 unidades atingido." é exibida ao alcançar 5 unidades na vitrine.
  - Imagem: `../evidencias/evidencia-limite-5-produtos-interface.png`

### Checkout: Pedido Confirmado com Sucesso
- Pedido concluído com dados válidos gerando código no padrão `VZ-XXXXXX` e tela de confirmação com pagamento na entrega.
  - Imagem: `../evidencias/evidencia-pedido-confirmado.png`

### API: Validação de Cupons no `POST /api/pedidos`
- **Cupom Inexistente:** Retorno HTTP 422 com código `CUPOM_INVALIDO` e mensagem "Cupom inválido.".
  - Imagem: `../evidencias/evidencia-api-cupom-invalido-422.png`

- **Cupom Expirado:** Retorno HTTP 422 com código `CUPOM_EXPIRADO` e mensagem "Cupom expirado.".
  - Imagem: `../evidencias/evidencia-api-cupom-expirado-422.png`
