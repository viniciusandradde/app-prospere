'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Elementos nativos que aceitam rótulo. */
const CONTROLES = new Set(['input', 'textarea', 'select']);

/**
 * Um controle é um elemento nativo rotulável ou um componente nosso (Input, Textarea), que
 * repassa `id` ao controle interno. `forwardRef` produz um objeto como `type`, não uma função —
 * por isso a checagem é "não é tag nativa de layout", e não "é função".
 */
function ehControle(child: React.ReactNode): child is React.ReactElement<{ id?: string }> {
  if (!React.isValidElement(child)) return false;
  return typeof child.type === 'string' ? CONTROLES.has(child.type) : true;
}

/**
 * Rótulo + dica + erro, o arranjo repetido em todos os formulários.
 *
 * - Filho único que é um controle: o `id` é gerado e associado ao rótulo automaticamente.
 * - `htmlFor` explícito: quem chama garante o id — usado quando o controle vem dentro de um
 *   arranjo (campo + botão, por exemplo). Nada é injetado, para não duplicar o id.
 * - Qualquer outro conteúdo (um grupo de botões): vira um grupo rotulado, sem `<label>` solto.
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
  const controle = ehControle(children) ? children : null;

  const injetarId = !htmlFor && controle !== null;
  const controlId = htmlFor ?? (controle ? (controle.props.id ?? generatedId) : undefined);
  const content = injetarId
    ? React.cloneElement(controle, { id: controle.props.id ?? generatedId })
    : children;

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
      {controlId ? content : <div role="group" aria-label={label}>{content}</div>}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
