const { test, expect } = require('@playwright/test');

test.describe('Testes de API - Verzel Store', () => {

  test('API-01 - [GET /api/produtos] Deve listar produtos com status 200', async ({ request }) => {
    const response = await request.get('/api/produtos');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('preco');
  });

  test('API-02 - [POST /api/pedidos] Deve rejeitar pedido com cupom inexistente com status 422', async ({ request }) => {
    const response = await request.post('/api/pedidos', {
      data: {
        cliente: {
          nome: "Rafael Rodrigues",
          email: "rafael@teste.com",
          cep: "01310-100"
        },
        itens: [{ produtoId: "P001", quantidade: 1 }],
        cupom: "CUPOM_FALSO"
      }
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.erro.codigo).toBe('CUPOM_INVALIDO');
    expect(body.erro.mensagem).toBe('Cupom inválido.');
  });

  test('API-03 - [POST /api/pedidos] Deve rejeitar pedido com cupom expirado com status 422', async ({ request }) => {
    const response = await request.post('/api/pedidos', {
      data: {
        cliente: {
          nome: "Rafael Rodrigues",
          email: "rafael@teste.com",
          cep: "01310-100"
        },
        itens: [{ produtoId: "P001", quantidade: 1 }],
        cupom: "VERAO2026"
      }
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.erro.codigo).toBe('CUPOM_EXPIRADO');
    expect(body.erro.mensagem).toBe('Cupom expirado.');
  });

  test('API-04 - [POST /api/carrinho/calcular] Deve calcular frete grátis com subtotal exatamente R$ 200,00', async ({ request }) => {
    // Falha esperada: BUG-01 (ver docs/bugs.md)
    test.fail();

    const response = await request.post('/api/carrinho/calcular', {
      data: {
        itens: [
          { produtoId: 'P005', quantidade: 1 },
          { produtoId: 'P008', quantidade: 2 }
        ]
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.subtotal).toBe(200);
    expect(body.frete).toBe(0);
    expect(body.freteGratis).toBe(true);
    expect(body.total).toBe(200);
  });

  test('API-05 - [POST /api/pedidos] Deve rejeitar criação de pedido com quantidade superior a 5 com status 422', async ({ request }) => {
    // Falha esperada: BUG-02 (ver docs/bugs.md)
    test.fail();

    const response = await request.post('/api/pedidos', {
      data: {
        cliente: {
          nome: "Rafael Rodrigues",
          email: "rafael@teste.com",
          cep: "01310-100"
        },
        itens: [{ produtoId: "P001", quantidade: 6 }]
      }
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
  });

});
