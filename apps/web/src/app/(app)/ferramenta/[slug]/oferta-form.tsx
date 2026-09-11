'use client';

import { useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import {
  PRINCIPIO_HINTS,
  PRINCIPIO_LABELS,
  PRINCIPIO_STATUS,
  PRINCIPIO_STATUS_LABELS,
  PRINCIPIOS,
  promessa,
  type Oferta,
} from '@prospere/content';
import { saveArtifactAction, type SaveArtifactState } from '@/actions/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function OfertaForm({ initial }: { initial: Oferta }) {
  const [state, setState] = useState<SaveArtifactState | null>(null);
  const [pending, startTransition] = useTransition();
  const { register, control, handleSubmit, watch, setValue } = useForm<Oferta>({
    defaultValues: initial,
  });

  const objecoes = useFieldArray({ control, name: 'objecoes' });
  const checklist = watch('checklist');
  const atual = watch();

  const submit = (status: 'draft' | 'final') =>
    handleSubmit((values) => {
      startTransition(async () => {
        setState(await saveArtifactAction('T-PER-01', { ...values, status }));
      });
    });

  const issueFor = (path: string) =>
    state?.issues?.find((issue) => issue.path === path || issue.path.startsWith(`${path}.`))?.message;

  return (
    <form className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>A promessa</CardTitle>
          <p className="text-sm text-muted-foreground">{promessa(atual)}</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Ajudo…" {...(issueFor('cliente') ? { error: issueFor('cliente') } : {})}>
            <Input {...register('cliente')} placeholder="nutricionistas autônomas" />
          </Field>
          <Field label="a…">
            <Input {...register('resultado')} placeholder="fechar 10 clientes por mês" />
          </Field>
          <Field label="sem…">
            <Input {...register('obstaculo')} placeholder="depender de indicação" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benefícios</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">O que muda para a pessoa</p>
            {[0, 1, 2].map((index) => (
              <Input
                key={index}
                aria-label={`Benefício emocional ${index + 1}`}
                {...register(`beneficios_emocionais.${index}` as const)}
                placeholder={`Benefício emocional ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">O que ela recebe</p>
            {[0, 1, 2].map((index) => (
              <Input
                key={index}
                aria-label={`Benefício prático ${index + 1}`}
                {...register(`beneficios_praticos.${index}` as const)}
                placeholder={`Benefício prático ${index + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prova, garantia e preço</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Prova" hint="Depoimento, caso ou número — real e verificável.">
            <Textarea {...register('prova')} rows={2} />
          </Field>
          <Field label="Garantia">
            <Input {...register('garantia')} placeholder="7 dias para pedir reembolso" />
          </Field>
          <Field
            label="Escassez real"
            hint='Vagas, prazo ou bônus que existem de fato. Se não houver, escreva "nenhuma".'
          >
            <Input {...register('escassez_real')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Preço (R$)" {...(issueFor('preco') ? { error: issueFor('preco') } : {})}>
              <Input type="number" min={0} step="0.01" {...register('preco', { valueAsNumber: true })} />
            </Field>
            <Field label="Comparação de valor" hint="Com o que o preço se compara na vida do cliente?">
              <Input {...register('comparacao_de_valor')} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objeções</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pelo menos 3 para finalizar. Responda no formato &quot;sim, e…&quot;.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {objecoes.fields.map((field, index) => (
            <div
              key={field.id}
              role="group"
              aria-label={`Objeção ${index + 1}`}
              className="flex flex-col gap-3 rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Objeção {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover objeção ${index + 1}`}
                  onClick={() => objecoes.remove(index)}
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
              <Input {...register(`objecoes.${index}.objecao` as const)} placeholder="Está caro" />
              <Textarea
                {...register(`objecoes.${index}.resposta` as const)}
                rows={2}
                placeholder="Sim, e é por isso que…"
              />
              <Input {...register(`objecoes.${index}.prova` as const)} placeholder="Prova que sustenta" />
            </div>
          ))}
          {issueFor('objecoes') ? (
            <p role="alert" className="text-sm text-destructive">
              {issueFor('objecoes')}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={() => objecoes.append({ objecao: '', resposta: '', prova: '' })}
          >
            <Plus aria-hidden /> Adicionar objeção
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auditoria ética dos 7 princípios</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gatilho marcado como artificial impede finalizar a oferta. Escassez falsa e prova
            inventada destroem o ativo mais caro: confiança.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {PRINCIPIOS.map((principio, index) => {
            const item = checklist?.[index];
            return (
              <div
                key={principio}
                role="group"
                aria-label={PRINCIPIO_LABELS[principio]}
                className="flex flex-col gap-2 rounded-lg border border-border p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{PRINCIPIO_LABELS[principio]}</span>
                  <span className="text-xs text-muted-foreground">{PRINCIPIO_HINTS[principio]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRINCIPIO_STATUS.map((status) => (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={item?.status === status ? 'default' : 'outline'}
                      onClick={() => setValue(`checklist.${index}.status`, status)}
                    >
                      {PRINCIPIO_STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
                <Input
                  {...register(`checklist.${index}.como` as const)}
                  placeholder="Como isso é verdadeiro no seu caso"
                />
              </div>
            );
          })}
          {issueFor('checklist') ? (
            <p role="alert" className="text-sm text-destructive">
              {issueFor('checklist')}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={submit('draft')} disabled={pending}>
          Salvar rascunho
        </Button>
        <Button type="button" onClick={submit('final')} disabled={pending}>
          Finalizar oferta
        </Button>
        {state?.status === 'ok' ? <span className="text-sm text-muted-foreground">Salvo.</span> : null}
        {state?.status === 'error' ? (
          <span role="alert" className="text-sm text-destructive">
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
