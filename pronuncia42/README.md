# English in Real Life · Laboratório de pronúncia 4.2

Módulo independente para os primeiros cinco alvos. Abra `index.html` em um navegador ou sirva a pasta como página estática. Para testar sem internet, selecione **EUA · voz sintética offline**. O controle de velocidade preserva o relógio da mídia. Use **Fixar posição** para estudar o desenho e o controle deslizante para examinar a transição manualmente.

## Auditoria da plataforma

Inspeção do site Render publicado em Chrome e do `index.html` em `main` no GitHub, blob `a0f0e492b49535a698eaef612081362057f2894a`.

| Área | Evidência observada | Decisão aplicada no módulo |
| --- | --- | --- |
| Entrada e progressão | A página começa em A0–A2. A Masterclass oferece busca no atlas, escolha de variedade e prática de palavra, contraste e frase. | Mantive a progressão de percepção e produção. Os cinco alvos ficam acessíveis por botões logo após o título. |
| Repetição na lição | O site publicado mostrou Laboratório 3.0, Articulação 4.0 e Mapa 4.1, com duas atividades de percepção semelhantes em /ɪ/. O código consultado no GitHub também chama `refine42()`. | Concentrei as duas vistas, o modelo e o teste auditivo no mesmo percurso. O conteúdo observado em produção difere do código consultado. A revisão exata em execução ficou sem confirmação. |
| Sotaque do áudio | A função `speak()` busca a voz do locale e depois aceita outra voz em inglês. O rótulo do seletor indica o idioma do reconhecimento. | O áudio principal usa gravações hospedadas pela Macquarie. O fallback offline é identificado como síntese americana. Cambridge oferece escuta externa UK/US. |
| Sincronia e anatomia | O mapa 4.1 destaca regiões com um marcador, enquanto a lição apresenta instruções orais separadas. | Vistas frontal e lateral compartilham a fase sonora. O desenho diferencia deslocamento da mandíbula, lábios, zonas da língua, aproximação dental, fluxo oral e presença de voz. |
| Feedback e permissões | O produto avisa que a transcrição representa reconhecimento de palavras. O avanço padrão da prática pede tentativa com feedback, com saídas manuais em cenários de erro. | O módulo funciona sem microfone. O quiz corrige a identificação do áudio. A avaliação da produção pode continuar no treino existente, com o mesmo limite de interpretação da transcrição. |
| Referência externa | O site oferece buscas de vídeos e uma playlist. | O módulo aponta para quatro vídeos específicos da BBC, gravações australianas e demonstrações do quadro IPA da University of Glasgow. |

## Plano das cinco lições

| Alvo | Contraste | Foco de observação | Exercício corretivo |
| --- | --- | --- | --- |
| /θ/ | think × sink | Aproximação dos incisivos e ar contínuo sem vozeamento | Avançar a ponta após /s/ e manter passagem de ar após uma substituição por /t/. |
| /ð/ | these × D’s | Região dental semelhante à de /θ/, com vozeamento | Alternar /θ/ e /ð/ com uma mão na garganta e passar de these à frase. |
| /ɪ/ | hid × heed | Corpo da língua ligeiramente mais baixo e recuado que no fim de FLEECE | Alternar as posições. Produzir /d/ final sem vogal de apoio. |
| /iː/ | heed × hid | Língua alta e anterior, com possibilidade de movimento inicial na Austrália | Comparar qualidade e duração. Transferir a posição para seat. |
| /æ/ | had × head | Mandíbula mais aberta, língua baixa e anterior | Abrir a partir do É de “pé” e monitorar a posição anterior. |

**Uso inicial.** Escute o modelo e congele a posição. Compare os pares, faça seis sorteios e experimente a frase. Como referência prática, cinco acertos em seis dão margem para seguir adiante no mesmo dia. Esse critério serve para organizar o treino da atividade. Um resultado com uma só voz e um só par tem alcance limitado.

**Uso avançado.** Depois do ajuste, compare amostras humanas de mais de uma variedade e pratique em fala corrida. Na expansão, use várias gravações por categoria e exemplos em contextos diferentes. Isso ajuda a verificar se o aluno aprendeu o contraste além daquele par e daquela voz. Para /θ/ e /ð/, distribua alvos no início, no meio e no fim de palavra, com contraexemplos selecionados para brasileiros. Preserve a numeração de 48 **alvos** e mantenha a distinção entre fonemas e padrões como [ɾ], [ʔ], [ɫ] e linking R.

## Contrato de integração

