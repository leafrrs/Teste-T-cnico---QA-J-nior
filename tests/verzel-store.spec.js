const { test, expect } = require('@playwright/test');

test.describe('Testes E2E - Verzel Store (Entrega VZS-142)', () => {

  test('CT01 - Aplicar cupom válido BEMVINDO10 e garantir frete grátis para subtotal > R$ 200', async ({ page }) => {
    // 1. Acessa a loja
    await page.goto('/');

    // 2. Adiciona a Jaqueta Corta-Vento (R$ 229,90) ao carrinho
    const itemJaqueta = page.locator('article').filter({ hasText: 'Jaqueta Corta-Vento' });
    await itemJaqueta.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

    // 3. Acessa a página do carrinho
    await page.goto('/carrinho');

    // 4. Aplica o cupom de desconto BEMVINDO10 usando o seletor estável #campo-cupom
    await page.locator('#campo-cupom').fill('BEMVINDO10');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();

    // 5. Validações conforme regras CA01, CA06, CA08 e CA09
    const resumo = page.locator('div').filter({ hasText: /^Resumo do pedido/ }).first();
    await expect(resumo.getByText('R$ 22,99')).toBeVisible();
    await expect(resumo.getByText(/Grátis/i)).toBeVisible();
    await expect(resumo.getByText('R$ 206,91')).toBeVisible();
  });

  test('CT02 - Tentar aplicar cupom inexistente e validar mensagem de erro', async ({ page }) => {
    // 1. Acessa a loja
    await page.goto('/');

    // 2. Adiciona a Mochila Urbana (R$ 100,00)
    const itemMochila = page.locator('article').filter({ hasText: 'Mochila Urbana 20L' });
    await itemMochila.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

    // 3. Acessa o carrinho
    await page.goto('/carrinho');

    // 4. Tenta aplicar cupom inexistente
    await page.locator('#campo-cupom').fill('CUPOMINVALIDO99');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();

    // 5. Validações conforme CA03 restritas ao resumo para maior robustez
    await expect(page.getByText('Cupom inválido.')).toBeVisible();

    const resumo = page.locator('div').filter({ hasText: /^Resumo do pedido/ }).first();
    await expect(resumo.getByText('R$ 0,00')).toBeVisible(); // Sem desconto
    await expect(resumo.getByText('R$ 19,90')).toBeVisible(); // Frete cobrado
    await expect(resumo.getByText('R$ 119,90')).toBeVisible(); // Total inalterado
  });

  test('CT03 - Validar bloqueio de limite máximo de 5 unidades na interface', async ({ page }) => {
    // 1. Acessa a loja
    await page.goto('/');

    // 2. Localiza o card da Mochila Urbana
    const itemMochila = page.locator('article').filter({ hasText: 'Mochila Urbana 20L' });
    const btnAdicionar = itemMochila.getByRole('button', { name: 'Adicionar ao carrinho' });

    // 3. Clica 5 vezes para atingir o limite máximo
    for (let i = 0; i < 5; i++) {
      await btnAdicionar.click();
    }

    // 4. Validação conforme CA10
    await expect(itemMochila.getByText('Limite de 5 unidades atingido.')).toBeVisible();
    await expect(btnAdicionar).toBeDisabled();
  });

  test('CT04 - Fluxo completo E2E de compra e confirmação de pedido', async ({ page }) => {
    // 1. Acessa a loja e adiciona um item
    await page.goto('/');
    const itemTenis = page.locator('article').filter({ hasText: 'Tênis Casual Urbano' });
    await itemTenis.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

    // 2. Vai para o checkout
    await page.goto('/checkout');

    // 3. Preenche formulário com os IDs estáveis identificados
    await page.locator('#campo-nome').fill('Rafael Rodrigues');
    await page.locator('#campo-email').fill('rafael@teste.com');
    await page.locator('#campo-cep').fill('01310-100');

    // 4. Confirma o pedido
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();

    // 5. Validação de sucesso: confirmação do pedido
    await expect(page.getByText(/Pedido VZ-/i)).toBeVisible();
    await expect(page.getByText(/Obrigado, Rafael/i)).toBeVisible();
  });

  test('CT05 - Validar frete grátis com subtotal exatamente R$ 200,00 na interface', async ({ page }) => {
    // Falha esperada: BUG-01 (ver docs/bugs.md)
    test.fail();

    // 1. Acessa a loja
    await page.goto('/');

    // 2. Adiciona Mochila Urbana 20L x1 (R$ 100,00)
    const itemMochila = page.locator('article').filter({ hasText: 'Mochila Urbana 20L' });
    await itemMochila.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

    // 3. Adiciona Garrafa Térmica 750ml x2 (2 x R$ 50,00 = R$ 100,00)
    const itemGarrafa = page.locator('article').filter({ hasText: 'Garrafa Térmica 750ml' });
    await itemGarrafa.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await itemGarrafa.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

    // 4. Abre o carrinho
    await page.goto('/carrinho');

    // 5. Validações: Subtotal R$ 200,00 deve ter Frete Grátis e Total R$ 200,00
    await expect(page.locator('dd[data-valor="subtotal"]')).toHaveText('R$ 200,00');
    await expect(page.locator('dd[data-valor="frete"]')).toHaveText(/Grátis/i);
    await expect(page.locator('dd[data-valor="total"]')).toHaveText('R$ 200,00');
  });

  test('CT06 - Aplicar cupom com variação de caixa e espaços nas extremidades', async ({ page }) => {
    // 1. Acessa a loja e adiciona Mochila Urbana 20L (R$ 100,00)
    await page.goto('/');
    const itemMochila = page.locator('article').filter({ hasText: 'Mochila Urbana 20L' });
    await itemMochila.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

    // 2. Acessa o carrinho
    await page.goto('/carrinho');

    // 3. Aplica cupom com minúsculas e espaços antes/depois (CA02)
    await page.locator('#campo-cupom').fill('  bemvindo10  ');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();

    // 4. Validação: Desconto de R$ 10,00 aplicado com sucesso
    const resumo = page.locator('div').filter({ hasText: /^Resumo do pedido/ }).first();
    await expect(resumo.getByText('R$ 10,00')).toBeVisible();
  });

  test('CT07 - Garantir que apenas um cupom pode ser aplicado e botão de remoção fica visível', async ({ page }) => {
    // 1. Acessa a loja e adiciona Mochila Urbana 20L
    await page.goto('/');
    const itemMochila = page.locator('article').filter({ hasText: 'Mochila Urbana 20L' });
    await itemMochila.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

    // 2. Acessa o carrinho
    await page.goto('/carrinho');

    // 3. Aplica BEMVINDO10
    await page.locator('#campo-cupom').fill('BEMVINDO10');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();

    // 4. Validação conforme CA05: campo #campo-cupom indisponível e botão 'Remover cupom' visível
    await expect(page.locator('#campo-cupom')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Remover cupom/i })).toBeVisible();
  });

});
