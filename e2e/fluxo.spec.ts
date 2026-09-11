import { createHash, randomBytes } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { Client } from 'pg';

/**
 * Fluxo completo do MVP (PRD Negócio, seção 9, semana 2):
 * cadastro → board → trilha → missão concluída.
 */

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://prospere@127.0.0.1:5433/prospere';

const comBanco = async <T>(fn: (client: Client) => Promise<T>): Promise<T> => {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
};

/**
 * Cadastro por link mágico. O e-mail não sai neste ambiente, então o teste faz o papel da
 * caixa de entrada: pede o link pela interface (o que grava o token) e entra por um token
 * próprio, exercitando a mesma rota de verificação que o usuário abriria.
 */
const entrar = async (page: Page, email: string) => {
  await page.goto('/entrar');
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  await page.getByLabel('Seu e-mail').fill(email);
  await page.getByRole('button', { name: 'Receber link de acesso' }).click();
  await expect(page.getByText(/Link enviado/)).toBeVisible();

  const pedidos = await comBanco((client) =>
    client.query('select id from login_tokens where email = $1', [email]),
  );
  expect(pedidos.rowCount, 'o pedido de acesso deveria ter gravado um token').toBe(1);

  const token = randomBytes(32).toString('base64url');
  await comBanco((client) =>
    client.query(
      "insert into login_tokens (email, token_hash, expires_at) values ($1, $2, now() + interval '15 minutes')",
      [email, createHash('sha256').update(token).digest('hex')],
    ),
  );

  await page.goto(`/entrar/verificar?token=${token}`);
  await expect(page).toHaveURL(/\/(hoje|onboarding)/);
};

/**
 * O wizard só responde depois da hidratação; em dev o primeiro clique pode se perder
 * enquanto a rota compila. O helper confirma que a etapa avançou e repete se necessário.
 */
const escolher = async (page: Page, label: string | RegExp, etapaEsperada: number) => {
  const contador = page.getByText(`Pergunta ${etapaEsperada} de 7`);
  for (let tentativa = 0; tentativa < 3; tentativa += 1) {
    await page.getByRole('button', { name: label }).first().click();
    try {
      await contador.waitFor({ state: 'visible', timeout: 5_000 });
      return;
    } catch {
      if (tentativa === 2) throw new Error(`Board travou antes da pergunta ${etapaEsperada}.`);
    }
  }
};

