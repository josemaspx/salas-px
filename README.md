# Salas PX · mapa interativo

Mapa responsivo das salas de reunião do escritório, construído sobre a planta original.

O arquivo `logo-px-oficial.svg` é o vetor canônico versionado no Cerebro, exportado do Figma validado da marca. Não deve ser redesenhado nem substituído por texto.

## Como abrir

Abra `index.html` no navegador. Para testar com um servidor local:

```powershell
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Como editar salas e referências

Todas as salas ficam no início de `app.js`, dentro da lista `rooms`. Cada item contém:

- `name`: nome exibido;
- `zone`: espaço de referência;
- `box`: posição clicável na imagem, no formato `[x, y, largura, altura]`;
- `description`: explicação curta;
- `reference`: orientação mostrada no destaque.

O projeto não depende de framework nem de instalação.

## Site publicado

O mapa fica disponível em:

```text
https://josemaspx.github.io/salas-px/
```

Cada push na branch `main` executa o workflow `.github/workflows/deploy-pages.yml` e atualiza automaticamente o GitHub Pages.
O workflow adiciona o SHA do commit às URLs do CSS e JavaScript para impedir que o navegador reutilize uma versão antiga após o deploy.

> O GitHub Pages é público. Qualquer pessoa que conheça o endereço pode abrir o mapa.
