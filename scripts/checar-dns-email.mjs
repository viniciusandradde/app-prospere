#!/usr/bin/env node
/**
 * Confere se os registros DNS que a Resend exige já estão no ar para o domínio do remetente.
 * Não substitui o painel da Resend — mostra o que o mundo enxerga agora.
 *
 * Uso: node scripts/checar-dns-email.mjs [dominio]
 */
import { Resolver } from 'node:dns/promises';

const dominio = process.argv[2] ?? 'prospere.vsatecnologia.com.br';
const resolver = new Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);

const achatar = (registros) =>
  registros.map((r) => (Array.isArray(r) ? r.join('') : String(r?.exchange ?? r))).join(' | ');

const checagens = [
  {
    nome: `send.${dominio}`,
    tipo: 'MX',
    descricao: 'MX de retorno (bounces)',
    valido: (v) => v.includes('amazonses.com'),
  },
  {
    nome: `send.${dominio}`,
    tipo: 'TXT',
    descricao: 'SPF',
    valido: (v) => v.includes('spf1') && v.includes('amazonses.com'),
  },
  {
    nome: `resend._domainkey.${dominio}`,
    tipo: 'TXT',
    descricao: 'DKIM',
    valido: (v) => v.includes('p='),
  },
  {
    nome: `_dmarc.${dominio}`,
    tipo: 'TXT',
    descricao: 'DMARC (opcional, recomendado)',
    valido: (v) => v.includes('DMARC1'),
    opcional: true,
  },
];

let faltando = 0;

for (const { nome, tipo, descricao, valido, opcional } of checagens) {
  let valor = '';
  try {
    valor = achatar(await resolver.resolve(nome, tipo));
  } catch (erro) {
    valor = `ausente (${erro.code})`;
  }

  const ok = valido(valor);
  if (!ok && !opcional) faltando += 1;
  const marca = ok ? 'ok    ' : opcional ? 'aviso ' : 'FALTA ';
  console.info(`${marca} ${tipo.padEnd(3)} ${nome}`);
  console.info(`       ${descricao}: ${valor.slice(0, 120)}`);
}

if (faltando > 0) {
  console.error(
    `\n${faltando} registro(s) obrigatório(s) ausente(s). Copie os valores do painel da Resend ` +
      `(Domains → ${dominio}) para o DNS. Propagação costuma levar minutos.`,
  );
  process.exit(1);
}

console.info('\nTodos os registros obrigatórios estão no ar. Verifique o domínio no painel da Resend.');