- Página estática em `pronuncia42/index.html`, com scripts e áudio offline incorporados. O ZIP de integração também contém a versão com `lab.js` e `media.js` separados.
- Comece com um link na Masterclass ou com inclusão isolada na rota de testes. Para incorporação no cartão, associe os cinco sons do atlas por IPA. As âncoras atuais do catálogo usam *thin, then, ship, sheep, bad*. As âncoras da gravação australiana usam *think, these, hid, heed, had*.
- Mantenha o conteúdo A0–A2, os dados de progresso `coach_free_done_v1` e as práticas por etapa do atlas. Antes da integração, confirme a revisão usada pelo Render e valide o caminho selecionado no Android e no iOS.
- Cada entrada de mídia contém o URL ou dados MP3, a duração e o intervalo `cue` em segundos. A faixa selecionada das gravações australianas tem `limit` para concentrar a demonstração no começo do arquivo. A amostra completa continua acessível no módulo. O desenho lê `HTMLMediaElement.currentTime`, inclusive ao desacelerar, e as duas vistas usam a mesma fase.
- Os WAV australianos são reproduzidos a partir do domínio da universidade. Os arquivos anexos contêm URLs, em vez dos WAV de terceiros. Os MP3 sintéticos foram gerados localmente com a voz CMU US SLT do Flite. Os pares das consoantes e as frases usam essa voz. As gravações UK/US da Cambridge ficam nos links.
- Para os próximos alvos, mantenha a ficha com realização de referência por variedade, posição, erro provável, contraste, frase, origem de áudio, intervalo temporal e revisão. Parametrize por som antes de ampliar a lista. Africadas, ditongos e pausas glotais exigirão múltiplas fases internas; uma única posição não basta.

## Validação e limites

- Consultei duas linhas de evidência para os alvos: a descrição australiana e os exemplos da Macquarie, além do quadro articulatório da Glasgow e da literatura sobre o aprendizado por brasileiros. O movimento de /iː/ representa uma trajetória possível no inglês australiano. As três cores distinguem zonas didáticas de uma única língua contínua.
- Os tempos australianos são aproximações marcadas por forma de onda e distribuição espectral. Os tempos da síntese usam sua segmentação interna. O desenho ilustra o alvo e a aproximação; ele não reconstrói a fala do locutor quadro a quadro. As setas indicam fluxo oral esquemático e o anel indica a região de aproximação dental.
- Seis WAV de referência foram obtidos diretamente da Macquarie e examinados localmente. Treze MP3 passaram por decodificação FFmpeg. Dez combinações de som e voz passaram por testes de lógica com relógio de áudio simulado, incluindo alteração de vista, velocidade, quiz, erro, fim e troca de som. A execução local do Chromium foi bloqueada no arranque do processo pelo ambiente. Reprodução real do módulo, qualidade perceptiva da síntese e comportamento em Chrome Android/Safari iOS seguem sem validação de ponta a ponta.
- Antes da publicação e da expansão, faça uma escuta com falantes australianos de diferentes vozes e uma revisão com especialista em fonética articulatória. Em seguida, observe brasileiros de níveis diferentes executando a sequência em tela pequena. O teste de produção precisa de fala real, sem depender da transcrição automática como medida de fonema.

## Referências identificadas

- Felicity Cox, *Australian English Pronunciation and Transcription*, capítulo 2. [Macquarie University](https://www.mq.edu.au/faculty-of-medicine-health-and-human-sciences/departments-and-schools/department-of-linguistics/our-research/phonetics-and-phonology/speech/australian-english-pronunciation-and-transcription/chapter-2-vowels)
- Macquarie University, *Phonemic (broad) transcription of Australian English*. [Tabela e áudios](https://www.mq.edu.au/faculty-of-medicine-health-and-human-sciences/departments-and-schools/department-of-linguistics/our-research/phonetics-and-phonology/speech/phonetics-and-phonology/transcription/phonemic-broad-transcription-of-australian-english)
- Lawson, Stuart-Smith, Scobbie e Nakai, *Seeing Speech*. [University of Glasgow](https://www.seeingspeech.ac.uk/speechstar/ipa-charts/)
- *Phonological and Lexical Conditioning of TRAP Vowel Duration in Australian English*. [Journal of the International Phonetic Association](https://doi.org/10.1017/S0025100325000064)
- *The Influence of Metalinguistic Knowledge of Segmental Phonology on the Production of English Vowels By Brazilian Undergraduate Students*. [Ilha do Desterro](https://doi.org/10.5007/2175-8026.2017v70n3p117)
- *The perception and production of English interdental fricatives by Brazilian EFL learners*. [UFSC](https://repositorio.ufsc.br/handle/123456789/89154)
- Dutra e Pedro, *A produção das fricativas interdentais na fala de brasileiros aprendizes do inglês*. [Horizontes de Linguística Aplicada](https://periodicos.unb.br/index.php/horizontesla/article/download/1120/970)
