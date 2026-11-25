# English in Real Life

Plataforma estática de inglês e pronúncia. A trilha A0–A2 abre por padrão. Use **Pronunciation Masterclass** para acessar o laboratório.

## Demonstração local

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Abra <http://localhost:8765>, selecione **Pronunciation Masterclass** e procure `thin`, `then`, `ship`, `sheep` ou `bad`. Use **Reproduzir**, mude a velocidade, pause e marque **Repetir**. Para testar a escuta nesses cinco alvos com os modelos incluídos, selecione o sotaque americano. O microfone funciona em localhost ou HTTPS com permissão do navegador. O áudio gravado pelo laboratório é descartado quando você troca de alvo ou sai da página. Já o reconhecimento de palavras usa o serviço do navegador, cuja disponibilidade e tratamento de áudio podem depender do fornecedor.

## Como adicionar conteúdo pedagógico

- `pronunciation/content.mjs` contém o catálogo e as orientações em português. A interface recebe os campos `reference`, `cue`, `correction` e `detail` por identificador IPA. Materiais revisados do ChatGPT Work podem preencher esses campos sem alterar a reprodução ou o progresso. Preserve os índices dos 48 alvos existentes, usados por `coach_free_done_v1`.
- `pronunciation/motion.mjs` define a posição de referência e os pontos da linha do tempo de cada alvo. Cada posição controla ponta, corpo e dorso da língua, mandíbula, arredondamento e fechamento dos lábios e abertura da glote. A abertura e os movimentos são esquemáticos.
- `pronunciation/view.mjs` interpola os pontos e desenha as duas perspectivas com a mesma posição. Para adicionar áudio sincronizado, coloque o arquivo em `pronunciation/audio/` e registre o nome e os tempos em segundos no perfil. Use tempos de segmentação revisados para a gravação escolhida. A reprodução usa a posição real do áudio como relógio.
- Os clipes locais usam a voz americana sintética SLT do Flite. Os 37 modelos animados usam os limites de segmentos exportados pelo Flite, com transições esquemáticas. Nos outros 11 alvos, a amostra do Flite diverge do perfil ensinado ou sua variante fonética não pode ser confirmada só pela segmentação. Esses alvos usam animação visual e escuta separada. Os exemplos de sotaques australiano e britânico dependem da síntese do dispositivo.
- `beginner.js` preserva os dados e a chave `erl-beginner`. `indexold.html` mantém o endereço legado.


Para regenerar os clipes e os tempos, execute `python3 tools/generate-models.py` com Flite SLT e FFmpeg com `libmp3lame` instalados. O manifesto em `tools/aligned-models.json` identifica a palavra e o segmento esperado por alvo. Revise o som e a articulação antes de adicionar um modelo. O gerador verifica o rótulo do segmento, que por si só não confirma variantes acústicas ou alofônicas.

## Verificação

```sh
node --test tests/motion.test.mjs
```

Para rodar a suíte de navegador, mantenha o servidor local ativo e execute o Chromium com um perfil isolado. O navegador executa o capturador de áudio real com um dispositivo virtual para tornar a execução reproduzível.

```sh
chromium --headless --remote-debugging-port=9223 --user-data-dir=/tmp/erl-test-profile \
  --use-fake-device-for-media-stream --use-fake-ui-for-media-stream about:blank
# Em outro terminal, com Node.js 22 ou mais recente
node tests/browser.mjs
```

A suíte cobre larguras de 320, 390, 768 e 1280 px, avanço, progresso das duas trilhas, carregamento do logotipo, reprodução completa dos 37 modelos e movimento em ambas as vistas, pausa, câmera lenta, repetição, teste auditivo local, gravação e reprodução. Os retornos do reconhecimento são injetados para reproduzir condições de corrida e validar a regra do modo estrito. Qualidade da pronúncia, microfone físico e o serviço externo de reconhecimento exigem validação própria.

## Revisão da base e publicação

A base 4.2 gerava o laboratório quatro vezes por alvo, oferecia exercícios de escuta repetidos e podia aceitar callbacks de fala após mudar de lição. A refatoração consolida o laboratório, mantém a gravação durante as etapas do mesmo alvo, limpa recursos ao trocar de alvo e atualiza a regra de avanço quando o modo muda. O laboratório reaproveita o catálogo existente e carrega cada clipe sob demanda. A navegação expõe o curso e o alvo ativos, mantém foco visível e os estados de gravação e escuta são anunciados pelo leitor de tela.

Em 24/11/2026, o Render informava `autoDeploy: yes`, disparo por commit, branch `main`, comando `echo 'Static site ready'` e publicação de `.`. O deploy ativo era o commit `b074fb6` (4.1) e a `main` já tinha `f0c9b9d` (4.2). O histórico de eventos mostrava builds bem-sucedidos iniciados manualmente depois do primeiro deploy, sem registro de tentativa ou commit ignorado para `f0c9b9d`.

Às 16:16 UTC, um novo deploy manual publicou `f0c9b9d`. Isso atualizou o site, mas o histórico continuou sem um disparo automático. O GitHub retornou HTTP 403 para a leitura de webhooks com a credencial desta sessão, então a entrega de eventos ao Render permanece sem verificação.

A documentação do Render informa que um serviço criado por URL pública faz deploy manual e que o deploy automático exige um provedor Git conectado. A origem cadastrada aparece como URL nos dados disponíveis, que não identificam o tipo de conexão. A verificação seguinte no painel é confirmar se o serviço está ligado ao GitHub como provedor e se a instalação do Render recebe eventos deste repositório. A validação da correção precisa observar um deploy automático originado por um commit de produção aprovado. [Documentação do Render](https://render.com/docs/deploys#automatic-deploys)

Em 25/11/2026, o HTML servido em produção ainda correspondia byte a byte a `f0c9b9d`. A `main` já estava em `26b5adb`, com a identidade visual aprovada. A branch do laboratório incorporou essa identidade e a suíte de navegador verifica o logotipo e o favicon junto com a reprodução.
