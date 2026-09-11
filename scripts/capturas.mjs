#!/usr/bin/env node
/**
 * Gera as capturas de tela de `docs/capturas/` percorrendo o app de verdade, com dados de uma
 * persona Fundadora. Rode com o app em produção na porta 3102 e o Postgres de pé:
 *
 *   pnpm build
 *   DATABASE_URL=... EMAIL_TRANSPORT=console EMAIL_API_KEY=capturas \
 *     pnpm --filter @prospere/web start --port 3102 &
 *   node scripts/capturas.mjs
 */
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import pg from '../apps/web/node_modules/pg/lib/index.js';

const BASE = 'http://127.0.0.1:3102';
const DB = 'postgresql://prospere@127.0.0.1:5433/prospere';
const DIR = fileURLToPath(new URL('../docs/capturas/', import.meta.url));

const sql = async (texto, params = []) => {
  const client = new pg.Client({ connectionString: DB });
  await client.connect();
  try { return await client.query(texto, params); } finally { await client.end(); }
};

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-proxy-server'],
});

const shot = async (page, nome) => {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/${nome}.png`, fullPage: true });
  console.info('✓', nome);
};

// ---------- desktop ----------
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();

await page.goto(`${BASE}/`);
await shot(page, '01-inicio');

// Sessão: token direto no banco, como faz o e2e.
const email = `camila.nutri.${Date.now()}@exemplo.com.br`;
const token = randomBytes(32).toString('base64url');
await sql(
  "insert into login_tokens (email, token_hash, expires_at) values ($1, $2, now() + interval '15 minutes')",
  [email, createHash('sha256').update(token).digest('hex')],
);
await page.goto(`${BASE}/entrar/verificar?token=${token}`);

// ---------- board ----------
const escolher = async (label, etapa) => {
  const botao = page.getByRole('button', { name: label }).first();
  for (let i = 0; i < 4; i += 1) {
    try {
      await botao.scrollIntoViewIfNeeded({ timeout: 5000 });
      await botao.click({ timeout: 5000 });
      await page.getByText(`Pergunta ${etapa} de 7`).waitFor({ timeout: 4000 });
      return;
    } catch {
      await page.waitForTimeout(1000); // hidratação ainda em curso
    }
  }
  throw new Error(`não consegui avançar para a pergunta ${etapa}`);
};

await page.goto(`${BASE}/onboarding/board`);
await page.getByText('Pergunta 1 de 7').waitFor();
await shot(page, '02-board-pergunta-1');

await escolher(/Tenho uma ideia ou um produto\/serviço/, 2);
await escolher('Fazer as primeiras vendas', 3);
await page.getByLabel('Faturamento mensal alvo (R$)').fill('10000');
await page.getByLabel('Preço médio do que você vende (ou pretende vender)').fill('500');
await page.getByRole('button', { name: '6 meses' }).click();
await shot(page, '03-board-meta');
await page.getByRole('button', { name: 'Continuar' }).click();
await page.getByText('Pergunta 4 de 7').waitFor();
await escolher('Tenho um protótipo ou versão inicial', 5);
await escolher('Nunca vendi por conta própria', 6);
await escolher('Menos de 100', 7);
await page.getByRole('button', { name: '10 a 20 h' }).click();
await page.waitForURL('**/trilha');
await shot(page, '04-trilha');

// ---------- missão com template ----------
await page.goto(`${BASE}/missao/PRE-01`);
await page.getByLabel('As 3 desculpas que eu repito').fill(
  'O mercado está saturado de nutricionista.\nNão tenho tempo de gravar conteúdo.\nMinha internet é ruim para atender online.',
);
await page.getByLabel('O que está sob o meu controle em cada uma').fill(
  'Escolher um nicho (gestantes) em vez de competir com todo mundo.\nBloquear terça e quinta, 7h às 8h30.\nGravar pelo celular, em casa, sem depender de upload pesado.',
);
await page.getByLabel('As 3 ações desta semana, com dia marcado').fill(
  'Segunda: escrever a promessa para gestantes.\nTerça: gravar o primeiro vídeo de 2 min.\nQuinta: falar com 3 clientes antigas.',
);
await page.getByRole('button', { name: 'Salvar resposta' }).click();
await page.getByText('Salvo.').waitFor();
await shot(page, '05-missao-template');
await page.getByRole('button', { name: 'Concluir missão' }).click();
await page.getByRole('button', { name: 'Desfazer conclusão' }).waitFor();

// ---------- missão com contador ----------
await page.goto(`${BASE}/missao/SON-01`);
for (const nota of [
  'Ana, 32, grávida de 6 meses — disse que já gastou R$ 1.200 em consultas avulsas',
  'Júlia, indicada pela Ana — quer cardápio que caiba na rotina do trabalho',
  'Marina, 29 — "o problema não é saber, é não ter com quem falar toda semana"',
]) {
  await page.getByLabel('Quem foi e a frase que ficou').fill(nota);
  await page.getByRole('button', { name: 'Registrar' }).click();
  await page.waitForTimeout(500);
}
await shot(page, '06-missao-contador');

// ---------- missão do tipo lista ----------
await page.goto(`${BASE}/missao/ENG-01`);
const pessoas = [
  ['Ana Paula', 'cliente', 'Já foi minha paciente e virou mãe', 'Mando o guia do 2º trimestre', 'Chamar para um café', '15/09'],
  ['Dra. Helena', 'mentor', 'Nutri há 20 anos, atende gestantes', 'Indico o podcast dela', 'Pedir 30 min de conversa', '17/09'],
  ['Camila (obstetra)', 'parceiro', 'Atende o mesmo público, não concorre', 'Encaminho minhas pacientes', 'Propor indicação mútua', '19/09'],
];
for (const [i, pessoa] of pessoas.entries()) {
  if (i > 0) await page.getByRole('button', { name: 'Adicionar pessoa' }).click();
  const linha = page.getByRole('group', { name: `Linha ${i + 1}` });
  await linha.getByLabel('Nome').fill(pessoa[0]);
  await linha.getByLabel('Tipo').selectOption(pessoa[1]);
  await linha.getByLabel('Por que importa').fill(pessoa[2]);
  await linha.getByLabel('Como eu ajudo primeiro').fill(pessoa[3]);
  await linha.getByLabel('Próximo passo').fill(pessoa[4]);
  await linha.getByLabel('Quando').fill(pessoa[5]);
}
await page.getByRole('button', { name: 'Salvar lista' }).click();
await page.getByText('Salvo.').waitFor();
await shot(page, '07-missao-lista');

// ---------- ferramenta: quadro ----------
await page.goto(`${BASE}/ferramenta/quadro`);
await page.getByRole('button', { name: 'Novo cartão' }).click();
await page.getByLabel('Hipótese').last().fill(
  'Gestantes pagam R$ 500 por um acompanhamento de 8 semanas porque consulta avulsa não dá continuidade',
);
await page.getByLabel('Experimento').last().fill('Oferecer pré-venda para 20 gestantes da minha lista');
await page.getByLabel('Métrica').last().fill('pré-vendas fechadas');
await page.getByLabel('Critério de sucesso').last().fill('3 pré-vendas em 14 dias');
await page.getByRole('button', { name: 'Rodando', exact: true }).last().click();
await page.getByRole('button', { name: 'Salvar quadro' }).click();
await page.getByText('Salvo.').waitFor();
await shot(page, '08-ferramenta-quadro');

// ---------- ferramenta: oferta ----------
await page.goto(`${BASE}/ferramenta/oferta`);
await page.getByLabel('Ajudo…').fill('gestantes de primeira viagem');
await page.getByLabel('a…').fill('comer bem nas 40 semanas sem virar refém de dieta');
await page.getByLabel('sem…').fill('passar fome ou cozinhar duas vezes ao dia');
await page.getByLabel('Benefício emocional 1').fill('Parar de culpar cada refeição');
await page.getByLabel('Benefício emocional 2').fill('Chegar no parto confiante com o próprio corpo');
await page.getByLabel('Benefício emocional 3').fill('Saber que tem alguém acompanhando toda semana');
await page.getByLabel('Benefício prático 1').fill('Cardápio semanal que usa o que já tem em casa');
await page.getByLabel('Benefício prático 2').fill('Encontro de 30 min por semana, por vídeo');
await page.getByLabel('Benefício prático 3').fill('Lista de compras pronta, por trimestre');
await page.getByLabel('Prova', { exact: true }).fill('7 gestantes acompanhadas em 2025; 5 mantiveram o ganho de peso na faixa recomendada');
await page.getByLabel('Garantia').fill('Primeiras 2 semanas: não serviu, devolvo o valor inteiro');
await page.getByLabel('Escassez real').fill('4 vagas por turma — é o que cabe no meu horário de atendimento');
await page.getByLabel('Preço (R$)').fill('500');
await page.getByLabel('Comparação de valor').fill('Menos que 3 consultas avulsas, e são 8 semanas de acompanhamento');

const objecoes = [
  ['Está caro', 'Sim, e por isso dividi em 8 semanas: R$ 62 por semana, menos que um delivery.', 'Comparação com 3 consultas avulsas'],
  ['Não sei se funciona para mim', 'Sim, e é por isso que a garantia cobre as 2 primeiras semanas.', 'Caso da Ana, 32 semanas'],
  ['Vou começar depois do parto', 'Sim, e o ganho de peso da gestação é justamente o que pesa depois.', 'Diretriz de ganho de peso gestacional'],
];
for (const [i, [o, r, prova]] of objecoes.entries()) {
  await page.getByRole('button', { name: 'Adicionar objeção' }).click();
  const bloco = page.getByRole('group', { name: `Objeção ${i + 1}` });
  await bloco.getByPlaceholder('Está caro').fill(o);
  await bloco.getByPlaceholder('Sim, e é por isso que…').fill(r);
  await bloco.getByPlaceholder('Prova que sustenta').fill(prova);
}

const marcar = async (principio, status, como) => {
  const g = page.getByRole('group', { name: principio, exact: true });
  await g.getByRole('button', { name: status }).click();
  if (como) await g.getByPlaceholder('Como isso é verdadeiro no seu caso').fill(como);
};
await marcar('Reciprocidade', 'Aplicado e verdadeiro', 'Guia de lanches do 2º trimestre, gratuito');
await marcar('Autoridade', 'Aplicado e verdadeiro', 'CRN ativo e 7 gestantes acompanhadas');
await marcar('Aprovação social', 'Aplicado e verdadeiro', 'Depoimentos reais, com nome e autorização');
await marcar('Escassez', 'Aplicado e verdadeiro', '4 vagas é o limite real da minha agenda');
await marcar('Unidade', 'Aplicado e verdadeiro', 'Também fui mãe de primeira viagem');
await page.getByRole('button', { name: 'Finalizar oferta' }).click();
await page.getByText('Salvo.').waitFor();
await shot(page, '09-ferramenta-oferta');

// ---------- ritual ----------
await page.goto(`${BASE}/ritual`);
await page.getByLabel('Vitória 1').fill('Fechei a primeira pré-venda: R$ 500');
await page.getByLabel('Vitória 2').fill('Gravei os 3 vídeos da semana');
await page.getByLabel('Vitória 3').fill('Falei com 6 gestantes, 3 pediram para avisar quando abrir');
await page.getByLabel('Onde eu fugi da responsabilidade').fill(
  'Adiei o convite para a lista duas vezes porque "o material não estava pronto".',
);
await page.getByLabel('Contatos', { exact: true }).fill('34');
await page.getByLabel('Conversas', { exact: true }).fill('11');
await page.getByLabel('Propostas', { exact: true }).fill('4');
await page.getByLabel('Vendas', { exact: true }).fill('1');
await page.getByLabel('Receita (R$)').fill('500');
await page.getByLabel('Número da semana').fill('1');
await page.getByLabel('O que eu aprendi').fill(
  'Quem já me conhece compra; quem nunca me viu quer ver o método antes. A prova pesa mais que o preço.',
);
await page.getByLabel('Prioridade 1').fill('Convidar as 30 da lista para a turma de 4 vagas');
await page.getByLabel('Prioridade 2').fill('Fechar o cardápio do 2º trimestre');
await page.getByLabel('Prioridade 3').fill('Pedir depoimento em vídeo para a Ana');
await page.getByRole('button', { name: 'Fechar a revisão' }).click();
await page.getByText(/Revisão salva/).waitFor();
await shot(page, '10-ritual-revisao-semanal');

// ---------- hoje ----------
await page.goto(`${BASE}/hoje`);
await shot(page, '11-hoje');
await context.close();

// ---------- celular (360 px) ----------
const mobile = await browser.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 });
const cel = await mobile.newPage();
const tokenCel = randomBytes(32).toString('base64url');
await sql(
  "insert into login_tokens (email, token_hash, expires_at) values ($1, $2, now() + interval '15 minutes')",
  [email, createHash('sha256').update(tokenCel).digest('hex')],
);
await cel.goto(`${BASE}/entrar/verificar?token=${tokenCel}`);
await cel.goto(`${BASE}/hoje`);
await shot(cel, '12-celular-hoje');
await cel.goto(`${BASE}/trilha`);
await shot(cel, '13-celular-trilha');
await mobile.close();

await browser.close();
console.info('capturas prontas');
