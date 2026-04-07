# Prompts de Operacao com o Agente (Byla)

Use este arquivo como seu ponto unico de copy/paste para trabalhar comigo com maxima eficiencia.

## 1) Abertura do dia (arranque rapido)

```txt
Hoje vou executar em blocos curtos.
Prioridade #1: [resultado]
Prioridade #2: [resultado]
Prioridade #3: [resultado]

Regras:
- uma tarefa por vez
- implementar ponta a ponta
- rodar validacoes (test/lint/build)
- reportar evidencias
- nao commitar sem eu pedir

Comece pela Prioridade #1.
```

## 2) Prompt padrao por tarefa

```txt
Tarefa: [nome curto]

Objetivo:
[resultado final esperado]

Escopo permitido:
- [pastas/arquivos que pode mexer]
Escopo proibido:
- [o que NAO pode tocar]

Contratos que devem permanecer:
- [endpoint, tipo, payload, regra]

Criterios de pronto:
1. [comportamento funcional]
2. [caso de borda]
3. [testes/lint/build ok]
4. [sem regressao em X]

Execute tudo e me entregue:
- mudancas feitas
- validacoes executadas + resultado
- riscos pendentes
- sugestao de proximo passo
```

## 3) Prompt de diagnostico (quando quebrar)

```txt
Entrar em modo diagnostico.

Problema observado:
[erro/sintoma]

Quero:
1) hipotese raiz
2) reproducao curta
3) correcao minima segura
4) validacao com evidencia

Nao quero refatoracao ampla agora.
```

## 4) Prompt de fechamento da tarefa

```txt
Feche a tarefa com:
- resumo tecnico em 5 bullets
- arquivos alterados
- evidencias de validacao
- mensagem de commit sugerida
- 2 proximos passos recomendados
```

## 5) Checklist diario (30 segundos)

- Objetivo da tarefa esta mensuravel?
- Escopo esta limitado?
- Criterio de pronto inclui validacao?
- Foi pedido evidencia, nao so "feito"?
- Proxima acao ja ficou definida?

## 6) Versao ultra-curta (copiar e colar)

```txt
Objetivo: [resultado]
Escopo: [arquivos permitidos] | Restricoes: [nao mexer em X]
Pronto quando: [criterios]
Execute ponta a ponta, rode validacoes e reporte evidencias + riscos.
```
