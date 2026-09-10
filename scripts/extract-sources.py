#!/usr/bin/env python3
"""Extrai os materiais do PROSPERE para texto puro em `sources/` (pasta gitignored).

Uso: python3 scripts/extract-sources.py <pasta_origem> <pasta_destino>

Os arquivos ".pdf" do bundle não são PDFs reais: os livros são texto puro e os e-books são
ZIPs com um .txt por página (+ imagem + manifest.json). O script trata os dois casos e
remove as linhas "Licensed to ..." (dados pessoais do comprador). PDFs reais, se houver,
são convertidos com `pdftotext` (poppler-utils), se disponível.
"""
import re, sys, zipfile, shutil, subprocess, unicodedata
from pathlib import Path

LICENSE_RE = re.compile(r'Licensed to.*?(\r?\n|$)')

def slug(stem: str) -> str:
    s = unicodedata.normalize('NFKD', stem).encode('ascii', 'ignore').decode()
    return re.sub(r'[^A-Za-z0-9]+', '_', s).strip('_')[:60]

def from_zip(path: Path) -> str:
    z = zipfile.ZipFile(path)
    pages = sorted((n for n in z.namelist() if n.endswith('.txt')), key=lambda n: int(Path(n).stem))
    parts = []
    for n in pages:
        t = LICENSE_RE.sub('', z.read(n).decode('utf-8', errors='ignore'))
        t = re.sub(r'[ \t]+', ' ', t)
        t = re.sub(r'\r?\n\s*\r?\n+', '\n', t)
        parts.append(f'[p{Path(n).stem}] ' + t.strip())
    return '\n'.join(parts)

def from_pdf(path: Path) -> str:
    if shutil.which('pdftotext'):
        out = subprocess.run(['pdftotext', '-layout', str(path), '-'], capture_output=True, text=True)
        return LICENSE_RE.sub('', out.stdout)
    raise RuntimeError('pdftotext não encontrado; instale poppler-utils')

def main(src: Path, dst: Path) -> None:
    dst.mkdir(parents=True, exist_ok=True)
    for f in sorted(src.iterdir()):
        if not f.is_file():
            continue
        head = f.read_bytes()[:8]
        if head.startswith(b'PK'):
            text = from_zip(f)
        elif head.startswith(b'%PDF'):
            text = from_pdf(f)
        else:
            text = LICENSE_RE.sub('', f.read_bytes().decode('utf-8', errors='ignore'))
        out = dst / f'{slug(f.stem)}.txt'
        out.write_text(text, encoding='utf-8')
        print(f'{out.name:60} {len(text.split()):>8} palavras')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__); sys.exit(1)
    main(Path(sys.argv[1]), Path(sys.argv[2]))
