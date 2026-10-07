# Cenários de Teste - Verzel Store (Card VZS-142)

Este documento contém os cenários de teste mapeados a partir dos Critérios de Aceite (CA01 a CA11) da entrega da Versão 2.3.0 da Verzel Store, utilizando a sintaxe BDD (**Gherkin**).

---

## Funcionalidade 1: Cupons de Desconto no Carrinho

### CA01 - Aplicação de cupom válido
```gherkin
Cenário: Aplicar cupom de desconto válido com sucesso
  Dado que o cliente possui produtos no carrinho de compras
  Quando insere o código do cupom "BEMVINDO10" no campo de cupom
  E clica no botão "Aplicar cupom"
  Então o sistema deve aplicar um desconto de 10% sobre o subtotal dos produtos
  E o valor total do pedido deve ser atualizado subtraindo o desconto
```

### CA02 - Tratamento de maiúsculas, minúsculas e espaços
```gherkin
Cenário: Aplicar cupom com variação de caixa e espaços nas extremidades
  Dado que o cliente possui produtos no carrinho
  Quando insere o código "  bemvindo10  " (minúsculas e espaços antes/depois)
  E clica no botão "Aplicar cupom"
  Então o sistema deve reconhecer o cupom e aplicar 10% de desconto normalmente

Cenário: Tentar aplicar cupom com espaço no meio
  Dado que o cliente possui produtos no carrinho
  Quando insere o código "BEM VINDO10" com espaço no meio
  E clica no botão "Aplicar cupom"
  Então o sistema deve exibir a mensagem "Cupom inválido."
  E nenhum desconto deve ser aplicado
```

### CA03 - Cupom inexistente
```gherkin
Cenário: Tentar aplicar cupom inexistente
  Dado que o cliente possui produtos no carrinho
  Quando insere um código inexistente como "BEMVINDO20"
  E clica no botão "Aplicar cupom"
  Então o sistema deve exibir a mensagem "Cupom inválido."
  E nenhum desconto deve ser aplicado sobre o subtotal
  E o valor total do pedido deve permanecer inalterado
```

### CA04 - Cupom expirado
```gherkin
Cenário: Tentar aplicar cupom fora da validade
  Dado que o cliente possui produtos no carrinho
  Quando insere o cupom expirado "VERAO2026"
  E clica no botão "Aplicar cupom"
  Então o sistema deve exibir a mensagem "Cupom expirado."
  E nenhum desconto deve ser aplicado sobre o subtotal
```

### CA05 - Aplicação de apenas um cupom por vez
```gherkin
Cenário: Impedir aplicação de múltiplos cupons simultâneos
  Dado que o cliente já aplicou o cupom "BEMVINDO10" com sucesso
  Quando observa a interface de cupom
  Então o campo para inserção de novo cupom não deve estar disponível
  E deve ser disponibilizada a opção de "Remover cupom" para permitir a troca
```

---

## Funcionalidade 2: Regras de Frete e Frete Grátis

### CA06 - Frete grátis a partir de R$ 200,00
```gherkin
Cenário: Obter frete grátis com subtotal acima de R$ 200,00
  Dado que o cliente adicionou itens com subtotal superior a R$ 200,00 (ex: Jaqueta R$ 229,90)
  Quando visualiza o resumo do pedido no carrinho
  Então o valor do frete deve ser exibido como "Grátis" (R$ 0,00)
  E o campo indicativo de valor faltante não deve exigir valor adicional

Cenário: Obter frete grátis com subtotal exatamente em R$ 200,00 (Fronteira)
  Dado que o cliente adicionou itens com subtotal exatamente de R$ 200,00 (ex: 1x Mochila Urbana 20L [R$ 100,00] + 2x Garrafa Térmica 750ml [R$ 50,00 cada])
  Quando visualiza o resumo do pedido no carrinho
  Então o frete deve ser R$ 0,00 (Grátis)
  E a mensagem deve indicar que o frete grátis foi atingido
  # NOTA: Este cenário falhou na aplicação devido ao BUG-01
```

### CA07 - Frete fixo e cálculo do valor faltante
```gherkin
Cenário: Cobrança de frete fixo quando subtotal for inferior a R$ 200,00
  Dado que o cliente adicionou 1 Mochila Urbana 20L (R$ 100,00)
  Quando visualiza o resumo do pedido no carrinho
  Então o frete cobrado deve ser fixo no valor de R$ 19,90
  E o carrinho deve exibir a mensagem "Faltam R$ 100,00 para o frete grátis."
  E o valor total deve ser R$ 119,90
```

### CA08 & CA09 - Precedência de cálculo e não incidência sobre frete
```gherkin
Cenário: Frete grátis mantido mesmo quando cupom reduz o total pago para menos de R$ 200,00
  Dado que o cliente adicionou itens com subtotal de R$ 229,90 (elegível ao frete grátis)
  Quando aplica o cupom "BEMVINDO10" que concede R$ 22,99 de desconto
  Então o frete deve permanecer "Grátis" (R$ 0,00), pois considera o subtotal antes do desconto
  E o desconto de 10% não deve incidir sobre o frete
  E o valor total final deve ser exatamente R$ 206,91
```

---

## Funcionalidade 3: Limites de Quantidade e Validações

### CA10 - Limite máximo de 5 unidades por produto
```gherkin
Cenário: Limitar a 5 unidades por produto na interface
  Dado que o cliente adicionou 5 unidades de um mesmo produto
  Quando tenta adicionar a 6ª unidade na vitrine ou no carrinho
  Então o botão de adicionar deve ficar desabilitado
  E deve exibir a mensagem "Limite de 5 unidades atingido."

Cenário: Bloquear criação de pedido com quantidade superior a 5 na API
  Dado que uma requisição POST é enviada diretamente para "/api/pedidos" com quantidade 6
  Quando o backend processa os dados
  Então a API deve retornar status HTTP 422 Unprocessable Entity
  E o corpo da resposta deve conter o código de erro "QUANTIDADE_MAXIMA_EXCEDIDA"
  # NOTA: Este cenário falhou na aplicação devido ao BUG-02
```

### CA11 - Arredondamento para duas casas decimais
```gherkin
Cenário: Garantir arredondamento preciso para 2 casas decimais
  Dado que o cliente possui itens com valores fracionados (ex: Camiseta R$ 59,90)
  Quando o cupom de 10% é aplicado
  Então o desconto deve ser exibido como R$ 5,99 (duas casas decimais)
  E todos os valores exibidos no resumo devem conter exatamente duas casas decimais
```
