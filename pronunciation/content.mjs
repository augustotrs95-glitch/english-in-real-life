// The catalog order is the index stored by coach_free_done_v1. Keep it stable.
const raw = [
['/ɪ/','I relaxado','ship','sheep','My shift starts at three.','Língua alta, ligeiramente relaxada; não pronuncie como o I longo.'],
['/iː/','I longo','sheep','ship','Please leave the green tray here.','Língua alta e frontal, vogal tensa; contraste com ship.'],
['/e/','É de bed','bed','bad','There are ten boxes left.','Língua anterior, altura média; não abra tanto quanto /æ/.'],
['/æ/','A aberto','bad','bed','Can you give me a hand?','Abra mais a mandíbula e mantenha a língua à frente.'],
['/ɑː/','A longo','car','cup','The car is parked outside.','Vogal baixa e posterior; no modelo australiano não force R final.'],
['/ɒ/','Ó curto','hot','law','This box is not on the pallet.','Lábios arredondados e vogal curta; característica de muitas variedades australianas.'],
['/ɔː/','Ó longo','law','hot','We walk to work sometimes.','Lábios arredondados, vogal mais sustentada.'],
['/ʊ/','U relaxado','full','fool','Have a look at this plant.','Língua alta posterior, mas relaxada.'],
['/uː/','U longo','fool','full','The blue boxes are in the next room.','Vogal alta posterior e sustentada; compare full e fool.'],
['/ʌ/','Â de cup','cup','car','I got lucky with my new job.','Mandíbula moderadamente aberta; não nasalize como o ã português.'],
['/ɜː/','Vogal de nurse','work','about','I work in a warehouse.','Língua central; no australiano work não tem R consonantal.'],
['/ə/','Schwa','about','work','I need to check the plants.','Vogal central muito breve, em sílaba sem destaque.'],
['/eɪ/','Ditongo de day','day','bed','I take the train every day.','Deslize de uma vogal média anterior para posição mais alta.'],
['/aɪ/','Ditongo de time','time','Tim','What time does your shift finish?','Comece aberto e deslize para /ɪ/.'],
['/ɔɪ/','Ditongo de boy','boy','buy','I really enjoy dancing.','Comece arredondado e deslize para a frente.'],
['/aʊ/','Ditongo de now','now','no','I am heading out now.','Comece aberto e arredonde os lábios ao terminar.'],
['/əʊ/','Ditongo de go','go','got','I usually go home after work.','Em inglês australiano o ditongo pode soar /əʉ/.'],
['/ɪə/','Ditongo de near','near','knee','Come over here for a second.','Deslize de posição alta frontal ao centro; sem R final forçado.'],
['/eə/','Ditongo de hair','hair','head','Can you leave it over there?','Comece anterior média e deslize para o centro.'],
['/ʊə/','Ditongo de tour','tour','law','We are taking a tour of the nursery.','Varia muito entre sotaques; muitos falantes fundem esse ditongo.'],
['/p/','P sem voz','pack','back','Please pack these plants.','Feche os lábios e solte ar sem voz.'],
['/b/','B com voz','back','pack','Put the bags in the box.','Feche os lábios e solte com vibração da voz.'],
['/t/','T de tea','tea','day','Take the tray to the table.','Toque a crista atrás dos dentes e solte o ar.'],
['/d/','D de day','day','tea','Do you need these seeds?','Mesmo ponto do T, mas com voz.'],
['/k/','K de key','coat','goat','Could you check the stock?','Parte de trás da língua toca o palato mole, sem voz.'],
['/g/','G de go','goat','coat','Go through the garden gate.','Parte posterior da língua toca o palato mole, com voz.'],
['/f/','F sem voz','fan','van','My shift finishes at five.','Dentes superiores encostam no lábio inferior; ar contínuo.'],
['/v/','V com voz','van','fan','We have five boxes to move.','Mesma posição do F, com vibração.'],
['/θ/','TH sem voz','thin','tin','I think there are three trays.','Ponta da língua perto dos dentes; sopre sem voz.'],
['/ð/','TH com voz','then','den','These are the ones I need.','Língua perto dos dentes e vibração da voz.'],
['/s/','S sem voz','sip','zip','These plants need more space.','Ar passa por um canal estreito, sem vibração.'],
['/z/','Z com voz','zip','sip','Please move those bags.','Como S, mas com voz.'],
['/ʃ/','SH de shift','ship','chip','She checked my shift.','Língua um pouco recuada; fricção contínua sem voz.'],
['/ʒ/','Som de measure','pleasure','pressure','We measure the temperature.','Semelhante ao J brasileiro de já, com fricção e voz.'],
['/h/','H soprado','heat','eat','Can you help me here?','Sopro suave na glote, sem R gutural.'],
['/tʃ/','CH de check','chip','ship','Could you check this chair?','Fechamento de T seguido de SH em uma única consoante.'],
['/dʒ/','J de job','job','chop','I have got a job near the city.','Fechamento de D seguido de fricção sonora.'],
['/m/','M nasal','sum','sun','Meet me in the morning.','Lábios fechados; ar pelo nariz.'],
['/n/','N nasal','sun','sum','No, the nursery is nearby.','Ponta da língua na crista atrás dos dentes; ar nasal.'],
['/ŋ/','NG de sing','sing','sin','I enjoy working outdoors.','Dorso da língua no palato mole; sem G extra no fim.'],
['/l/','L claro','light','right','The leaves look healthy.','Ponta da língua na crista; ar escapa pelas laterais.'],
['/r/','R inglês','right','light','Turn right at the next road.','Língua elevada sem vibração repetida; R aproximante.'],
['/j/','Y consonantal','yet','jet','Yes, you can use this one.','Deslize rápido como o início de I longo.'],
['/w/','W de water','west','vest','We need more water.','Arredonde os lábios e deslize para a vogal.'],
['[ɾ]','T/D rápido','water','waiter','I need a bottle of water.','Toque alveolar muito breve; depende do sotaque e contexto.'],
['[ʔ]','Parada glotal','button','butter','Put the button on the right side.','Interrompa o fluxo de ar brevemente na glote; uso variável.'],
['[ɫ]','L escuro','full','fool','Fill the milk bottle carefully.','Eleve o dorso da língua ao produzir L final.'],
['linking R','R de ligação','far away','far','There are more apples over there.','No australiano, ligue o R quando a palavra seguinte começa com vogal.']
];
const cues=[["I de vida → Ê de você","Relaxe a língua e abaixe-a um pouco; não chegue ao Ê. Compare ship e sheep."],["I de vida","Eleve a frente da língua; sustente a vogal sem apertar a mandíbula."],["É de pé → Ê","Mantenha a língua anterior; ajuste ao modelo australiano, geralmente mais fechado."],["É de pé → A","Abra a mandíbula mantendo a língua à frente; o australiano pode ter uma vogal mais aberta."],["A de pá","Abra a boca e mantenha a língua baixa; sem R final no australiano."],["Ó de avó","Arredonde suavemente os lábios e mantenha a vogal breve."],["Ô/Ó como ponto de partida","Arredonde os lábios e sustente a vogal; ajuste ao modelo."],["U de tudo relaxado","Abaixe um pouco a língua e relaxe o arredondamento."],["U de tudo","Sustente a vogal; no australiano a língua pode ficar mais central."],["A de cama, sem nasalizar","Relaxe a mandíbula; não transforme em Ã."],["Sem equivalente direto","Mantenha a língua central e os lábios neutros; sustente sem R consonantal no australiano."],["Vogal neutra átona","Relaxe tudo; diga a primeira sílaba de about rapidamente, sem destaque."],["Ê → I","Deslize continuamente, sem separar em duas sílabas."],["AI de pai","Comece aberto e termine com língua mais alta e anterior."],["ÓI de dói","Comece arredondado e termine com língua anterior."],["AU de mau","Abra a mandíbula e depois arredonde os lábios."],["ÔU como aproximação","Deslize de uma vogal central para uma mais alta e arredondada."],["I → vogal neutra","Relaxe a língua no final; alguns australianos usam uma vogal longa."],["É → vogal neutra","Mantenha a frente da língua ativa; muitos australianos usam vogal longa."],["U → vogal neutra","Compare com o modelo; este contraste varia e pode desaparecer."],["P de pato","Feche os lábios, acumule ar e solte; no início tônico pode haver sopro."],["B de bola","Feche os lábios e solte com voz; não acrescente I final."],["T de tatu","Toque atrás dos dentes superiores; evite TCH antes de I."],["D de dado","Toque a crista alveolar e solte com voz; evite DJ antes de I."],["C de casa","Encoste o dorso da língua no palato mole e solte sem voz."],["G de gato","Mesmo fechamento do K, com voz."],["F de faca","Dentes superiores no lábio inferior; mantenha o ar contínuo."],["V de vaca","Mesma posição do F, com vibração na garganta."],["Sem equivalente","Ponta da língua entre ou junto aos dentes; sopre sem voz, sem virar T ou F."],["TH com voz","Mesma posição do TH anterior; vibre a garganta, sem virar D."],["S de sapo","Crie um canal estreito para o ar, sem voz."],["Z de zebra","Mesmo canal do S, com voz."],["CH de chuva","Fricção contínua; não comece com T."],["J de janela","Fricção contínua com voz; não acrescente D."],["Sopro suave","Solte ar pela glote, sem raspar a garganta."],["TI de tia (mineiro)","Feche como T e solte como CH, numa única consoante."],["DI de dia (mineiro)","Feche como D e solte como J, numa única consoante."],["M de mala","Feche os lábios; deixe o ar sair pelo nariz."],["N de nada","Ponta da língua na crista; ar pelo nariz."],["N de banco, sem K","Eleve o dorso da língua; deixe o ar sair pelo nariz, sem G final."],["L de lata","Ponta da língua na crista; ar pelas laterais."],["R sem equivalente direto","Eleve ou curve a língua sem tocar a crista; não vibre."],["I de iate","Deslize rapidamente para a vogal seguinte."],["U de quase","Arredonde os lábios e deslize para a vogal; não use V."],["R simples de caro","Toque a crista uma vez, muito rapidamente; comum em water americano e também variável na Austrália."],["Interrupção da voz","Feche brevemente a glote, sem apertar com força; uso variável."],["L final, não U","Ponta da língua na crista e dorso elevado; evite vocalizar como no português."],["R de ligação","Em sotaques não róticos, ligue o R histórico à vogal seguinte, como far away."]];
const corrections=["Não troque por I longo.","Não encurte até soar como ship.","Não abra até bad.","Não transforme em É ou A posterior.","Não pronuncie R final no australiano.","Não use Ô fechado automaticamente.","Não acrescente U final.","Não use U longo.","Não confunda com full.","Não nasalize.","Não acrescente R consonantal no australiano.","Não dê destaque à sílaba átona.","Não separe em duas sílabas.","Não termine com I forte separado.","Não separe Ó e I.","Não separe A e U.","Não copie o Ô português sem deslize.","Não force R final no australiano.","Não force R final no australiano.","Não force um ditongo que o falante modelo não usa.","Não acrescente I final.","Não acrescente I final.","Evite TCH em tea.","Evite DJ em day.","Não acrescente vogal após K.","Não acrescente vogal após G.","Não use voz.","Não substitua por F.","Não substitua por T, S ou F.","Não substitua por D ou Z.","Não use voz.","Não substitua por S.","Não acrescente T.","Não acrescente D.","Não raspe a garganta.","Não use apenas SH.","Não use apenas J.","Não abra os lábios antes de concluir.","Não transforme em M.","Não acrescente G final.","Não transforme L inicial em U.","Não use R vibrante.","Não acrescente uma sílaba I.","Não substitua por V.","Não faça R forte.","Não force a garganta.","Não transforme automaticamente em U.","Não acrescente R onde não existe historicamente."];
const guidedData=[["ship","sheep","I de vida em direção ao Ê de você","Abaixe ligeiramente a língua e relaxe os lábios. Não chegue ao Ê. SH é o CH de chuva. Feche os lábios no P sem acrescentar I."],["sheep","ship","I de vida","Língua alta e à frente. Sustente a vogal um pouco mais. SH é CH de chuva."],["bed","bad","É de pé, ajustado ao sotaque","Mantenha a língua à frente. No australiano a vogal pode soar mais fechada. Termine no D sem acrescentar I."],["bad","bed","Entre É e A","Parta do É de pé e abra mais a mandíbula, mantendo a língua à frente."],["car","cup","A aberto de pá","Abra a mandíbula e relaxe a língua. No australiano não pronuncie o R final de car isolado."]];

export const sounds = raw.map(([ipa, title, word, contrast, sentence, guide], index) => ({
  ipa, title, word, contrast, sentence, guide,
  group: index < 12 ? 'Vogais' : index < 20 ? 'Ditongos' : index < 44 ? 'Consoantes' : 'Extras',
}));

export const materialByTarget = Object.fromEntries(sounds.map((sound, index) => {
  // Where relevant, preserve the earlier explanation without duplicating exercises.
  const detail = guidedData.find(([word, contrast]) => word === sound.word && contrast === sound.contrast)?.[3];
  const [reference, cue] = cues[index];
  const variant = sound.ipa === '[ɾ]' ? 'O toque rápido ocorre em muitos contextos americanos e australianos.'
    : sound.ipa === '[ʔ]' ? 'A parada glotal varia com contexto e região.' : '';
  return [sound.ipa, { reference, cue, correction: corrections[index], detail: [detail, variant].filter(Boolean).join(' ') }];
}));