const responderBoard = async (
  page: Page,
  opcoes: { arquetipo: string | RegExp; produto: string; vendas: string },
) => {
  await page.goto('/onboarding/board');
  await expect(page.getByText('Pergunta 1 de 7')).toBeVisible();

  await escolher(page, opcoes.arquetipo, 2);
  await escolher(page, 'Fazer as primeiras vendas', 3);

  await page.getByLabel('Faturamento mensal alvo (R$)').fill('10000');
  await page.getByLabel('Preço médio do que você vende (ou pretende vender)').fill('500');
  await page.getByRole('button', { name: '6 meses' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Pergunta 4 de 7')).toBeVisible();

  await escolher(page, opcoes.produto, 5);
  await escolher(page, opcoes.vendas, 6);
  await escolher(page, 'Menos de 100', 7);
  await page.getByRole('button', { name: '10 a 20 h' }).click();
};

test('cadastro, board, trilha personalizada e missão concluída', async ({ page }) => {
  const email = `fundadora+${Date.now()}@exemplo.com.br`;
  await entrar(page, email);

  await responderBoard(page, {
    arquetipo: /Tenho uma ideia ou um produto\/serviço/,
    produto: 'Tenho um protótipo ou versão inicial',
    vendas: 'Nunca vendi por conta própria',
  });

  await page.waitForURL('**/trilha');
  await expect(page.getByRole('heading', { name: 'Sua trilha', exact: true })).toBeVisible();
  await expect(page.getByText('Fundador(a)', { exact: true })).toBeVisible();

  // Meta decomposta: R$ 10.000 ÷ R$ 500 ÷ 4,33 semanas = 5 vendas/semana.
  await expect(page.getByText('5 vendas por semana')).toBeVisible();
  // Quem nunca vendeu recebe as missões de script e objeções (ADJ-NOSALES).
  await expect(page.getByText('Script de venda 1:1')).toBeVisible();
  await expect(page.getByText('Banco de objeções')).toBeVisible();
  // Audiência pequena: lançamento semente.
  await expect(page.getByText('Lançamento semente')).toBeVisible();

  await page.getByRole('link', { name: /Auditoria de Responsabilidade/ }).click();
  await expect(page.getByRole('heading', { name: 'Auditoria de Responsabilidade' })).toBeVisible();

  await page.getByLabel('As 3 desculpas que eu repito').fill('Não tenho tempo');
  await page.getByRole('button', { name: 'Salvar resposta' }).click();
  await expect(page.getByText('Salvo.')).toBeVisible();

  await page.getByRole('button', { name: 'Concluir missão' }).click();
  await expect(page.getByRole('button', { name: 'Desfazer conclusão' })).toBeVisible();

  // Contador: o campo precisa ser alcançável pelo rótulo — leitor de tela e teste usam o mesmo caminho.
  await page.goto('/missao/SON-01');
  await page.getByLabel('Quem foi e a frase que ficou').fill('Ana, 32 — já gastou R$ 1.200 em consultas avulsas');
  await page.getByRole('button', { name: 'Registrar' }).click();
  await expect(page.getByText('1 de 10')).toBeVisible();

  await page.goto('/hoje');
  await expect(page.getByRole('heading', { name: 'Hoje' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Abrir missão/ })).toBeVisible();
});

test('operador com clientes pagantes vira A4 e não recebe as missões de validação inicial', async ({
  page,
}) => {
  const email = `operador+${Date.now()}@exemplo.com.br`;
  await entrar(page, email);

  await responderBoard(page, {
    arquetipo: /Tenho uma ideia ou um produto\/serviço/,
    produto: 'Já tenho clientes pagantes',
    vendas: 'Vendo com regularidade',
  });

  await page.waitForURL('**/trilha');
  // ARC-VALIDATED: quem já tem clientes pagantes é tratado como Operador(a).
  await expect(page.getByText('Operador(a)', { exact: true })).toBeVisible();
  await expect(page.getByText('Seed Launch (pré-venda)')).toHaveCount(0);
});

test('gate de fora de escopo registra lista de espera em vez de gerar trilha', async ({ page }) => {
  const email = `escala+${Date.now()}@exemplo.com.br`;
  await entrar(page, email);

  await page.goto('/onboarding/board');
  await page
    .getByRole('button', {
      name: 'Tenho empresa com time e faturamento acima de R$ 1 mi/ano e quero escalar',
    })
    .click();

  await expect(page.getByRole('heading', { name: 'Essa edição ainda não está aberta' })).toBeVisible();
  await page.getByLabel('Seu e-mail').fill(email);
  await page.getByRole('button', { name: 'Entrar na lista de espera' }).click();
  await expect(page.getByText('Contato registrado.')).toBeVisible();
});

test('a oferta não fecha com gatilho artificial e a revisão semanal exige prioridades', async ({
  page,
}) => {
  const email = `oferta+${Date.now()}@exemplo.com.br`;
  await entrar(page, email);
  await responderBoard(page, {
    arquetipo: /Tenho um negócio em operação/,
    produto: 'Já tenho clientes pagantes',
    vendas: 'Vendo com regularidade',
  });
  await page.waitForURL('**/trilha');

  await page.goto('/ferramenta/oferta');
  await page.getByLabel('Ajudo…').fill('nutricionistas autônomas');
  await page.getByLabel('a…').fill('fechar 10 clientes por mês');
  await page.getByLabel('sem…').fill('depender de indicação');
  await page.getByLabel('Preço (R$)').fill('1500');

  const objecoes = ['Está caro', 'Não sei se funciona', 'Não é o momento'];
  for (const [index, objecao] of objecoes.entries()) {
    await page.getByRole('button', { name: 'Adicionar objeção' }).click();
    const bloco = page.getByRole('group', { name: `Objeção ${index + 1}` });
    await bloco.getByPlaceholder('Está caro').fill(objecao);
    await bloco.getByPlaceholder('Sim, e é por isso que…').fill('Sim, e é por isso que funciona.');
  }

  // Marca a escassez como artificial: a oferta não pode ser finalizada assim.
  const escassez = page.getByRole('group', { name: 'Escassez', exact: true });
  await escassez.getByRole('button', { name: 'Está na oferta, mas é artificial' }).click();
  await page.getByRole('button', { name: 'Finalizar oferta' }).click();
  await expect(page.getByText('Revise os campos destacados.')).toBeVisible();
  await expect(page.getByText(/Remova o que é artificial/)).toBeVisible();

  // Corrigido para "não se aplica", a oferta fecha.
  await escassez.getByRole('button', { name: 'Não se aplica' }).click();
  await page.getByRole('button', { name: 'Finalizar oferta' }).click();
  await expect(page.getByText('Salvo.')).toBeVisible();

  await page.goto('/ritual');
  await page.getByRole('button', { name: 'Fechar a revisão' }).click();
  await expect(page.getByText('Revise os campos destacados.')).toBeVisible();

  await page.getByPlaceholder('Vitória 1').fill('Primeira venda fechada');
  await page.getByPlaceholder('Prioridade 1').fill('10 abordagens novas');
  await page.getByRole('button', { name: 'Fechar a revisão' }).click();
  await expect(page.getByText(/Revisão salva/)).toBeVisible();
});
