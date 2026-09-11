'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Rótulo + dica + erro, o arranjo repetido em todos os formulários.
 * Quando o conteúdo é um único controle, o `id` é gerado e associado ao rótulo
 * automaticamente; quando é um grupo (botões de escolha), vira um grupo rotulado.
 */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const generatedId = React.useId();
  const id = htmlFor ?? generatedId;

  const single = React.isValidElement<{ id?: string }>(children);
  const content = single
    ? React.cloneElement(children as React.ReactElement<{ id?: string }>, {
        id: (children as React.ReactElement<{ id?: string }>).props.id ?? id,
      })
    : children;
  const controlId = single
    ? ((children as React.ReactElement<{ id?: string }>).props.id ?? id)
    : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {controlId ? (
        <label htmlFor={controlId} className="text-sm font-medium">
          {label}
        </label>
      ) : (
        <span className="text-sm font-medium">{label}</span>
      )}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {controlId ? (
        content
      ) : (
        <div role="group" aria-label={label}>
          {content}
        </div>
      )}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
