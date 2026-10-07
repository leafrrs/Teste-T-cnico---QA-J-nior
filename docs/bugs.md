# Relatório de Bugs (Bug Reports) - Verzel Store

Este documento registra os defeitos funcionais encontrados durante a fase de testes da versão 2.3.0 (Card VZS-142).

---

## BUG-01: Cobrança indevida de frete quando o subtotal é exatamente R$ 200,00

- **ID:** BUG-01
- **Título:** [Carrinho / API] Frete é cobrado e frete grátis não é concedido quando o subtotal da compra atinge exatamente R$ 200,00
- **Severidade:** **Alta** (Cobrança financeira indevida do cliente; cálculo divergente da regra de negócio)
- **Prioridade:** **Alta** (Afeta diretamente o critério de aceite principal da entrega)
- **Componente:** Frontend (Carrinho) e Backend (`POST /api/carrinho/calcular`)
- **Versão:** 2.3.0 (Card VZS-142)
- **Ambiente:** Multi-navegador (Google Chrome, Microsoft Edge e demais navegadores web) — o comportamento ocorre independentemente do browser pois o cálculo defeituoso é retornado diretamente pela API backend.
- **Critério Violado:** CA06 (*"O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive."*)

### Pré-condições:
1. Carrinho de compras vazio.

### Passos para Reproduzir:
1. Acessar a vitrine da Verzel Store.
2. Adicionar ao carrinho produtos que somem exatamente R$ 200,00 no subtotal (Exemplo: 1 unidade da "Mochila Urbana 20L" [R$ 100,00] e 2 unidades da "Garrafa Térmica 750ml" [2 x R$ 50,00 = R$ 100,00]).
3. Acessar a página do carrinho (`/carrinho`).
4. Observar a seção "Resumo do pedido" na interface.
5. Inspecionar a resposta JSON da rota `POST /api/carrinho/calcular` no DevTools.

### Resultado Esperado:
- O frete deve ser exibido como **"Grátis"** (R$ 0,00).
- O total deve ser **R$ 200,00**.
- A API deve retornar `"frete": 0` e `"freteGratis": true`.
- Não deve haver aviso cobrando valor adicional para frete grátis.

### Resultado Obtido:
- A interface e a API cobram o frete fixo de **R$ 19,90**, totalizando **R$ 219,90**.
- A interface exibe a mensagem contraditória: *"Faltam R$ 0,00 para o frete grátis."*.
- O payload retornado pela API confirma o defeito no backend:
  ```json
  {
    "subtotal": 200,
    "desconto": 0,
    "frete": 19.9,
    "freteGratis": false,
    "valorFaltanteFreteGratis": 0,
    "total": 219.9
  }
  ```

### Causa Raiz Provável:
A lógica condicional no backend provavelmente foi codificada com o operador de maior estrito (`subtotal > 200`) em vez de maior ou igual (`subtotal >= 200`).

---

## BUG-02: API permite criação de pedido com quantidade de produto superior a 5 unidades

- **ID:** BUG-02
- **Título:** [API /pedidos] Falha na validação de limite máximo por produto permite criação de pedido com 6 ou mais unidades via POST
- **Severidade:** **Alta** (Quebra de regra de negócio no backend; bypass de validação de estoque/pedido)  
  *Justificativa:* A regra do CA10 vale explicitamente para a interface e para a API. A validação implementada somente na interface pode ser facilmente contornada por requisição direta, permitindo compras acima do limite de estoque/pedido.
- **Prioridade:** **Alta** (Critério CA10 exige explicitamente a regra na interface e na API)
- **Componente:** Backend (`POST /api/pedidos`)
- **Versão:** 2.3.0 (Card VZS-142)
- **Ambiente:** API REST / Console DevTools / Requisições HTTP
- **Critério Violado:** CA10 (*"Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API."*)

### Pré-condições:
1. Nenhuma.

### Passos para Reproduzir:
1. Enviar uma requisição HTTP `POST` para o endpoint `/api/pedidos` com dados válidos de cliente e um produto com quantidade igual a 6:
   ```json
   {
     "cliente": {
       "nome": "Rafael Rodrigues",
       "email": "rafael@teste.com",
       "cep": "01310-100"
     },
     "itens": [
       { "produtoId": "P001", "quantidade": 6 }
     ]
   }
   ```
2. Verificar o status code HTTP e a resposta retornada pela API.

### Resultado Esperado:
- A API deve rejeitar a criação do pedido retornando **HTTP 422 Unprocessable Entity**.
- O corpo deve conter o código de erro documentado: `"QUANTIDADE_MAXIMA_EXCEDIDA"`.

### Resultado Obtido:
- A API aceita a requisição e retorna **HTTP 201 Created**.
- O pedido é gerado com sucesso (ex: pedido `VZ-403520`), aceitando 6 unidades do item `P001` e subtotal de R$ 359,40, burlando a regra de negócio.

### Causa Raiz Provável:
A validação de limite de 5 unidades foi implementada apenas na camada de apresentação (interface web), faltando a validação defensiva correspondente na camada de domínio/controlador da API `POST /api/pedidos`.
