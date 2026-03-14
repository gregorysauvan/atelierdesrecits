import { useState, useRef, useEffect } from "react";

// ╔══════════════════════════════════════════════════════════════════╗
// ║  VERSION — format : VJJ-MM-HHMM  (ex: V04-03-0022)             ║
// ║  RÈGLE ABSOLUE : mettre à jour APP_VERSION à CHAQUE             ║
// ║  modification du fichier, avant de sauvegarder.                 ║
// ║  JJ=jour, MM=mois, HH=heure, MM=minutes (heure Paris UTC+1)     ║
// ║  Affiché en bas à gauche de la barre debug + dans les logs.     ║
// ╚══════════════════════════════════════════════════════════════════╝
const APP_VERSION = "V14-03-2945";


// ── Config ────────────────────────────────────────────────────────
const GENRES = [
  { value: "fantasy",       label: "Fantastique",    emoji: "🧙" },
  { value: "horror",        label: "Horreur",         emoji: "👁️" },
  { value: "romance",       label: "Romance",         emoji: "🌹" },
  { value: "scifi",         label: "Science-fiction", emoji: "🚀" },
  { value: "thriller",      label: "Thriller",        emoji: "🔪" },
  { value: "comedy",        label: "Comédie",         emoji: "😂" },
  { value: "biography",     label: "Biographie",      emoji: "📖" },
  { value: "historical",    label: "Historique",      emoji: "🏛️" },
  { value: "uchronia",     label: "Uchronie",         emoji: "⏳" },
  { value: "adventure",     label: "Aventure",        emoji: "🗺️" },
  { value: "mystery",       label: "Mystère",         emoji: "🔍" },
  { value: "philosophical", label: "Philosophique",   emoji: "🧠" },
  { value: "children",     label: "Histoire enfant",  emoji: "🧸" },
  { value: "fairytale",    label: "Conte",            emoji: "🏰" },
  { value: "youngadult",   label: "Jeune adulte",     emoji: "🌟" },
  { value: "erotic",       label: "Érotique",         emoji: "🔞", nsfw: true },
];

// ── Author Style Library ──────────────────────────────────────────
// Each author has a detailed style fingerprint used in prompts
const AUTHOR_STYLES = {
  // ── ANTIQUITÉ ──
  "Homère": "Style oral et épique : phrases longues à souffle ample, formules figées répétées rythmiquement pour aider la mémorisation, épithètes composées accolées aux noms (adjectifs-attributs récurrents). Très peu d'action psychologique intérieure — tout s'extériorise en gestes, discours, combats. Nombreuses digressions sous forme de comparaisons étendues (similes développés sur plusieurs lignes). Vocabulaire solennel et archaïsant, registre épique noble. Peu de descriptions de décors, beaucoup de listes énumératives (armées, navires, offrandes). Narration à la troisième personne, voix du conteur omniscient qui s'adresse à un auditoire collectif.",

  "Virgile": "Prose poétique dense et musicale, phrases longues à subordinations multiples, syntaxe latine inversée (complément avant verbe). Registre noble et solennel, vocabulaire soutenu emprunté au registre religieux et guerrier. Alternance entre passages d'action rapide (phrases courtes, verbes d'action) et descriptions contemplatives très travaillées. Abondance d'images pastorales (nature cultivée, saisons, troupeaux) entrelacées avec le souffle épique. Émotion retenue, jamais explicite — le sentiment transparaît dans la précision du détail. Diction harmonieuse, attention extrême au rythme des syllabes, aux allitérations discrètes.",

  "Ovide": "Prose élégante et fluide, rythme vif, transitions rapides d'une situation à l'autre. Ton badin et ironique, légèreté apparente même dans les situations dramatiques ou douloureuses. Goût du paradoxe et du renversement : le corps se transforme, les identités glissent. Vocabulaire érotique délicat, sous-entendus sensuels habillés de métaphores mythologiques. Phrases de longueur moyenne, équilibre entre action et description. Beaucoup de discours directs expressifs. Narrateur complice du lecteur, clin d'œil permanent à l'artifice littéraire.",

  "Apulée": "Style baroque et exubérant, vocabulaire rare et inventif, plaisir évident du mot insolite. Récits enchâssés les uns dans les autres (une histoire en contient d'autres). Mélange constant du registre noble et du registre vulgaire, du sacré et du grotesque. Descriptions sensuelles et extravagantes, abondance d'adjectifs et de qualificatifs accumulés. Humour picaresque — personnage ballotté par les événements, digne et ridicule tour à tour. Rythme irrégulier : passages très lents et descriptifs alternant avec des scènes d'action effrénée. Ton de conteur en représentation, qui joue avec l'auditoire.",

  "Sénèque": "Phrases courtes, percutantes, lapidaires — la pensée frappe comme un coup de marteau. Maximes et sentences morales condensées, construites pour être mémorisées. Vocabulaire stoïcien : maîtrise de soi, mort, vertu, passion, raison. Dialogues intérieurs tourmentés, monologue de la conscience qui s'interroge. Peu de descriptions extérieures — tout se passe dans l'arène intérieure du personnage. Tension rhétorique constante : antithèse, chiasme, anaphore. Registre philosophique et tragique entremêlés, ton de l'urgence morale.",

  // ── MOYEN ÂGE & RENAISSANCE ──
  "François Rabelais": "Langue française du XVIe siècle : orthographe phonétique, formes archaïques (iceulx, parquoy, davantaige), latinismes et termes savants mêlés à l'argot populaire. Phrases longues et labyrinthiques, digressions interminables et jouissives. Accumulations et listes colossales (inventaires absurdes, catalogues de noms, énumérations burlesques). Registre carnavalesque : le corps, ses fonctions, ses excès sont célébrés avec un égal plaisir. Humour grossier et philosophique entremêlés sans hiérarchie. Inventions de mots-valises et néologismes savoureux. Narrateur exubérant qui interpelle le lecteur et se moque de sa propre fiction.",

  "Michel de Montaigne": "Prose du XVIe siècle, langue encore en formation : orthographe instable, latinismes fréquents, tournures archaïques ('ce me semble', 'je ne sçay'). Phrase longue, sinueuse, qui avance par digressions et retours en arrière — la pensée se découvre en s'écrivant. Ton de confidence aristocratique : naturel, familier, jamais pontifiant. Citations latines intégrées sans traduction. Doute permanent érigé en méthode : 'que sais-je ?' structure la pensée. Très peu d'action — tout est réflexion et observation intérieure. Beaucoup d'exemples tirés de l'observation quotidienne et de la vie ordinaire.",

  "William Shakespeare": "Langue anglaise élisabéthaine traduite en français de manière archaïsante : tournures inversées, apostrophes dramatiques. Alternance entre registre élevé (métaphores filées complexes, images poétiques denses) et registre populaire (calembours, jeux de mots, vulgarités). Soliloque psychologique : le personnage pense à voix haute, ses contradictions se déploient sans filtre. Dialogues vifs, coupés, où chaque réplique rebondit sur la précédente. Métaphores développées sur plusieurs phrases (comparaisons filées). Humour et tragédie coexistent dans la même scène, parfois dans la même réplique. Personnages contradictoires qui se surprennent eux-mêmes.",

  "Miguel de Cervantes": "Prose narrative du XVIIe siècle espagnol traduite : style clair mais légèrement archaïsant. Ironie douce et constante — le narrateur commente ce qu'il raconte, prend ses distances, feint le doute. Récits enchâssés et digressions assumées ('mais laissons cela pour revenir à...'). Dialogues longs entre personnages aux visions du monde opposées, chacun défendant sa logique jusqu'à l'absurde. Parodie du style héroïque : le registre épique est utilisé pour des situations dérisoires. Narrateur qui joue à être un simple transcripteur de faits réels. Rythme moyen, ni trop lent ni trop rapide.",

  "François Villon": "Langue française du XVe siècle : termes vieillis, argot de la pègre médiévale, tournures archaïques. Ton oscillant entre lyrisme poignant et ironie amère. Vocabulaire de la mort, de la pauvreté, du corps qui souffre et vieillit. Autodérision constante : le narrateur se moque de lui-même avant que les autres ne le fassent. Tendresse cachée sous la grossièreté. Rythme saccadé, formules frappantes. Peu de descriptions de décors, beaucoup de voix directes et de confessions crues.",

  // ── CLASSIQUE XVIIe–XVIIIe ──
  "Molière": "Langue classique du XVIIe siècle : français châtié, élégant, mais parlé et vivant. Dialogues qui dominent largement sur la narration — tout passe par la parole des personnages. Tirades en accélération : une idée obsessionnelle répétée, reformulée, amplifiée jusqu'au comique. Répétitions volontaires comme procédé comique. Quiproquos et malentendus construits avec rigueur géométrique. Types sociaux fortement marqués (l'avare, le misanthrope, l'hypocrite) qui parlent chacun un langage reconnaissable. Rythme vif, coupes rythmiques efficaces, peu de descriptions.",

  "Voltaire": "Langue française du XVIIIe siècle : claire, élégante, rapide. Phrases courtes à moyennes, jamais alambiquées — la clarté est une arme. Ironie acérée fondée sur la naïveté feinte : le narrateur décrit les horreurs comme s'il ne les comprenait pas. Accumulation d'événements catastrophiques présentés sur le même ton neutre et détaché. Aphorismes et formules frappantes, construits pour être cités. Vocabulaire précis et peu ornemental — pas de baroque, pas de lyrisme. Beaucoup d'action et de mouvement, peu d'introspection. Dialogues philosophiques habillés en fiction.",

  "Jean-Jacques Rousseau": "Prose du XVIIIe siècle, longues périodes lyriques au rythme ample et musical. Vocabulaire de la sensibilité : sentiment, âme, cœur, larme, nature, vertu. Phrases construites en crescendo émotionnel, qui montent vers une conclusion pathétique. Descriptions de la nature abondantes et sensuelles — paysages, lumières, sons, odeurs. Introspection passionnée : le narrateur scrute ses propres états intérieurs avec une précision quasi scientifique. Ton sincère et vibrant, jamais froid. Alternance entre passages contemplatifs très lents et bouffées d'indignation rhétorique.",

  "Denis Diderot": "Langue française du XVIIIe siècle vivante et mouvante. Dialogues philosophiques qui dominent : deux voix s'affrontent, se coupent, se relancent, changent de position. Narrateur intrusif qui interpelle le lecteur, reconnaît les conventions du roman et s'en joue. Ruptures de registre soudaines : le ton philosophique bascule dans le comique ou le sentimental sans prévenir. Phrases de longueur variable, rythme imprévisible. Vocabulaire matérialiste et concret : le corps, les sens, la matière ont autant de dignité que les idées. Pensée en mouvement, jamais figée en thèse.",

  "Madame de Lafayette": "Langue classique du XVIIe siècle : syntaxe sobre, vocabulaire retenu, registre de la cour. Phrases de longueur moyenne, construites avec économie — pas un mot de trop. Psychologie fine et précise : les émotions sont disséquées, nommées, analysées avec une froideur chirurgicale. Style indirect libre naissant : les pensées du personnage se confondent avec la narration sans être explicitement signalées. Très peu d'action extérieure — tout se joue dans les regards, les silences, les demi-mots des conversations de salon. Tension constante entre la passion ressentie et la bienséance affichée.",

  // ── XIXe SIÈCLE ──
  "Victor Hugo": "Langue française du XIXe siècle, registre élevé et solennel. Phrases longues, périodes ample, souffle oratoire — le style est fait pour être dit à voix haute. Antithèses fracassantes construites en parallélisme (ombre/lumière, sublime/grotesque, grandeur/misère). Descriptions panoramiques et monumentales : les lieux sont décrits avec une ampleur épique. Digressions historiques, sociales, philosophiques insérées au milieu de l'action. Apostrophes et exclamations lyriques fréquentes. Vocabulaire riche, mélange de registres élevés et populaires assumé. Personnages-symboles qui incarnent des forces morales.",

  "Honoré de Balzac": "Langue française du XIXe siècle, prose dense et accumulatrice. Longues descriptions d'intérieurs, de vêtements, d'objets : chaque détail matériel révèle un caractère ou une condition sociale. Phrases longues à propositions relatives enchainées, qui ajoutent couche après couche. Narrateur omniscient et commentateur : il explique, analyse, juge les motivations de ses personnages. Vocabulaire précis et spécialisé selon les milieux décrits (finance, médecine, noblesse, commerce). Rythme lent au début (mise en place) puis accéléré lors des crises dramatiques. Peu de dialogue par rapport à la narration et au commentaire.",

  "Gustave Flaubert": "Langue française du XIXe siècle, prose travaillée jusqu'à l'obsession sonore — chaque phrase est pesée, polie, réécrite. Style indirect libre maîtrisé : les pensées du personnage se coulent dans la voix du narrateur sans guillemets ni tirets. Ironie froide et distante : le narrateur ne commente jamais directement, il montre. Rythme lent, phrases longues aux clausules musicales étudiées. Descriptions minutieuses de gestes, de décors, d'objets — le trivial est rendu avec la même précision que le sublime. Vocabulaire précis et châtié, aucun mot de trop. Désillusion implacable : les espoirs des personnages sont montrés dans leur médiocrité sans le moindre pathos.",

  "Émile Zola": "Langue française du XIXe siècle, registre naturaliste : vocabulaire technique et populaire selon les milieux décrits (argot ouvrier, termes médicaux, jargon professionnel). Descriptions collectives et monumentales : les foules, les machines, les bâtiments ont autant d'importance que les individus. Phrases longues et accumulatrices, listes et inventaires qui font masse. Odeurs, bruits, textures omniprésentes — le corps et les sens sont convoqués à chaque page. Rythme lent dans les descriptions, explosif dans les scènes de crise collective. Métaphores récurrentes empruntées au monde animal et végétal. Narrateur qui observe avec la froideur d'un scientifique.",

  "Stendhal": "Langue française du XIXe siècle, style sec et rapide — le contraire du style ornemental. Phrases courtes à moyennes, construction directe sujet-verbe-complément sans fioritures. Analyse psychologique sans complaisance : les motivations des personnages sont disséquées avec une lucidité clinique. Dialogues vifs et révélateurs de rapports de pouvoir. Très peu de descriptions de décors — on entre dans l'action et la psychologie immédiatement. Ironie distante, jamais lyrique ni sentimental. Narrateur qui intervient parfois en aparté pour commenter la bêtise ou la bassesse des conventions sociales. Rythme rapide, beaucoup d'action et de déplacement.",

  "Guy de Maupassant": "Langue française de la fin du XIXe siècle, prose limpide et tranchante — économie absolue des moyens. Phrases courtes, précises, sans adjectif inutile. Scènes construites avec rigueur dramatique vers une chute ou une révélation finale. Dialogues révélateurs de caractère, souvent plus importants que la narration. Descriptions brèves mais frappantes — un ou deux détails suffisent à planter un décor. Ironie froide et sans pitié : le narrateur observe ses personnages comme des insectes. Vocabulaire simple et concret. Rythme rapide, peu de digressions.",

  "Charles Dickens": "Langue anglaise victorienne traduite : registre ample et expressif, vocabulaire coloré. Phrases longues et sinueuses, avec parenthèses, relatives et digressions qui s'accumulent. Accumulation de détails sordides ou pittoresques pour créer une atmosphère de lieu ou de milieu social. Personnages caractérisés par un tic de langage, une obsession ou un trait physique récurrent. Dialogues expressifs, différenciés selon la classe sociale du locuteur. Pathos ouvertement assumé dans les scènes d'émotion — larmes, séparations, sacrifices. Humour grinçant dans les portraits d'institutions ou de personnages odieux. Narrateur bienveillant mais ironique.",

  "Jane Austen": "Langue anglaise du début du XIXe siècle traduite : registre élégant, ironie légère et précise. Phrases de longueur moyenne, construites avec finesse. Style indirect libre très développé : les pensées du personnage féminin se confondent avec la narration. Dialogues comme révélateurs de caractère — ce qu'on dit, comment on le dit, ce qu'on ne dit pas. Ironie narrative : le narrateur dit une chose tout en laissant comprendre le contraire. Très peu d'action extérieure — tout se passe dans les salons, les visites, les conversations et les lettres. Vocabulaire de la bienséance et des convenances sociales. Observations acérées sur les manœuvres matrimoniales et les hypocrisies de la bonne société.",

  "Edgar Allan Poe": "Langue anglaise du XIXe siècle traduite : registre soutenu, légèrement archaïsant. Phrases longues à subordinations multiples, qui instaurent un rythme hypnotique. Atmosphère construite dès les premières lignes et maintenue sans relâche — le décor est une projection de l'état mental du narrateur. Narrateur à la première personne sur le bord de la folie : il s'adresse au lecteur, lui demande de le croire, s'en défend. Détails morbides et obsédants répétés, amplifiés. Raisonnement logique appliqué à des situations irrationnelles — la précision analytique rend l'horreur plus glaçante. Peu d'action physique, beaucoup de tension intérieure.",

  "Fiodor Dostoïevski": "Langue russe du XIXe siècle traduite : registre parlé, presque oral, haché. Phrases courtes et fiévreuses qui s'enchaînent, puis soudain une longue tirade qui monte en crescendo. Dialogues en crescendo : les personnages s'interrompent, se coupent, changent d'avis, crient leur contradictions. Chaque personnage porte une idéologie et la défend jusqu'à la rupture psychologique. Intériorité tourmentée : honte, orgueil blessé, culpabilité, fièvre morale — les émotions sont extrêmes et changeantes. Beaucoup de discours direct, peu de narration externe. Rythme frénétique, sentiment d'urgence permanente. Le corps souffre autant que l'âme.",

  "Léon Tolstoï": "Langue russe du XIXe siècle traduite : style ample, réaliste, d'une clarté souveraine. Phrases longues qui décrivent minutieusement le déroulement intérieur de la conscience — les pensées arrivent dans l'ordre où elles se forment. Descriptions de la nature très développées, jamais gratuites : chaque paysage entre en résonance avec l'état moral du personnage. Narration panoramique qui passe d'un personnage à un autre, d'une classe sociale à une autre, d'un champ de bataille à un salon. Dialogues sobres mais révélateurs. Vocabulaire simple et direct — aucune affectation de style. Jugement moral sous-jacent mais jamais assené.",

  "Anton Tchekhov": "Langue russe de la fin du XIXe siècle traduite : style sobre, elliptique, d'une précision chirurgicale. Phrases courtes, détails concrets sélectionnés avec soin — un objet, un geste révèle tout ce qu'on ne dit pas. Sous-texte omniprésent : ce qui compte se passe sous les mots, dans les silences et les non-dits. Les personnages parlent souvent de choses insignifiantes quand ils pensent à autre chose. Fin ouverte, sans résolution — la vie continue, rien n'a été réglé. Mélancolie douce et diffuse, humour triste. Beaucoup de dialogues anodins en surface, chargés de sens en profondeur. Très peu d'événements extérieurs.",

  // ── DÉBUT XXe ──
  "Marcel Proust": "Langue française du début du XXe siècle, phrases d'une longueur exceptionnelle avec de multiples propositions subordonnées imbriquées les unes dans les autres. Le lecteur doit souvent relire pour démêler qui pense quoi. Métaphores synesthésiques complexes : une odeur évoque une couleur qui évoque un son. Digressions analytiques interminables sur les mécanismes de la mémoire, de la jalousie, du snobisme, de l'art. Très peu d'action extérieure — tout est perception, souvenir, analyse. Vocabulaire élaboré, précieux sans être pédant. Rythme lent, contemplatif, méditatif. Le temps est perçu de façon subjective et non linéaire.",

  "Louis-Ferdinand Céline": "Langue française du XXe siècle radicalement transformée : syntaxe brisée, points de suspension omniprésents comme une respiration haletante et saccadée. Argot, verlan, inventions verbales mêlés à un lyrisme sombre et rageur. Phrases courtes, percutantes, qui s'enchaînent sans transition logique. Registre oral transgressif — on entend une voix qui parle, qui crie, qui ricane. Colère et tendresse entremêlées de façon déchirante. Descriptions violentes et poétiques à la fois. Narrateur qui s'adresse directement au lecteur avec agressivité et complicité. Vocabulaire des bas-fonds, de la misère, de la guerre.",

  "Franz Kafka": "Langue allemande traduite : style sobre, précis, administratif — comme un rapport officiel. Phrases courtes à moyennes, ton neutre et factuel même pour décrire des situations absurdes ou cauchemardesques. La transformation ou l'absurdité est décrite sur le même ton calme que le reste. Vocabulaire bureaucratique et juridique : règlements, procédures, hiérarchies. Culpabilité sans cause identifiable — le personnage accepte sa punition sans comprendre son crime. Dialogues souvent déconcertants : les interlocuteurs ne se comprennent pas, ou refusent de se comprendre. Rythme lent, oppressant, circulaire.",

  "Virginia Woolf": "Langue anglaise du début du XXe siècle traduite : prose lyrique et musicale, attention extrême au rythme des phrases. Flux de conscience : les pensées s'enchaînent par association, par résonance, sans logique causale stricte. Temps subjectif : cinq minutes peuvent occuper plusieurs pages, une journée entière peut être résumée en une phrase. Descriptions sensorielles très développées — lumière, sons, textures, impressions fugitives. Intériorité féminine scrutée avec finesse. Peu d'action extérieure, tout se passe dans la conscience. Phrases longues qui se déploient puis se referment. Instants épiphaniques où une perception ordinaire soudain révèle quelque chose d'essentiel.",

  "Ernest Hemingway": "Langue anglaise du XXe siècle traduite : style dépouillé, direct, minimaliste. Phrases courtes, structure sujet-verbe-complément sans subordination complexe. Dialogues secs et apparemment anodins qui portent une charge émotionnelle immense non exprimée. Le non-dit est la matière principale : tout ce qui importe est sous la surface. Peu d'adjectifs, aucun adverbe inutile. Descriptions brèves mais précises, fonctionnelles. Vocabulaire simple, concret, quotidien. Actions décrites de façon factuelle — boire, marcher, pêcher — sans commentaire psychologique. Le lecteur doit inférer les émotions.",

  "F. Scott Fitzgerald": "Langue anglaise des années 1920 traduite : prose lyrique et mélancolique, attention aux sonorités. Phrases longues aux métaphores lumineuses, visuelles, souvent liées à la lumière, à l'or, aux étoiles. Nostalgie enveloppante pour quelque chose de perdu ou de jamais vraiment atteint. Dialogues brillants et légers en surface, portant une tristesse profonde en dessous. Vocabulaire élégant, parfois précieux. Personnages brillants et creux qui s'agitent dans des fêtes somptueuses. Rythme musical, balancé. Narrateur légèrement en retrait qui observe avec fascination et mélancolie.",

  "William Faulkner": "Langue anglaise du XXe siècle traduite : phrases labyrinthiques d'une longueur extrême, avec de multiples subordonnées, parenthèses et digressions. Plusieurs voix narratives qui se relaient sans prévenir, chacune avec sa propre syntaxe et son propre rythme. Temporalité non linéaire : passé et présent s'entremêlent sans hiérarchie, la chronologie est constamment bousculée. Monologue intérieur dense, parfois difficile à suivre. Vocabulaire riche, archaïsant pour les voix âgées, populaire et dialectal pour les voix paysannes. Atmosphère lourde, humide, chargée d'histoire et de culpabilité collective. Rythme lent, opressant.",

  "Jorge Luis Borges": "Langue espagnole traduite : style sec, précis, d'une clarté trompeuse qui masque une complexité vertigineuse. Phrases courtes à moyennes, construites avec une élégance mathématique. Vocabulaire érudit mêlant termes philosophiques, scientifiques et littéraires. Ton de l'essai ou du compte rendu savant appliqué à des fictions impossibles. Erudition réelle et fausse indistinctement mêlées — notes de bas de page, bibliographies inventées, auteurs inexistants cités avec sérieux. Absence totale d'émotions brutes — tout est abstrait, intellectuel, conceptuel. Très peu de descriptions sensorielles. Rythme régulier, presque hypnotique.",

  "Mikhail Boulgakov": "Langue russe du XXe siècle traduite : style vif, satirique, teinté d'un humour noir grinçant. Alternance entre registre réaliste et registre fantastique, le passage de l'un à l'autre se faisant avec naturel. Dialogues très vivants, piquants, révélateurs des lâchetés et des compromissions des personnages. Descriptions d'atmosphères urbaines nocturnes, théâtrales. Ironie acérée sur le pouvoir, la bureaucratie et l'opportunisme intellectuel. Récits emboîtés : une histoire dans l'histoire, avec des correspondances symboliques entre les deux niveaux. Rythme rapide, beaucoup d'action et de mouvement.",

  // ── CONTEMPORAINS ──
  "Albert Camus": "Langue française du XXe siècle, style sobre et classique d'une grande clarté méditerranéenne. Phrases courtes à moyennes, économie de mots rigoureuse. Vocabulaire simple et précis, registre neutre sans emphase ni lyrisme excessif. Narration à la troisième personne ou à la première très distanciée — l'émotion est sous-jacente, jamais étalée. Descriptions sensorielles de la lumière, de la chaleur, de la mer — le soleil et la mer comme présences physiques. Lucidité froide, refus du sentimentalisme. Les personnages pensent peu et agissent — l'introspection est rare et brève. Rythme régulier, serein malgré les thèmes sombres.",

  "Marguerite Duras": "Langue française du XXe siècle, style épuré jusqu'à l'os — phrase courte, blanche, suspendue. Répétitions hypnotiques : une même formule revient, légèrement modifiée, creusant le sens. Blancs et silences comme matière narrative à part entière — ce qu'on ne dit pas est aussi important que ce qu'on dit. Phrases nominales ou verbales très courtes, parfois incomplètes. Vocabulaire minimal, presque dénudé. Désir et douleur exprimés de façon oblique, jamais nommés directement. Temps flottant, non chronologique. Voix narrative à mi-chemin entre le récit et le poème en prose.",

  "Patrick Modiano": "Langue française contemporaine, style léger et légèrement flottant, comme si les mots effleuraient les choses sans les saisir vraiment. Phrases courtes à moyennes, ton neutre et mélancolique. Récit à la première personne qui interroge ses propres lacunes — le narrateur ne sait pas, doute, reconstruit. Accumulation de détails précis (adresses, noms, dates, professions) qui paradoxalement accentuent le sentiment de vide et d'incertitude. Atmosphère nocturne et brumeuse. Dialogues rares, courts, légèrement décalés. Rythme lent et flottant, beaucoup de blanc narratif. Vocabulaire ordinaire, sans effets de style.",

  "Michel Houellebecq": "Langue française contemporaine, registre hybride entre le roman et l'essai sociologique. Phrases longues qui mêlent observation narrative et digression analytique sur la société, l'économie, la sexualité. Vocabulaire froid et clinique pour décrire les émotions et les corps. Ironie sans recours — le narrateur n'offre aucune consolation. Beaucoup de description des comportements de consommation, des modes de vie contemporains. Dialogues rares mais souvent crus et désenchantés. Statistiques et données sociologiques intégrées dans le texte comme des faits romanesques. Rythme moyen, jamais urgent.",

  "Gabriel García Márquez": "Langue espagnole traduite : prose baroque et enveloppante, phrases longues et sinueuses au rythme de la conversation orale. Le merveilleux est présenté sur le même ton factuel que le quotidien — aucune marque d'étonnement. Hyperboles constantes comme registre de base (cent ans de solitude, mille jours de pluie). Temps circulaire ou répétitif — les mêmes événements ou les mêmes caractères reviennent de génération en génération. Vocabulaire tropical, sensoriel, sensuel : chaleur, odeurs, couleurs intenses. Narration distante, presque chronistique, qui rapporte les événements les plus extraordinaires avec un calme absolu. Personnages marqués par la fatalité.",

  "Haruki Murakami": "Langue japonaise traduite : style simple, dépouillé, d'une clarté presque étrange. Phrases courtes à moyennes, rythme régulier et mélancolique. Personnages solitaires qui vivent seuls, cuisinent, écoutent de la musique, boivent de la bière — les gestes quotidiens sont décrits avec soin et douceur. Passages vers un autre monde ou une autre réalité s'opèrent de façon fluide, sans rupture de ton. Dialogues calmes, légèrement décalés. Vocabulaire contemporain mêlant références culturelles occidentales (musique, littérature, cinéma) et sensibilité japonaise. Rythme lent et hypnotique, atmosphère onirique.",

  "Cormac McCarthy": "Langue anglaise traduite : prose dépouillée, dure, d'une beauté âpre. Pas de guillemets pour les dialogues — la parole se fond dans la narration. Phrases courtes et sèches pour l'action, longues et lyriques pour les descriptions de paysages. Pas de tirets, d'apostrophes dans les contractions anglaises — ponctuation réduite au minimum. Vocabulaire archaïque et biblique : les constructions rappellent la King James Bible. Dialogues minimal, souvent elliptiques — les personnages ne s'expliquent pas. Descriptions de la nature et du paysage comme présences presque divines. Violence froide décrite de façon factuelle. Destin implacable.",

  "Umberto Eco": "Langue italienne traduite : style encyclopédique et jouissif, mêlant rigueur académique et récit d'aventure. Phrases longues chargées d'érudition — citations, références, analyses insérées naturellement dans le flux narratif. Vocabulaire très riche : termes techniques, archaïsmes, latinismes mêlés à la prose contemporaine. Humour érudit — le plaisir du savoir est explicitement mis en scène. Structure narrative à plusieurs niveaux (roman policier + essai philosophique + méditation historique). Digressions longues et savoureuses sur des questions linguistiques, symboliques, théologiques. Dialogues denses, entre personnages très cultivés.",

  "Kazuo Ishiguro": "Langue anglaise contemporaine traduite : style d'une retenue exquise, élégance discrète. Phrases longues mais coulantes, jamais laborieuses. Narrateur à la première personne dont la mémoire est sélective — il raconte en omettant l'essentiel, qui affleure progressivement. Ton de la confidence polie, jamais directement émotionnel — les sentiments les plus forts sont exprimés par une légère inflexion, un mot choisi. Dialogues de surface qui transportent des significations profondes. Vocabulaire soigné, britannique. Rythme lent et doux, mélancolie diffuse. Le passé se révèle peu à peu comme quelque chose d'impossible à affronter directement.",

  "Toni Morrison": "Langue anglaise américaine traduite : prose poétique et rythmée, proche de l'oralité chantée. Phrases longues au rythme musical, avec des répétitions et des variations comme dans un blues. Vocabulaire de la chair, du sang, de la terre, du corps souffrant et résistant. Plusieurs voix narratives qui se superposent et se répondent. Temps non linéaire — le passé surgit dans le présent avec une force physique. Images sensorielles très intenses. Narration collective par moments — le 'nous' d'une communauté. Dialogues expressifs, différenciés selon les personnages. Émotions intenses exprimées de façon directe.",

  // ── FANTASTIQUE & SF ──
  "J.R.R. Tolkien": "Langue anglaise traduite avec un registre archaïsant et solennel, proche des épopées médiévales. Phrases longues et majestueuses, syntaxe inversée héritée des textes anciens. Vocabulaire élaboré et inventé : langues fictives, étymologies imaginaires intégrées subtilement dans les noms et les formules. Descriptions très détaillées de la géographie, de l'architecture, de la végétation — le monde physique est décrit comme s'il avait une histoire millénaire. Peu de psychologie intérieure complexe — les personnages agissent selon des valeurs claires. Narration épique, ample, qui prend son temps. Beaucoup de chants, de poèmes, de légendes insérés dans le récit.",

  "H.P. Lovecraft": "Langue anglaise du début du XXe siècle traduite : style grandiloquent et archaïsant. Phrases très longues, chargées d'adjectifs empilés et de qualificatifs hyperboliques. Vocabulaire d'horreur cultivé : termes rares, mots composés pour signifier l'indicible ('non-euclidien', 'cyclopéen', 'antédiluvien'). Le narrateur affirme ne pas pouvoir décrire ce qu'il voit — l'horreur est toujours plus grande que le langage. Atmosphère construite par accumulation d'inquiétude croissante avant toute action. Très peu de dialogues. Rythme lent, oppressant. La connaissance elle-même est dangereuse — comprendre détruit l'esprit.",

  "Philip K. Dick": "Langue anglaise du XXe siècle traduite : style simple, direct, presque journalistique. Phrases courtes à moyennes, rythme rapide. Vocabulaire du quotidien, contemporain — l'extraordinaire surgit dans un cadre banal et familier. Dialogues fréquents, vifs, déstabilisants — les personnages ne s'accordent pas sur ce qui est réel. Introspection du personnage ordinaire qui découvre que la réalité est truquée. Beaucoup d'action et de mouvement. Paranoïa douce — le personnage doute de tout, y compris de lui-même. Questions philosophiques sur l'identité, la réalité, la conscience posées de façon concrète dans des situations ordinaires.",

  "Ursula K. Le Guin": "Langue anglaise traduite : style sobre et lyrique, d'une grande clarté. Phrases moyennes, rythme régulier et mesuré. Vocabulaire précis sans affectation. Descriptions soignées de sociétés, de cultures, de modes de vie — l'anthropologie comme matière romanesque. Personnages complexes dont les valeurs et les perceptions sont façonnées par leur culture. Peu d'action spectaculaire — les enjeux sont politiques, sociaux, philosophiques. Dialogues interculturels : des personnages qui ne partagent pas les mêmes présupposés essaient de se comprendre. Narration distante, analytique, mais jamais froide. Temps long, rythme patient.",

  "Frank Herbert": "Langue anglaise traduite : style dense et intellectuellement exigeant. Phrases longues alternant narration externe et monologue intérieur sans toujours le signaler clairement. Vocabulaire très élaboré : termes techniques inventés, expressions rituelles, proverbes d'une culture imaginaire. Beaucoup de pensées des personnages entrelacées dans l'action — on est à la fois dans l'action et dans l'analyse de l'action. Écologie, politique et religion comme moteurs narratifs intégrés dans chaque description. Dialogues chargés de sous-entendus politiques. Rythme lent dans les passages analytiques, rapide dans l'action.",

  "Ray Bradbury": "Langue anglaise traduite : prose lyrique et évocatrice, proche du poème en prose. Phrases longues aux métaphores sensuelles, visuelles, olfactives — les images sont saisissantes et insolites. Vocabulaire de l'enfance, de l'automne, du crépuscule, du rêve. Nostalgie douce-amère pour un passé idéalisé. Descriptions atmosphériques très développées — le lecteur sent la chaleur, entend les sons. Peu d'action physique, beaucoup d'ambiance et d'atmosphère. Rythme musical, balancé, comme une berceuse légèrement triste. Personnages enfants ou adultes restés enfants. La technologie est décrite avec méfiance et fascination mêlées.",

  "Isaac Asimov": "Langue anglaise traduite : style didactique et fonctionnel, d'une grande clarté. Phrases courtes à moyennes, structure directe. Vocabulaire scientifique intégré naturellement dans la narration, jamais pédant. Dialogues-débats qui dominent : les personnages échangent des arguments, développent des théories, exposent des positions. Très peu de descriptions atmosphériques ou sensorielles — l'essentiel est dans les idées et les problèmes à résoudre. Humour discret, souvent intellectuel. Rythme rapide, efficace. Personnages fonctionnels au service des idées. Optimisme sur la capacité humaine à raisonner et résoudre.",

  "Arthur C. Clarke": "Langue anglaise traduite : style clair et élégant, rigoureusement scientifique dans ses extrapolations. Phrases de longueur moyenne, précises, jamais lyriques à l'excès. Vocabulaire scientifique et technique intégré sans vulgarisation condescendante. Descriptions de phénomènes physiques ou astronomiques avec précision et beauté sobre. Sens du 'sense of wonder' : les révélations finales ouvrent sur une vérité plus grande que ce qu'on imaginait. Peu de psychologie intérieure — les personnages sont des observateurs face au cosmos. Rythme lent qui s'accélère vers la révélation finale. Humour britannique discret.",

  "Peter F. Hamilton": "Langue anglaise traduite : style de space opera monumental, narratif et efficace. Phrases longues à moyennes, beaucoup d'action et de mouvement. Plusieurs points de vue entrelacés — on suit de nombreux personnages dans des lieux différents. Vocabulaire technique très développé : technologies extrapolées décrites avec précision et cohérence. Rythme lent pour établir le contexte, explosif lors des séquences d'action ou de révélation. Descriptions de sociétés et de politiques interstellaires détaillées. Dialogues directs et fonctionnels. Sens de l'échelle cosmique — les enjeux sont civilisationnels. Beaucoup de pages dédiées à l'établissement du world-building.",

  "Neil Gaiman": "Langue anglaise traduite : voix narrative chaleureuse et légèrement distante, comme celle d'un conteur professionnel. Phrases de longueur variable, rythme souple. Vocabulaire accessible mais précis, avec des touches d'archaïsme quand la matière mythologique l'appelle. Le merveilleux s'installe sans fracas dans le quotidien. Humour doux et mélancolique. Dialogues expressifs et caractérisants. Descriptions d'atmosphères nocturnes, de lieux étranges traversés par des personnages mythologiques désenchantés. Ton entre le conte pour enfants et le roman noir adulte — les deux registres coexistent. Rythme moyen, jamais pressé.",

  "Stephen King": "Langue anglaise américaine contemporaine traduite : style oral et fluide, très proche de la voix d'un conteur populaire. Phrases longues et coulantes, sans complexité syntaxique — on lit vite, on tourne les pages. Vocabulaire familier et populaire américain. Beaucoup de dialogue, vif et caractérisant. Développement lent et patient des personnages avant le surgissement de l'horreur — on s'attache avant d'avoir peur. Détails du quotidien américain accumulés pour ancrer le fantastique dans le réel. Flashbacks d'enfance fréquents. Rythme accéléré lors des climax. Humour grinçant dans les passages descriptifs.",

  "George Orwell": "Langue anglaise traduite : style dépouillé, clair, d'une honnêteté presque brutale. Phrases courtes à moyennes, structure directe. Vocabulaire simple et précis — Orwell croyait que la clarté du style est une vertu politique. Pas d'ornement, pas de métaphore superflue. Descriptions concrètes et factuelles des conditions de vie, des rapports de pouvoir, des mécanismes d'oppression. Narration proche du journalisme — les faits d'abord. Dialogues sobres et révélateurs. Ironie sobre, jamais ostentatoire. Rythme régulier. La langue elle-même comme enjeu politique — les mots utilisés révèlent qui détient le pouvoir.",

  "Douglas Adams": "Langue anglaise traduite : humour absurde britannique poussé à son comble. Phrases longues qui partent dans des digressions apparemment hors-sujet avant de revenir avec une punchline inattendue. Logique interne rigoureuse appliquée à des prémisses totalement absurdes. Vocabulaire mêlant termes techniques (scientifiques, bureaucratiques) et expressions très familières. Narrateur omniscient qui s'adresse au lecteur avec une familiarité complice et un désespoir joyeux. Beaucoup de parenthèses et d'apartés. Descriptions de machines, de règlements ou de procédures présentées avec un sérieux implacable qui en souligne l'absurdité. Rythme syncopé.",

  "Anne Rice": "Langue anglaise traduite : prose baroque et sensuelle, d'une richesse ornementale assumée. Phrases longues, lentes, qui savourent chaque détail. Vocabulaire précieux, sombre, évocateur : soie, velours, ombre, sang, marbre, chandelles. Descriptions d'intérieurs somptueux et de vêtements très développées. Introspection mélancolique et interminable — le personnage rumine, remet en question, analyse ses propres désirs avec une acuité douloureuse. Dialogues rares mais intenses, philosophiques. Atmosphère nocturne et décadente. Rythme lent et hypnotique. L'immortalité et la mort décrites avec une sensualité morbide.",

  // ── JEUNESSE & CONTE ──
  "J.K. Rowling": "Langue anglaise contemporaine traduite : style accessible, fluide, légèrement espiègle. Phrases de longueur variable, rythme dynamique. Vocabulaire inventif pour les termes du monde imaginaire (néologismes construits sur des racines latines ou anglaises). Humour britannique décalé, présent même dans les situations dramatiques. Personnages secondaires caractérisés par un ou deux traits forts immédiatement reconnaissables. Dialogues expressifs et différenciés — chaque personnage a une façon de parler qui lui appartient. Descriptions soignées des environnements fantastiques, suffisamment détaillées pour être visualisées. Rythme rapide avec de nombreuses scènes d'action.",

  "Roald Dahl": "Langue anglaise traduite avec un registre légèrement espiègle et malicieux, accessible aux enfants mais avec des niveaux de lecture adultes. Phrases courtes, directes, vives — on va à l'essentiel. Vocabulaire inventif et savoureux, plaisir évident des mots insolites et des sonorités amusantes. Descriptions d'adultes très exagérées, presque caricaturales — la laideur morale se lit sur les corps. Humour noir enfantin : les méchants reçoivent des punitions grotesques et jubilatoires. Narrateur complice des enfants et lecteurs contre les adultes oppressifs. Dialogues vifs, souvent mordants. Rythme rapide, chutes abruptes.",
};

const AUTHORS = [
  { group: "Antiquité", authors: ["Homère","Virgile","Ovide","Apulée","Sénèque"] },
  { group: "Moyen Âge & Renaissance", authors: ["François Rabelais","Michel de Montaigne","William Shakespeare","Miguel de Cervantes","François Villon"] },
  { group: "Classique (XVIIe–XVIIIe)", authors: ["Molière","Voltaire","Jean-Jacques Rousseau","Denis Diderot","Madame de Lafayette"] },
  { group: "XIXe siècle — France", authors: ["Victor Hugo","Honoré de Balzac","Gustave Flaubert","Émile Zola","Stendhal","Guy de Maupassant"] },
  { group: "XIXe siècle — Angleterre & USA", authors: ["Charles Dickens","Jane Austen","Edgar Allan Poe","Fiodor Dostoïevski","Léon Tolstoï","Anton Tchekhov"] },
  { group: "Début XXe siècle", authors: ["Marcel Proust","Louis-Ferdinand Céline","Franz Kafka","Virginia Woolf","Ernest Hemingway","F. Scott Fitzgerald","William Faulkner","Jorge Luis Borges","Mikhail Boulgakov"] },
  { group: "Contemporains", authors: ["Albert Camus","Marguerite Duras","Patrick Modiano","Michel Houellebecq","Gabriel García Márquez","Haruki Murakami","Cormac McCarthy","Umberto Eco","Kazuo Ishiguro","Toni Morrison"] },
  { group: "Fantastique & SF", authors: ["J.R.R. Tolkien","H.P. Lovecraft","Philip K. Dick","Ursula K. Le Guin","Frank Herbert","Ray Bradbury","Isaac Asimov","Arthur C. Clarke","Peter F. Hamilton","Neil Gaiman","Stephen King","George Orwell","Douglas Adams","Anne Rice"] },
  { group: "Jeunesse & Conte", authors: ["J.K. Rowling","Roald Dahl"] },
];

const DURATIONS = [
  { value: "micro", label: "Micro",  desc: "~500 mots",   words: 500 },
  { value: "flash", label: "Flash",  desc: "~1 000 mots", words: 1000 },
  { value: "short", label: "Courte", desc: "~2 000 mots", words: 2000 },
  { value: "long",  label: "Longue", desc: "~5 000 mots", words: 5000 },
];

const ENDINGS = [
  { value: "happy",       label: "Heureuse" },
  { value: "tragic",      label: "Tragique" },
  { value: "twist",       label: "Coup de théâtre" },
  { value: "open",        label: "Ouverte" },
  { value: "bittersweet", label: "Douce-amère" },
  { value: "circular",    label: "Circulaire" },
  { value: "cliffhanger", label: "Cliffhanger" },
  { value: "redemption",  label: "Rédemption" },
  { value: "ambiguous",   label: "Ambiguë" },
  { value: "dark",        label: "Sombre" },
];

const NARRATORS = [
  { value: "third",  label: "3ème personne" },
  { value: "first",  label: "1ère personne" },
  { value: "second", label: "2ème personne" },
];

const LANGUAGES = [
  { value: "french",     label: "Français",  flag: "🇫🇷" },
  { value: "english",    label: "English",   flag: "🇬🇧" },
  { value: "spanish",    label: "Español",   flag: "🇪🇸" },
  { value: "german",     label: "Deutsch",   flag: "🇩🇪" },
  { value: "italian",    label: "Italiano",  flag: "🇮🇹" },
  { value: "portuguese", label: "Português", flag: "🇵🇹" },
  { value: "japanese",   label: "日本語",     flag: "🇯🇵" },
  { value: "chinese",    label: "中文",       flag: "🇨🇳" },
];

const langInstructions = {
  french: "Écris en français.", english: "Write in English.",
  spanish: "Escribe en español.", german: "Schreibe auf Deutsch.",
  italian: "Scrivi in italiano.", portuguese: "Escreve em português.",
  japanese: "日本語で書いてください。", chinese: "请用中文写作。",
};
const narratorLabels = {
  first:  "à la première personne (je/I)",
  third:  "à la troisième personne",
  second: "à la deuxième personne (tu/you)",
};
const endingLabels = {
  happy:       "heureuse et satisfaisante",
  tragic:      "tragique",
  twist:       "avec un retournement de situation inattendu",
  open:        "ouverte, laissant place à l'imagination",
  bittersweet: "douce-amère, mêlant joie et mélancolie",
  circular:    "circulaire, revenant au point de départ",
  cliffhanger: "en cliffhanger, suspense maximal",
  redemption:  "de rédemption",
  ambiguous:   "délibérément ambiguë",
  dark:        "sombre et nihiliste",
};

// ── UI Translations ────────────────────────────────────────────────
const UI_LANGS = {
  french: {
    appTitle:"Atelier des Récits",   appSub:"Écrivons ensemble une histoire",
    powered:"Propulsé par Claude AI",
    langLabel:"Langue d'écriture", durLabel:"Longueur du récit", genreLabel:"Genre(s) littéraire(s)",
    narratorLabel:"Point de vue narratif", customLabel:"Personnaliser l'histoire",
    includeLabel:"✦ Inclure", excludeLabel:"✕ Exclure",
    includePh:"Personnages, lieux, thèmes…", excludePh:"À éviter absolument…",
    generateBtn:"GÉNÉRER L'HISTOIRE", advMode:"Mode avancé", adultLabel:"🔞 Contenu adulte",
    writing:"Écriture de l'histoire…", writingSuite:"Écriture de la suite…",
    writingEnd:"Écriture de la fin…", closingChap:"Clôture du chapitre…",
    rewriting:"Réécriture en cours…", genTitle:"Génération du titre…",
    chapCount:(n)=>`${n} chapitre${n>1?"s":""}`, partCount:(n)=>`${n} partie${n>1?"s":""}`,
    wordCount:(n)=>`~${n.toLocaleString("fr-FR")} mots`, storyEnded:"Histoire terminée",
    customNext:"Personnaliser la suite", lengthLabel:"Longueur de la suite",
    chapSuggest:"✦ Ce moment semble propice à un nouveau chapitre",
    closeAndNew:"✕ Clore & nouveau chapitre", ignore:"Ignorer",
    continueBtn:"➜ Suite", endChapBtn:"✕ Fin de chapitre", endStoryBtn:"⬛ Fin de l'histoire",
    regenBtn:"↺ Régénérer", endingType:"Type de fin", confirmEnd:"✓ Confirmer et écrire la fin",
    chapClosed:(t)=>`✦ ${t} clos`, openChap:(l)=>`＋ Ouvrir ${l}`, regenEnd:"↺ Régénérer la fin",
    bookTitleLabel:"Titre du livre", titlePh:"Saisir un titre… (ou vide = auto IA)", titleHint:"Laissez vide pour que l'IA génère le titre",
    illustrateTitle:"ILLUSTRER MON LIVRE", illustrateDesc:"Ajoutez vos propres photos : couverture, illustrations, 4ème de couverture.",
    authorLabel:"Nom de l'auteur (optionnel)", authorPh:"Votre nom ou pseudonyme…",
    openEditor:"✦ Ouvrir l'éditeur du livre", viewBook:"👁 Voir le livre",
    saveLabel:"Sauvegarder", saveLocked:"🔒 Générez la fin pour débloquer",
    epubLabel:"📖 EPUB", withIllus:"🎨 Avec illustrations", textOnly:"📄 Texte seul",
    epubHint:"ℹ️ Ouvrez d'abord l'éditeur du livre",
    dlPdf:"⬇ Télécharger en PDF", dlBtn:"⬇ Télécharger",
    newStory:"← Nouvelle histoire", backBtn:"← Retour", previewTitle:"✦ APERÇU DU LIVRE ✦",
    noCover:"Aucune photo — titre seul", hasCover:"✓ Photo de couverture",
    chapIllus:(t)=>`Illustration — ${t}`, chapIllusHas:(t)=>`✓ Illustration — ${t}`,
    backCover:"4ème de couverture (optionnel)", backCoverHas:"✓ 4ème de couverture",
    addCover:"Ajouter une photo de couverture", addIllus:(t)=>`Ajouter une illustration — ${t}`,
    addBack:"Ajouter une image de 4ème de couverture", changeBtn:"✎ Changer",
    resumeLabel:"RÉSUMÉ", colophon:"ATELIER DES RÉCITS",
    preparingBook:"Préparation du livre…", generatingEpub:"Génération…",
    nsfwTitle:"Contenu adulte", nsfwPrompt:"Entrez le code d'accès",
    nsfwPh:"Code…", nsfwError:"Code incorrect", nsfwConfirm:"Confirmer", nsfwCancel:"Annuler",
    genreSelected:(n,l)=>`Genre(s) — ${n} · ${l}`,
    portrait:"Idéal : 800×1120 px", landscape:"Idéal : 1200×600 px",
    errorEmpty:"Réponse vide, veuillez réessayer.",
    errorPfx:"Erreur : ", errorTitle:"Erreur génération : ", errorEpub:"Erreur EPUB : ", errorDl:"Erreur téléchargement : ",
    htmlMsg:"✅ HTML téléchargé — ouvre dans un navigateur › Ctrl+P › Enregistrer en PDF",
    txtMsg:"✅ Fichier .txt téléchargé — ouvre dans Word et enregistre en .docx",
    preparing:"Préparation…",
    narrators:{ third:"3ème personne", first:"1ère personne", second:"2ème personne" },
    durations:[{v:"micro",l:"Micro",d:"~500 mots"},{v:"flash",l:"Flash",d:"~1 000 mots"},{v:"short",l:"Courte",d:"~2 000 mots"},{v:"long",l:"Longue",d:"~5 000 mots"}],
    genres:[{v:"fantasy",l:"Fantastique"},{v:"horror",l:"Horreur"},{v:"romance",l:"Romance"},{v:"scifi",l:"Science-fiction"},{v:"thriller",l:"Thriller"},{v:"comedy",l:"Comédie"},{v:"biography",l:"Biographie"},{v:"historical",l:"Historique"},{v:"uchronia",l:"Uchronie"},{v:"adventure",l:"Aventure"},{v:"mystery",l:"Mystère"},{v:"philosophical",l:"Philosophique"},{v:"children",l:"Histoire enfant"},{v:"fairytale",l:"Conte"},{v:"youngadult",l:"Jeune adulte"},{v:"erotic",l:"Érotique"}],
    endings:[{v:"happy",l:"Heureuse"},{v:"tragic",l:"Tragique"},{v:"twist",l:"Coup de théâtre"},{v:"open",l:"Ouverte"},{v:"bittersweet",l:"Douce-amère"},{v:"circular",l:"Circulaire"},{v:"cliffhanger",l:"Cliffhanger"},{v:"redemption",l:"Rédemption"},{v:"ambiguous",l:"Ambiguë"},{v:"dark",l:"Sombre"}],
  },
  english: {
    appTitle:"Story Workshop", appSub:"Your AI assistant to create stories",
    powered:"Powered by Claude AI",
    langLabel:"Writing language", durLabel:"Story length", genreLabel:"Literary genre(s)",
    narratorLabel:"Point of view", customLabel:"Customize the story",
    includeLabel:"✦ Include", excludeLabel:"✕ Exclude",
    includePh:"Characters, places, themes…", excludePh:"To avoid absolutely…",
    generateBtn:"GENERATE STORY", advMode:"Advanced mode", adultLabel:"🔞 Adult content",
    writing:"Writing the story…", writingSuite:"Writing the continuation…",
    writingEnd:"Writing the ending…", closingChap:"Closing the chapter…",
    rewriting:"Rewriting…", genTitle:"Generating title…",
    chapCount:(n)=>`${n} chapter${n>1?"s":""}`, partCount:(n)=>`${n} part${n>1?"s":""}`,
    wordCount:(n)=>`~${n.toLocaleString("en")} words`, storyEnded:"Story completed",
    customNext:"Customize the next part", lengthLabel:"Length",
    chapSuggest:"✦ This seems like a good moment for a new chapter",
    closeAndNew:"✕ Close & new chapter", ignore:"Ignore",
    continueBtn:"➜ Continue", endChapBtn:"✕ End chapter", endStoryBtn:"⬛ End story",
    regenBtn:"↺ Regenerate", endingType:"Ending type", confirmEnd:"✓ Confirm and write the ending",
    chapClosed:(t)=>`✦ ${t} closed`, openChap:(l)=>`＋ Open ${l}`, regenEnd:"↺ Regenerate ending",
    bookTitleLabel:"Book title", titlePh:"Enter a title… (or leave blank for AI generation)", titleHint:"Leave blank for the AI to generate a title",
    illustrateTitle:"ILLUSTRATE MY BOOK", illustrateDesc:"Add your own photos: cover, chapter illustrations, back cover.",
    authorLabel:"Author name (optional)", authorPh:"Your name or pen name…",
    openEditor:"✦ Open book editor", viewBook:"👁 View book",
    saveLabel:"Save", saveLocked:"🔒 Generate the ending to unlock",
    epubLabel:"📖 EPUB", withIllus:"🎨 With illustrations", textOnly:"📄 Text only",
    epubHint:"ℹ️ Open the book editor first",
    dlPdf:"⬇ Download as PDF", dlBtn:"⬇ Download",
    newStory:"← New story", backBtn:"← Back", previewTitle:"✦ BOOK PREVIEW ✦",
    noCover:"No photo — title only", hasCover:"✓ Cover photo added",
    chapIllus:(t)=>`Illustration — ${t}`, chapIllusHas:(t)=>`✓ Illustration — ${t}`,
    backCover:"Back cover (optional)", backCoverHas:"✓ Back cover",
    addCover:"Add a cover photo", addIllus:(t)=>`Add illustration — ${t}`,
    addBack:"Add a back cover image", changeBtn:"✎ Change",
    resumeLabel:"SUMMARY", colophon:"STORY WORKSHOP",
    preparingBook:"Preparing book…", generatingEpub:"Generating…",
    nsfwTitle:"Adult content", nsfwPrompt:"Enter access code",
    nsfwPh:"Code…", nsfwError:"Incorrect code", nsfwConfirm:"Confirm", nsfwCancel:"Cancel",
    genreSelected:(n,l)=>`Genre(s) — ${n} · ${l}`,
    portrait:"Ideal: 800×1120 px", landscape:"Ideal: 1200×600 px",
    errorEmpty:"Empty response, please try again.",
    errorPfx:"Error: ", errorTitle:"Generation error: ", errorEpub:"EPUB error: ", errorDl:"Download error: ",
    htmlMsg:"✅ HTML downloaded — open in browser › Ctrl+P › Save as PDF",
    txtMsg:"✅ .txt downloaded — open in Word and save as .docx",
    preparing:"Preparing…",
    narrators:{ third:"3rd person", first:"1st person", second:"2nd person" },
    durations:[{v:"micro",l:"Micro",d:"~500 words"},{v:"flash",l:"Flash",d:"~1,000 words"},{v:"short",l:"Short",d:"~2,000 words"},{v:"long",l:"Long",d:"~5,000 words"}],
    genres:[{v:"fantasy",l:"Fantasy"},{v:"horror",l:"Horror"},{v:"romance",l:"Romance"},{v:"scifi",l:"Sci-Fi"},{v:"thriller",l:"Thriller"},{v:"comedy",l:"Comedy"},{v:"biography",l:"Biography"},{v:"historical",l:"Historical"},{v:"uchronia",l:"Alternate History"},{v:"adventure",l:"Adventure"},{v:"mystery",l:"Mystery"},{v:"philosophical",l:"Philosophical"},{v:"children",l:"Children's story"},{v:"fairytale",l:"Fairy tale"},{v:"youngadult",l:"Young adult"},{v:"erotic",l:"Erotic"}],
    endings:[{v:"happy",l:"Happy"},{v:"tragic",l:"Tragic"},{v:"twist",l:"Twist"},{v:"open",l:"Open"},{v:"bittersweet",l:"Bittersweet"},{v:"circular",l:"Circular"},{v:"cliffhanger",l:"Cliffhanger"},{v:"redemption",l:"Redemption"},{v:"ambiguous",l:"Ambiguous"},{v:"dark",l:"Dark"}],
  },
  spanish: {
    appTitle:"Taller de Relatos", appSub:"Tu asistente IA para crear historias",
    powered:"Impulsado por Claude AI",
    langLabel:"Idioma de escritura", durLabel:"Duración del relato", genreLabel:"Género(s) literario(s)",
    narratorLabel:"Punto de vista narrativo", customLabel:"Personalizar la historia",
    includeLabel:"✦ Incluir", excludeLabel:"✕ Excluir",
    includePh:"Personajes, lugares, temas…", excludePh:"A evitar absolutamente…",
    generateBtn:"GENERAR HISTORIA", advMode:"Modo avanzado", adultLabel:"🔞 Contenido adulto",
    writing:"Escribiendo la historia…", writingSuite:"Escribiendo la continuación…",
    writingEnd:"Escribiendo el final…", closingChap:"Cerrando el capítulo…",
    rewriting:"Reescribiendo…", genTitle:"Generando título…",
    chapCount:(n)=>`${n} capítulo${n>1?"s":""}`, partCount:(n)=>`${n} parte${n>1?"s":""}`,
    wordCount:(n)=>`~${n.toLocaleString("es")} palabras`, storyEnded:"Historia terminada",
    customNext:"Personalizar la siguiente parte", lengthLabel:"Longitud",
    chapSuggest:"✦ Este parece un buen momento para un nuevo capítulo",
    closeAndNew:"✕ Cerrar & nuevo capítulo", ignore:"Ignorar",
    continueBtn:"➜ Continuar", endChapBtn:"✕ Fin de capítulo", endStoryBtn:"⬛ Fin de la historia",
    regenBtn:"↺ Regenerar", endingType:"Tipo de final", confirmEnd:"✓ Confirmar y escribir el final",
    chapClosed:(t)=>`✦ ${t} cerrado`, openChap:(l)=>`＋ Abrir ${l}`, regenEnd:"↺ Regenerar final",
    bookTitleLabel:"Título del libro", titlePh:"Escribe un título…", titleHint:"Deja en blanco para que la IA genere un título",
    illustrateTitle:"ILUSTRAR MI LIBRO", illustrateDesc:"Añade tus propias fotos: portada, ilustraciones, contraportada.",
    authorLabel:"Nombre del autor (opcional)", authorPh:"Tu nombre o seudónimo…",
    openEditor:"✦ Abrir el editor del libro", viewBook:"👁 Ver el libro",
    saveLabel:"Guardar", saveLocked:"🔒 Genera el final para desbloquear",
    epubLabel:"📖 EPUB", withIllus:"🎨 Con ilustraciones", textOnly:"📄 Solo texto",
    epubHint:"ℹ️ Abre primero el editor del libro",
    dlPdf:"⬇ Descargar como PDF", dlBtn:"⬇ Descargar",
    newStory:"← Nueva historia", backBtn:"← Volver", previewTitle:"✦ VISTA PREVIA ✦",
    noCover:"Sin foto — solo título", hasCover:"✓ Foto de portada añadida",
    chapIllus:(t)=>`Ilustración — ${t}`, chapIllusHas:(t)=>`✓ Ilustración — ${t}`,
    backCover:"Contraportada (opcional)", backCoverHas:"✓ Contraportada",
    addCover:"Añadir foto de portada", addIllus:(t)=>`Añadir ilustración — ${t}`,
    addBack:"Añadir imagen de contraportada", changeBtn:"✎ Cambiar",
    resumeLabel:"RESUMEN", colophon:"TALLER DE RELATOS",
    preparingBook:"Preparando el libro…", generatingEpub:"Generando…",
    nsfwTitle:"Contenido adulto", nsfwPrompt:"Introduce el código de acceso",
    nsfwPh:"Código…", nsfwError:"Código incorrecto", nsfwConfirm:"Confirmar", nsfwCancel:"Cancelar",
    genreSelected:(n,l)=>`Género(s) — ${n} · ${l}`,
    portrait:"Ideal: 800×1120 px", landscape:"Ideal: 1200×600 px",
    errorEmpty:"Respuesta vacía, inténtalo de nuevo.",
    errorPfx:"Error: ", errorTitle:"Error de generación: ", errorEpub:"Error EPUB: ", errorDl:"Error de descarga: ",
    htmlMsg:"✅ HTML descargado — abrir en navegador › Ctrl+P › Guardar como PDF",
    txtMsg:"✅ .txt descargado — abrir en Word y guardar como .docx",
    preparing:"Preparando…",
    narrators:{ third:"3ª persona", first:"1ª persona", second:"2ª persona" },
    durations:[{v:"micro",l:"Micro",d:"~500 palabras"},{v:"flash",l:"Flash",d:"~1.000 palabras"},{v:"short",l:"Corto",d:"~2.000 palabras"},{v:"long",l:"Largo",d:"~5.000 palabras"}],
    genres:[{v:"fantasy",l:"Fantasía"},{v:"horror",l:"Terror"},{v:"romance",l:"Romance"},{v:"scifi",l:"Ciencia ficción"},{v:"thriller",l:"Thriller"},{v:"comedy",l:"Comedia"},{v:"biography",l:"Biografía"},{v:"historical",l:"Histórico"},{v:"uchronia",l:"Ucronía"},{v:"adventure",l:"Aventura"},{v:"mystery",l:"Misterio"},{v:"philosophical",l:"Filosófico"},{v:"children",l:"Historia infantil"},{v:"fairytale",l:"Cuento"},{v:"youngadult",l:"Joven adulto"},{v:"erotic",l:"Erótico"}],
    endings:[{v:"happy",l:"Feliz"},{v:"tragic",l:"Trágico"},{v:"twist",l:"Giro"},{v:"open",l:"Abierto"},{v:"bittersweet",l:"Agridulce"},{v:"circular",l:"Circular"},{v:"cliffhanger",l:"Cliffhanger"},{v:"redemption",l:"Redención"},{v:"ambiguous",l:"Ambiguo"},{v:"dark",l:"Oscuro"}],
  },
  german: {
    appTitle:"Schreibwerkstatt", appSub:"Ihr KI-Assistent für Geschichten",
    powered:"Powered by Claude AI",
    langLabel:"Schreibsprache", durLabel:"Länge der Geschichte", genreLabel:"Literarisches Genre",
    narratorLabel:"Erzählperspektive", customLabel:"Geschichte anpassen",
    includeLabel:"✦ Einschließen", excludeLabel:"✕ Ausschließen",
    includePh:"Charaktere, Orte, Themen…", excludePh:"Unbedingt vermeiden…",
    generateBtn:"GESCHICHTE GENERIEREN", advMode:"Erweiterter Modus", adultLabel:"🔞 Für Erwachsene",
    writing:"Geschichte wird geschrieben…", writingSuite:"Fortsetzung wird geschrieben…",
    writingEnd:"Ende wird geschrieben…", closingChap:"Kapitel wird abgeschlossen…",
    rewriting:"Wird neu geschrieben…", genTitle:"Titel wird generiert…",
    chapCount:(n)=>`${n} Kapitel`, partCount:(n)=>`${n} Teil${n>1?"e":""}`,
    wordCount:(n)=>`~${n.toLocaleString("de")} Wörter`, storyEnded:"Geschichte abgeschlossen",
    customNext:"Nächsten Teil anpassen", lengthLabel:"Länge",
    chapSuggest:"✦ Jetzt wäre ein guter Moment für ein neues Kapitel",
    closeAndNew:"✕ Schließen & neues Kapitel", ignore:"Ignorieren",
    continueBtn:"➜ Weiter", endChapBtn:"✕ Kapitel beenden", endStoryBtn:"⬛ Geschichte beenden",
    regenBtn:"↺ Neu generieren", endingType:"Art des Endes", confirmEnd:"✓ Bestätigen und Ende schreiben",
    chapClosed:(t)=>`✦ ${t} abgeschlossen`, openChap:(l)=>`＋ ${l} öffnen`, regenEnd:"↺ Ende neu generieren",
    bookTitleLabel:"Buchtitel", titlePh:"Titel eingeben…", titleHint:"Leer lassen, damit die KI einen Titel generiert",
    illustrateTitle:"MEIN BUCH ILLUSTRIEREN", illustrateDesc:"Eigene Fotos hinzufügen: Umschlag, Kapitelillustrationen, Rückseite.",
    authorLabel:"Autorenname (optional)", authorPh:"Ihr Name oder Pseudonym…",
    openEditor:"✦ Buch-Editor öffnen", viewBook:"👁 Buch ansehen",
    saveLabel:"Speichern", saveLocked:"🔒 Generieren Sie das Ende zum Entsperren",
    epubLabel:"📖 EPUB", withIllus:"🎨 Mit Illustrationen", textOnly:"📄 Nur Text",
    epubHint:"ℹ️ Öffnen Sie zuerst den Buch-Editor",
    dlPdf:"⬇ Als PDF herunterladen", dlBtn:"⬇ Herunterladen",
    newStory:"← Neue Geschichte", backBtn:"← Zurück", previewTitle:"✦ BUCHVORSCHAU ✦",
    noCover:"Kein Foto — nur Titel", hasCover:"✓ Titelbild hinzugefügt",
    chapIllus:(t)=>`Illustration — ${t}`, chapIllusHas:(t)=>`✓ Illustration — ${t}`,
    backCover:"Rückseite (optional)", backCoverHas:"✓ Rückseite",
    addCover:"Titelbild hinzufügen", addIllus:(t)=>`Illustration für ${t} hinzufügen`,
    addBack:"Rückseitenbild hinzufügen", changeBtn:"✎ Ändern",
    resumeLabel:"ZUSAMMENFASSUNG", colophon:"SCHREIBWERKSTATT",
    preparingBook:"Buch wird vorbereitet…", generatingEpub:"Wird generiert…",
    nsfwTitle:"Inhalte für Erwachsene", nsfwPrompt:"Zugangscode eingeben",
    nsfwPh:"Code…", nsfwError:"Falscher Code", nsfwConfirm:"Bestätigen", nsfwCancel:"Abbrechen",
    genreSelected:(n,l)=>`Genre(s) — ${n} · ${l}`,
    portrait:"Ideal: 800×1120 px", landscape:"Ideal: 1200×600 px",
    errorEmpty:"Leere Antwort, bitte erneut versuchen.",
    errorPfx:"Fehler: ", errorTitle:"Generierungsfehler: ", errorEpub:"EPUB-Fehler: ", errorDl:"Download-Fehler: ",
    htmlMsg:"✅ HTML heruntergeladen — im Browser öffnen › Strg+P › Als PDF speichern",
    txtMsg:"✅ .txt heruntergeladen — in Word öffnen und als .docx speichern",
    preparing:"Wird vorbereitet…",
    narrators:{ third:"3. Person", first:"1. Person", second:"2. Person" },
    durations:[{v:"micro",l:"Mikro",d:"~500 Wörter"},{v:"flash",l:"Flash",d:"~1.000 Wörter"},{v:"short",l:"Kurz",d:"~2.000 Wörter"},{v:"long",l:"Lang",d:"~5.000 Wörter"}],
    genres:[{v:"fantasy",l:"Fantasy"},{v:"horror",l:"Horror"},{v:"romance",l:"Liebesroman"},{v:"scifi",l:"Science-Fiction"},{v:"thriller",l:"Thriller"},{v:"comedy",l:"Komödie"},{v:"biography",l:"Biografie"},{v:"historical",l:"Historisch"},{v:"uchronia",l:"Uchronie"},{v:"adventure",l:"Abenteuer"},{v:"mystery",l:"Krimi"},{v:"philosophical",l:"Philosophisch"},{v:"children",l:"Kindergeschichte"},{v:"fairytale",l:"Märchen"},{v:"youngadult",l:"Jugendliteratur"},{v:"erotic",l:"Erotisch"}],
    endings:[{v:"happy",l:"Glücklich"},{v:"tragic",l:"Tragisch"},{v:"twist",l:"Wendung"},{v:"open",l:"Offen"},{v:"bittersweet",l:"Bittersüß"},{v:"circular",l:"Kreisförmig"},{v:"cliffhanger",l:"Cliffhanger"},{v:"redemption",l:"Erlösung"},{v:"ambiguous",l:"Mehrdeutig"},{v:"dark",l:"Düster"}],
  },
  italian: {
    appTitle:"Laboratorio dei Racconti", appSub:"Il tuo assistente IA per creare storie",
    powered:"Alimentato da Claude AI",
    langLabel:"Lingua di scrittura", durLabel:"Lunghezza del racconto", genreLabel:"Genere(i) letterario(i)",
    narratorLabel:"Punto di vista narrativo", customLabel:"Personalizza la storia",
    includeLabel:"✦ Includere", excludeLabel:"✕ Escludere",
    includePh:"Personaggi, luoghi, temi…", excludePh:"Da evitare assolutamente…",
    generateBtn:"GENERA LA STORIA", advMode:"Modalità avanzata", adultLabel:"🔞 Contenuto adulto",
    writing:"Scrittura della storia…", writingSuite:"Scrittura del seguito…",
    writingEnd:"Scrittura del finale…", closingChap:"Chiusura del capitolo…",
    rewriting:"Riscrittura in corso…", genTitle:"Generazione del titolo…",
    chapCount:(n)=>`${n} capitolo${n>1?"i":""}`, partCount:(n)=>`${n} parte${n>1?"i":""}`,
    wordCount:(n)=>`~${n.toLocaleString("it")} parole`, storyEnded:"Storia completata",
    customNext:"Personalizza la prossima parte", lengthLabel:"Lunghezza",
    chapSuggest:"✦ Questo sembra un buon momento per un nuovo capitolo",
    closeAndNew:"✕ Chiudi & nuovo capitolo", ignore:"Ignora",
    continueBtn:"➜ Continua", endChapBtn:"✕ Fine capitolo", endStoryBtn:"⬛ Fine storia",
    regenBtn:"↺ Rigenera", endingType:"Tipo di finale", confirmEnd:"✓ Conferma e scrivi il finale",
    chapClosed:(t)=>`✦ ${t} chiuso`, openChap:(l)=>`＋ Apri ${l}`, regenEnd:"↺ Rigenera finale",
    bookTitleLabel:"Titolo del libro", titlePh:"Inserisci un titolo…", titleHint:"Lascia vuoto per la generazione automatica",
    illustrateTitle:"ILLUSTRARE IL MIO LIBRO", illustrateDesc:"Aggiungi le tue foto: copertina, illustrazioni, quarta di copertina.",
    authorLabel:"Nome dell'autore (opzionale)", authorPh:"Il tuo nome o pseudonimo…",
    openEditor:"✦ Apri l'editor del libro", viewBook:"👁 Vedi il libro",
    saveLabel:"Salva", saveLocked:"🔒 Genera il finale per sbloccare",
    epubLabel:"📖 EPUB", withIllus:"🎨 Con illustrazioni", textOnly:"📄 Solo testo",
    epubHint:"ℹ️ Apri prima l'editor del libro",
    dlPdf:"⬇ Scarica come PDF", dlBtn:"⬇ Scarica",
    newStory:"← Nuova storia", backBtn:"← Indietro", previewTitle:"✦ ANTEPRIMA ✦",
    noCover:"Nessuna foto — solo titolo", hasCover:"✓ Foto di copertina",
    chapIllus:(t)=>`Illustrazione — ${t}`, chapIllusHas:(t)=>`✓ Illustrazione — ${t}`,
    backCover:"Quarta di copertina (opzionale)", backCoverHas:"✓ Quarta di copertina",
    addCover:"Aggiungi foto di copertina", addIllus:(t)=>`Aggiungi illustrazione — ${t}`,
    addBack:"Aggiungi immagine di quarta", changeBtn:"✎ Cambia",
    resumeLabel:"RIASSUNTO", colophon:"LABORATORIO DEI RACCONTI",
    preparingBook:"Preparazione del libro…", generatingEpub:"Generazione…",
    nsfwTitle:"Contenuto adulto", nsfwPrompt:"Inserisci il codice di accesso",
    nsfwPh:"Codice…", nsfwError:"Codice errato", nsfwConfirm:"Conferma", nsfwCancel:"Annulla",
    genreSelected:(n,l)=>`Genere(i) — ${n} · ${l}`,
    portrait:"Ideale: 800×1120 px", landscape:"Ideale: 1200×600 px",
    errorEmpty:"Risposta vuota, riprova.",
    errorPfx:"Errore: ", errorTitle:"Errore di generazione: ", errorEpub:"Errore EPUB: ", errorDl:"Errore download: ",
    htmlMsg:"✅ HTML scaricato — apri nel browser › Ctrl+P › Salva come PDF",
    txtMsg:"✅ .txt scaricato — apri in Word e salva come .docx",
    preparing:"Preparazione…",
    narrators:{ third:"3ª persona", first:"1ª persona", second:"2ª persona" },
    durations:[{v:"micro",l:"Micro",d:"~500 parole"},{v:"flash",l:"Flash",d:"~1.000 parole"},{v:"short",l:"Breve",d:"~2.000 parole"},{v:"long",l:"Lungo",d:"~5.000 parole"}],
    genres:[{v:"fantasy",l:"Fantasy"},{v:"horror",l:"Horror"},{v:"romance",l:"Romance"},{v:"scifi",l:"Fantascienza"},{v:"thriller",l:"Thriller"},{v:"comedy",l:"Commedia"},{v:"biography",l:"Biografia"},{v:"historical",l:"Storico"},{v:"uchronia",l:"Ucronia"},{v:"adventure",l:"Avventura"},{v:"mystery",l:"Mistero"},{v:"philosophical",l:"Filosofico"},{v:"children",l:"Storia per bambini"},{v:"fairytale",l:"Fiaba"},{v:"youngadult",l:"Young adult"},{v:"erotic",l:"Erotico"}],
    endings:[{v:"happy",l:"Felice"},{v:"tragic",l:"Tragico"},{v:"twist",l:"Colpo di scena"},{v:"open",l:"Aperto"},{v:"bittersweet",l:"Agrodolce"},{v:"circular",l:"Circolare"},{v:"cliffhanger",l:"Cliffhanger"},{v:"redemption",l:"Redenzione"},{v:"ambiguous",l:"Ambiguo"},{v:"dark",l:"Oscuro"}],
  },
  portuguese: {
    appTitle:"Ateliê de Histórias", appSub:"Seu assistente IA para criar histórias",
    powered:"Alimentado por Claude AI",
    langLabel:"Idioma de escrita", durLabel:"Duração da história", genreLabel:"Género(s) literário(s)",
    narratorLabel:"Ponto de vista narrativo", customLabel:"Personalizar a história",
    includeLabel:"✦ Incluir", excludeLabel:"✕ Excluir",
    includePh:"Personagens, lugares, temas…", excludePh:"A evitar absolutamente…",
    generateBtn:"GERAR HISTÓRIA", advMode:"Modo avançado", adultLabel:"🔞 Conteúdo adulto",
    writing:"A escrever a história…", writingSuite:"A escrever a continuação…",
    writingEnd:"A escrever o final…", closingChap:"A fechar o capítulo…",
    rewriting:"A reescrever…", genTitle:"A gerar título…",
    chapCount:(n)=>`${n} capítulo${n>1?"s":""}`, partCount:(n)=>`${n} parte${n>1?"s":""}`,
    wordCount:(n)=>`~${n.toLocaleString("pt")} palavras`, storyEnded:"História terminada",
    customNext:"Personalizar a próxima parte", lengthLabel:"Comprimento",
    chapSuggest:"✦ Este parece um bom momento para um novo capítulo",
    closeAndNew:"✕ Fechar & novo capítulo", ignore:"Ignorar",
    continueBtn:"➜ Continuar", endChapBtn:"✕ Fim de capítulo", endStoryBtn:"⬛ Fim da história",
    regenBtn:"↺ Regenerar", endingType:"Tipo de final", confirmEnd:"✓ Confirmar e escrever o final",
    chapClosed:(t)=>`✦ ${t} fechado`, openChap:(l)=>`＋ Abrir ${l}`, regenEnd:"↺ Regenerar final",
    bookTitleLabel:"Título do livro", titlePh:"Escreva um título…", titleHint:"Deixe em branco para geração automática",
    illustrateTitle:"ILUSTRAR O MEU LIVRO", illustrateDesc:"Adicione as suas fotos: capa, ilustrações, contracapa.",
    authorLabel:"Nome do autor (opcional)", authorPh:"O seu nome ou pseudónimo…",
    openEditor:"✦ Abrir o editor do livro", viewBook:"👁 Ver o livro",
    saveLabel:"Guardar", saveLocked:"🔒 Gere o final para desbloquear",
    epubLabel:"📖 EPUB", withIllus:"🎨 Com ilustrações", textOnly:"📄 Só texto",
    epubHint:"ℹ️ Abra primeiro o editor do livro",
    dlPdf:"⬇ Descarregar como PDF", dlBtn:"⬇ Descarregar",
    newStory:"← Nova história", backBtn:"← Voltar", previewTitle:"✦ PRÉ-VISUALIZAÇÃO ✦",
    noCover:"Sem foto — só título", hasCover:"✓ Foto de capa adicionada",
    chapIllus:(t)=>`Ilustração — ${t}`, chapIllusHas:(t)=>`✓ Ilustração — ${t}`,
    backCover:"Contracapa (opcional)", backCoverHas:"✓ Contracapa",
    addCover:"Adicionar foto de capa", addIllus:(t)=>`Adicionar ilustração — ${t}`,
    addBack:"Adicionar imagem de contracapa", changeBtn:"✎ Alterar",
    resumeLabel:"RESUMO", colophon:"ATELIÊ DE HISTÓRIAS",
    preparingBook:"A preparar o livro…", generatingEpub:"A gerar…",
    nsfwTitle:"Conteúdo adulto", nsfwPrompt:"Introduza o código de acesso",
    nsfwPh:"Código…", nsfwError:"Código incorreto", nsfwConfirm:"Confirmar", nsfwCancel:"Cancelar",
    genreSelected:(n,l)=>`Género(s) — ${n} · ${l}`,
    portrait:"Ideal: 800×1120 px", landscape:"Ideal: 1200×600 px",
    errorEmpty:"Resposta vazia, tente novamente.",
    errorPfx:"Erro: ", errorTitle:"Erro de geração: ", errorEpub:"Erro EPUB: ", errorDl:"Erro de download: ",
    htmlMsg:"✅ HTML descarregado — abrir no navegador › Ctrl+P › Guardar como PDF",
    txtMsg:"✅ .txt descarregado — abrir no Word e guardar como .docx",
    preparing:"A preparar…",
    narrators:{ third:"3ª pessoa", first:"1ª pessoa", second:"2ª pessoa" },
    durations:[{v:"micro",l:"Micro",d:"~500 palavras"},{v:"flash",l:"Flash",d:"~1.000 palavras"},{v:"short",l:"Curta",d:"~2.000 palavras"},{v:"long",l:"Longa",d:"~5.000 palavras"}],
    genres:[{v:"fantasy",l:"Fantasia"},{v:"horror",l:"Terror"},{v:"romance",l:"Romance"},{v:"scifi",l:"Ficção científica"},{v:"thriller",l:"Thriller"},{v:"comedy",l:"Comédia"},{v:"biography",l:"Biografia"},{v:"historical",l:"Histórico"},{v:"uchronia",l:"Ucronía"},{v:"adventure",l:"Aventura"},{v:"mystery",l:"Mistério"},{v:"philosophical",l:"Filosófico"},{v:"children",l:"História infantil"},{v:"fairytale",l:"Conto de fadas"},{v:"youngadult",l:"Jovem adulto"},{v:"erotic",l:"Erótico"}],
    endings:[{v:"happy",l:"Feliz"},{v:"tragic",l:"Trágico"},{v:"twist",l:"Reviravolta"},{v:"open",l:"Aberto"},{v:"bittersweet",l:"Agridoce"},{v:"circular",l:"Circular"},{v:"cliffhanger",l:"Cliffhanger"},{v:"redemption",l:"Redenção"},{v:"ambiguous",l:"Ambíguo"},{v:"dark",l:"Sombrio"}],
  },
  japanese: {
    appTitle:"物語工房", appSub:"AIがあなたの物語を創ります",
    powered:"Claude AI搭載",
    langLabel:"執筆言語", durLabel:"物語の長さ", genreLabel:"ジャンル",
    narratorLabel:"語り口", customLabel:"物語をカスタマイズ",
    includeLabel:"✦ 含める", excludeLabel:"✕ 除外する",
    includePh:"キャラクター、場所、テーマ…", excludePh:"絶対に避けること…",
    generateBtn:"物語を生成", advMode:"詳細モード", adultLabel:"🔞 成人向け",
    writing:"物語を執筆中…", writingSuite:"続きを執筆中…",
    writingEnd:"結末を執筆中…", closingChap:"章を閉じています…",
    rewriting:"書き直し中…", genTitle:"タイトルを生成中…",
    chapCount:(n)=>`${n}章`, partCount:(n)=>`${n}パート`,
    wordCount:(n)=>`約${n.toLocaleString("ja")}語`, storyEnded:"物語完成",
    customNext:"次のパートをカスタマイズ", lengthLabel:"長さ",
    chapSuggest:"✦ 新しい章を始めるのに良い場面です",
    closeAndNew:"✕ 章を閉じて新しい章へ", ignore:"無視",
    continueBtn:"➜ 続き", endChapBtn:"✕ 章の終わり", endStoryBtn:"⬛ 物語の終わり",
    regenBtn:"↺ 再生成", endingType:"結末の種類", confirmEnd:"✓ 確認して結末を書く",
    chapClosed:(t)=>`✦ ${t}完結`, openChap:(l)=>`＋ ${l}を開く`, regenEnd:"↺ 結末を再生成",
    bookTitleLabel:"本のタイトル", titlePh:"タイトルを入力…（空白でAI自動生成）", titleHint:"空白のままにするとAIがタイトルを生成します",
    illustrateTitle:"本をイラスト化", illustrateDesc:"自分の写真を追加：表紙、章ごとのイラスト、裏表紙。",
    authorLabel:"著者名（任意）", authorPh:"あなたの名前またはペンネーム…",
    openEditor:"✦ 本のエディタを開く", viewBook:"👁 本を見る",
    saveLabel:"保存", saveLocked:"🔒 結末を生成してロック解除",
    epubLabel:"📖 EPUB", withIllus:"🎨 イラスト付き", textOnly:"📄 テキストのみ",
    epubHint:"ℹ️ まず本のエディタを開いてください",
    dlPdf:"⬇ PDFダウンロード", dlBtn:"⬇ ダウンロード",
    newStory:"← 新しい物語", backBtn:"← 戻る", previewTitle:"✦ 本のプレビュー ✦",
    noCover:"写真なし — タイトルのみ", hasCover:"✓ 表紙写真追加済み",
    chapIllus:(t)=>`イラスト — ${t}`, chapIllusHas:(t)=>`✓ イラスト — ${t}`,
    backCover:"裏表紙（任意）", backCoverHas:"✓ 裏表紙",
    addCover:"表紙写真を追加", addIllus:(t)=>`${t}のイラストを追加`,
    addBack:"裏表紙画像を追加", changeBtn:"✎ 変更",
    resumeLabel:"あらすじ", colophon:"物語工房",
    preparingBook:"本を準備中…", generatingEpub:"生成中…",
    nsfwTitle:"成人向けコンテンツ", nsfwPrompt:"アクセスコードを入力",
    nsfwPh:"コード…", nsfwError:"コードが違います", nsfwConfirm:"確認", nsfwCancel:"キャンセル",
    genreSelected:(n,l)=>`ジャンル — ${n} · ${l}`,
    portrait:"推奨: 800×1120 px", landscape:"推奨: 1200×600 px",
    errorEmpty:"空の応答です。もう一度お試しください。",
    errorPfx:"エラー: ", errorTitle:"生成エラー: ", errorEpub:"EPUBエラー: ", errorDl:"ダウンロードエラー: ",
    htmlMsg:"✅ HTMLダウンロード済 — ブラウザで開く › Ctrl+P › PDFとして保存",
    txtMsg:"✅ .txtダウンロード済 — Wordで開いて.docxとして保存",
    preparing:"準備中…",
    narrators:{ third:"三人称", first:"一人称", second:"二人称" },
    durations:[{v:"micro",l:"マイクロ",d:"約500語"},{v:"flash",l:"フラッシュ",d:"約1,000語"},{v:"short",l:"短編",d:"約2,000語"},{v:"long",l:"長編",d:"約5,000語"}],
    genres:[{v:"fantasy",l:"ファンタジー"},{v:"horror",l:"ホラー"},{v:"romance",l:"ロマンス"},{v:"scifi",l:"SF"},{v:"thriller",l:"スリラー"},{v:"comedy",l:"コメディ"},{v:"biography",l:"伝記"},{v:"historical",l:"歴史"},{v:"uchronia",l:"架空歴史"},{v:"adventure",l:"冒険"},{v:"mystery",l:"ミステリー"},{v:"philosophical",l:"哲学"},{v:"children",l:"児童文学"},{v:"fairytale",l:"おとぎ話"},{v:"youngadult",l:"ヤングアダルト"},{v:"erotic",l:"官能"}],
    endings:[{v:"happy",l:"ハッピー"},{v:"tragic",l:"悲劇"},{v:"twist",l:"どんでん返し"},{v:"open",l:"オープン"},{v:"bittersweet",l:"甘くて苦い"},{v:"circular",l:"円環的"},{v:"cliffhanger",l:"クリフハンガー"},{v:"redemption",l:"救済"},{v:"ambiguous",l:"曖昧"},{v:"dark",l:"ダーク"}],
  },
  chinese: {
    appTitle:"故事工坊", appSub:"您的AI故事创作助手",
    powered:"由Claude AI驱动",
    langLabel:"写作语言", durLabel:"故事长度", genreLabel:"文学类型",
    narratorLabel:"叙事视角", customLabel:"自定义故事",
    includeLabel:"✦ 包含", excludeLabel:"✕ 排除",
    includePh:"人物、地点、主题…", excludePh:"绝对避免…",
    generateBtn:"生成故事", advMode:"高级模式", adultLabel:"🔞 成人内容",
    writing:"正在写故事…", writingSuite:"正在写续集…",
    writingEnd:"正在写结局…", closingChap:"正在关闭章节…",
    rewriting:"正在重写…", genTitle:"正在生成标题…",
    chapCount:(n)=>`${n}章`, partCount:(n)=>`${n}部分`,
    wordCount:(n)=>`约${n.toLocaleString("zh")}字`, storyEnded:"故事完成",
    customNext:"自定义下一部分", lengthLabel:"长度",
    chapSuggest:"✦ 现在是开始新章节的好时机",
    closeAndNew:"✕ 关闭并新建章节", ignore:"忽略",
    continueBtn:"➜ 继续", endChapBtn:"✕ 章节结束", endStoryBtn:"⬛ 故事结束",
    regenBtn:"↺ 重新生成", endingType:"结局类型", confirmEnd:"✓ 确认并写结局",
    chapClosed:(t)=>`✦ ${t}已完结`, openChap:(l)=>`＋ 开启${l}`, regenEnd:"↺ 重新生成结局",
    bookTitleLabel:"书名", titlePh:"输入标题…（或留空让AI自动生成）", titleHint:"留空让AI生成标题",
    illustrateTitle:"为我的书配图", illustrateDesc:"添加您自己的照片：封面、章节插图、封底。",
    authorLabel:"作者姓名（可选）", authorPh:"您的姓名或笔名…",
    openEditor:"✦ 打开书籍编辑器", viewBook:"👁 查看书籍",
    saveLabel:"保存", saveLocked:"🔒 生成结局以解锁",
    epubLabel:"📖 EPUB", withIllus:"🎨 含插图", textOnly:"📄 纯文本",
    epubHint:"ℹ️ 请先打开书籍编辑器",
    dlPdf:"⬇ 下载为PDF", dlBtn:"⬇ 下载",
    newStory:"← 新故事", backBtn:"← 返回", previewTitle:"✦ 书籍预览 ✦",
    noCover:"无照片 — 只显示标题", hasCover:"✓ 封面照片已添加",
    chapIllus:(t)=>`插图 — ${t}`, chapIllusHas:(t)=>`✓ 插图 — ${t}`,
    backCover:"封底（可选）", backCoverHas:"✓ 封底",
    addCover:"点击添加封面照片", addIllus:(t)=>`为${t}添加插图`,
    addBack:"添加封底图片", changeBtn:"✎ 更改",
    resumeLabel:"简介", colophon:"故事工坊",
    preparingBook:"正在准备书籍…", generatingEpub:"生成中…",
    nsfwTitle:"成人内容", nsfwPrompt:"请输入访问码",
    nsfwPh:"访问码…", nsfwError:"访问码错误", nsfwConfirm:"确认", nsfwCancel:"取消",
    genreSelected:(n,l)=>`类型 — ${n} · ${l}`,
    portrait:"理想: 800×1120 px", landscape:"理想: 1200×600 px",
    errorEmpty:"响应为空，请重试。",
    errorPfx:"错误：", errorTitle:"生成错误：", errorEpub:"EPUB错误：", errorDl:"下载错误：",
    htmlMsg:"✅ HTML已下载 — 在浏览器中打开 › Ctrl+P › 保存为PDF",
    txtMsg:"✅ .txt已下载 — 在Word中打开并保存为.docx",
    preparing:"准备中…",
    narrators:{ third:"第三人称", first:"第一人称", second:"第二人称" },
    durations:[{v:"micro",l:"微型",d:"约500字"},{v:"flash",l:"闪小说",d:"约1000字"},{v:"short",l:"短篇",d:"约2000字"},{v:"long",l:"长篇",d:"约5000字"}],
    genres:[{v:"fantasy",l:"奇幻"},{v:"horror",l:"恐怖"},{v:"romance",l:"言情"},{v:"scifi",l:"科幻"},{v:"thriller",l:"悬疑"},{v:"comedy",l:"喜剧"},{v:"biography",l:"传记"},{v:"historical",l:"历史"},{v:"uchronia",l:"架空历史"},{v:"adventure",l:"冒险"},{v:"mystery",l:"推理"},{v:"philosophical",l:"哲学"},{v:"children",l:"儿童故事"},{v:"fairytale",l:"童话"},{v:"youngadult",l:"青少年"},{v:"erotic",l:"情色"}],
    endings:[{v:"happy",l:"快乐"},{v:"tragic",l:"悲剧"},{v:"twist",l:"反转"},{v:"open",l:"开放"},{v:"bittersweet",l:"苦乐参半"},{v:"circular",l:"循环"},{v:"cliffhanger",l:"悬念"},{v:"redemption",l:"救赎"},{v:"ambiguous",l:"模糊"},{v:"dark",l:"黑暗"}],
  },
};


const NSFW_PASSWORD = "789275";

// ── Pure-JS PDF Generator (no CDN) ───────────────────────────────
// Generates a real PDF/1.4 file with proper text layout, pagination, and headers
async function generatePdfBlob({ title, author, genreStr, chapters, parts, coverDataUrl = null, backCoverDataUrl = null, images = {}, summary = "", preface = null, credits = null, bookCharacters = [], typo = {}, folio = {}, tocConfig = { show: true, position: "start" }, coverStyle = {} }) {

  // ── Base64 dataURL → raw bytes ──────────────────────────────────
  const dataUrlToBytes = (dataUrl) => {
    if (!dataUrl) return null;
    const b64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  };

  // ── JPEG dimensions from raw bytes ─────────────────────────────
  const jpegSize = (bytes) => {
    if (!bytes || bytes[0] !== 0xFF || bytes[1] !== 0xD8) return { w: 600, h: 400 };
    let i = 2;
    while (i < bytes.length - 8) {
      if (bytes[i] !== 0xFF) break;
      const marker = bytes[i + 1];
      const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
      if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) ||
          (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)) {
        return { h: (bytes[i+5] << 8) | bytes[i+6], w: (bytes[i+7] << 8) | bytes[i+8] };
      }
      i += 2 + segLen;
    }
    return { w: 600, h: 400 };
  };

  // ── PNG dimensions from raw bytes ──────────────────────────────
  const pngSize = (bytes) => {
    if (!bytes || bytes.length < 24) return { w: 600, h: 400 };
    const w = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
    const h = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
    return { w, h };
  };

  // ── Detect image type ──────────────────────────────────────────
  // Retourne { bytes (JPEG), w, h } — convertit PNG/WebP en JPEG via canvas si besoin
  const imgInfo = (dataUrl, bytes) => {
    if (!bytes || !dataUrl) return null;
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
    const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
    const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45; // WEBP
    if (!isPng && !isJpeg && !isWebp) return null;
    if (isJpeg) {
      const size = jpegSize(bytes);
      return { bytes, ...size };
    }
    // PNG ou WebP : convertir en JPEG via canvas (synchrone impossible ici — on retourne null)
    // → sera géré en amont via prepareImageDataUrl (async)
    return null;
  };

  // Version async : convertit n'importe quelle dataUrl image en JPEG dataUrl via canvas
  const toJpegDataUrl = (dataUrl) => new Promise((resolve) => {
    if (!dataUrl) { resolve(null); return; }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });

  // WinAnsiEncoding map for French characters
  const winAnsiMap = {
    0xC0:0xC0,0xC1:0xC1,0xC2:0xC2,0xC3:0xC3,0xC4:0xC4,0xC5:0xC5,0xC6:0xC6,0xC7:0xC7,
    0xC8:0xC8,0xC9:0xC9,0xCA:0xCA,0xCB:0xCB,0xCC:0xCC,0xCD:0xCD,0xCE:0xCE,0xCF:0xCF,
    0xD0:0xD0,0xD1:0xD1,0xD2:0xD2,0xD3:0xD3,0xD4:0xD4,0xD5:0xD5,0xD6:0xD6,0xD7:0xD7,
    0xD8:0xD8,0xD9:0xD9,0xDA:0xDA,0xDB:0xDB,0xDC:0xDC,0xDD:0xDD,0xDE:0xDE,0xDF:0xDF,
    0xE0:0xE0,0xE1:0xE1,0xE2:0xE2,0xE3:0xE3,0xE4:0xE4,0xE5:0xE5,0xE6:0xE6,0xE7:0xE7,
    0xE8:0xE8,0xE9:0xE9,0xEA:0xEA,0xEB:0xEB,0xEC:0xEC,0xED:0xED,0xEE:0xEE,0xEF:0xEF,
    0xF0:0xF0,0xF1:0xF1,0xF2:0xF2,0xF3:0xF3,0xF4:0xF4,0xF5:0xF5,0xF6:0xF6,0xF7:0xF7,
    0xF8:0xF8,0xF9:0xF9,0xFA:0xFA,0xFB:0xFB,0xFC:0xFC,0xFD:0xFD,0xFE:0xFE,0xFF:0xFF,
    0x152:0x8C,0x153:0x9C,0x160:0x8A,0x161:0x9A,0x178:0x9F,0x17D:0x8E,0x17E:0x9E,
    0x2013:0x96,0x2014:0x97,0x2018:0x91,0x2019:0x92,0x201A:0x82,0x201C:0x93,0x201D:0x94,
    0x2020:0x86,0x2021:0x87,0x2022:0x95,0x2026:0x85,0x2030:0x89,0x20AC:0x80,
  };

  const toWinAnsi = (str) => {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const cp = str.codePointAt(i);
      if (cp > 0xFFFF) i++;
      if (cp < 0x80) bytes.push(cp);
      else if (cp >= 0x80 && cp <= 0xFF) bytes.push(cp);
      else if (winAnsiMap[cp] !== undefined) bytes.push(winAnsiMap[cp]);
      else bytes.push(0x3F);
    }
    return bytes;
  };

  const escStr = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const bufParts = [];
  const textEnc = new TextEncoder();
  const appendStr = (s) => bufParts.push(textEnc.encode(s));
  const appendBytes = (b) => bufParts.push(b instanceof Uint8Array ? b : new Uint8Array(b));
  const getOffset = () => { let off = 0; for (let pi2 = 0; pi2 < bufParts.length; pi2++) off += bufParts[pi2].length; return off; };

  const xrefs = {};
  const pushObjStart = (id) => { xrefs[id] = getOffset(); };

  const PW = 595.28, PH = 841.89;
  // Valeurs par défaut coverStyle
  const cs = { showTitle: true, showAuthor: true, titleColor: null, authorColor: null, ...coverStyle };
  const ML = 72, MR = 72, MT = 80, MB = 72;
  const TW = PW - ML - MR;
  // Mapping police web → famille PDF Type1
  // Typographie PDF : mapper les polices CSS vers polices PDF Type1
  const PDF_FONT_MAP = { "Georgia, serif": "Times", '"Palatino Linotype", Palatino, serif': "Times", '"Times New Roman", Times, serif': "Times", "Garamond, serif": "Times", "Baskerville, serif": "Times" };
  const pdfFontBase = "Times"; // Type1 uniquement, toujours Times en PDF natif
  // Remapper les fonts F1-F4 selon la famille choisie
  const F1 = `/${pdfFontBase}-Roman`, F2 = `/${pdfFontBase}-Bold`, F3 = `/${pdfFontBase}-Italic`, F4 = `/${pdfFontBase}-BoldItalic`;
  const FONT_SIZE = typeof typo.bodySize === "number" ? typo.bodySize * 11.5 : 11.5;
  const LEADING = FONT_SIZE * 1.75;
  const TITLE_FS = 20, GENRE_FS = 9, CHAP_FS = 14, FOOTER_FS = 8.5;
  const charW = fs => fs * 0.5;
  const lineMaxChars = fs => Math.floor(TW / charW(fs));

  function wrapText(text, fs) {
    const maxC = lineMaxChars(fs);
    const lines = [];
    for (const rawLine of text.split("\n")) {
      const words = rawLine.split(" ").filter(Boolean);
      if (!words.length) { lines.push(""); continue; }
      let cur = "";
      for (const w of words) {
        if (!cur) { cur = w; continue; }
        if ((cur + " " + w).length <= maxC) cur += " " + w;
        else { lines.push(cur); cur = w; }
      }
      if (cur) lines.push(cur);
    }
    return lines;
  }

  // ── Draw command lists ──────────────────────────────────────────
  const pages = [];
  let curPage = [];
  let y = PH - MT;

  const newPage = () => { pages.push(curPage); curPage = []; y = PH - MT; };
  const needSpace = (h) => { if (y - h < MB) newPage(); };
  const drawText = (text, x, yPos, fs, opts = {}) => curPage.push({ type:"text", text, x, y:yPos, fs, ...opts });
  const drawLine = (x1, y1, x2, y2, opts = {}) => curPage.push({ type:"line", x1, y1, x2, y2, ...opts });
  const drawImage = (xObjName, x, y, w, h) => curPage.push({ type:"image", xObjName, x, y, w, h });

  // ── Prepare image XObjects (async — convertit PNG/WebP en JPEG) ──
  const imgRegistry = {}; // name → { bytes, w, h }

  const prepareImg = async (name, dataUrl) => {
    if (!dataUrl) return;
    // Essayer d'abord direct (JPEG natif)
    let bytes = dataUrlToBytes(dataUrl);
    let info = imgInfo(dataUrl, bytes);
    if (!info) {
      // PNG / WebP / autre → convertir en JPEG via canvas
      const jpegDataUrl = await toJpegDataUrl(dataUrl);
      if (!jpegDataUrl) return;
      bytes = dataUrlToBytes(jpegDataUrl);
      info = imgInfo(jpegDataUrl, bytes);
    }
    if (info) imgRegistry[name] = info;
  };

  await prepareImg("ImgCov", coverDataUrl);
  await prepareImg("ImgBack", backCoverDataUrl);
  await Promise.all(Object.entries(images).map(([ci, dataUrl]) => prepareImg(`ImgCh${ci}`, dataUrl)));

  const coverInfo = imgRegistry["ImgCov"] || null;
  const backInfo = imgRegistry["ImgBack"] || null;

  // ── Page de couverture ─────────────────────────────────────────
  if (coverInfo) {
    // Image plein cadre
    drawImage("ImgCov", 0, 0, PW, PH);
    // Titre en surimpression en bas
    const titleLines = wrapText(title, TITLE_FS);
    let ty = 120;
    if (cs.showTitle || cs.showAuthor) {
      drawLine(PW/2 - 40, ty + 18, PW/2 + 40, ty + 18, { color:"#c9a96e", width:0.5 });
    }
    if (cs.showTitle) {
      titleLines.forEach((l, i) => {
        drawText(l, PW/2, ty - i * 26, TITLE_FS, { align:"center", bold:true, color: cs.titleColor || "#ffffff" });
      });
    }
    if (cs.showTitle || cs.showAuthor) {
      drawLine(PW/2 - 40, ty - titleLines.length * 26 - 6, PW/2 + 40, ty - titleLines.length * 26 - 6, { color:"#c9a96e", width:0.5 });
    }
    if (author && cs.showAuthor !== false) drawText(author, PW/2, ty - titleLines.length * 26 - 24, GENRE_FS + 1, { align:"center", italic:true, color: cs.authorColor || "#e0d0a0" });
  } else {
    // Couverture texte seule
    const titleLines = wrapText(title, TITLE_FS);
    let ty = PH / 2 + 40 + (titleLines.length * 26) / 2;
    if (cs.showTitle || cs.showAuthor) {
      drawLine(PW/2 - 30, ty + 18, PW/2 + 30, ty + 18, { color:"#c9a96e", width:0.4 });
    }
    if (cs.showTitle !== false) {
      titleLines.forEach((l, i) => {
        drawText(l, PW/2, ty - i * 26, TITLE_FS, { align:"center", bold:true, color: cs.titleColor || "#5a3010" });
      });
    }
    if (cs.showTitle || cs.showAuthor) {
      drawLine(PW/2 - 30, ty - titleLines.length * 26 - 6, PW/2 + 30, ty - titleLines.length * 26 - 6, { color:"#c9a96e", width:0.4 });
    }
    if (author && cs.showAuthor !== false) drawText(author, PW/2, ty - titleLines.length * 26 - 22, GENRE_FS + 1, { align:"center", italic:true, color: cs.authorColor || "#7a6040" });
  }
  newPage();

  // ── forceOddPage : insère une page blanche si la prochaine serait paire ──
  // Page physique = pages.length (finalisées) + 1 (courante)
  // Pour que la prochaine soit impaire : pages.length doit être pair (0,2,4…)
  const forceOddPage = () => {
    if (curPage.length > 0) newPage(); // finaliser la page courante d'abord
    if (pages.length % 2 !== 0) pages.push([]); // insérer page blanche si besoin
  };

  // ── Page de garde (verso couverture) — blanche, non numérotée ──
  // La couverture est page 1 (impaire). Son verso = page 2 (paire) = blanche.
  pages.push([]); // page 2 = verso couverture, toujours blanche

  // ── Préface (optionnelle) — page impaire ───────────────────────
  const hasPreface = !!(preface?.enabled && preface?.text);
  if (hasPreface) {
    // pages.length doit être pair pour que la préface soit sur une page impaire
    if (pages.length % 2 !== 0) pages.push([]); // page blanche si nécessaire
    // Maintenant curPage sera page impaire
    const prefLines = wrapText(preface.text, FONT_SIZE);
    drawText("PRÉFACE", PW/2, y, GENRE_FS, { align: "center", bold: true, color: "#9a7a4a" });
    y -= LEADING * 0.6;
    drawLine(ML + 30, y, PW - MR - 30, y, { color: "#c9a96e", width: 0.3 });
    y -= LEADING * 1.2;
    prefLines.forEach(line => {
      needSpace(LEADING);
      drawText(line, ML, y, FONT_SIZE, { italic: true, color: "#5a4030" });
      y -= LEADING;
    });
    newPage(); // finaliser la préface
  }

  // ── Chapitres ──────────────────────────────────────────────────
  const chapList = chapters.length > 0 ? chapters : [{ title: "" }];
  const chapPageNums = {}; // ci → numéro de page visible (préface = 1, ou chap1 = 1)

  // ── Sommaire — page impaire ─────────────────────────────────────
  const hasToc = tocConfig.show !== false && chapList.length > 1;
  const tocAtStart = hasToc && tocConfig.position !== "end";
  const tocAtEnd = hasToc && tocConfig.position === "end";
  let tocPageIndex = -1;
  if (tocAtStart) {
    forceOddPage(); // sommaire toujours sur page impaire
    tocPageIndex = pages.length; // index du placeholder
    pages.push([]); // placeholder sommaire début (page impaire)
  }

  chapList.forEach((ch, ci) => {
    const chParts = parts.filter(p => (p.chapterIdx ?? 0) === ci);
    if (!chParts.length) return;

    const chapImgName = `ImgCh${ci}`;
    const chapImg = imgRegistry[chapImgName];

    // Chaque chapitre commence sur une page impaire (droite)
    forceOddPage();
    // Enregistrer le numéro de page du chapitre (pages déjà finalisées + 1)
    chapPageNums[ci] = pages.length + 1; // +1 car curPage pas encore pushé (toujours impair)

    if (chapImg) {
      // Illustration en haut de page, proportionnelle, max 55% de la hauteur utile
      const maxImgH = (PH - MT - MB) * 0.55;
      const maxImgW = TW;
      const ratio = chapImg.w / chapImg.h;
      let imgW = maxImgW, imgH = imgW / ratio;
      if (imgH > maxImgH) { imgH = maxImgH; imgW = imgH * ratio; }
      const imgX = ML + (TW - imgW) / 2;
      drawImage(chapImgName, imgX, y - imgH, imgW, imgH);
      y -= imgH + LEADING;
    }

    if (chapList.length > 1) {
      needSpace(CHAP_FS * 3);
      drawText(["I","II","III","IV","V","VI","VII","VIII","IX","X"][ci] || String(ci+1), PW/2, y, CHAP_FS * 0.8, { align:"center", color:"#c9a96e" });
      y -= CHAP_FS * 1.2;
      drawText(ch.title, PW/2, y, CHAP_FS, { align:"center", bold:true, italic:true, color:"#5a3010" });
      y -= CHAP_FS * 2.5;
      drawLine(ML + 30, y + CHAP_FS, PW - MR - 30, y + CHAP_FS, { color:"#c9a96e", width:0.3 });
      y -= LEADING;
    }

    chParts.forEach((part, pi) => {
      if (pi > 0) {
        needSpace(LEADING * 2);
        drawText("* * *", PW/2, y, FONT_SIZE, { align:"center", color:"#c9a96e" });
        y -= LEADING * 2;
      }
      const paragraphs = part.text.split("\n\n").filter(p => p.trim() && p.trim() !== "— ✦ —");
      paragraphs.forEach((para, idx) => {
        const isFirstPara = (ci === 0 && pi === 0 && idx === 0 && !chapImg);
        const lines = wrapText(para.trim(), FONT_SIZE);
        lines.forEach((line, li) => {
          needSpace(LEADING);
          const indent = (!isFirstPara && li === 0) ? (ML + 18) : ML;
          drawText(line, indent, y, FONT_SIZE);
          y -= LEADING;
        });
        y -= LEADING * 0.3;
      });
    });
  });

  // ── Générer la page Sommaire (remplace le placeholder) ────────
  let tocPageContent = null; // stocke le contenu pour tocAtEnd
  if (hasToc) {
    const tocPage = [];
    const addToc = (text, x, yPos, fs, opts = {}) => tocPage.push({ type:"text", text, x, y:yPos, fs, ...opts });
    const addTocLine = (x1, y1, x2, y2, opts = {}) => tocPage.push({ type:"line", x1, y1, x2, y2, ...opts });

    // Page physique du sommaire = tocPageIndex + 1, folio = tocPageIndex + 1 - 2
    const tocVisiblePage = tocPageIndex + 1 - 2;
    let ty = PH - MT;
    // Titre SOMMAIRE avec son propre folio en haut de page
    addTocLine(ML + 30, ty, PW - MR - 30, ty, { color:"#c9a96e", width:0.4 });
    ty -= LEADING;
    addToc("SOMMAIRE", PW/2, ty, GENRE_FS + 1, { align:"center", bold:true, color:"#9a7a4a" });
    ty -= LEADING * 0.6;
    addTocLine(ML + 30, ty, PW - MR - 30, ty, { color:"#c9a96e", width:0.4 });
    ty -= LEADING * 1.5;

    // Entrée préface si présente
    // Préface = p.3 physique (après couv p1 + garde p2) → folio = 3 - 2 = 1
    if (preface?.enabled && preface?.text) {
      const prefVisiblePage = 3 - 2; // = 1
      addToc("Préface", ML, ty, FONT_SIZE, { italic: true, color:"#7a6a50" });
      const prefDots = ". ".repeat(20).slice(0, Math.floor(TW * 0.6 / charW(FONT_SIZE)));
      addToc(prefDots, ML + 60, ty, FONT_SIZE, { color:"#9a8a70", opacity: 0.6 });
      addToc(String(prefVisiblePage), PW - MR, ty, FONT_SIZE, { align:"right", color:"#7a6a50" });
      ty -= LEADING * 1.3;
    }

    const ROMANS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
    chapList.forEach((ch, ci) => {
      if (!chapPageNums[ci]) return;
      const chParts = parts.filter(p => (p.chapterIdx ?? 0) === ci);
      if (!chParts.length) return;

      const roman = ROMANS[ci] || String(ci+1);
      const chapLabel = ch.title ? `${roman} — ${ch.title}` : `Chapitre ${roman}`;
      // Numéro visible = page physique - couv(1) - garde(1) - sommaire(1 si avant)
      // Les blancs d'alignement (pages vides) ne comptent pas dans le folio
      // Numéro visible = page physique - 2 (couv + 2ème couv toujours exclues)
      const displayPageNum = chapPageNums[ci] - 2;
      const pageStr = String(displayPageNum);

      // Ligne de points entre titre et numéro
      const titleW = chapLabel.length * charW(FONT_SIZE);
      const pageW = pageStr.length * charW(FONT_SIZE);
      const dotsW = TW - titleW - pageW - 8;
      const dotsCount = Math.max(3, Math.floor(dotsW / charW(FONT_SIZE)));
      const dots = ". ".repeat(Math.ceil(dotsCount / 2)).slice(0, dotsCount);

      addToc(chapLabel, ML, ty, FONT_SIZE, { color:"#5a3010" });
      addToc(dots, ML + titleW + 4, ty, FONT_SIZE, { color:"#9a8a70", opacity:0.6 });
      addToc(displayPageNum > 0 ? pageStr : "—", PW - MR, ty, FONT_SIZE, { align:"right", color:"#5a3010" });
      ty -= LEADING * 1.3;
    });

    // Pour tocAtStart : injection immédiate (placeholder déjà créé avant les chapitres)
    // Pour tocAtEnd : on stocke tocPage, on injectera après création du placeholder
    if (tocAtStart && tocPageIndex >= 0 && tocPageIndex < pages.length) {
      pages[tocPageIndex] = tocPage;
    }
    // Stocker pour tocAtEnd
    if (tocAtEnd) { tocPageContent = tocPage; }
  }

  // ── Sommaire fin (si position "end") — avant annexe et crédits ──
  if (tocAtEnd) {
    if (curPage.length > 0) newPage();
    forceOddPage(); // sommaire toujours sur page impaire
    tocPageIndex = pages.length;
    pages.push(tocPageContent || []); // injecter le contenu directement
  }

  // ── Annexe personnages ─────────────────────────────────────────
  if (bookCharacters && bookCharacters.length > 0) {
    if (curPage.length > 0) newPage();
    drawText("PERSONNAGES", PW/2, y, GENRE_FS + 1, { align: "center", bold: true, color: "#9a7a4a" });
    y -= LEADING * 0.6;
    drawLine(ML + 30, y, PW - MR - 30, y, { color: "#c9a96e", width: 0.3 });
    y -= LEADING * 1.5;
    bookCharacters.filter(c => c.role !== "mentionné").forEach(ch => {
      needSpace(LEADING * 3);
      drawText(ch.name, ML, y, FONT_SIZE, { bold: true, color: "#c9a96e" });
      if (ch.role) drawText(`(${ch.role})`, ML + ch.name.length * charW(FONT_SIZE) + 8, y, FONT_SIZE * 0.85, { italic: true, color: "#9a8a70" });
      y -= LEADING;
      if (ch.description) {
        wrapText(ch.description, FONT_SIZE * 0.9).forEach(dline => {
          needSpace(LEADING);
          drawText(dline, ML + 12, y, FONT_SIZE * 0.9, { italic: true, color: "#7a6a50" });
          y -= LEADING * 0.95;
        });
      }
      y -= LEADING * 0.5;
    });
    newPage();
  }

  // ── Crédits ─────────────────────────────────────────────────────
  if (credits?.enabled && credits?.text) {
    if (curPage.length > 0) newPage();
    const credLines = wrapText(credits.text, FONT_SIZE * 0.9);
    let cy = PH / 2 + (credLines.length * LEADING * 0.9) / 2;
    drawLine(ML + 30, cy + LEADING * 1.5, PW - MR - 30, cy + LEADING * 1.5, { color: "#c9a96e", width: 0.3 });
    credLines.forEach(line => {
      drawText(line, PW/2, cy, FONT_SIZE * 0.9, { align: "center", italic: true, color: "#7a6a50" });
      cy -= LEADING * 0.9;
    });
    drawLine(ML + 30, cy - LEADING * 0.5, PW - MR - 30, cy - LEADING * 0.5, { color: "#c9a96e", width: 0.3 });
  }

  // ── Page 4ème de couverture ─────────────────────────────────────
  if (backInfo || summary) {
    newPage();
    if (backInfo) {
      // Image en haut — max 45% de la hauteur utile pour laisser place au résumé
      const maxH = summary ? (PH - MT - MB) * 0.45 : (PH - MT - MB);
      const maxW = TW;
      const ratio = backInfo.w / backInfo.h;
      let imgW = maxW, imgH = imgW / ratio;
      if (imgH > maxH) { imgH = maxH; imgW = imgH * ratio; }
      const imgX = ML + (TW - imgW) / 2;
      drawImage("ImgBack", imgX, y - imgH, imgW, imgH);
      y -= imgH + LEADING * 1.5;
    }
    if (summary) {
      // Ligne décorative
      drawLine(ML + 30, y, PW - MR - 30, y, { color: "#c9a96e", width: 0.4 });
      y -= LEADING;
      // Libellé RÉSUMÉ
      drawText("RÉSUMÉ", PW/2, y, GENRE_FS, { align: "center", color: "#9a7a4a", bold: true });
      y -= LEADING * 1.2;
      // Texte du résumé — wrappé
      const summaryLines = wrapText(summary, FONT_SIZE);
      summaryLines.forEach(sumLine => {
        needSpace(LEADING);
        drawText(sumLine, ML, y, FONT_SIZE, { italic: true, color: "#5a4030" });
        y -= LEADING;
      });
      y -= LEADING * 0.5;
      drawLine(ML + 30, y, PW - MR - 30, y, { color: "#c9a96e", width: 0.4 });
    }
  }

  if (curPage.length > 0) newPage();

  // ── Pages blanches pour livret (multiple de 4) ─────────────────
  // En impression livret recto-verso plié : total pages doit être multiple de 4.
  // La 4ème de couverture doit être la DERNIÈRE page.
  // Structure : p.1 couverture, p.2-3 pages intérieures, ..., p.N 4ème couv.
  // On insère des pages blanches AVANT la 4ème de couverture si nécessaire.
  if (backInfo || summary) {
    // La dernière page est déjà la 4ème de couverture.
    // Compter les pages actuelles et rembourrer si besoin.
    const pagesBeforeBack = pages.length - 1; // toutes sauf la 4ème de couv
    const remainder = pages.length % 4;
    if (remainder !== 0) {
      const blanksNeeded = 4 - remainder;
      // Insérer les pages blanches juste avant la dernière (4ème de couv)
      const backPage = pages.pop();
      for (let bk = 0; bk < blanksNeeded; bk++) pages.push([]);
      pages.push(backPage);
    }
  } else {
    // Pas de 4ème de couverture — rembourrer quand même à multiple de 4
    const remainder = pages.length % 4;
    if (remainder !== 0) {
      const blanksNeeded = 4 - remainder;
      for (let bk = 0; bk < blanksNeeded; bk++) pages.push([]);
    }
  }

  // ── Encode PDF ─────────────────────────────────────────────────
  const hexColor = (hex) => {
    if (!hex || hex.length < 7) return "0.100 0.071 0.047";
    const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
  };

  const buildStream = (cmds, pageNum, totalPg) => {
    const streamBytes = [];
    const pushAscii = (s) => { for (let ci = 0; ci < s.length; ci++) streamBytes.push(s.charCodeAt(ci)); };

    // Footer — couverture (p.1) et 4ème couv (dernière) non numérotées
    // Sommaire non numéroté. Préface numérotée = page 1 du livre.
    // Si pas de préface : premier chapitre = page 1
    const hasPreface = !!(preface?.enabled && preface?.text);
    // Structure physique : couverture(p1) + garde(p2) + [préface impaire] + [sommaire impaire] + chapitres
    // Structure physique : couv(p1) + garde(p2) + [préface p3+] + [sommaire impair] + chapitres
    // Hors pagination : couverture(p1) + 2ème couv(p2) + 3ème couv(avant-dernière) + 4ème couv(dernière)
    // Tout le reste est numéroté à partir de 1 (garde = p.1 visible, préface = p.3 visible, etc.)
    const hasBack = !!(backInfo || summary);
    const p4 = totalPg;           // 4ème de couverture (dernière page physique)
    const p3 = hasBack ? totalPg - 1 : -1; // 3ème de couverture (avant-dernière si 4ème présente)
    const isHorsPagination = pageNum === 1   // couverture
                          || pageNum === 2   // 2ème de couverture (garde)
                          || pageNum === p3  // 3ème de couverture
                          || pageNum === p4; // 4ème de couverture
    // Numéro visible = page physique - 2 (couv + 2ème couv toujours exclues)
    const displayNum = pageNum - 2;
    // Total visible = totalPg - 2(couv+2ème) - (hasBack ? 2 : 0)(3ème+4ème couv)
    const totalVisible = totalPg - 2 - (hasBack ? 2 : 0);
    if (!isHorsPagination) {
      // Folio configurable
      const folioShow = folio.show !== false;
      if (folioShow) {
        const folioFS = typeof folio.size === "number" ? folio.size : FOOTER_FS;
        const folioColor = folio.color || "#9a8a70";
        const totalStr = totalVisible > 0 ? String(totalVisible) : "?";
        const numStr = String(displayNum);
        const fmt = folio.format || "n / N";
        let folioText = fmt === "n" ? numStr
          : fmt === "n / N" ? `${numStr} / ${totalStr}`
          : fmt === "— n —" ? `- ${numStr} -`
          : fmt === "Page n" ? `Page ${numStr}` : numStr;
        if (folio.prefix) folioText = folio.prefix + " " + folioText;
        if (folio.suffix) folioText = folioText + " " + folio.suffix;
        const folioW = folioText.length * charW(folioFS);
        const pos = folio.position || "center";
        const folioX = pos === "left" ? ML : pos === "right" ? PW - MR - folioW : (PW - folioW) / 2;
        pushAscii(`BT\n/F1 ${folioFS} Tf\n${hexColor(folioColor)} rg\n`);
        pushAscii(`${folioX.toFixed(2)} ${(MB - 18).toFixed(2)} Td\n(`);
        const folioBytes = toWinAnsi(folioText.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)"));
        for (let bi = 0; bi < folioBytes.length; bi++) streamBytes.push(folioBytes[bi]);
        pushAscii(`) Tj\nET\n`);
      }
    }

    // Images
    for (const cmd of cmds) {
      if (cmd.type === "image") {
        pushAscii(`q\n${cmd.w.toFixed(2)} 0 0 ${cmd.h.toFixed(2)} ${cmd.x.toFixed(2)} ${cmd.y.toFixed(2)} cm\n/${cmd.xObjName} Do\nQ\n`);
      }
    }

    // Text
    pushAscii("BT\n");
    for (const cmd of cmds) {
      if (cmd.type === "text") {
        const fn = (cmd.bold && cmd.italic) ? "/F4" : cmd.bold ? "/F2" : cmd.italic ? "/F3" : "/F1";
        pushAscii(`ET\nBT\n${fn} ${cmd.fs} Tf\n${hexColor(cmd.color || "#1a1208")} rg\n`);
        let x = cmd.x;
        if (cmd.align === "center") x = cmd.x - cmd.text.length * charW(cmd.fs) / 2;
        pushAscii(`${x.toFixed(2)} ${cmd.y.toFixed(2)} Td\n(`);
        const escaped = cmd.text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
        const winBytes = toWinAnsi(escaped);
        for (let bi = 0; bi < winBytes.length; bi++) streamBytes.push(winBytes[bi]);
        pushAscii(`) Tj\n`);
      }
    }
    pushAscii("ET\n");

    // Lines
    for (const cmd of cmds) {
      if (cmd.type === "line") {
        pushAscii(`${hexColor(cmd.color || "#c9a96e")} RG\n${(cmd.width||0.3).toFixed(2)} w\n${cmd.x1.toFixed(2)} ${cmd.y1.toFixed(2)} m ${cmd.x2.toFixed(2)} ${cmd.y2.toFixed(2)} l S\n`);
      }
    }

    return new Uint8Array(streamBytes);
  };

  // ── PDF structure ──────────────────────────────────────────────
  appendStr("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  // Font objects (IDs 3-6)
  const fontObj = (id, baseFont) => {
    xrefs[id] = getOffset();
    appendStr(`${id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /${baseFont} /Encoding /WinAnsiEncoding >>\nendobj\n`);
  };
  fontObj(3, `${pdfFontBase}-Roman`);
  fontObj(4, `${pdfFontBase}-Bold`);
  fontObj(5, `${pdfFontBase}-Italic`);
  fontObj(6, `${pdfFontBase}-BoldItalic`);

  // Image XObjects — IDs starting at 7
  let nextId = 7;
  const imgObjIds = {};
  for (const [name, info] of Object.entries(imgRegistry)) {
    const id = nextId++;
    imgObjIds[name] = id;
    xrefs[id] = getOffset();
    if (info.isJpeg) {
      appendStr(`${id} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${info.w} /Height ${info.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${info.bytes.length} >>\nstream\n`);
    } else {
      // PNG: strip PNG wrapper, embed raw RGB via FlateDecode would need zlib — fallback: re-encode as JPEG not possible here
      // Use raw uncompressed RGB (may be large but safe)
      // For PNG we embed as-is using ASCIIHexDecode trick — actually simplest: just skip PNG images gracefully
      // Better: embed PNG bytes with /Filter [/ASCII85Decode /FlateDecode] — too complex without zlib
      // Simplest safe approach: mark as JPEG DCT anyway if it starts with JPEG sig, else skip
      appendStr(`${id} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${info.w} /Height ${info.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${info.bytes.length} >>\nstream\n`);
    }
    appendBytes(info.bytes);
    appendStr(`\nendstream\nendobj\n`);
  }

  // Page streams and objects
  const totalPages = pages.length;
  const pageStreamIds = [];
  const pageObjIds = [];
  for (let pi = 0; pi < totalPages; pi++) {
    pageStreamIds.push(nextId++);
    pageObjIds.push(nextId++);
  }

  for (let pi = 0; pi < totalPages; pi++) {
    const streamContent = buildStream(pages[pi], pi + 1, totalPages);
    const sid = pageStreamIds[pi];
    xrefs[sid] = getOffset();
    appendStr(`${sid} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n`);
    appendBytes(streamContent);
    appendStr(`\nendstream\nendobj\n`);

    const pid = pageObjIds[pi];
    xrefs[pid] = getOffset();
    // Build XObject resource dict for this page
    const pageImgNames = [...new Set(pages[pi].filter(c => c.type === "image").map(c => c.xObjName))];
    const xObjDict = pageImgNames.map(n => `/${n} ${imgObjIds[n]} 0 R`).join(" ");
    const xObjEntry = xObjDict ? ` /XObject << ${xObjDict} >>` : "";
    appendStr(`${pid} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Contents ${sid} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >>${xObjEntry} >> >>\nendobj\n`);
  }

  // Pages tree
  xrefs[2] = getOffset();
  const kidsStr = pageObjIds.map(i => `${i} 0 R`).join(" ");
  appendStr(`2 0 obj\n<< /Type /Pages /Kids [${kidsStr}] /Count ${totalPages} >>\nendobj\n`);

  // Catalog
  xrefs[1] = getOffset();
  appendStr(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);

  // XRef table
  const allIds = [1, 2, 3, 4, 5, 6, ...Object.values(imgObjIds), ...pageStreamIds, ...pageObjIds];
  const maxId = Math.max(...allIds);
  const xrefPos = getOffset();
  appendStr(`xref\n0 ${maxId + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= maxId; i++) {
    const pos = xrefs[i] ?? 0;
    appendStr(`${String(pos).padStart(10,"0")} 00000 n \n`);
  }
  appendStr(`trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`);

  let total = 0;
  for (let pi3 = 0; pi3 < bufParts.length; pi3++) total += bufParts[pi3].length;
  const result = new Uint8Array(total);
  let off = 0;
  for (let pi2 = 0; pi2 < bufParts.length; pi2++) { result.set(bufParts[pi2], off); off += bufParts[pi2].length; }

  return new Blob([result], { type: "application/pdf" });
}
async function readAllZipFiles(buf) {
  const ru16=(b,o)=>b[o]|(b[o+1]<<8), ru32=(b,o)=>(b[o]|(b[o+1]<<8)|(b[o+2]<<16)|(b[o+3]<<24))>>>0;
  const dec=new TextDecoder(); let eocd=-1;
  for(let i=buf.length-22;i>=0;i--){if(buf[i]===0x50&&buf[i+1]===0x4B&&buf[i+2]===0x05&&buf[i+3]===0x06){eocd=i;break;}}
  if(eocd<0) return {};
  const count=ru16(buf,eocd+8); let cd=ru32(buf,eocd+16);
  const files={};
  for(let i=0;i<count;i++){
    const nl=ru16(buf,cd+28),xl=ru16(buf,cd+30),cl=ru16(buf,cd+32);
    const lo=ru32(buf,cd+42), method=ru16(buf,cd+10), cs=ru32(buf,cd+20);
    const name=dec.decode(buf.slice(cd+46,cd+46+nl));
    const lnl=ru16(buf,lo+26),lxl=ru16(buf,lo+28);
    const start=lo+30+lnl+lxl; const comp=buf.slice(start,start+cs); let data=comp;
    if(method===8){
      try{
        const ds=new DecompressionStream("deflate-raw");
        const w=ds.writable.getWriter(); w.write(comp); w.close();
        const chunks=[],r=ds.readable.getReader();
        while(true){const{done,value}=await r.read();if(done)break;chunks.push(value);}
        const t=chunks.reduce((s,c)=>s+c.length,0); data=new Uint8Array(t); let p=0;
        for(const c of chunks){data.set(c,p);p+=c.length;}
      }catch{data=comp;}
    }
    files[name]=data; cd+=46+nl+xl+cl;
  }
  return files;
}
async function extractFileFromZip(buf, targetPath) {
  const files=await readAllZipFiles(buf); const dec=new TextDecoder();
  const match=Object.keys(files).find(k=>k===targetPath||k.endsWith("/"+targetPath));
  return match ? dec.decode(files[match]) : null;
}

async function callClaude(messages, maxTokens = 7000, timeoutMs = null, retries = 2, noAutoComplete = false) {
  // Timeout adaptatif selon la taille de la requête
  if (!timeoutMs) {
    timeoutMs = maxTokens <= 100 ? 15000
               : maxTokens <= 800 ? 40000
               : maxTokens <= 2000 ? 90000
               : 210000; // grandes générations : 3m30
  }
  const preview = messages[messages.length - 1]?.content?.slice(0, 120).replace(/\n/g, " ") + "…";

  // Helper : timeout de secours garanti (AbortController peut ne pas fonctionner si réseau coupe)
  const withHardTimeout = (promise, ms) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout forcé après ${ms/1000}s`)), ms + 5000))
  ]);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);
    const t0 = Date.now();
    if (attempt === 0) {
      addLog("api", "API", `→ Requête Claude (max ${maxTokens} tokens)`, preview);
    } else {
      addLog("api", "API", `→ Retry ${attempt}/${retries} (max ${maxTokens} tokens)`, preview);
    }
    try {
      const res = await withHardTimeout(fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens, messages }),
        signal: controller.signal,
      }), timeoutMs);
      const data = await res.json();
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      if (data.error) {
        addLog("error", "API", `✕ Erreur API (${elapsed}s) : ${data.error.message}`, data.error);
        throw new Error(data.error.message);
      }
      let text = data.content?.[0]?.text || "";
      const words = text.split(/\s+/).filter(Boolean).length;
      const stopReason = data.stop_reason ?? "?";
      addLog("info", "API", `✓ Réponse reçue en ${elapsed}s — ~${words} mots, ${data.usage?.output_tokens ?? "?"} tokens`, `Input tokens: ${data.usage?.input_tokens ?? "?"} | Stop reason: ${stopReason}`);

      // ── Complétion automatique si phrase tronquée ──────────────────
      if (!noAutoComplete && stopReason === "max_tokens" && text.trim()) {
        // Détecter si la dernière phrase est incomplète :
        // une phrase complète se termine par . ! ? » " ou … suivi d'espace/fin
        const lastChar = text.trimEnd().slice(-1);
        const isIncomplete = ![".", "!", "?", "»", '"', "…", "—"].includes(lastChar);
        if (isIncomplete) {
          addLog("warn", "API", `⚠ Phrase tronquée détectée — complétion automatique en cours…`);
          try {
            const completionMessages = [
              ...messages,
              { role: "assistant", content: text },
              { role: "user", content: "Continue exactement là où tu t'es arrêté, en complétant uniquement la phrase en cours, puis arrête-toi à la fin de cette phrase. N'écris rien d'autre." }
            ];
            const compRes = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 200, messages: completionMessages }),
            });
            const compData = await compRes.json();
            const completion = compData.content?.[0]?.text || "";
            if (completion.trim()) {
              text = text + completion;
              addLog("info", "API", `✓ Phrase complétée (+${completion.trim().split(/\s+/).length} mots)`);
            }
          } catch(ce) {
            addLog("warn", "API", `⚠ Complétion échouée : ${ce.message}`);
          }
        } else {
          addLog("warn", "API", `⚠ max_tokens atteint mais phrase complète — texte retourné tel quel`);
        }
      }

      clearTimeout(tid);
      return text;
    } catch(e) {
      clearTimeout(tid);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const isRetryable = e.name === "AbortError" || (!e.message?.includes("API") && !e.message?.includes("401") && !e.message?.includes("403"));
      if (e.name === "AbortError") {
        addLog("error", "API", `✕ Timeout après ${elapsed}s (limite: ${timeoutMs/1000}s)`);
      } else if (!e.message?.includes("API")) {
        addLog("error", "API", `✕ Erreur réseau (${elapsed}s) : ${e.message}`);
      }
      if (attempt < retries && isRetryable) {
        const delay = (attempt + 1) * 3000;
        addLog("warn", "API", `⏳ Attente ${delay/1000}s avant retry…`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
}

async function generateTitle(storyText, genre, language) {
  const lang = langInstructions[language] || "Écris en français.";
  const text = await callClaude([{ role: "user", content: `${lang}\nDonne un titre littéraire court et accrocheur (2-5 mots) pour cette histoire de genre ${genre}.\n\nExtrait : ${storyText.slice(0, 600)}\n\nRéponds UNIQUEMENT avec le titre, sans guillemets.` }], 80);
  return text.trim();
}

// ── Résumé dynamique du contexte pour les longues histoires ─────────
// Au lieu de tronquer brutalement, résume les parties anciennes et garde les récentes intactes
function buildSmartContext(parts, language, chapters = [], blocks = []) {
  const MAX_TOTAL_CHARS = 12000;

  const allText = parts.map(p => p.text).join("\n\n");
  if (allText.length <= MAX_TOTAL_CHARS) return allText;

  const lastPart = parts[parts.length - 1];
  const lastPartText = lastPart?.text || "";

  if (lastPartText.length >= MAX_TOTAL_CHARS) {
    return "[début de cette partie omis]\n\n" + lastPartText.slice(-MAX_TOTAL_CHARS);
  }

  const budgetForPrevious = MAX_TOTAL_CHARS - lastPartText.length - 200;
  const maxChapIdx = parts.reduce((mx, p) => Math.max(mx, p.chapterIdx ?? 0), 0);

  if (maxChapIdx > 0) {
    const oldChapsSummaries = [];
    for (let ci = 0; ci < maxChapIdx; ci++) {
      const chTitle = chapters[ci]?.title || `Chapitre ${ci + 1}`;
      // Priorité 1 : résumé de chapitre (generateAndCacheChapterSummary)
      if (chapters[ci]?.summary) {
        oldChapsSummaries.push(`[${chTitle}]\n${chapters[ci].summary}`);
      // Priorité 2 : résumés de blocs RAG indexés
      } else {
        const chBlocks = blocks.filter(b => b.chapterIdx === ci && b.summary && !b.summaryIsChapter);
        if (chBlocks.length) {
          const blockLines = chBlocks.map(b => `  • ${b.summary}`).join("\n");
          oldChapsSummaries.push(`[${chTitle}]\n${blockLines}`);
        // Priorité 3 : texte brut tronqué
        } else {
          const chapText = parts.filter(p => (p.chapterIdx ?? 0) === ci).map(p => p.text).join("\n\n");
          if (chapText) oldChapsSummaries.push(`[${chTitle}]\n${chapText.slice(0, 800)}`);
        }
      }
    }

    const currentChapParts = parts.filter(p => (p.chapterIdx ?? 0) === maxChapIdx && p !== lastPart);
    const currentOtherText = currentChapParts.map(p => p.text).join("\n\n");
    const summariesBlock = oldChapsSummaries.length
      ? `[CHAPITRES PRÉCÉDENTS]\n${oldChapsSummaries.join("\n\n")}`
      : "";
    const previousContext = summariesBlock
      ? (currentOtherText ? `${summariesBlock}\n\n[Chapitre en cours]\n${currentOtherText.slice(-Math.floor(budgetForPrevious * 0.5))}` : summariesBlock)
      : currentOtherText;
    return `${previousContext.slice(-budgetForPrevious)}\n\n[DERNIÈRE PARTIE — continuer depuis la fin]\n${lastPartText}`;
  }

  const previousText = parts.slice(0, -1).map(p => p.text).join("\n\n");
  return previousText.slice(-budgetForPrevious) + "\n\n" + lastPartText;
}

async function generateSummary(storyText, language) {
  const lang = langInstructions[language] || "Écris en français.";
  const text = await callClaude([{ role: "user", content: `${lang}\nÉcris un résumé de quatrième de couverture (3-4 phrases, ~90 mots), mystérieux et accrocheur, au présent.\n\nHistoire : ${storyText.slice(0, 2000)}\n\nRéponds UNIQUEMENT avec le résumé.` }], 300);
  return text.trim();
}

// ── Image helpers ─────────────────────────────────────────────────
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result;
      const img = new Image();
      img.onerror = reject;
      img.onload = () => resolve({ dataUrl, w: img.naturalWidth, h: img.naturalHeight, file });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// ── EPUB ──────────────────────────────────────────────────────────
function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function toUtf8(s) { return new TextEncoder().encode(s); }

// ── Pure-JS ZIP builder (EPUB sans CDN) ──────────────────────────
async function buildEpubZip(files) {
  const u16 = (n) => [n & 0xFF, (n >> 8) & 0xFF];
  const u32 = (n) => [n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF];
  const cat = (...arrs) => { const t = arrs.reduce((s,a)=>s+a.length,0); const o = new Uint8Array(t); let p=0; for(const a of arrs){o.set(a,p);p+=a.length;} return o; };

  const crcTable = (() => { const t=new Uint32Array(256); for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[i]=c;} return t; })();
  const crc32 = (b) => { let c=0xFFFFFFFF; for(let i=0;i<b.length;i++)c=crcTable[(c^b[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };

  const deflate = async (data) => {
    if (typeof CompressionStream === "undefined") return null;
    const cs = new CompressionStream("deflate-raw");
    const w = cs.writable.getWriter(); w.write(data); w.close();
    const chunks=[]; const r=cs.readable.getReader();
    while(true){const{done,value}=await r.read();if(done)break;chunks.push(value);}
    const tot=chunks.reduce((s,c)=>s+c.length,0); const out=new Uint8Array(tot); let off=0;
    for(const c of chunks){out.set(c,off);off+=c.length;} return out;
  };

  const enc = new TextEncoder();
  const dosNow = () => { const d=new Date(); return [...u16((d.getHours()<<11)|(d.getMinutes()<<5)|Math.floor(d.getSeconds()/2)), ...u16(((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate())]; };
  const locals=[]; const centrals=[]; let offset=0;

  for (const f of files) {
    const name = enc.encode(f.path);
    const raw = f.data instanceof Uint8Array ? f.data : enc.encode(f.data);
    const crc = crc32(raw);
    let comp = raw; let method = 0;
    if (f.compress !== false) {
      const d = await deflate(raw);
      if (d && d.length < raw.length) { comp = d; method = 8; }
    }
    const dt = dosNow();
    const lh = new Uint8Array([0x50,0x4B,0x03,0x04, 20,0, 0,0, ...u16(method), ...dt,
      ...u32(crc), ...u32(comp.length), ...u32(raw.length), ...u16(name.length), 0,0]);
    const local = cat(lh, name, comp);
    locals.push(local);
    const ch = new Uint8Array([0x50,0x4B,0x01,0x02, 20,0, 20,0, 0,0, ...u16(method), ...dt,
      ...u32(crc), ...u32(comp.length), ...u32(raw.length), ...u16(name.length), 0,0, 0,0, 0,0, 0,0, 0,0,0,0, ...u32(offset)]);
    centrals.push(cat(ch, name));
    offset += local.length;
  }
  const cd = cat(...centrals);
  const eocd = new Uint8Array([0x50,0x4B,0x05,0x06, 0,0, 0,0,
    ...u16(files.length), ...u16(files.length), ...u32(cd.length), ...u32(offset), 0,0]);
  return new Blob([cat(...locals, cd, eocd)], { type: "application/epub+zip" });
}

async function generateEpub({ title, author, summary, parts, chapters, genreStr, images, coverDataUrl, backCoverDataUrl }) {
  const bookId = "urn:uuid:atelier-" + Date.now();
  const safeT = esc(title); const safeA = esc(author || "Story Workshop");
  const safeSum = esc((summary || "").slice(0, 300));
  const files = [];
  const add = (path, str, compress = true) => files.push({ path, data: toUtf8(str), compress });
  const addBin = (path, uint8) => files.push({ path, data: uint8, compress: true });

  add("mimetype", "application/epub+zip", false);
  add("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  add("OEBPS/stylesheet.css", `body{font-family:Georgia,"Times New Roman",serif;margin:5% 8%;line-height:1.85;color:#1a1a1a}h1{font-size:1.9em;text-align:center;margin:1.5em 0 .3em;color:#5a3a0a}h2{font-size:1em;text-align:center;color:#7a5a2a;font-style:italic;font-weight:normal;margin:0 0 2em}p{margin:0 0 1.1em;text-align:justify}p.indent{text-indent:1.5em;margin:0}.sep{text-align:center;color:#c9a96e;margin:1.8em 0;letter-spacing:.4em}.cover-img{width:100%;height:auto;display:block}.back-img{width:100%;height:auto;display:block}.chap-img{width:100%;height:auto;display:block;margin:0 0 1.5em}.colophon{text-align:center;font-size:.6em;color:#aaa;letter-spacing:.2em;margin-top:2em}`);

  const xhtml = (t, b) => `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr"><head><meta charset="utf-8"/><title>${esc(t)}</title><link rel="stylesheet" type="text/css" href="stylesheet.css"/></head><body>${b}</body></html>`;

  const imgManifest = [];

  // Helper: embed dataUrl as binary file in EPUB
  const embedImage = (dataUrl, idPrefix, idx, isCover = false) => {
    if (!dataUrl) return null;
    const [header, b64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const ext = mime === "image/png" ? "png" : "jpg";
    const fname = `${idPrefix}${idx}.${ext}`;
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    addBin(`OEBPS/${fname}`, bytes);
    imgManifest.push({ id: `${idPrefix}${idx}`, href: fname, mime, isCover });
    return fname;
  };

  // Cover page
  const coverFname = embedImage(coverDataUrl, "cover", 0, true);
  add("OEBPS/cover.xhtml", xhtml(title,
    coverFname
      ? `<div style="text-align:center"><img class="cover-img" src="${coverFname}" alt="Couverture"/></div><div style="text-align:center;margin-top:2em"><p style="font-size:.7em;letter-spacing:.3em;color:#9a7a4a;text-transform:uppercase">${esc(genreStr)}</p><h1>${safeT}</h1><h2>${safeA}</h2></div>`
      : `<div style="text-align:center;margin-top:4em"><p style="font-size:.7em;letter-spacing:.3em;color:#9a7a4a;text-transform:uppercase">${esc(genreStr)}</p><h1>${safeT}</h1><h2>${safeA}</h2></div>`
  ));

  // Chapters
  const chapterGroups = (chapters && chapters.length > 0)
    ? chapters.map((ch, ci) => ({ ...ch, ci, parts: parts.filter(p => (p.chapterIdx ?? 0) === ci) }))
    : [{ title: "Chapitre I", ci: 0, parts }];

  const chItems = [];
  chapterGroups.forEach((chG, gi) => {
    if (!chG.parts.length) return;
    const imgFname = embedImage(images?.[gi], "illus", gi);
    let body = `<h1>${gi === 0 ? safeT : esc(chG.title)}</h1>\n`;
    if (gi === 0) body += `<h2>${esc(chG.title)}</h2>\n`;
    if (imgFname) body += `<div><img class="chap-img" src="${imgFname}" alt="${esc(chG.title)}"/></div>\n`;
    chG.parts.forEach((part, pi) => {
      const paras = part.text.split("\n\n").filter(p => p.trim());
      if (pi > 0) body += `<p class="sep">&#x2726; &#x2726; &#x2726;</p>\n`;
      paras.forEach((para, i) => {
        if (para.trim() === "— ✦ —") { body += `<p class="sep">&#x2726; &#x2726; &#x2726;</p>\n`; }
        else if (para.trim()) { body += `<p${gi === 0 && pi === 0 && i === 0 ? "" : ' class="indent"'}>${esc(para)}</p>\n`; }
      });
    });
    const fname = `chapter${gi + 1}.xhtml`;
    add(`OEBPS/${fname}`, xhtml(`${title} — ${chG.title}`, body));
    chItems.push({ id: `chap${gi + 1}`, href: fname, title: chG.title });
  });

  // Back cover / summary page
  const backFname = embedImage(backCoverDataUrl, "back", 0);
  add("OEBPS/summary.xhtml", xhtml("Résumé",
    (backFname ? `<div><img class="back-img" src="${backFname}" alt="4ème de couverture"/></div>\n` : "") +
    `<p style="text-align:center;font-size:.6em;letter-spacing:.3em;color:#9a7a4a;text-transform:uppercase;margin-top:2em">R&#xE9;sum&#xE9;</p><p style="font-style:italic;color:#3a3020">${safeSum}</p><p class="colophon">ATELIER DES R&#xC9;CITS</p>`
  ));

  // NCX
  const navPts = [
    `<navPoint id="nav-cover" playOrder="1"><navLabel><text>Couverture</text></navLabel><content src="cover.xhtml"/></navPoint>`,
    ...chItems.map((c, i) => `<navPoint id="nav-${c.id}" playOrder="${i+2}"><navLabel><text>${esc(c.title)}</text></navLabel><content src="${c.href}"/></navPoint>`),
    `<navPoint id="nav-sum" playOrder="${chItems.length+2}"><navLabel><text>R&#xE9;sum&#xE9;</text></navLabel><content src="summary.xhtml"/></navPoint>`,
  ].join("\n    ");
  add("OEBPS/toc.ncx", `<?xml version="1.0" encoding="utf-8"?><!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd"><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head><meta name="dtb:uid" content="${bookId}"/><meta name="dtb:depth" content="1"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head><docTitle><text>${safeT}</text></docTitle><navMap>${navPts}</navMap></ncx>`);

  // OPF
  const manifest = [
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `<item id="css" href="stylesheet.css" media-type="text/css"/>`,
    `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`,
    ...imgManifest.map(im => `<item id="${im.id}" href="${im.href}" media-type="${im.mime}"${im.isCover ? ' properties="cover-image"' : ""}/>` ),
    ...chItems.map(c => `<item id="${c.id}" href="${c.href}" media-type="application/xhtml+xml"/>`),
    `<item id="summary" href="summary.xhtml" media-type="application/xhtml+xml"/>`,
  ].join("\n    ");
  const spine = [`<itemref idref="cover"/>`, ...chItems.map(c => `<itemref idref="${c.id}"/>`), `<itemref idref="summary"/>`].join("\n    ");
  add("OEBPS/content.opf", `<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf"><dc:title>${safeT}</dc:title><dc:creator opf:role="aut">${safeA}</dc:creator><dc:language>fr</dc:language><dc:identifier id="BookId" opf:scheme="UUID">${bookId}</dc:identifier><dc:subject>${esc(genreStr)}</dc:subject><dc:description>${safeSum}</dc:description>${coverFname ? `<meta name="cover" content="cover0"/>` : ""}</metadata><manifest>${manifest}</manifest><spine toc="ncx">${spine}</spine><guide><reference type="cover" title="Couverture" href="cover.xhtml"/><reference type="text" title="D&#xE9;but" href="${chItems[0]?.href || "cover.xhtml"}"/></guide></package>`);

  return buildEpubZip(files);
}

// ── Debug log store (survit aux re-renders, réinitialisé seulement au refresh) ──
const _logs = [];
let _logListeners = [];
let _debugPanelOpen = false;
let _debugPanelListeners = [];
function setDebugPanelOpen(val) {
  _debugPanelOpen = val;
  _debugPanelListeners.forEach(fn => fn(val));
}
function useDebugPanelOpen() {
  const [open, setOpen] = useState(_debugPanelOpen);
  useEffect(() => {
    _debugPanelListeners.push(setOpen);
    return () => { _debugPanelListeners = _debugPanelListeners.filter(fn => fn !== setOpen); };
  }, []);
  return open;
}
function addLog(level, category, message, detail = null) {
  const entry = {
    id: Date.now() + Math.random(),
    ts: new Date().toISOString(),
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    level,      // "info" | "warn" | "error" | "api"
    category,   // "API" | "EPUB" | "PDF" | "IMPORT" | "GEN" | "UI"
    message,
    detail: detail ? (typeof detail === "string" ? detail : JSON.stringify(detail, null, 2)) : null,
  };
  _logs.push(entry);
  if (_logs.length > 300) _logs.shift();
  _logListeners.forEach(fn => fn([..._logs]));
}
function useDebugLogs() {
  const [logs, setLogs] = useState([..._logs]);
  useEffect(() => {
    _logListeners.push(setLogs);
    return () => { _logListeners = _logListeners.filter(fn => fn !== setLogs); };
  }, []);
  return logs;
}

// ── Styles ────────────────────────────────────────────────────────
// ── Thèmes clair / sombre ─────────────────────────────────────────
const THEME_DARK = {
  gold: "#c9a96e", darkGold: "#8b6a3e", bg: "#0f0e11", card: "#14120f",
  text: "#d4c8b0", muted: "#7a7060", green: "#7ec87e", blue: "#8abcd4",
  border: "#2a2218", inputBg: "#1a1714", inputBorder: "#3a3328",
  chipBorder: "#3a3328", chipText: "#9a8a70", chipActive: "#e8d5a8",
  panelBg: "rgba(10,9,8,0.85)", triggerBg: "rgba(10,9,8,0.75)",
  storyBg: "#14120f", storyBorder: "#2a2218",
  isDark: true,
};
const THEME_LIGHT = {
  gold: "#9a6e30", darkGold: "#7a5020", bg: "#eeeae4", card: "#ffffff",
  text: "#1a1410", muted: "#8a7a6a", green: "#3a7a3a", blue: "#3a6a8a",
  border: "#d0c8b8", inputBg: "#f8f5f0", inputBorder: "#c8bfaf",
  chipBorder: "#c8bfaf", chipText: "#6a5a4a", chipActive: "#2a1a08",
  panelBg: "rgba(240,236,228,0.92)", triggerBg: "rgba(235,230,220,0.92)",
  storyBg: "#ffffff", storyBorder: "#d8d0c0",
  isDark: false,
};

const ThemeContext = React.createContext(THEME_DARK);
const useTheme = () => React.useContext(ThemeContext);

const makeS = (C) => ({
  chip: (active) => ({
    padding: "0.4rem 0.85rem", margin: "0.2rem",
    border: active ? `2px solid ${C.gold}` : `1px solid ${C.chipBorder}`,
    borderRadius: "3px",
    background: active ? `${C.gold}20` : "transparent",
    color: active ? C.chipActive : C.chipText,
    cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "0.88rem",
    transition: "all 0.2s",
  }),
  btn: (color, size = "normal") => {
    const col = color || C.gold;
    return {
      padding: size === "small" ? "0.45rem 1rem" : "0.75rem 1.6rem",
      border: `1px solid ${col}`, background: "transparent", color: col,
      fontFamily: "Georgia, serif", fontSize: size === "small" ? "0.78rem" : "0.82rem",
      letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.2s", borderRadius: "2px",
    };
  },
  input: {
    width: "100%", background: C.inputBg, border: `1px solid ${C.inputBorder}`,
    color: C.text, fontFamily: "Georgia, serif", fontSize: "0.88rem",
    padding: "0.7rem", borderRadius: "3px", resize: "vertical", minHeight: "65px",
    outline: "none", lineHeight: 1.6, boxSizing: "border-box",
  },
  label: { fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, opacity: 0.7, display: "block", marginBottom: "0.5rem" },
  divider: { width: "40px", height: "1px", background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, margin: "0 auto 0.8rem" },
});

// Fallback global pour les composants hors contexte
const C = THEME_DARK;
const S = makeS(C);

// ── Toggle switch ─────────────────────────────────────────────────
function Toggle({ on, onChange, label, color }) {
  const C = useTheme();
  const col = color || C.gold;
  return (
    <div onClick={() => onChange(!on)} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
      <div style={{ width: 32, height: 18, borderRadius: 9, background: on ? col : C.inputBorder, border: `1px solid ${on ? col : C.border}`, position: "relative", transition: "all 0.25s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: on ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: on ? "#fff" : C.muted, transition: "left 0.25s" }} />
      </div>
      {label && <span style={{ color: on ? col : C.muted, fontSize: "0.75rem", fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>{label}</span>}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────
function Section({ label, children }) {
  const C = useTheme(); const S = makeS(C);
  return (
    <div style={{ marginBottom: "1.4rem", textAlign: "center" }}>
      <div style={S.label}>{label}</div>
      <div style={S.divider} />
      {children}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────
function Spinner({ msg }) {
  const C = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
      <style>{`@keyframes pulse{0%,100%{transform:scale(.8);opacity:.3}50%{transform:scale(1.2);opacity:1}}`}</style>
      <p style={{ color: C.gold, fontStyle: "italic", marginBottom: "1rem", fontSize: "0.95rem" }}>{msg}</p>
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold, animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />)}
      </div>
    </div>
  );
}

// ── DropZone ─────────────────────────────────────────────────────
function DropZone({ dataUrl, onFile, label, aspect = "landscape", onRemove }) {
  const C = useTheme(); const S = makeS(C);
  const ref = useRef(null);
  const isPortrait = aspect === "portrait";
  const ph = isPortrait ? 240 : 140;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {dataUrl ? (
        <div style={{ position: "relative", borderRadius: 4, overflow: "hidden", background: C.panelBg }}>
          <img src={dataUrl} alt={label} style={{ width: "100%", display: "block", maxHeight: isPortrait ? 320 : 200, objectFit: "cover" }} />
          <div style={{ position: "absolute", top: "0.4rem", right: "0.4rem", display: "flex", gap: "0.3rem" }}>
            <button onClick={() => ref.current?.click()} style={{ ...S.btn(C.blue, "small"), fontSize: "0.65rem", background: `${C.card}ee`, padding: "0.2rem 0.55rem" }}>✎ Changer</button>
            {onRemove && <button onClick={onRemove} style={{ ...S.btn("#e07070", "small"), fontSize: "0.65rem", background: `${C.card}ee`, padding: "0.2rem 0.5rem" }}>✕</button>}
          </div>
        </div>
      ) : (
        <div onClick={() => ref.current?.click()}
          style={{ minHeight: ph, border: `1px dashed ${C.green}66`, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", padding: "1rem", transition: "border-color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.green}
          onMouseLeave={e => e.currentTarget.style.borderColor = `${C.green}66`}>
          <span style={{ fontSize: "1.8rem", opacity: 0.25 }}>🖼</span>
          <span style={{ color: C.muted, fontSize: "0.75rem", textAlign: "center" }}>{label}</span>
          <span style={{ color: C.muted, fontSize: "0.65rem", opacity: 0.7, fontStyle: "italic" }}>
            {isPortrait ? "Idéal : 800×1120 px" : "Idéal : 1200×600 px"}
          </span>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ── CustomZone ────────────────────────────────────────────────────
function CustomZone({ include, exclude, setInclude, setExclude }) {
  const C = useTheme(); const S = makeS(C);
  return (
    <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
      <div>
        <div style={{ ...S.label, color: "#7ec87e" }}>✦ Inclure</div>
        <textarea style={{ ...S.input, borderColor: "#2a4a2a" }} placeholder="Personnages, lieux, thèmes…" value={include} onChange={e => setInclude(e.target.value)} />
      </div>
      <div>
        <div style={{ ...S.label, color: "#e07070" }}>✕ Exclure</div>
        <textarea style={{ ...S.input, borderColor: "#4a2a2a" }} placeholder="À éviter absolument…" value={exclude} onChange={e => setExclude(e.target.value)} />
      </div>
    </div>
  );
}


// ── NSFW Password Modal ────────────────────────────────────────────
function NsfwPasswordModal({ t, onSuccess, onCancel }) {
  const C = useTheme(); const S = makeS(C);
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);
  const submit = () => {
    if (code === NSFW_PASSWORD) { onSuccess(); }
    else { setErr(true); setShake(true); setCode(""); setTimeout(()=>setShake(false),600); }
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.72)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
      <div style={{ background:C.card, border:`1px solid #c9404044`, borderRadius:8, padding:"2rem", maxWidth:300, width:"100%", textAlign:"center", animation:shake?"shake 0.6s ease":"none", boxShadow:`0 8px 40px rgba(0,0,0,${C.isDark?0.7:0.2})` }}>
        <div style={{ fontSize:"2rem", marginBottom:"0.75rem" }}>🔞</div>
        <h3 style={{ color:C.gold, fontFamily:"Georgia, serif", fontSize:"1rem", letterSpacing:"0.15em", marginBottom:"0.5rem" }}>{t.nsfwTitle}</h3>
        <p style={{ color:C.muted, fontSize:"0.78rem", fontStyle:"italic", marginBottom:"1.2rem" }}>{t.nsfwPrompt}</p>
        <input type="password" value={code} onChange={e=>{setCode(e.target.value);setErr(false);}}
          onKeyDown={e=>e.key==="Enter"&&submit()} placeholder={t.nsfwPh}
          style={{ width:"100%", background:C.inputBg, border:err?`1px solid #c94040`:`1px solid ${C.inputBorder}`, color:C.text, fontFamily:"Georgia, serif", fontSize:"1.1rem", padding:"0.7rem", borderRadius:3, outline:"none", textAlign:"center", letterSpacing:"0.3em", boxSizing:"border-box" }}
          autoFocus/>
        {err && <p style={{ color:"#e07070", fontSize:"0.72rem", marginTop:"0.4rem" }}>{t.nsfwError}</p>}
        <div style={{ display:"flex", gap:"0.6rem", justifyContent:"center", marginTop:"1.2rem" }}>
          <button onClick={onCancel} style={{ padding:"0.45rem 1rem", border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontFamily:"Georgia, serif", fontSize:"0.78rem", letterSpacing:"0.12em", cursor:"pointer", borderRadius:2 }}>{t.nsfwCancel}</button>
          <button onClick={submit} style={{ padding:"0.45rem 1rem", border:"1px solid #c94040", background:"transparent", color:"#c94040", fontFamily:"Georgia, serif", fontSize:"0.78rem", letterSpacing:"0.12em", cursor:"pointer", borderRadius:2 }}>{t.nsfwConfirm}</button>
        </div>
      </div>
    </div>
  );
}

// ── BookPreview ───────────────────────────────────────────────────

// ── RichTextEditor ─────────────────────────────────────────────────────────
// Portail DOM natif pour la toolbar — contourne tout problème de stacking context
let _rtePortal = null;
const getRtePortal = () => {
  if (!_rtePortal || !document.body.contains(_rtePortal)) {
    _rtePortal = document.createElement("div");
    _rtePortal.id = "rte-portal";
    _rtePortal.style.cssText = "position:fixed;z-index:2147483647;pointer-events:auto;top:0;left:0;";
    document.body.appendChild(_rtePortal);
  }
  return _rtePortal;
};

function RichTextEditor({ html, text, onChange, style, C, S, readOnly = false }) {
  const ref = React.useRef(null);
  const savedSel = React.useRef(null);
  const isOverBar = React.useRef(false);
  const [bar, setBar] = React.useState(null);
  const [fmt, setFmt] = React.useState({});
  const idRef = React.useRef("rte-" + Math.random().toString(36).slice(2));

  React.useEffect(() => {
    if (!ref.current || readOnly) return;
    const init = html || (text || "").split("\n\n").map(p =>
      "<p>" + p.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</p>"
    ).join("") || "";
    ref.current.innerHTML = init;
  }, [readOnly]);

  // Synchroniser la toolbar dans le portail DOM
  React.useEffect(() => {
    const portal = getRtePortal();
    if (!bar) {
      portal.style.display = "none";
      portal.innerHTML = "";
      return;
    }
    portal.style.display = "flex";
    portal.style.top = bar.top + "px";
    portal.style.left = bar.left + "px";
    portal.style.gap = "3px";
    portal.style.alignItems = "center";
    portal.style.padding = "4px 8px";
    portal.style.background = C.card || "#1e1a14";
    portal.style.border = "1px solid " + (C.gold || "#c9a96e") + "99";
    portal.style.borderRadius = "6px";
    portal.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
    portal.style.flexWrap = "nowrap";
    portal.style.width = "340px";

    // Reconstruire le contenu
    portal.innerHTML = "";

    // Bouton avec menu déroulant custom — cliquable partout
    const mkSel = (placeholder, opts, cb) => {
      const wrap = document.createElement("div");
      wrap.style.cssText = "position:relative;display:inline-block;flex-shrink:0;";

      const btn = document.createElement("button");
      const isFont = placeholder === "Police…";
      btn.style.cssText = `height:24px;padding:0 6px;font-size:11px;background:${C.panelBg||"#2a2018"};color:${C.text||"#d4c8b0"};border:1px solid ${C.border||"#4a3a28"};border-radius:3px;cursor:pointer;white-space:nowrap;min-width:${isFont?"72":"52"}px;display:flex;align-items:center;justify-content:space-between;gap:3px;`;
      btn.innerHTML = `<span>${placeholder}</span><span style="font-size:9px;opacity:0.6;">▾</span>`;
      btn.addEventListener("mousedown", e => e.preventDefault());

      const menu = document.createElement("div");
      menu.style.cssText = `display:none;position:fixed;z-index:2147483647;background:${C.card||"#1e1a14"};border:1px solid ${C.gold||"#c9a96e"}88;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.5);min-width:${isFont?"120":"80"}px;max-height:200px;overflow-y:auto;`;

      const closeMenu = () => { menu.style.display = "none"; };

      opts.forEach(o => {
        const item = document.createElement("div");
        item.textContent = o.l;
        item.style.cssText = `padding:5px 10px;font-size:11px;color:${C.text||"#d4c8b0"};cursor:pointer;white-space:nowrap;`;
        if (isFont) item.style.fontFamily = o.v;
        item.addEventListener("mouseenter", () => { item.style.background = (C.gold||"#c9a96e") + "33"; });
        item.addEventListener("mouseleave", () => { item.style.background = "transparent"; });
        item.addEventListener("mousedown", e => e.preventDefault());
        item.addEventListener("click", () => { cb(o.v); closeMenu(); btn.querySelector("span").textContent = o.l; });
        menu.appendChild(item);
      });

      btn.addEventListener("click", () => {
        if (menu.style.display === "none") {
          // Fermer tous les autres menus ouverts
          document.querySelectorAll(".rte-menu-open").forEach(m => { m.style.display = "none"; m.classList.remove("rte-menu-open"); });
          const br = btn.getBoundingClientRect();
          menu.style.top = (br.bottom + 2) + "px";
          menu.style.left = br.left + "px";
          menu.style.display = "block";
          menu.classList.add("rte-menu-open");
          // Fermer au clic extérieur
          setTimeout(() => {
            const close = (e) => { if (!menu.contains(e.target) && e.target !== btn) { closeMenu(); document.removeEventListener("click", close); } };
            document.addEventListener("click", close);
          }, 0);
        } else {
          closeMenu();
        }
      });

      // Attacher le menu au body pour éviter tout clipping
      document.body.appendChild(menu);
      wrap.appendChild(btn);
      wrap._menu = menu; // pour cleanup
      return wrap;
    };

    const mkBtn = (label, active, onClick, extra) => {
      const b = document.createElement("button");
      b.innerHTML = label;
      b.style.cssText = `width:28px;height:28px;border:1px solid ${active ? (C.gold||"#c9a96e") : (C.border||"#4a3a28")};border-radius:3px;cursor:pointer;font-size:13px;line-height:28px;background:${active ? (C.gold||"#c9a96e") : (C.panelBg||"#2a2018")};color:${active ? "#1a1208" : (C.text||"#d4c8b0")};padding:0;flex-shrink:0;text-align:center;font-family:Georgia,serif;`;
      if (extra) Object.assign(b.style, extra);
      b.addEventListener("mousedown", e => e.preventDefault());
      b.addEventListener("click", onClick);
      return b;
    };

    const mkSep = () => {
      const d = document.createElement("div");
      d.style.cssText = `width:1px;height:16px;background:${C.border||"#4a3a28"};flex-shrink:0;`;
      return d;
    };

    const restoreAndExec = (cmd) => {
      restore(); try { document.execCommand(cmd, false, null); } catch(e) {}
      updateFmt(); emit(); ref.current?.focus();
    };

    const restoreAndStyle = (prop, val) => {
      if (!restore()) return;
      const s = window.getSelection();
      if (!s || !s.rangeCount || s.getRangeAt(0).collapsed) return;
      const r = s.getRangeAt(0);
      try {
        const frag = r.extractContents();
        const span = document.createElement("span");
        span.style[prop] = val;
        span.appendChild(frag);
        r.insertNode(span);
        const nr = document.createRange();
        nr.selectNodeContents(span);
        s.removeAllRanges(); s.addRange(nr);
        savedSel.current = nr.cloneRange();
      } catch(e) {}
      emit(); ref.current?.focus();
    };

    const FONTS = [
      { l: "Georgia", v: "Georgia, serif" },
      { l: "Palatino", v: '"Palatino Linotype", serif' },
      { l: "Times", v: '"Times New Roman", serif' },
      { l: "Baskerville", v: "Baskerville, serif" },
      { l: "Sans", v: "Arial, sans-serif" },
    ];
    const SIZES = ["9","11","13","16","20","28"].map(s => ({ l: s+"pt", v: s }));

    portal.appendChild(mkSel("Police…", FONTS, v => restoreAndStyle("fontFamily", v)));
    portal.appendChild(mkSel("Taille", SIZES, v => restoreAndStyle("fontSize", v+"pt")));
    portal.appendChild(mkSep());
    portal.appendChild(mkBtn("<b>B</b>", fmt.bold,      () => restoreAndExec("bold")));
    portal.appendChild(mkBtn("<i>I</i>", fmt.italic,    () => restoreAndExec("italic")));
    const uBtn = mkBtn("U", fmt.underline, () => restoreAndExec("underline"));
    uBtn.style.textDecoration = "underline";
    portal.appendChild(uBtn);
    portal.appendChild(mkSep());

    const col = document.createElement("input");
    col.type = "color";
    col.style.cssText = `width:24px;height:24px;border:1px solid ${C.border||"#4a3a28"};border-radius:3px;padding:1px;cursor:pointer;background:${C.panelBg||"#2a2018"};flex-shrink:0;`;
    col.addEventListener("change", e => { restore(); try { document.execCommand("foreColor", false, e.target.value); } catch(e2) {} emit(); ref.current?.focus(); });
    portal.appendChild(col);

    const clr = mkBtn("✕", false, () => restoreAndExec("removeFormat"), { width: "auto", padding: "0 5px", fontSize: "11px", color: C.muted||"#9a8a70" });
    portal.appendChild(clr);

    portal.onmouseenter = () => { isOverBar.current = true; };
    portal.onmouseleave = () => { isOverBar.current = false; };

    return () => { portal.onmouseenter = null; portal.onmouseleave = null; };
  }, [bar, fmt]);

  // Fermer la toolbar au clic extérieur
  React.useEffect(() => {
    if (readOnly) return;
    const onDocClick = (e) => {
      const portal = document.getElementById("rte-portal");
      const isInPortal = portal && portal.contains(e.target);
      const isInEditor = ref.current && ref.current.contains(e.target);
      const isInMenu = e.target.closest && e.target.closest(".rte-menu-open");
      if (!isInPortal && !isInEditor && !isInMenu) {
        setBar(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [readOnly]);

  // Cleanup au démontage
  React.useEffect(() => () => {
    const p = document.getElementById("rte-portal");
    if (p) {
      document.querySelectorAll(".rte-menu-open").forEach(m => m.remove());
      p.style.display = "none"; p.innerHTML = "";
    }
  }, []);

  const updateFmt = () => {
    try { setFmt({ bold: document.queryCommandState("bold"), italic: document.queryCommandState("italic"), underline: document.queryCommandState("underline") }); } catch(e) {}
  };

  const restore = () => {
    if (!savedSel.current) return false;
    try { const s = window.getSelection(); s.removeAllRanges(); s.addRange(savedSel.current); return true; } catch(e) { return false; }
  };

  const emit = () => { if (ref.current && onChange) onChange(ref.current.innerHTML); };

  const showBar = (e) => {
    if (readOnly) return;
    const mx = e.clientX, my = e.clientY;
    setTimeout(() => {
      try {
        const s = window.getSelection();
        if (!s || s.isCollapsed || !s.toString().trim()) return;
        if (!ref.current?.contains(s.anchorNode)) return;
        savedSel.current = s.getRangeAt(0).cloneRange();
        const W = 340, H = 44;
        let left = mx - W / 2;
        left = Math.max(4, Math.min(left, window.innerWidth - W - 4));
        const top = my >= H + 10 ? my - H - 6 : my + 20;
        setBar({ top, left });
        updateFmt();
      } catch(e) {}
    }, 10);
  };

  if (readOnly) {
    if (html) return <div dangerouslySetInnerHTML={{ __html: html }} style={{ lineHeight: 1.95, ...style }} />;
    return <>{(text || "").split("\n\n").map((p, i) =>
      p.trim() === "— ✦ —"
        ? <div key={i} style={{ textAlign:"center", color:C.gold, opacity:0.25, margin:"2rem 0", letterSpacing:".5em" }}>✦ ✦ ✦</div>
        : p.trim() ? <p key={i} style={{ margin:"0 0 1.3em", ...style }}>{p}</p> : null
    )}</>;
  }

  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      onMouseUp={showBar}
      onBlur={() => { emit(); }}
      onInput={emit}
      style={{ outline:`1px dashed ${C.gold||"#c9a96e"}44`, borderRadius:3, padding:"0.25rem",
        minHeight:"2em", cursor:"text", lineHeight:1.95, ...style }} />
  );
}


function BookPreview({ book, onClose, onDownload, downloading, onUpdateImage, savingEpub, onDownloadEpub, advancedMode, t, characters = [], locations = [], onPartsChange, onChaptersChange, onExtrasChange, chatInjectRef }) {
  const C = useTheme(); const S = makeS(C);
  const { title, author, genreStr, parts: initialParts, chapters, summary, images = {}, coverDataUrl, backCoverDataUrl } = book;
  const [localImages, setLocalImages] = useState(images);
  const [localCover, setLocalCover] = useState(coverDataUrl || null);
  const [localBack, setLocalBack] = useState(backCoverDataUrl || null);
  const [showToc, setShowToc] = useState(false);
  const ROMANS_TOC = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
  const [localParts, setLocalParts] = useState(initialParts);
  const [localChapters, setLocalChapters] = useState(chapters || [{ title: "Chapitre I", closed: false }]);

  // ── Typographie ──────────────────────────────────────────────────
  const FONTS = [
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Palatino", value: '"Palatino Linotype", Palatino, serif' },
    { label: "Times", value: '"Times New Roman", Times, serif' },
    { label: "Garamond", value: "Garamond, serif" },
    { label: "Baskerville", value: "Baskerville, serif" },
  ];
  const bExtras = book?.extras || {};
  const [typo, setTypo] = useState(bExtras.typo || { bodyFont: "Georgia, serif", bodySize: 1.0, titleFont: "Georgia, serif", titleSize: 1.3, tocFont: "Georgia, serif", tocSize: 1.0 });
  const [showTypoPanel, setShowTypoPanel] = useState(false);

  // ── Préface ──────────────────────────────────────────────────────
  const [preface, setPreface] = useState(bExtras.preface || { enabled: false, text: "", html: null, font: "Georgia, serif", size: 1.0, italic: true, include: "", exclude: "", writingStyle: "" });
  const [generatingPreface, setGeneratingPreface] = useState(false);

  // ── Crédits ──────────────────────────────────────────────────────
  const [credits, setCredits] = useState(bExtras.credits || { enabled: false, text: "", html: null, font: "Georgia, serif", size: 0.85, italic: false, include: "", exclude: "" });
  const [generatingCredits, setGeneratingCredits] = useState(false);

  // ── Personnages (annexe) ─────────────────────────────────────────
  const [showCharacters, setShowCharacters] = useState(bExtras.showCharacters || false);

  // ── Images sommaire ──────────────────────────────────────────────
  const [tocImageBefore, setTocImageBefore] = useState(null);
  const [tocImageAfter, setTocImageAfter] = useState(null);

  // ── Config sommaire ──────────────────────────────────────────────
  const [tocConfig, setTocConfig] = useState(bExtras.tocConfig || { show: true, position: "start" });

  // ── Folio (numéro de page) ───────────────────────────────────────
  const [folio, setFolio] = useState(bExtras.folio || {
    show: true,
    position: "center",
    format: "n / N",
    font: "Georgia, serif",
    size: 8.5,
    color: "#9a8a70",
    logo: null,
    logoPosition: "left",
    prefix: "",
    suffix: "",
  });
  const [showFolioPanel, setShowFolioPanel] = useState(false);




  // ── Style couverture ─────────────────────────────────────────────
  const COVER_COLORS = [
    { label: "Aucun", value: "none" },
    { label: "Noir", value: "rgba(0,0,0,0.75)" },
    { label: "Blanc", value: "rgba(255,255,255,0.85)" },
    { label: "Or", value: "rgba(201,169,110,0.25)" },
    { label: "Sombre", value: "rgba(15,10,5,0.88)" },
  ];
  const [coverStyle, setCoverStyle] = useState(bExtras.coverStyle || {
    titleFont: "Georgia, serif", titleSize: 1.6, titleColor: "#ffffff",
    showTitle: true,
    authorFont: "Georgia, serif", authorSize: 0.9, authorColor: "#e0d0a0",
    showAuthor: true,
    overlayColor: "rgba(0,0,0,0.75)",
  });
  const [showCoverPanel, setShowCoverPanel] = useState(false);

  // ── Persistance temps réel des extras ───────────────────────────
  React.useEffect(() => {
    if (onExtrasChange) {
      onExtrasChange({ preface, credits, showCharacters, typo, coverStyle, folio, tocConfig });
    }
  }, [preface, credits, showCharacters, typo, coverStyle, folio, tocConfig]);

  // ── Génération IA préface / crédits ─────────────────────────────
  const generatePreface = async () => {
    setGeneratingPreface(true);
    try {
      const storyText = localParts.map(p => p.text).join("\n\n").slice(0, 3000);
      const lang = book.language || "french";
      const incl = preface.include?.trim();
      const excl = preface.exclude?.trim();
      const inclStr = incl ? (lang === "french" ? `\nÉléments à inclure absolument : ${incl}` : `\nMust include: ${incl}`) : "";
      const exclStr = excl ? (lang === "french" ? `\nÉléments à éviter : ${excl}` : `\nAvoid: ${excl}`) : "";
      const styleAuthor = preface.writingStyle;
      const styleFingerprint = styleAuthor ? AUTHOR_STYLES[styleAuthor] : null;
      const styleStr = styleAuthor
        ? (lang === "french"
          ? `\nSTYLE IMPOSÉ — Écris cette préface à la manière de ${styleAuthor}. ${styleFingerprint ? `Caractéristiques stylistiques : ${styleFingerprint}` : `Applique le ton, le rythme et les procédés narratifs propres à ${styleAuthor}.`}`
          : `\nSTYLE REQUIRED — Write this preface in the style of ${styleAuthor}. ${styleFingerprint || `Apply the tone, rhythm and narrative techniques of ${styleAuthor}.`}`)
        : "";
      const prompt = lang === "french"
        ? `Tu es un auteur littéraire. Écris une préface de 2-3 paragraphes pour ce livre intitulé "${title}"${author ? ` par ${author}` : ""}. La préface doit introduire l'œuvre, son contexte et ses thèmes principaux.${styleStr}${inclStr}${exclStr}\nVoici un extrait du livre :\n\n${storyText}\n\nÉcris uniquement la préface, sans titre, en prose élégante.`
        : `You are a literary author. Write a 2-3 paragraph preface for this book titled "${title}"${author ? ` by ${author}` : ""}. Introduce the work, its context and main themes.${styleStr}${inclStr}${exclStr}\nHere is an excerpt:\n\n${storyText}\n\nWrite only the preface, no title, in elegant prose.`;
      const resp = await callClaude([{ role: "user", content: prompt }], 600, 30000, 0.8);
      setPreface(prev => ({ ...prev, text: resp.trim() }));
    } catch(e) { console.error("Préface generation error:", e); }
    setGeneratingPreface(false);
  };

  const generateCredits = async () => {
    setGeneratingCredits(true);
    try {
      const lang = book.language || "french";
      const year = new Date().getFullYear();
      const incl = credits.include?.trim();
      const excl = credits.exclude?.trim();
      const inclStr = incl ? (lang === "french" ? `\nÉléments à inclure absolument : ${incl}` : `\nMust include: ${incl}`) : "";
      const exclStr = excl ? (lang === "french" ? `\nÉléments à éviter : ${excl}` : `\nAvoid: ${excl}`) : "";
      const prompt = lang === "french"
        ? `Écris une page de crédits/colophon sobre et élégante pour le livre "${title}"${author ? ` par ${author}` : ""}. Inclus : mention de droits (© ${year}), remerciements courts, et un achevé d'imprimer fictif poétique. 3-4 paragraphes courts. Pas de titre, juste le texte.${inclStr}${exclStr}`
        : `Write a sober and elegant credits/colophon page for the book "${title}"${author ? ` by ${author}` : ""}. Include: copyright notice (© ${year}), brief acknowledgments, and a poetic fictional colophon. 3-4 short paragraphs. No title, just the text.${inclStr}${exclStr}`;
      const resp = await callClaude([{ role: "user", content: prompt }], 400, 30000, 0.8);
      setCredits(prev => ({ ...prev, text: resp.trim() }));
    } catch(e) { console.error("Credits generation error:", e); }
    setGeneratingCredits(false);
  };

  const propagate = (newParts, newChapters) => {
    setLocalParts(newParts);
    onPartsChange?.(newParts);
    if (newChapters) { setLocalChapters(newChapters); onChaptersChange?.(newChapters); }
  };

  // Insérer une coupure de chapitre avant la partie globalIdx
  const insertChapterBreak = (globalIdx) => {
    if (globalIdx === 0) return; // pas de coupure avant la toute première partie
    // Trouver le chapterIdx de la partie précédente
    const partBefore = localParts[globalIdx - 1];
    const currentChapIdx = partBefore?.chapterIdx ?? 0;
    const newChapIdx = currentChapIdx + 1;
    // Décaler tous les chapterIdx à partir de globalIdx
    const newParts = localParts.map((p, i) => {
      if (i < globalIdx) return p;
      return { ...p, chapterIdx: (p.chapterIdx ?? 0) + 1 };
    });
    // Insérer un nouveau chapitre dans localChapters après currentChapIdx
    const romanNum = n => ["I","II","III","IV","V","VI","VII","VIII","IX","X"][n] || String(n + 1);
    const newChapters = [
      ...localChapters.slice(0, newChapIdx),
      { title: `Chapitre ${romanNum(newChapIdx)}`, closed: false },
      ...localChapters.slice(newChapIdx).map(ch => ch), // chapitres suivants inchangés
    ];
    propagate(newParts, newChapters);
  };
  const [editMode, setEditMode] = useState(false);
  // Sync vers App quand les valeurs changent
  const [processingIdx, setProcessingIdx] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Panneau axes — partagé pour reformuler ET liaison
  // type: "rewrite" | "liaison"
  // pour "rewrite" : targetIdx = globalIdx de la partie
  // pour "liaison" : targetIdx = globalIdx après lequel insérer
  const [axesPanel, setAxesPanel] = useState(null);
  // { type, targetIdx, include, exclude, words, axes, loadingAxes, selectedAxis }

  const chCount = localChapters?.length || 1;
  const byChapter = Array.from({ length: chCount }, (_, ci) => ({
    title: localChapters?.[ci]?.title || ("Chapitre " + (ci + 1)),
    parts: localParts.map((p, gi) => ({ ...p, globalIdx: gi })).filter(p => (p.chapterIdx ?? 0) === ci),
  }));
  const roman = n => ["I","II","III","IV","V","VI","VII","VIII","IX","X"][n] || String(n + 1);

  const handleCoverFile = async (file) => { const { dataUrl } = await readImageFile(file); setLocalCover(dataUrl); onUpdateImage("cover", null, dataUrl); };
  const handleBackFile = async (file) => { const { dataUrl } = await readImageFile(file); setLocalBack(dataUrl); onUpdateImage("back", null, dataUrl); };
  const handleChapFile = async (ci, file) => { const { dataUrl } = await readImageFile(file); setLocalImages(prev => ({ ...prev, [ci]: dataUrl })); onUpdateImage("chapter", ci, dataUrl); };

  const styleHint = book.choices?.writingStyle ? `Style d'écriture : ${book.choices.writingStyle}.` : "";

  // ── Ouvrir le panneau de choix ──
  // ── Ouvrir le panneau de choix ──
  const openPanel = (type, targetIdx, defaultWords = 300) => {
    if (type === "expand") {
      const part = localParts[targetIdx];
      const currentWords = part.text.split(/\s+/).filter(Boolean).length;
      defaultWords = Math.max(Math.round(currentWords * 1.5 / 50) * 50, currentWords + 100);
    }
    setAxesPanel({ type, targetIdx, include: "", exclude: "", words: defaultWords, axes: null, loadingAxes: false, selectedAxis: null });
  };

  const updatePanel = (patch) => setAxesPanel(prev => prev ? { ...prev, ...patch } : null);

  // ── Générer les axes ──
  const generateAxesForEdit = async () => {
    if (!axesPanel) return;
    updatePanel({ loadingAxes: true, axes: null, selectedAxis: null });
    const { type, targetIdx, include, exclude, words } = axesPanel;
    let prompt = "";
    if (type === "rewrite") {
      const part = localParts[targetIdx];
      const before = localParts.slice(0, targetIdx).map(p => p.text).join("\n\n").slice(-600);
      const after  = localParts.slice(targetIdx + 1).map(p => p.text).join("\n\n").slice(0, 300);
      prompt = `${styleHint}
Contexte AVANT ce passage : "${before}"
Contexte APRÈS ce passage : "${after}"
${include ? `Éléments à inclure : ${include}` : ""}
${exclude ? `Éléments à éviter : ${exclude}` : ""}

PASSAGE ORIGINAL (${part.text.split(/\s+/).length} mots) :
${part.text}

Propose 3 façons différentes de reformuler ce passage en conservant les mêmes événements et personnages mais en variant le ton, le rythme ou l'angle narratif.
Réponds UNIQUEMENT en JSON valide : [{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."}]
Chaque "title" = 4-5 mots. Chaque "description" = 2-3 phrases décrivant l'approche stylistique proposée.`;
    } else if (type === "expand") {
      const part = localParts[targetIdx];
      const currentWords = part.text.split(/\s+/).filter(Boolean).length;
      const before = localParts.slice(0, targetIdx).map(p => p.text).join("\n\n").slice(-500);
      const after  = localParts.slice(targetIdx + 1).map(p => p.text).join("\n\n").slice(0, 300);
      prompt = `${styleHint}
Contexte AVANT : "${before}"
Contexte APRÈS : "${after}"
${include ? `Éléments à développer en priorité : ${include}` : ""}
${exclude ? `Éléments à éviter : ${exclude}` : ""}

PASSAGE ORIGINAL (${currentWords} mots) :
${part.text}

Propose 3 façons différentes d'étofser ce passage pour atteindre environ ${words} mots, en conservant exactement les mêmes événements et personnages.
Chaque approche doit enrichir le texte différemment (ex : développer les descriptions, approfondir les émotions, ajouter des dialogues, ralentir le rythme…).
Réponds UNIQUEMENT en JSON valide : [{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."}]
Chaque "title" = 4-5 mots. Chaque "description" = 2-3 phrases décrivant comment le passage sera étoffé.`;
    } else {
      const before = localParts.slice(0, targetIdx + 1).map(p => p.text).join("\n\n").slice(-800);
      const after  = localParts.slice(targetIdx + 1).map(p => p.text).join("\n\n").slice(0, 500);
      prompt = `${styleHint}
CE QUI PRÉCÈDE : "${before}"
CE QUI SUIT : "${after}"
${include ? `Éléments à inclure dans la liaison : ${include}` : ""}
${exclude ? `Éléments à éviter : ${exclude}` : ""}

Propose 3 façons différentes de relier ces deux passages avec un texte de liaison d'environ ${words} mots.
Chaque option doit avoir une approche narrative distincte (ex : ellipse temporelle, scène d'action, introspection, dialogue…).
Réponds UNIQUEMENT en JSON valide : [{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."}]
Chaque "title" = 4-5 mots. Chaque "description" = 2-3 phrases décrivant comment la liaison s'articule.`;
    }
    try {
      const raw = await callClaude([{ role: "user", content: prompt }], 600, 30000, 2, false);
      const clean = raw.replace(/```json[\s\S]*?```|```/g, "").trim();
      let parsed = null;
      const fullMatch = clean.match(/\[[\s\S]*\]/);
      if (fullMatch) {
        try { parsed = JSON.parse(fullMatch[0].replace(/[\u2018\u2019\u201C\u201D]/g, "'").replace(/,\s*([}\]])/g, '$1')); } catch(_) {}
      }
      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
        const items = []; const re = /\{[^{}]*"title"\s*:\s*"([^"]+)"[^{}]*"description"\s*:\s*"([^"]+)"[^{}]*\}/g; let m;
        while ((m = re.exec(clean)) !== null) items.push({ title: m[1], description: m[2] });
        if (items.length > 0) parsed = items;
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        updatePanel({ axes: parsed, loadingAxes: false });
        addLog("info", "EDIT", `✓ ${parsed.length} axes générés (${type})`);
      } else throw new Error("Pas de JSON trouvé");
    } catch(e) {
      addLog("warn", "EDIT", `⚠ Axes échoués : ${e.message}`);
      updatePanel({ loadingAxes: false });
    }
  };

  // ── Exécuter l'action avec l'axe sélectionné ──
  const executeWithAxis = async () => {
    if (!axesPanel) return;
    const { type, targetIdx, include, exclude, words, selectedAxis, axes } = axesPanel;
    const axisDesc = selectedAxis !== null && axes ? axes[selectedAxis]?.description : null;
    setAxesPanel(null);
    setProcessingIdx(type === "liaison" ? -1 : targetIdx);

    try {
      if (type === "rewrite") {
        const part = localParts[targetIdx];
        const before = localParts.slice(0, targetIdx).map(p => p.text).join("\n\n").slice(-800);
        const after  = localParts.slice(targetIdx + 1).map(p => p.text).join("\n\n").slice(0, 400);
        const prompt = `${styleHint}
Contexte AVANT : "${before}"
Contexte APRÈS : "${after}"
${axisDesc ? `Approche choisie : ${axisDesc}` : ""}
${include ? `Éléments à inclure : ${include}` : ""}
${exclude ? `Éléments à éviter : ${exclude}` : ""}

Reformule ce passage (~${part.text.split(/\s+/).length} mots) selon l'approche indiquée. Conserve les mêmes événements et personnages.
Écris uniquement le texte reformulé, sans commentaire ni titre.

PASSAGE ORIGINAL :
${part.text}`;
        const newText = await callClaude([{ role: "user", content: prompt }], 4000, null);
        if (!newText?.trim()) throw new Error("Réponse vide");
        propagate(localParts.map((p, i) => i === targetIdx ? { ...p, text: newText.trim() } : p));
        addLog("info", "EDIT", `✓ Partie ${targetIdx+1} reformulée (axe: ${axes?.[selectedAxis]?.title || "libre"})`);

      } else if (type === "expand") {
        const part = localParts[targetIdx];
        const before = localParts.slice(0, targetIdx).map(p => p.text).join("\n\n").slice(-800);
        const after  = localParts.slice(targetIdx + 1).map(p => p.text).join("\n\n").slice(0, 400);
        const prompt = `${styleHint}
Contexte AVANT : "${before}"
Contexte APRÈS : "${after}"
${axisDesc ? `Approche d'étoffement choisie : ${axisDesc}` : ""}
${include ? `Éléments à développer en priorité : ${include}` : ""}
${exclude ? `Éléments à éviter : ${exclude}` : ""}

PASSAGE ORIGINAL (${part.text.split(/\s+/).filter(Boolean).length} mots) :
${part.text}

Récris ce passage en l'étoffant pour atteindre environ ${words} mots. Conserve EXACTEMENT les mêmes événements, personnages et la même chronologie.
Enrichis le texte selon l'approche choisie (descriptions, émotions, dialogues, rythme…) mais ne change pas ce qui se passe.
Écris uniquement le texte étoffé, sans commentaire ni titre.`;
        const expandedTokens = Math.min(Math.round(words * 1.8), 6000);
        const newText = await callClaude([{ role: "user", content: prompt }], expandedTokens, null);
        if (!newText?.trim()) throw new Error("Réponse vide");
        propagate(localParts.map((p, i) => i === targetIdx ? { ...p, text: newText.trim() } : p));
        addLog("info", "EDIT", `✓ Partie ${targetIdx+1} étoffée : ${part.text.split(/\s+/).filter(Boolean).length} → ${newText.trim().split(/\s+/).filter(Boolean).length} mots`);

      } else {
        const before = localParts.slice(0, targetIdx + 1).map(p => p.text).join("\n\n").slice(-1000);
        const after  = localParts.slice(targetIdx + 1).map(p => p.text).join("\n\n").slice(0, 600);
        const chapterIdx = localParts[targetIdx]?.chapterIdx ?? 0;
        const prompt = `${styleHint}
CE QUI PRÉCÈDE : "${before}"
CE QUI SUIT : "${after}"
${axisDesc ? `Approche choisie : ${axisDesc}` : ""}
${include ? `Éléments à inclure : ${include}` : ""}
${exclude ? `Éléments à éviter : ${exclude}` : ""}

Écris un passage de liaison d'environ ${words} mots qui s'enchaîne naturellement entre les deux extraits selon l'approche indiquée.
Garde les mêmes personnages et le même style. Écris uniquement le texte, sans titre ni commentaire.`;
        const newText = await callClaude([{ role: "user", content: prompt }], 2000, null);
        if (!newText?.trim()) throw new Error("Réponse vide");
        const newPart = { text: newText.trim(), include: "", exclude: "", chapterIdx };
        propagate([...localParts.slice(0, targetIdx + 1), newPart, ...localParts.slice(targetIdx + 1)]);
        addLog("info", "EDIT", `✓ Liaison insérée après partie ${targetIdx+1}`);
      }
    } catch(e) {
      addLog("error", "EDIT", `✕ Échec : ${e.message}`);
    }
    setProcessingIdx(null);
  };

  // ── Supprimer une partie ──
  const deletePart = (globalIdx) => {
    propagate(localParts.filter((_, i) => i !== globalIdx));
    setConfirmDelete(null);
    addLog("info", "EDIT", `Partie ${globalIdx+1} supprimée`);
  };

  // ── Déplacer ──
  const movePart = (globalIdx, dir) => {
    const target = globalIdx + dir;
    if (target < 0 || target >= localParts.length) return;
    const np = [...localParts];
    [np[globalIdx], np[target]] = [np[target], np[globalIdx]];
    propagate(np);
  };

  const isProcessing = processingIdx !== null;

  // ── Panneau axes modal ──
  const AxesModal = () => {
    if (!axesPanel) return null;
    const { type, include, exclude, words, axes, loadingAxes, selectedAxis } = axesPanel;
    const isRewrite = type === "rewrite";
    const isExpand  = type === "expand";
    const accentColor = isRewrite ? "#7a6aaa" : isExpand ? "#3a8a70" : C.blue;
    const titleLabel  = isRewrite ? "✦ REFORMULER CE PASSAGE" : isExpand ? "↕ ÉTOFFER CE PASSAGE" : "+ PASSAGE DE LIAISON";
    return (
      <div style={{ position: "fixed", inset: 0, background: `rgba(0,0,0,0.88)`, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ background: C.bg, border: `1px solid ${accentColor}`, borderRadius: 6, padding: "1.5rem", maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
          {/* Titre */}
          <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
            <div style={{ color: accentColor, fontSize: "0.6rem", letterSpacing: "0.3em", marginBottom: "0.3rem" }}>
              {titleLabel}
            </div>
          </div>

          {/* Include / Exclude */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.8rem" }}>
            <div>
              <div style={{ ...S.label, color: C.green }}>{isExpand ? "↕ Développer" : "✦ Inclure"}</div>
              <textarea value={include} onChange={e => updatePanel({ include: e.target.value })}
                placeholder={isExpand ? "Descriptions, émotions, dialogues…" : "Thèmes, éléments, effets à intégrer…"}
                style={{ ...S.input, fontSize: "0.72rem", minHeight: "52px" }} />
            </div>
            <div>
              <div style={{ ...S.label, color: "#e06060" }}>✕ Exclure</div>
              <textarea value={exclude} onChange={e => updatePanel({ exclude: e.target.value })}
                placeholder="Ce qu'il faut éviter…"
                style={{ ...S.input, fontSize: "0.72rem", minHeight: "52px" }} />
            </div>
          </div>

          {/* Longueur cible (liaison et expand) */}
          {!isRewrite && (
            <div style={{ marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ ...S.label, marginBottom: 0 }}>{isExpand ? "Longueur cible" : "Longueur"}</span>
                <span style={{ color: accentColor, fontSize: "0.78rem" }}>~{words} mots</span>
              </div>
              <input type="range"
                min={isExpand ? 200 : 80}
                max={isExpand ? 5000 : 800}
                step={isExpand ? 100 : 40}
                value={words}
                onChange={e => updatePanel({ words: Number(e.target.value) })}
                style={{ width: "100%", accentColor }} />
              {isExpand && (
                <div style={{ color: C.muted, fontSize: "0.65rem", fontStyle: "italic", marginTop: "0.3rem" }}>
                  Le sens et les événements restent identiques — seul le développement change.
                </div>
              )}
            </div>
          )}

          {/* Bouton générer axes */}
          {!axes && (
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <button onClick={generateAxesForEdit} disabled={loadingAxes}
                style={{ ...S.btn(accentColor), padding: "0.65rem 2rem" }}>
                {loadingAxes ? "⟳ Génération des axes…" : "✦ Proposer des axes narratifs"}
              </button>
            </div>
          )}

          {/* Axes proposés */}
          {axes && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ ...S.label, textAlign: "center", marginBottom: "0.6rem" }}>Choisissez une approche</div>
              {axes.map((ax, i) => (
                <div key={i} onClick={() => updatePanel({ selectedAxis: i })}
                  style={{ border: `1px solid ${selectedAxis === i ? accentColor : C.border}`, borderRadius: 4, padding: "0.75rem 1rem", marginBottom: "0.5rem", cursor: "pointer", background: selectedAxis === i ? `${accentColor}18` : "transparent", transition: "all 0.15s" }}>
                  <div style={{ color: selectedAxis === i ? accentColor : C.text, fontSize: "0.78rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
                    {selectedAxis === i ? "✓ " : ""}{ax.title}
                  </div>
                  <div style={{ color: C.muted, fontSize: "0.7rem", lineHeight: 1.5 }}>{ax.description}</div>
                </div>
              ))}
              {/* Option libre */}
              <div onClick={() => updatePanel({ selectedAxis: null })}
                style={{ border: `1px solid ${selectedAxis === null ? C.gold+"44" : C.border}`, borderRadius: 4, padding: "0.6rem 1rem", cursor: "pointer", background: selectedAxis === null ? "rgba(80,70,50,0.15)" : "transparent", transition: "all 0.15s" }}>
                <div style={{ color: selectedAxis === null ? C.gold : C.muted, fontSize: "0.72rem" }}>
                  {selectedAxis === null ? "✓ " : ""}Laisser Claude choisir librement
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {axes && (
              <button onClick={executeWithAxis}
                style={{ ...S.btn(accentColor), padding: "0.6rem 1.8rem" }}>
                {isRewrite ? "✦ Reformuler" : isExpand ? "↕ Étoffer ce passage" : "+ Générer la liaison"}
              </button>
            )}
            {axes && (
              <button onClick={() => updatePanel({ axes: null, selectedAxis: null })}
                style={{ ...S.btn(C.gold, "small"), fontSize: "0.7rem" }}>
                ↺ Nouveaux axes
              </button>
            )}
            <button onClick={() => setAxesPanel(null)}
              style={{ ...S.btn(C.muted, "small"), fontSize: "0.7rem" }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="book-preview-root" style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 1000, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>
      <style>{`@keyframes bookIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}.bi{animation:bookIn 0.4s ease forwards}`}</style>

      <AxesModal />

      {/* ── Sommaire flottant ── */}
      {tocConfig.show && showToc !== undefined && byChapter.filter(ch => ch.parts.length > 0).length > 0 && (
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200 }}>
          {showToc && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "0.75rem 0", marginBottom: "0.4rem", boxShadow: `0 4px 24px rgba(0,0,0,0.25)`, minWidth: 200, maxWidth: 280, maxHeight: "60vh", overflowY: "auto" }}>
              <div style={{ fontSize: "0.55rem", letterSpacing: "0.25em", color: C.gold, textTransform: "uppercase", padding: "0 1rem 0.5rem", borderBottom: `1px solid ${C.border}`, marginBottom: "0.4rem" }}>Sommaire</div>
              {preface.enabled && preface.text && (
                <div onClick={() => { document.getElementById("bk-preface")?.scrollIntoView({ behavior: "smooth", block: "start" }); setShowToc(false); }}
                  style={{ padding: "0.4rem 1rem", cursor: "pointer", fontSize: "0.7rem", color: C.muted, fontFamily: "Georgia, serif", fontStyle: "italic" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.gold}15`}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  Préface
                </div>
              )}
          {byChapter.map((ch, ci) => ch.parts.length === 0 ? null : (
                <div key={ci}
                  onClick={() => { document.getElementById(`bk-chap-${ci}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); setShowToc(false); }}
                  style={{ padding: "0.4rem 1rem", cursor: "pointer", fontSize: "0.72rem", color: C.text, fontFamily: "Georgia, serif", display: "flex", gap: "0.6rem", alignItems: "baseline" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.gold}15`}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ color: C.gold, fontSize: "0.62rem", flexShrink: 0, opacity: 0.8 }}>{ROMANS_TOC[ci] || String(ci+1)}</span>
                  <span style={{ opacity: 0.85 }}>{ch.title || `Chapitre ${ROMANS_TOC[ci] || ci+1}`}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <button onClick={() => document.getElementById("book-preview-root")?.scrollTo({ top: 0, behavior: "smooth" })}
              title="Haut de page"
              style={{ ...S.btn(C.muted, "small"), fontSize: "0.75rem", padding: "0.4rem 0.5rem", background: C.card }}>↑</button>
            <button onClick={() => setShowToc(v => !v)}
              style={{ ...S.btn(showToc ? C.gold : C.muted, "small"), fontSize: "0.68rem", padding: "0.4rem 0.85rem", background: C.card, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {showToc ? "✕" : "☰"} <span>Sommaire</span>
            </button>
            <button onClick={() => { const el = document.getElementById("book-preview-root"); if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }}
              title="Bas de page"
              style={{ ...S.btn(C.muted, "small"), fontSize: "0.75rem", padding: "0.4rem 0.5rem", background: C.card }}>↓</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.bg, backdropFilter: "blur(6px)", borderBottom: `1px solid ${C.border}`, padding: "0.75rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <button onClick={onClose} style={S.btn(C.muted, "small")}>{t.backBtn}</button>
        <span style={{ color: C.gold, fontSize: "0.65rem", letterSpacing: "0.3em" }}>{t.previewTitle}</span>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {advancedMode && (
            <button onClick={() => setEditMode(v => !v)}
              style={{ ...S.btn(editMode ? C.gold : C.muted, "small"), fontSize: "0.68rem" }}>
              {editMode ? "✓ Mode édition" : "✎ Éditer"}
            </button>
          )}
          <button onClick={() => setShowTypoPanel(v => !v)} title="Typographie"
            style={{ ...S.btn(showTypoPanel ? C.gold : C.muted, "small"), fontSize: "0.68rem", padding: "0.4rem 0.6rem" }}>
            Aa
          </button>
          {advancedMode && (
            <button onClick={() => onDownloadEpub(localCover, localBack, localImages)} disabled={savingEpub}
              style={{ ...S.btn(C.blue, "small"), opacity: savingEpub ? 0.4 : 1 }}>
              {savingEpub ? "EPUB…" : t.epubLabel}
            </button>
          )}
          <button onClick={() => onDownload(localCover, localBack, localImages, { preface, credits, showCharacters, characters, typo, coverStyle, folio, tocConfig })} disabled={downloading}
            style={{ ...S.btn(C.green, "small"), opacity: downloading ? 0.4 : 1 }}>
            {downloading ? "…" : t.dlBtn}
          </button>
        </div>
      </div>

      {/* ── Panneau typographie ── */}
      {showTypoPanel && (
        <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "1rem 1.5rem", display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
          {/* Corps du texte */}
          <div>
            <div style={{ ...S.label, marginBottom: "0.4rem", color: C.gold }}>Corps du texte</div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
              {FONTS.map(f => (
                <button key={f.value} onClick={() => setTypo(prev => ({ ...prev, bodyFont: f.value }))}
                  style={{ ...S.chip(typo.bodyFont === f.value), fontSize: "0.65rem", fontFamily: f.value }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.62rem", color: C.muted }}>Taille</span>
              {[0.85, 0.9, 1.0, 1.1, 1.2].map(s => (
                <button key={s} onClick={() => setTypo(prev => ({ ...prev, bodySize: s }))}
                  style={{ ...S.chip(typo.bodySize === s), fontSize: "0.62rem", padding: "0.15rem 0.4rem", minWidth: 32 }}>
                  {s === 0.85 ? "XS" : s === 0.9 ? "S" : s === 1.0 ? "M" : s === 1.1 ? "L" : "XL"}
                </button>
              ))}
            </div>
          </div>
          {/* Titres */}
          <div>
            <div style={{ ...S.label, marginBottom: "0.4rem", color: C.gold }}>Titres de chapitres</div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
              {FONTS.map(f => (
                <button key={f.value} onClick={() => setTypo(prev => ({ ...prev, titleFont: f.value }))}
                  style={{ ...S.chip(typo.titleFont === f.value), fontSize: "0.65rem", fontFamily: f.value }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.62rem", color: C.muted }}>Taille</span>
              {[1.1, 1.2, 1.3, 1.5, 1.8].map(s => (
                <button key={s} onClick={() => setTypo(prev => ({ ...prev, titleSize: s }))}
                  style={{ ...S.chip(typo.titleSize === s), fontSize: "0.62rem", padding: "0.15rem 0.4rem", minWidth: 32 }}>
                  {s === 1.1 ? "XS" : s === 1.2 ? "S" : s === 1.3 ? "M" : s === 1.5 ? "L" : "XL"}
                </button>
              ))}
            </div>
          </div>
          {/* Sommaire */}
          <div>
            <div style={{ ...S.label, marginBottom: "0.4rem", color: C.gold }}>Sommaire</div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
              {FONTS.map(f => (
                <button key={f.value} onClick={() => setTypo(prev => ({ ...prev, tocFont: f.value }))}
                  style={{ ...S.chip(typo.tocFont === f.value), fontSize: "0.65rem", fontFamily: f.value }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.62rem", color: C.muted }}>Taille</span>
              {[0.85, 0.9, 1.0, 1.1, 1.2].map(s => (
                <button key={s} onClick={() => setTypo(prev => ({ ...prev, tocSize: s }))}
                  style={{ ...S.chip(typo.tocSize === s), fontSize: "0.62rem", padding: "0.15rem 0.4rem", minWidth: 32 }}>
                  {s === 0.85 ? "XS" : s === 0.9 ? "S" : s === 1.0 ? "M" : s === 1.1 ? "L" : "XL"}
                </button>
              ))}
            </div>
          </div>
          {/* Folio */}
          <div>
            <div style={{ ...S.label, marginBottom: "0.4rem", color: C.gold }}>Folio (n° de page)</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.4rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.65rem", color: C.text, cursor: "pointer" }}>
                <input type="checkbox" checked={folio.show} onChange={e => setFolio(prev => ({ ...prev, show: e.target.checked }))} />
                Afficher
              </label>
              <button onClick={() => setShowFolioPanel(v => !v)}
                style={{ ...S.btn(showFolioPanel ? C.gold : C.muted, "small"), fontSize: "0.62rem", padding: "0.2rem 0.5rem" }}>
                ✎ Configurer
              </button>
            </div>
            {showFolioPanel && (
              <div style={{ background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: 280 }}>
                {/* Format */}
                <div>
                  <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.3rem" }}>FORMAT</div>
                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                    {[["n","1"],["n / N","1 / 12"],["— n —","— 1 —"],["Page n","Page 1"]].map(([fmt, preview]) => (
                      <button key={fmt} onClick={() => setFolio(prev => ({ ...prev, format: fmt }))}
                        style={{ ...S.chip(folio.format === fmt), fontSize: "0.6rem" }}>{preview}</button>
                    ))}
                  </div>
                </div>
                {/* Position */}
                <div>
                  <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.3rem" }}>POSITION</div>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    {[["left","← Gauche"],["center","Centre"],["right","Droite →"]].map(([pos, lbl]) => (
                      <button key={pos} onClick={() => setFolio(prev => ({ ...prev, position: pos }))}
                        style={{ ...S.chip(folio.position === pos), fontSize: "0.6rem" }}>{lbl}</button>
                    ))}
                  </div>
                </div>
                {/* Police + taille */}
                <div>
                  <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.3rem" }}>POLICE</div>
                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                    {FONTS.map(f => <button key={f.value} onClick={() => setFolio(prev => ({ ...prev, font: f.value }))} style={{ ...S.chip(folio.font === f.value), fontSize: "0.6rem", fontFamily: f.value }}>{f.label}</button>)}
                  </div>
                  <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.6rem", color: C.muted }}>Taille</span>
                    {[7, 8.5, 10, 11].map(s => <button key={s} onClick={() => setFolio(prev => ({ ...prev, size: s }))} style={{ ...S.chip(folio.size === s), fontSize: "0.6rem", minWidth: 28 }}>{s}pt</button>)}
                  </div>
                </div>
                {/* Couleur */}
                <div>
                  <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.3rem" }}>COULEUR</div>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    {["#9a8a70","#5a4a38","#c9a96e","#1a1208","#888888"].map(col => (
                      <button key={col} onClick={() => setFolio(prev => ({ ...prev, color: col }))}
                        style={{ width: 20, height: 20, borderRadius: 3, background: col, border: folio.color === col ? "2px solid #c9a96e" : `1px solid ${C.border}`, cursor: "pointer" }} />
                    ))}
                    <input type="color" value={folio.color} onChange={e => setFolio(prev => ({ ...prev, color: e.target.value }))}
                      style={{ width: 24, height: 24, border: "none", borderRadius: 3, cursor: "pointer", padding: 0, background: "transparent" }} />
                  </div>
                </div>
                {/* Préfixe / suffixe texte */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.3rem" }}>TEXTE AVANT</div>
                    <input value={folio.prefix} onChange={e => setFolio(prev => ({ ...prev, prefix: e.target.value }))}
                      placeholder="ex: Fédération —"
                      style={{ ...S.input, minHeight: "unset", height: 28, fontSize: "0.68rem", padding: "0.2rem 0.4rem" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.3rem" }}>TEXTE APRÈS</div>
                    <input value={folio.suffix} onChange={e => setFolio(prev => ({ ...prev, suffix: e.target.value }))}
                      placeholder="ex: — 2024"
                      style={{ ...S.input, minHeight: "unset", height: 28, fontSize: "0.68rem", padding: "0.2rem 0.4rem" }} />
                  </div>
                </div>
                {/* Logo */}
                <div>
                  <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.3rem" }}>LOGO / ORNEMENT</div>
                  {folio.logo ? (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <img src={folio.logo} alt="logo folio" style={{ height: 20, objectFit: "contain" }} />
                      <div style={{ display: "flex", gap: "0.3rem" }}>
                        {[["left","← Gauche"],["right","Droite →"]].map(([pos, lbl]) => (
                          <button key={pos} onClick={() => setFolio(prev => ({ ...prev, logoPosition: pos }))}
                            style={{ ...S.chip(folio.logoPosition === pos), fontSize: "0.6rem" }}>{lbl}</button>
                        ))}
                      </div>
                      <button onClick={() => setFolio(prev => ({ ...prev, logo: null }))} style={{ ...S.btn(C.muted, "small"), fontSize: "0.6rem", opacity: 0.6 }}>✕</button>
                    </div>
                  ) : (
                    <label style={{ fontSize: "0.65rem", color: C.muted, cursor: "pointer", opacity: 0.7 }}>
                      + Ajouter un logo
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setFolio(prev => ({ ...prev, logo: ev.target.result })); r.readAsDataURL(f); } }} />
                    </label>
                  )}
                </div>
                {/* Aperçu */}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "0.5rem" }}>
                  <div style={{ fontFamily: folio.font, fontSize: `${folio.size * 0.9}pt`, color: folio.color, textAlign: folio.position, padding: "0.2rem 0", letterSpacing: "0.05em" }}>
                    {folio.logo && folio.logoPosition === "left" && <img src={folio.logo} alt="" style={{ height: 12, marginRight: 6, verticalAlign: "middle", objectFit: "contain" }} />}
                    {folio.prefix && <span style={{ marginRight: 4 }}>{folio.prefix}</span>}
                    {folio.format === "n" ? "5" : folio.format === "n / N" ? "5 / 48" : folio.format === "— n —" ? "— 5 —" : "Page 5"}
                    {folio.suffix && <span style={{ marginLeft: 4 }}>{folio.suffix}</span>}
                    {folio.logo && folio.logoPosition === "right" && <img src={folio.logo} alt="" style={{ height: 12, marginLeft: 6, verticalAlign: "middle", objectFit: "contain" }} />}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Sections spéciales */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ ...S.label, marginBottom: "0.4rem", color: C.gold }}>Options</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: C.text, cursor: "pointer" }}>
                  <input type="checkbox" checked={preface.enabled} onChange={e => setPreface(prev => ({ ...prev, enabled: e.target.checked }))} />
                  Préface
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: C.text, cursor: "pointer" }}>
                    <input type="checkbox" checked={tocConfig.show} onChange={e => setTocConfig(prev => ({ ...prev, show: e.target.checked }))} />
                    Sommaire
                  </label>
                  {tocConfig.show && (
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button onClick={() => setTocConfig(prev => ({ ...prev, position: "start" }))}
                        style={{ ...S.chip(tocConfig.position === "start"), fontSize: "0.6rem", padding: "0.1rem 0.4rem" }}>Début</button>
                      <button onClick={() => setTocConfig(prev => ({ ...prev, position: "end" }))}
                        style={{ ...S.chip(tocConfig.position === "end"), fontSize: "0.6rem", padding: "0.1rem 0.4rem" }}>Fin</button>
                    </div>
                  )}
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: C.text, cursor: "pointer" }}>
                  <input type="checkbox" checked={showCharacters} onChange={e => setShowCharacters(e.target.checked)} />
                  Annexe personnages
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: C.text, cursor: "pointer" }}>
                  <input type="checkbox" checked={credits.enabled} onChange={e => setCredits(prev => ({ ...prev, enabled: e.target.checked }))} />
                  Page de crédits
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>

        {/* ── COUVERTURE ── */}
        <div className="bi" style={{ maxWidth: 380, margin: "0 auto 2rem" }}>
          <div style={{ background: coverStyle.overlayColor === "none" ? "transparent" : C.card, borderRadius: 4, overflow: "hidden", boxShadow: `0 20px 80px rgba(0,0,0,0.5)`, position: "relative" }}>
            <DropZone dataUrl={localCover} onFile={handleCoverFile} label={t.addCover} aspect="portrait"
              onRemove={localCover ? () => { setLocalCover(null); onUpdateImage("cover", null, null); } : null} />
            <div style={{ background: coverStyle.overlayColor === "none" ? "transparent" : coverStyle.overlayColor, padding: "1rem 1.5rem", textAlign: "center", transition: "background 0.2s" }}>
              {(coverStyle.showTitle || coverStyle.showAuthor) && <div style={{ width: 40, height: 1, background: coverStyle.titleColor, margin: "0 auto 0.6rem", opacity: 0.4 }} />}
              {coverStyle.showTitle && <h1 style={{ color: coverStyle.titleColor, fontFamily: coverStyle.titleFont, fontSize: `${coverStyle.titleSize}rem`, letterSpacing: "0.08em", margin: "0 0 0.4rem", lineHeight: 1.3 }}>{title}</h1>}
              {(coverStyle.showTitle || coverStyle.showAuthor) && <div style={{ width: 40, height: 1, background: coverStyle.titleColor, margin: "0.4rem auto", opacity: 0.4 }} />}
              {coverStyle.showAuthor && <p style={{ color: coverStyle.authorColor, fontFamily: coverStyle.authorFont, fontSize: `${coverStyle.authorSize}rem`, fontStyle: "italic", margin: "0.4rem 0 0", letterSpacing: "0.1em" }}>{author || t.colophon}</p>}
              <button onClick={() => setShowCoverPanel(v => !v)}
                style={{ marginTop: "0.6rem", background: `${C.card}cc`, border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, fontSize: "0.58rem", padding: "0.2rem 0.6rem", cursor: "pointer", letterSpacing: "0.1em" }}>
                {showCoverPanel ? "✓ Fermer" : "✎ Style couverture"}
              </button>
            </div>
          </div>
          <p style={{ color: C.muted, fontSize: "0.65rem", textAlign: "center", fontStyle: "italic", marginTop: "0.5rem" }}>
            {localCover ? t.hasCover : t.noCover}
          </p>
        </div>

        {/* ── Panneau style couverture ── */}
        {showCoverPanel && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1rem 1.25rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {/* Fond */}
            <div>
              <div style={{ ...S.label, marginBottom: "0.4rem", color: C.gold }}>Fond de l'overlay</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {COVER_COLORS.map(c => (
                  <button key={c.value} onClick={() => setCoverStyle(prev => ({ ...prev, overlayColor: c.value }))}
                    style={{ ...S.chip(coverStyle.overlayColor === c.value), fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: c.value, border: "1px solid #888", display: "inline-block" }} />
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Visibilité */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: C.text, cursor: "pointer" }}>
                <input type="checkbox" checked={coverStyle.showTitle} onChange={e => setCoverStyle(prev => ({ ...prev, showTitle: e.target.checked }))} />
                Afficher le titre
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: C.text, cursor: "pointer" }}>
                <input type="checkbox" checked={coverStyle.showAuthor} onChange={e => setCoverStyle(prev => ({ ...prev, showAuthor: e.target.checked }))} />
                Afficher l'auteur
              </label>
            </div>
            {/* Titre */}
            <div>
              <div style={{ ...S.label, marginBottom: "0.4rem", color: C.gold }}>Titre</div>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
                {FONTS.map(f => <button key={f.value} onClick={() => setCoverStyle(prev => ({ ...prev, titleFont: f.value }))} style={{ ...S.chip(coverStyle.titleFont === f.value), fontSize: "0.62rem", fontFamily: f.value }}>{f.label}</button>)}
                {[1.2, 1.4, 1.6, 1.9, 2.2].map(s => <button key={s} onClick={() => setCoverStyle(prev => ({ ...prev, titleSize: s }))} style={{ ...S.chip(coverStyle.titleSize === s), fontSize: "0.62rem", minWidth: 32 }}>{s <= 1.2 ? "XS" : s <= 1.4 ? "S" : s <= 1.6 ? "M" : s <= 1.9 ? "L" : "XL"}</button>)}
                {["#ffffff","#f0e0b0","#c9a96e","#1a1208","#000000"].map(col => (
                  <button key={col} onClick={() => setCoverStyle(prev => ({ ...prev, titleColor: col }))}
                    style={{ width: 20, height: 20, borderRadius: 3, background: col, border: coverStyle.titleColor === col ? "2px solid #c9a96e" : "1px solid #666", cursor: "pointer" }} />
                ))}
              </div>
            </div>
            {/* Auteur */}
            <div>
              <div style={{ ...S.label, marginBottom: "0.4rem", color: C.gold }}>Auteur</div>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
                {FONTS.map(f => <button key={f.value} onClick={() => setCoverStyle(prev => ({ ...prev, authorFont: f.value }))} style={{ ...S.chip(coverStyle.authorFont === f.value), fontSize: "0.62rem", fontFamily: f.value }}>{f.label}</button>)}
                {[0.75, 0.85, 0.9, 1.0, 1.1].map(s => <button key={s} onClick={() => setCoverStyle(prev => ({ ...prev, authorSize: s }))} style={{ ...S.chip(coverStyle.authorSize === s), fontSize: "0.62rem", minWidth: 32 }}>{s <= 0.75 ? "XS" : s <= 0.85 ? "S" : s <= 0.9 ? "M" : s <= 1.0 ? "L" : "XL"}</button>)}
                {["#e0d0a0","#ffffff","#c9a96e","#9a8a70","#1a1208"].map(col => (
                  <button key={col} onClick={() => setCoverStyle(prev => ({ ...prev, authorColor: col }))}
                    style={{ width: 20, height: 20, borderRadius: 3, background: col, border: coverStyle.authorColor === col ? "2px solid #c9a96e" : "1px solid #666", cursor: "pointer" }} />
                ))}
              </div>
            </div>
            {/* Régénérer titre */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.6rem", color: C.muted, flex: 1, opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: "italic" }}>{title || "—"}</span>
              <button onClick={async () => {
                const storyText = localParts.map(p => p.text).join(" ").slice(0, 2000);
                const lang = book.language || "french";
                try {
                  const resp = await callClaude([{ role: "user", content: lang === "french"
                    ? `Propose un titre littéraire accrocheur. Voici un extrait du livre :

${storyText}

Réponds avec UNIQUEMENT le titre, sans guillemets ni ponctuation finale.`
                    : `Suggest a catchy literary title. Here is an excerpt:

${storyText}

Reply with ONLY the title, no quotes.`
                  }], 60, 15000, 1.1);
                  if (resp?.trim()) {
                    const clean = resp.trim().replace(/^["«»"']+|["«»"']+$/g, "").trim();
                    if (clean) setBook(prev => prev ? { ...prev, title: clean } : prev);
                  }
                } catch(e) { console.error(e); }
              }}
                style={{ ...S.btn(C.gold, "small"), fontSize: "0.62rem", padding: "0.2rem 0.6rem", whiteSpace: "nowrap" }}>
                ↺ Nouveau titre
              </button>
            </div>
          </div>
        )}


        {/* ── PRÉFACE ── */}
        {preface.enabled && (
          <div id="bk-preface" className="bi" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", marginBottom: "2rem" }}>
            <div style={{ background: C.panelBg, borderBottom: `1px solid ${C.border}`, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ ...S.label, color: C.gold }}>Préface</span>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <select value={preface.writingStyle || ""} onChange={e => setPreface(prev => ({ ...prev, writingStyle: e.target.value }))}
                    style={{ ...S.input, minHeight: "unset", height: 28, fontSize: "0.65rem", padding: "0.1rem 1.4rem 0.1rem 0.4rem", resize: "none", appearance: "none", WebkitAppearance: "none", cursor: "pointer", maxWidth: 180, color: preface.writingStyle ? C.text : C.muted }}>
                    <option value="">— Style libre —</option>
                    {AUTHORS.map(group => (
                      <optgroup key={group.group} label={`── ${group.group} ──`}>
                        {group.authors.map(a => (
                          <option key={a} value={a}>À la manière de {a}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: "0.4rem", top: "50%", transform: "translateY(-50%)", color: C.gold, pointerEvents: "none", fontSize: "0.6rem" }}>▾</span>
                </div>
                <button onClick={generatePreface} disabled={generatingPreface}
                  style={{ ...S.btn(C.blue, "small"), fontSize: "0.65rem", padding: "0.2rem 0.6rem", opacity: generatingPreface ? 0.5 : 1 }}>
                  {generatingPreface ? "⟳ Génération…" : "✦ Générer"}
                </button>
              </div>
            </div>
            <div style={{ padding: "0.5rem 1.25rem", display: "flex", gap: "0.75rem", borderBottom: `1px solid ${C.border}22` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.25rem" }}>INCLURE</div>
                <input value={preface.include || ""} onChange={e => setPreface(prev => ({ ...prev, include: e.target.value }))}
                  placeholder="ex: contexte historique, hommage à…"
                  style={{ ...S.input, minHeight: "unset", height: 28, fontSize: "0.68rem", padding: "0.2rem 0.5rem" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.25rem" }}>EXCLURE</div>
                <input value={preface.exclude || ""} onChange={e => setPreface(prev => ({ ...prev, exclude: e.target.value }))}
                  placeholder="ex: spoilers, références anachroniques…"
                  style={{ ...S.input, minHeight: "unset", height: 28, fontSize: "0.68rem", padding: "0.2rem 0.5rem" }} />
              </div>
            </div>
            <div style={{ padding: "1.25rem 2.5rem" }}>
              <div style={{ background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 3, padding: "0.75rem", minHeight: 120 }}>
                <RichTextEditor
                  key="preface-editor"
                  html={preface.html}
                  text={preface.text}
                  C={C} S={S}
                  readOnly={false}
                  onChange={newHtml => {
                    const tmp = document.createElement("div");
                    tmp.innerHTML = newHtml;
                    setPreface(prev => ({ ...prev, html: newHtml, text: tmp.innerText || tmp.textContent || "" }));
                  }}
                  style={{ fontFamily: preface.font, fontSize: `${preface.size}rem`, color: C.text, fontStyle: preface.italic ? "italic" : "normal", lineHeight: 1.8, outline: "none", border: "none" }}
                />
              </div>
              {preface.text && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                  <button onClick={generatePreface} disabled={generatingPreface}
                    style={{ ...S.btn(C.blue, "small"), fontSize: "0.65rem", padding: "0.25rem 0.7rem", opacity: generatingPreface ? 0.5 : 1 }}>
                    {generatingPreface ? "⟳ Génération…" : "↕ Étoffer"}
                  </button>
                  <button onClick={() => setPreface(prev => ({ ...prev, text: "", html: null }))}
                    style={{ ...S.btn(C.muted, "small"), fontSize: "0.6rem", padding: "0.25rem 0.6rem", opacity: 0.5 }}>✕ Effacer</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SOMMAIRE (aperçu) ── */}
        {tocConfig.show && tocConfig.position === "end" && byChapter.filter(ch => ch.parts.length > 0).length > 0 && (
          <div className="bi" style={{ background: C.panelBg, border: `1px dashed ${C.border}`, borderRadius: 4, marginBottom: "2rem", padding: "0.75rem 1.25rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.62rem", color: C.muted, fontStyle: "italic" }}>
              ☰ Sommaire placé en fin de livre —{" "}
              <span style={{ color: C.gold, cursor: "pointer", textDecoration: "underline" }}
                onClick={() => document.getElementById("bk-sommaire")?.scrollIntoView({ behavior: "smooth" })}>
                voir le sommaire ↓
              </span>
            </span>
          </div>
        )}
        {tocConfig.show && tocConfig.position === "start" && byChapter.filter(ch => ch.parts.length > 0).length > 0 && (() => {
          // Calcul des numéros de page corrects
          // Structure : couverture(1) + préface(1 si active) + sommaire(1) + chapitres + personnages + crédits
          // Structure physique : couv(p1) + garde(p2) + [préface p3+] + [sommaire impair] + chapitres
          // Règle : couv/2ème/3ème/4ème hors pagination, tout le reste numéroté à partir de 1
          // Numéro visible = page physique - 2
          let pageCounter = 3; // page physique courante (p3 = 1ère après garde)
          if (preface.enabled && preface.text) {
            const prefWords = preface.text.split(" ").length;
            const prefPages = Math.max(1, Math.ceil(prefWords / 300));
            pageCounter += prefPages;
          }
          // Sommaire : force page impaire
          if (pageCounter % 2 === 0) pageCounter++;
          pageCounter++; // sommaire
          // visibleOffset = 2 (couv + 2ème couv toujours exclues)
          const visibleOffset = 2;
          const chapPages = {};
          byChapter.forEach((ch, ci) => {
            if (ch.parts.length === 0) return;
            // Chaque chapitre sur page impaire
            if (pageCounter % 2 === 0) pageCounter++; // blanc si nécessaire
            chapPages[ci] = pageCounter - visibleOffset; // numéro visible
            const words = ch.parts.reduce((acc, p) => acc + (p.text || "").split(" ").length, 0);
            pageCounter += Math.max(1, Math.ceil(words / 300));
          });
          if (showCharacters && characters.length > 0) pageCounter++;
          if (credits.enabled && credits.text) pageCounter++;
          return (
          <div id="bk-sommaire" className="bi" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: "2rem", overflow: "hidden" }}>
            <div style={{ background: C.panelBg, borderBottom: `1px solid ${C.border}`, padding: "0.5rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.58rem", letterSpacing: "0.25em", color: C.gold, textTransform: "uppercase", opacity: 0.7 }}>Sommaire</span>
              <span style={{ fontSize: "0.58rem", color: C.muted, opacity: 0.6, fontStyle: "italic" }}>Police : {typo.tocFont.split(",")[0]}</span>
            </div>
            {/* Image avant */}
            {tocImageBefore && <img src={tocImageBefore} alt="avant sommaire" style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "cover" }} />}
            {!tocImageBefore && (
              <div style={{ padding: "0.5rem 1.25rem", borderBottom: `1px solid ${C.border}22` }}>
                <label style={{ fontSize: "0.62rem", color: C.muted, cursor: "pointer", opacity: 0.6 }}>
                  + Image avant le sommaire
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setTocImageBefore(ev.target.result); r.readAsDataURL(f); } }} />
                </label>
              </div>
            )}
            {tocImageBefore && (
              <button onClick={() => setTocImageBefore(null)} style={{ ...S.btn(C.muted, "small"), fontSize: "0.6rem", margin: "0.3rem 1.25rem", opacity: 0.5 }}>✕ Supprimer image avant</button>
            )}
            <div style={{ padding: "1.25rem 2.5rem" }}>
              {preface.enabled && preface.text && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: `1px solid ${C.border}22`, fontFamily: typo.tocFont, fontSize: `${typo.tocSize * 0.88}rem`, color: C.muted, fontStyle: "italic" }}>
                  <span>Préface</span>
                  <span style={{ opacity: 0.5 }}>1</span>
                </div>
              )}
              {byChapter.map((ch, ci) => ch.parts.length === 0 ? null : (
                <div key={ci} onClick={() => document.getElementById(`bk-chap-${ci}`)?.scrollIntoView({ behavior: "smooth" })}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.35rem 0", borderBottom: `1px solid ${C.border}22`, cursor: "pointer", fontFamily: typo.tocFont, fontSize: `${typo.tocSize * 0.9}rem` }}
                  onMouseEnter={e => e.currentTarget.style.color = C.gold}
                  onMouseLeave={e => e.currentTarget.style.color = ""}>
                  <span style={{ display: "flex", gap: "0.75rem" }}>
                    <span style={{ color: C.gold, fontFamily: typo.titleFont, opacity: 0.7, fontSize: `${typo.tocSize * 0.8}rem` }}>{ROMANS_TOC[ci] || String(ci + 1)}</span>
                    <span style={{ color: C.text }}>{ch.title || `Chapitre ${ROMANS_TOC[ci] || ci + 1}`}</span>
                  </span>
                  <span style={{ color: C.gold, opacity: 0.7, fontFamily: typo.tocFont }}>{chapPages[ci] ?? "–"}</span>
                </div>
              ))}
              {showCharacters && characters.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: `1px solid ${C.border}22`, fontFamily: typo.tocFont, fontSize: `${typo.tocSize * 0.88}rem`, color: C.muted, fontStyle: "italic" }}>
                  <span>Personnages</span>
                </div>
              )}
              {credits.enabled && credits.text && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontFamily: typo.tocFont, fontSize: `${typo.tocSize * 0.88}rem`, color: C.muted, fontStyle: "italic" }}>
                  <span>Crédits</span>
                </div>
              )}
            </div>
            {/* Image après */}
            {tocImageAfter && <img src={tocImageAfter} alt="après sommaire" style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "cover" }} />}
            {!tocImageAfter && (
              <div style={{ padding: "0.5rem 1.25rem", borderTop: `1px solid ${C.border}22` }}>
                <label style={{ fontSize: "0.62rem", color: C.muted, cursor: "pointer", opacity: 0.6 }}>
                  + Image après le sommaire
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => setTocImageAfter(ev.target.result); r.readAsDataURL(f); } }} />
                </label>
              </div>
            )}
            {tocImageAfter && (
              <button onClick={() => setTocImageAfter(null)} style={{ ...S.btn(C.muted, "small"), fontSize: "0.6rem", margin: "0.3rem 1.25rem", opacity: 0.5 }}>✕ Supprimer image après</button>
            )}
          </div>
          );
        })()}

        {/* ── CHAPITRES ── */}
        {byChapter.map((ch, ci) => ch.parts.length === 0 ? null : (
          <div key={ci} id={`bk-chap-${ci}`} className="bi" style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: `0 2px 12px rgba(0,0,0,0.15)`, marginBottom: "2rem", borderRadius: 4, overflow: "hidden" }}>

            {/* Illustration */}
            <div style={{ background: C.panelBg, borderBottom: `1px solid ${C.border}`, padding: "0.75rem" }}>
              <div style={{ ...S.label, textAlign: "center", marginBottom: "0.6rem" }}>
                {localImages[ci] ? t.chapIllusHas(ch.title) : t.chapIllus(ch.title)}
              </div>
              <DropZone dataUrl={localImages[ci]} onFile={f => handleChapFile(ci, f)}
                label={t.addIllus(ch.title)} aspect="landscape"
                onRemove={localImages[ci] ? () => { setLocalImages(prev => { const n={...prev}; delete n[ci]; return n; }); onUpdateImage("chapter", ci, null); } : null} />
            </div>

            {/* En-tête chapitre */}
            <div style={{ padding: "2rem 2.5rem 0.5rem", fontFamily: typo.titleFont, textAlign: "center" }}>
              <div style={{ color: C.gold, opacity: 0.2, letterSpacing: ".5em", fontSize: "0.7rem", marginBottom: "0.4rem" }}>✦ ✦ ✦</div>
              <div style={{ color: C.gold, fontFamily: typo.titleFont, fontSize: `${typo.titleSize * 0.7}rem`, letterSpacing: "0.3em", opacity: 0.6 }}>{roman(ci)}</div>
              {chCount > 1 && <div style={{ color: C.muted, fontFamily: typo.titleFont, fontSize: `${typo.titleSize * 0.55}rem`, letterSpacing: "0.2em", marginTop: "0.3rem", fontStyle: "italic" }}>{ch.title}</div>}
            </div>

            {/* Parties */}
            <div style={{ padding: "0.5rem 2.5rem 2rem", fontFamily: typo.bodyFont, lineHeight: 2, fontSize: `${typo.bodySize}rem`, color: C.text }}>
              {ch.parts.map((part, pi) => {
                const gi = part.globalIdx;
                const isThisProcessing = processingIdx === gi;
                const isInsertProcessing = processingIdx === -1;
                return (
                  <div key={pi}>
                    {/* Séparateur + bouton liaison */}
                    {pi > 0 && (
                      <div style={{ textAlign: "center", margin: "2rem 0" }}>
                        <div style={{ color: C.gold, opacity: 0.25, letterSpacing: ".5em" }}>✦ ✦ ✦</div>
                        {editMode && !isProcessing && (
                          <button onClick={() => openPanel("liaison", ch.parts[pi-1].globalIdx)}
                            style={{ marginTop: "0.5rem", background: "none", border: `1px dashed ${C.border}`, color: C.muted, fontSize: "0.6rem", letterSpacing: "0.15em", padding: "0.2rem 0.8rem", borderRadius: 2, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                            + passage de liaison
                          </button>
                        )}
                        {editMode && isInsertProcessing && (
                          <div style={{ color: C.blue, fontSize: "0.65rem", fontStyle: "italic", marginTop: "0.4rem" }}>⟳ Génération du passage…</div>
                        )}
                      </div>
                    )}

                    {/* Partie */}
                    <div style={{ position: "relative", background: isThisProcessing ? "rgba(201,169,110,0.04)" : "transparent", borderRadius: 4, padding: isThisProcessing ? "0.5rem" : 0 }}>

                      {/* Barre d'outils */}
                      {editMode && !isThisProcessing && (
                        <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                          <button onClick={() => movePart(gi, -1)} disabled={gi === 0 || isProcessing}
                            style={{ ...S.btn(C.muted, "small"), fontSize: "0.6rem", padding: "0.15rem 0.5rem", opacity: gi === 0 ? 0.3 : 1 }}>↑</button>
                          <button onClick={() => movePart(gi, 1)} disabled={gi === localParts.length-1 || isProcessing}
                            style={{ ...S.btn(C.muted, "small"), fontSize: "0.6rem", padding: "0.15rem 0.5rem", opacity: gi === localParts.length-1 ? 0.3 : 1 }}>↓</button>
                          <button onClick={() => setConfirmDelete(gi)} disabled={isProcessing}
                            style={{ ...S.btn("#c05050", "small"), fontSize: "0.6rem", padding: "0.15rem 0.5rem" }}>✕</button>
                          <button onClick={() => openPanel("rewrite", gi)} disabled={isProcessing}
                            style={{ ...S.btn(C.blue, "small"), fontSize: "0.6rem", padding: "0.15rem 0.6rem" }}>
                            ✦ Reformuler
                          </button>
                          <button onClick={() => openPanel("expand", gi)} disabled={isProcessing}
                            style={{ ...S.btn(C.green, "small"), fontSize: "0.6rem", padding: "0.15rem 0.6rem" }}>
                            ↕ Étoffer
                          </button>
                        </div>
                      )}

                      {/* Confirmation suppression */}
                      {confirmDelete === gi && (
                        <div style={{ background: C.card, border: `1px solid #c0505088`, borderRadius: 4, padding: "0.6rem 1rem", marginBottom: "0.75rem", display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ color: "#c05050", fontSize: "0.72rem", flex: 1 }}>Supprimer cette partie ? Action irréversible.</span>
                          <button onClick={() => deletePart(gi)} style={{ ...S.btn("#c05050", "small"), fontSize: "0.65rem" }}>Supprimer</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ ...S.btn(C.muted, "small"), fontSize: "0.65rem" }}>Annuler</button>
                        </div>
                      )}

                      {/* Texte ou spinner */}
                      {isThisProcessing ? (
                        <div style={{ textAlign: "center", padding: "2rem 0", opacity: 0.5 }}>
                          <span style={{ color: C.gold, fontSize: "0.8rem", fontStyle: "italic" }}>⟳ Traitement en cours…</span>
                        </div>
                      ) : (
                        <RichTextEditor
                          key={`rich-${gi}`}
                          html={part.html}
                          text={part.text}
                          C={C} S={S}
                          readOnly={!editMode}
                          onChange={newHtml => {
                            const tmp = document.createElement("div");
                            tmp.innerHTML = newHtml;
                            const plainText = tmp.innerText || tmp.textContent || "";
                            propagate(localParts.map((p, idx) =>
                              idx === gi ? { ...p, html: newHtml, text: plainText } : p
                            ));
                          }}
                          style={{ fontFamily: typo.bodyFont, fontSize: `${typo.bodySize}rem`, color: C.text }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}



        {/* ── SOMMAIRE FIN (aperçu) ── */}
        {tocConfig.show && tocConfig.position === "end" && (() => {
          const chapPagesFin = {};
          let pc = 3 + (preface.enabled && preface.text ? Math.max(1, Math.ceil(preface.text.split(" ").length / 300)) : 0);
          byChapter.forEach((ch, ci) => {
            if (ch.parts.length === 0) return;
            if (pc % 2 === 0) pc++;
            chapPagesFin[ci] = Math.max(1, pc - 2);
            pc += Math.max(1, Math.ceil(ch.parts.reduce((a, p) => a + (p.text||"").split(" ").length, 0) / 300));
          });
          return (
            <div id="bk-sommaire" className="bi" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, marginBottom: "2rem", overflow: "hidden" }}>
              <div style={{ background: C.panelBg, borderBottom: `1px solid ${C.border}`, padding: "0.5rem 1.25rem" }}>
                <span style={{ fontSize: "0.58rem", letterSpacing: "0.25em", color: C.gold, textTransform: "uppercase", opacity: 0.7 }}>Sommaire</span>
              </div>
              <div style={{ padding: "1.25rem 2.5rem" }}>
                {preface.enabled && preface.text && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: `1px solid ${C.border}22`, fontFamily: typo.tocFont, fontSize: `${typo.tocSize * 0.88}rem`, color: C.muted, fontStyle: "italic" }}>
                    <span>Préface</span><span style={{ opacity: 0.5 }}>1</span>
                  </div>
                )}
                {byChapter.map((ch, ci) => ch.parts.length === 0 ? null : (
                  <div key={ci} onClick={() => document.getElementById(`bk-chap-${ci}`)?.scrollIntoView({ behavior: "smooth" })}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.35rem 0", borderBottom: `1px solid ${C.border}22`, cursor: "pointer", fontFamily: typo.tocFont, fontSize: `${typo.tocSize * 0.9}rem` }}
                    onMouseEnter={e => e.currentTarget.style.color = C.gold}
                    onMouseLeave={e => e.currentTarget.style.color = ""}>
                    <span style={{ display: "flex", gap: "0.75rem" }}>
                      <span style={{ color: C.gold, opacity: 0.7, fontSize: `${typo.tocSize * 0.8}rem` }}>{ROMANS_TOC[ci] || String(ci + 1)}</span>
                      <span style={{ color: C.text }}>{ch.title || `Chapitre ${ROMANS_TOC[ci] || ci + 1}`}</span>
                    </span>
                    <span style={{ color: C.gold, opacity: 0.7 }}>{chapPagesFin[ci] ?? "–"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── ANNEXE PERSONNAGES ── */}
        {showCharacters && characters.length > 0 && (() => {
          const [editingCharId, setEditingCharId] = React.useState(null);
          const [localChars, setLocalChars] = React.useState(characters);
          const updateChar = (id, field, val) => {
            const updated = localChars.map(c => c.id === id ? { ...c, [field]: val } : c);
            setLocalChars(updated);
            // Remonter les modifications
            if (onPartsChange) {
              // Mettre à jour via les locations/characters du parent si disponible
            }
          };
          return (
          <div id="bk-characters" className="bi" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", marginBottom: "2rem" }}>
            <div style={{ background: C.panelBg, borderBottom: `1px solid ${C.border}`, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ ...S.label, color: C.gold }}>Annexe — Personnages</span>
              <span style={{ fontSize: "0.6rem", color: C.muted, fontStyle: "italic" }}>Cliquez ✎ pour modifier</span>
            </div>
            <div style={{ padding: "1.5rem 2.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {localChars.filter(c => c.role !== "mentionné").map(ch => {
                  const isEd = editingCharId === ch.id;
                  return (
                    <div key={ch.id} style={{ background: C.card, border: `1px solid ${isEd ? C.gold + "66" : C.border}`, borderRadius: 4, padding: "0.75rem 1rem", transition: "border-color 0.15s" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.35rem" }}>
                        {isEd ? (
                          <input value={ch.name} onChange={e => updateChar(ch.id, "name", e.target.value)}
                            style={{ flex: 1, background: C.panelBg, border: `1px solid ${C.gold}55`, borderRadius: 3, color: C.gold, fontFamily: typo.titleFont, fontWeight: "bold", fontSize: "0.9rem", padding: "0.1rem 0.4rem" }} />
                        ) : (
                          <span style={{ fontFamily: typo.titleFont, fontWeight: "bold", color: C.gold, fontSize: "0.9rem", flex: 1 }}>{ch.name}</span>
                        )}
                        {isEd ? (
                          <input value={ch.role || ""} onChange={e => updateChar(ch.id, "role", e.target.value)}
                            style={{ width: 80, background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, fontSize: "0.6rem", padding: "0.1rem 0.3rem" }} />
                        ) : (
                          <span style={{ fontSize: "0.6rem", color: C.muted, background: `${C.gold}18`, borderRadius: 3, padding: "0.05rem 0.3rem" }}>{ch.role}</span>
                        )}
                        <button onClick={() => setEditingCharId(isEd ? null : ch.id)}
                          style={{ background: "transparent", border: "none", color: isEd ? C.gold : C.muted, cursor: "pointer", fontSize: "0.7rem", padding: "0 0.2rem", opacity: isEd ? 1 : 0.5 }}>
                          {isEd ? "✓" : "✎"}
                        </button>
                      </div>
                      {isEd ? (
                        <RichTextEditor
                          key={`char-${ch.id}`}
                          html={ch.descHtml}
                          text={ch.description || ""}
                          C={C} S={S}
                          readOnly={false}
                          onChange={newHtml => {
                            const tmp = document.createElement("div");
                            tmp.innerHTML = newHtml;
                            updateChar(ch.id, "descHtml", newHtml);
                            updateChar(ch.id, "description", tmp.innerText || tmp.textContent || "");
                          }}
                          style={{ fontFamily: typo.bodyFont, fontSize: `${typo.bodySize * 0.82}rem`, color: C.text, lineHeight: 1.55, outline: "none", border: "none" }}
                        />
                      ) : (
                        ch.descHtml
                          ? <div dangerouslySetInnerHTML={{ __html: ch.descHtml }} style={{ fontFamily: typo.bodyFont, fontSize: `${typo.bodySize * 0.82}rem`, color: C.text, opacity: 0.85, lineHeight: 1.55 }} />
                          : ch.description && <p style={{ fontFamily: typo.bodyFont, fontSize: `${typo.bodySize * 0.82}rem`, color: C.text, opacity: 0.85, lineHeight: 1.55, margin: 0 }}>{ch.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          );
        })()}


        {/* ── CRÉDITS ── */}
        {credits.enabled && (
          <div id="bk-credits" className="bi" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", marginBottom: "2rem" }}>
            <div style={{ background: C.panelBg, borderBottom: `1px solid ${C.border}`, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ ...S.label, color: C.gold }}>Crédits</span>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={generateCredits} disabled={generatingCredits}
                  style={{ ...S.btn(C.blue, "small"), fontSize: "0.65rem", padding: "0.2rem 0.6rem", opacity: generatingCredits ? 0.5 : 1 }}>
                  {generatingCredits ? "⟳ Génération…" : "✦ Générer"}
                </button>
              </div>
            </div>
            <div style={{ padding: "0.5rem 1.25rem", display: "flex", gap: "0.75rem", borderBottom: `1px solid ${C.border}22` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.25rem" }}>INCLURE</div>
                <input value={credits.include || ""} onChange={e => setCredits(prev => ({ ...prev, include: e.target.value }))}
                  placeholder="ex: remerciements à X, mention de l'éditeur…"
                  style={{ ...S.input, minHeight: "unset", height: 28, fontSize: "0.68rem", padding: "0.2rem 0.5rem" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.15em", marginBottom: "0.25rem" }}>EXCLURE</div>
                <input value={credits.exclude || ""} onChange={e => setCredits(prev => ({ ...prev, exclude: e.target.value }))}
                  placeholder="ex: prix, ISBN, tirage…"
                  style={{ ...S.input, minHeight: "unset", height: 28, fontSize: "0.68rem", padding: "0.2rem 0.5rem" }} />
              </div>
            </div>
            <div style={{ padding: "1.25rem 2.5rem" }}>
              <div style={{ background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 3, padding: "0.75rem", minHeight: 80 }}>
                <RichTextEditor
                  key="credits-editor"
                  html={credits.html}
                  text={credits.text}
                  C={C} S={S}
                  readOnly={false}
                  onChange={newHtml => {
                    const tmp = document.createElement("div");
                    tmp.innerHTML = newHtml;
                    setCredits(prev => ({ ...prev, html: newHtml, text: tmp.innerText || tmp.textContent || "" }));
                  }}
                  style={{ fontFamily: credits.font, fontSize: `${credits.size}rem`, color: C.text, fontStyle: credits.italic ? "italic" : "normal", lineHeight: 1.8, outline: "none", border: "none" }}
                />
              </div>
              {credits.text && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                  <button onClick={generateCredits} disabled={generatingCredits}
                    style={{ ...S.btn(C.blue, "small"), fontSize: "0.65rem", padding: "0.25rem 0.7rem", opacity: generatingCredits ? 0.5 : 1 }}>
                    {generatingCredits ? "⟳ Génération…" : "↕ Étoffer"}
                  </button>
                  <button onClick={() => setCredits(prev => ({ ...prev, text: "", html: null }))}
                    style={{ ...S.btn(C.muted, "small"), fontSize: "0.6rem", padding: "0.25rem 0.6rem", opacity: 0.5 }}>✕ Effacer</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 4ÈME DE COUVERTURE ── */}
        <div className="bi" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", marginBottom: "2rem" }}>
          <div style={{ background: C.panelBg, borderBottom: `1px solid ${C.border}`, padding: "0.75rem" }}>
            <div style={{ ...S.label, textAlign: "center", marginBottom: "0.6rem" }}>{localBack ? t.backCoverHas : t.backCover}</div>
            <DropZone dataUrl={localBack} onFile={handleBackFile} label={t.addBack} aspect="landscape"
              onRemove={localBack ? () => { setLocalBack(null); onUpdateImage("back", null, null); } : null} />
          </div>
          <div style={{ padding: "2rem 2.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
              <div style={{ width: 36, height: 1, background: `linear-gradient(90deg,transparent,${C.gold},transparent)`, margin: "0 auto 0.7rem" }} />
              <span style={{ color: C.gold, fontSize: "0.58rem", letterSpacing: "0.35em", opacity: 0.55 }}>{t.resumeLabel}</span>
            </div>
            <p style={{ color: C.text, fontFamily: "Georgia, serif", fontSize: "0.95rem", lineHeight: 1.9, fontStyle: "italic", textAlign: "justify", margin: "0 0 2rem" }}>{summary}</p>
            <div style={{ textAlign: "center", borderTop: `1px solid ${C.border}`, paddingTop: "1.2rem" }}>
              <p style={{ color: C.muted, fontSize: "0.58rem", letterSpacing: "0.25em", fontFamily: "Georgia, serif" }}>{t.colophon}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Debug Panel ───────────────────────────────────────────────────
// ── Assistant Narratif (Chat) ────────────────────────────────────
function NarrativeChatBubble({ parts, chapters, choices, genres, writingStyle, language,
  advancedMode, setAdvancedMode, setNextInclude, setNextExclude, setAxes,
  setPendingAction, bookTitle, narrator, setWritingStyle, generateSuite, generateAxes, generate,
  setGenres, setNarrator, setLanguage, setDuration, setClassicSource, classicSource,
  searchClassicSource, setInitInclude, setInitExclude, generateBtnRef, setGeneratePulse,
  importText, axes, selectedAxis, setSelectedAxis, lastAxes,
  nextWords, setNextWords, bookMode, setBookMode, ended, setEnded,
  showEndingPicker, setShowEndingPicker, chapterSuggestion, setChapterSuggestion,
  currentChapter, setCurrentChapter, showRewriteModal, setShowRewriteModal,
  rewriteTargetStyle, setRewriteTargetStyle, showTranslatePanel, setShowTranslatePanel,
  translateTargetLang, setTranslateTargetLang, translateBook, saveProject, closeCurrentChapter,
  deletePart, movePart, updateLastPart, extendLastParagraph, extendParagraph, rewriteParagraph, chatInjectRef, nsfwEnabled, triggerNsfwModal,
  nextNsfw, setNextNsfw, setBookTitle, duration, blocks,
  onIndexBlocks, indexingBlocks, blocksCount, blocksSummarized, onChatbotWarn }) {
  const C = useTheme();
  const [open, setOpen]       = useState(false);
  const [history, setHistory] = useState([]);
  const [input, setInput]     = useState("");
  const [working, setWorking] = useState(false);
  const [unread, setUnread]   = useState(0);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Expose inject function so paragraph numbers can inject text into chat
  useEffect(() => {
    if (chatInjectRef) {
      chatInjectRef.current = (text) => {
        if (!open) setOpen(true);
        setInput(prev => prev ? prev + " " + text : text);
        setTimeout(() => inputRef.current?.focus(), 80);
      };
    }
  });

  useEffect(() => {
    if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [open, history]);

  useEffect(() => {
    if (!open && history.length > 0 && history[history.length - 1]?.role === "assistant") {
      setUnread(u => u + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const fullText = parts.map(p => p.text).join("\n\n");
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const genreStr = GENRES.filter(g => genres.includes(g.value)).map(g => g.label).join(", ");
  const allAuthors = AUTHORS.flatMap(g => g.authors).join(", ");
  const allGenres = GENRES.map(g => `${g.value} (${g.label})`).join(", ");
  const allDurations = "micro (~500 mots), flash (~1000 mots), short (~2000 mots), long (~5000 mots)";
  const hasStory = parts.length > 0;

  // Texte annoté avec numéros §chap.para — algorithme identique au rendu visuel
  const buildAnnotatedText = () => {
    if (!hasStory) return "";
    const lines = [];
    // Grouper par chapitre, dans l'ordre
    const chapterGroups = {};
    parts.forEach((part, gi) => {
      const ci = part.chapterIdx ?? 0;
      if (!chapterGroups[ci]) chapterGroups[ci] = [];
      chapterGroups[ci].push({ part, gi });
    });
    const sortedCis = Object.keys(chapterGroups).map(Number).sort((a, b) => a - b);
    sortedCis.forEach(ci => {
      const chNum = ci + 1;
      if (chapters.length > 1) lines.push(`\n── Chapitre ${chNum} ──`);
      const group = chapterGroups[ci];
      let paraChapterOffset = 0;
      group.forEach(({ part, gi }) => {
        // Calcul offset identique au rendu
        let offset = 0;
        for (let k = 0; k < gi; k++) {
          if ((parts[k]?.chapterIdx ?? 0) === ci) {
            offset += parts[k].text.split("\n\n").filter(p => p.trim() && p.trim() !== "— ✦ —").length;
          }
        }
        part.text.split("\n\n").forEach((para, i) => {
          if (!para.trim() || para.trim() === "— ✦ —") return;
          const localIdx = offset + part.text.split("\n\n").slice(0, i).filter(p => p.trim() && p.trim() !== "— ✦ —").length + 1;
          lines.push(`[§${chNum}.${localIdx}] ${para.trim()}`);
        });
      });
    });
    return lines.join("\n\n");
  };
  const blockIndex = blocks.length
    ? blocks.map(b => `[${b.id}] ${b.firstRef}→${b.lastRef} (${b.wordCount} mots) — ${b.summary || "résumé en cours…"}`).join("\n")
    : "";

  const systemPrompt = `Tu es l'assistant narratif de l'Atelier des Récits. Tu aides l'auteur à configurer et développer son histoire.

ÉTAT ACTUEL DE LA SESSION :
- Histoire : ${hasStory ? `${wordCount} mots, ${chapters.length} chapitre(s)` : "pas encore commencée"}
- Titre : ${bookTitle || "(sans titre)"}
- Genre(s) actuel : ${genreStr || "(non défini)"}
- Style actuel : ${writingStyle || "libre"}
- Narrateur : ${narrator || "(non défini)"}
- Langue : ${language}
- Source narrative : ${classicSource?.type === "known" ? `Livre/film connu : "${classicSource.bookTitle}"` : classicSource?.type === "upload" ? "Texte importé" : "Création libre"}
${axes?.length ? `- AXES NARRATIFS ACTUELLEMENT PROPOSÉS (l'auteur doit en choisir un) :\n${axes.map((a, i) => `  ${i+1}. "${a.title}" — ${a.description}`).join("\n")}${selectedAxis !== null ? `\n- Axe sélectionné par l'auteur : axe n°${selectedAxis+1} ("${axes[selectedAxis]?.title}")` : "\n- Aucun axe sélectionné pour l'instant"}` : lastAxes?.axes?.length ? `- Dernier cycle d'axes utilisé :\n${lastAxes.axes.map((a, i) => `  ${i+1}. "${a.title}" — ${a.description}`).join("\n")}` : "- Pas d'axes narratifs en cours"}
${classicSource?.type === "upload" && importText?.trim() ? `\nTEXTE SOURCE IMPORTÉ (${importText.trim().split(/\s+/).length} mots) — tu as accès à l'intégralité :\n${importText.length > 6000 ? "【DÉBUT】\n" + importText.slice(0, 2500) + "\n\n【…】\n\n【FIN】\n" + importText.slice(-2500) : importText}` : ""}
${hasStory && blockIndex ? `\nINDEX DE L'HISTOIRE (${wordCount} mots, ${blocks.length} blocs) — chaque bloc résume ~300 mots. Pour lire le texte exact d'un bloc, utilise l'action GET_BLOCK. Dans tes réponses, cite les paragraphes sous la forme §1.3 (sans crochets) :\n${blockIndex}` : ""}

RÉFÉRENTIELS DISPONIBLES :
Genres (valeurs exactes) : ${allGenres}
Narrateurs (valeurs exactes) : third (3ème personne), first (1ère personne), second (2ème personne)
Durées (valeurs exactes) : ${allDurations}
Styles d'auteurs disponibles : ${allAuthors}
Langues (valeurs exactes) : french, english, spanish, german, italian, portuguese, japanese, chinese

ÉTAT AVANCÉ :
- Mode : ${bookMode === "gybh" ? "Livre dont vous êtes le héros" : "Récit classique"}
- Longueur de suite : ${nextWords} mots
- Histoire terminée : ${ended ? "oui" : "non"}
- Partie en cours de chapitre : ${currentChapter ?? 0}
- NSFW activé : ${nsfwEnabled ? "oui" : "non"} (si l'auteur demande d'activer le mode adulte, utiliser l'action TRIGGER_NSFW_MODAL pour ouvrir la fenêtre de mot de passe)

TU PEUX DÉCLENCHER CES ACTIONS via des blocs <action>JSON</action> — tu es le dieu de cet artefact, tu peux tout faire :

── CONFIGURATION ──
<action>{"type":"SET_GENRES","values":["scifi","adventure"]}</action>
<action>{"type":"SET_NARRATOR","value":"third"}</action>  → third | first | second
<action>{"type":"SET_LANGUAGE","value":"french"}</action>
<action>{"type":"SET_DURATION","value":"flash"}</action>  → micro | flash | short | long
<action>{"type":"SET_STYLE","value":"Frank Herbert"}</action>
<action>{"type":"SET_INCLUDE","value":"..."}</action>
<action>{"type":"SET_EXCLUDE","value":"..."}</action>
<action>{"type":"SET_SOURCE","bookTitle":"Star Wars Episode IV","searchNow":true}</action>
<action>{"type":"SET_ADVANCED","value":true}</action>
<action>{"type":"SET_TITLE","value":"Mon titre"}</action>
<action>{"type":"SET_WORDS","value":1500}</action>  → longueur de la suite en mots (300-6000)
<action>{"type":"SET_BOOK_MODE","value":"classic"}</action>  → classic | gybh

── GÉNÉRATION ──
<action>{"type":"GENERATE_INCIPIT"}</action>  → génère le premier texte (depuis la config)
<action>{"type":"GENERATE_AXES"}</action>  → propose des axes narratifs pour la suite
<action>{"type":"GENERATE_AXES_FINAL","ending":"happy"}</action>  → axes de fin (happy | sad | open | twist)
<action>{"type":"GENERATE_AXES_CHAPTER"}</action>  → axes pour clore le chapitre courant (génère du texte de clôture)
<action>{"type":"CLOSE_CHAPTER"}</action>  → clore le chapitre courant SANS générer de texte, et ouvrir le chapitre suivant (usage : "clore le chapitre", "passer au chapitre suivant")
<action>{"type":"GENERATE_SUITE"}</action>  → génère la suite avec l'axe sélectionné
<action>{"type":"GENERATE_SUITE_AXIS","title":"...","description":"..."}</action>  → génère la suite avec un axe précis fourni par toi
<action>{"type":"SELECT_AXIS","index":0}</action>  → sélectionne un axe (0-based) parmi ceux proposés
<action>{"type":"SET_AXES","axes":[{"title":"...","description":"..."},{"title":"...","description":"..."}]}</action>  → injecte tes propres axes

── EDITION ──
<action>{"type":"UNDO_LAST_PART"}</action>  → supprime la dernière PARTIE (bloc entier généré) et restaure les axes précédents
<action>{"type":"DELETE_PART","index":0}</action>  → supprime une PARTIE entière à l'index donné (0-based). Omettre index = supprime la dernière partie.
<action>{"type":"DELETE_LAST_PARAGRAPH"}</action>  → supprime uniquement le DERNIER PARAGRAPHE du texte de la dernière partie (usage : "supprime le dernier paragraphe")
<action>{"type":"EXTEND_LAST_PARAGRAPH","words":200}</action>  → rallonge le dernier paragraphe de la dernière partie. words = nombre de mots cible (défaut 200)
<action>{"type":"EXTEND_PARAGRAPH","paraRef":"1.3","words":200}</action>  → rallonge le paragraphe §1.3 (chapitre 1, 3ème paragraphe — numéros visibles en marge en mode avancé). words optionnel.
<action>{"type":"REWRITE_PARAGRAPH","paraRef":"2.1","include":"plus de tension","exclude":"dialogues"}</action>  → réécrit le paragraphe §2.1 avec des contraintes. include/exclude optionnels.
<action>{"type":"MOVE_PART","index":0,"direction":-1}</action>  → déplace une partie (-1 = vers le haut, +1 = vers le bas)

── WORKFLOW ──
<action>{"type":"SAVE_PROJECT"}</action>  → sauvegarde le projet .atelier
<action>{"type":"TRIGGER_NSFW_MODAL"}</action>  → ouvre la fenêtre de mot de passe pour activer le mode adulte (usage : si l'auteur demande d'activer le mode adulte/18+/NSFW)
<action>{"type":"TRANSLATE","lang":"english"}</action>  → traduit l'histoire dans la langue cible
<action>{"type":"SET_ENDED","value":true}</action>  → marque l'histoire comme terminée (ou non)

── LECTURE DU TEXTE ──
Tu reçois un INDEX de l'histoire (résumés de blocs de ~600 mots). Pour les questions générales (thèmes, personnages, structure, cohérence globale), utilise UNIQUEMENT l'index — ne demande PAS de blocs. Pour lire le texte exact d'un passage précis, utilise :
<action>{"type":"GET_BLOCK","id":"B3"}</action>  → récupère le texte complet du bloc B3
<action>{"type":"GET_BLOCK","id":["B3","B4"]}</action>  → récupère 2 blocs d'un coup (maximum 2 à la fois)
Règles strictes :
- N'utilise GET_BLOCK QUE pour des questions très précises (numéro de paragraphe, citation exacte, détail de scène spécifique)
- Maximum 2 blocs par question
- Si un résumé affiche "(résumé non disponible)", utilise quand même les autres résumés disponibles pour répondre
- Si l'index est insuffisant pour répondre, dis-le à l'auteur et suggère-lui de cliquer sur 📑 pour indexer

RÈGLES DE CONVERSATION — IMPÉRATIVES :
1. UNE SEULE QUESTION À LA FOIS. Jamais plusieurs questions dans le même message.
2. Pose tes questions de façon naturelle et progressive, comme un vrai éditeur qui découvre le projet.
3. Quand tu proposes une configuration, fais un RÉCAPITULATIF CLAIR sous cette forme :

---
📋 Voici ce que je vais configurer :
• Genre : Science-fiction + Aventure
• Style : Frank Herbert
• Narrateur : 3ème personne
• Longueur de suite : 1500 mots
• Inclure : Darth Vader, côté obscur

Dois-je appliquer ces paramètres ? (oui / non / modifier)
---

4. N'applique AUCUNE action de config avant confirmation. Pour les actions éditoriales ponctuelles (supprimer une partie, sélectionner un axe, etc.) demande confirmation si destructif.
5. SET_ADVANCED:true TOUJOURS en premier si tu touches à la config.
6. SET_NARRATOR et SET_DURATION OBLIGATOIRES dans toute config complète — sans eux le bouton Générer est désactivé.
7. Pour un style hors liste : utilise SET_INCLUDE avec une description stylistique précise.
8. Après config : "✅ Configuration appliquée ! Cliquez sur **GÉNÉRER L'HISTOIRE** pour commencer."
9. Tu peux enchaîner des actions intelligemment : ex. GENERATE_AXES puis SELECT_AXIS puis GENERATE_SUITE si l'auteur dit "génère la suite avec l'axe 2".`;

  const send = async () => {
    const msg = input.trim();
    if (!msg || working) return;
    setInput("");
    const userMsg = { role: "user", content: msg };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setWorking(true);
    try {
      const messages = [
        { role: "user", content: systemPrompt + "\n\n---\nPremier message : prêt à aider." },
        { role: "assistant", content: "Bonjour ! Quel type d'histoire souhaitez-vous écrire ?" },
        ...newHistory.map(({ role, content }) => ({ role, content })),
      ];
      const raw = await callClaude(messages, 1000, 30000, 1, false);
      const actionRe = /<action>([\s\S]*?)<\/action>/g;
      let m;
      const actions = [];
      while ((m = actionRe.exec(raw)) !== null) {
        try { actions.push(JSON.parse(m[1])); } catch {}
      }
      const cleanText = raw.replace(/<action>[\s\S]*?<\/action>/g, "").trim();

      // SET_ADVANCED en premier pour que les autres champs soient visibles
      const advAction = actions.find(a => a.type === "SET_ADVANCED");
      if (advAction) { try { setAdvancedMode(advAction.value); addLog("info", "CHAT", `✦ Mode avancé → ${advAction.value}`); } catch(e) { addLog("warn","CHAT",`⚠ SET_ADVANCED: ${e.message}`); } }

      for (const action of actions) {
        try {
        if (action.type === "SET_GENRES" && Array.isArray(action.values)) {
          const valid = action.values.filter(v => GENRES.find(g => g.value === v));
          if (valid.length) { setGenres(valid); addLog("info", "CHAT", `✦ Genres → ${valid.join(", ")}`); }
        }
        if (action.type === "SET_NARRATOR" && action.value) { setNarrator(action.value); addLog("info", "CHAT", `✦ Narrateur → ${action.value}`); }
        if (action.type === "SET_LANGUAGE" && action.value) { setLanguage(action.value); addLog("info", "CHAT", `✦ Langue → ${action.value}`); }
        if (action.type === "SET_DURATION" && action.value) { setDuration(action.value); addLog("info", "CHAT", `✦ Durée → ${action.value}`); }
        if (action.type === "SET_STYLE" && action.value) { setWritingStyle(action.value); addLog("info", "CHAT", `✦ Style → "${action.value}"`); }
        if (action.type === "SET_TITLE" && action.value) { setBookTitle(action.value); addLog("info", "CHAT", `✦ Titre → "${action.value}"`); }
        if (action.type === "SET_WORDS" && action.value) { setNextWords(Math.max(300, Math.min(6000, Number(action.value)))); addLog("info", "CHAT", `✦ Longueur → ${action.value} mots`); }
        if (action.type === "SET_BOOK_MODE" && action.value) { setBookMode(action.value); addLog("info", "CHAT", `✦ Mode → ${action.value}`); }
        if (action.type === "SET_ENDED") { setEnded(!!action.value); addLog("info", "CHAT", `✦ Histoire terminée → ${action.value}`); }
        if (action.type === "SET_INCLUDE" && action.value) {
          const append = prev => prev ? `${prev}, ${action.value}` : action.value;
          setNextInclude(append);
          if (setInitInclude) setInitInclude(append);
          addLog("info", "CHAT", `✦ Inclure → "${action.value}"`);
        }
        if (action.type === "SET_EXCLUDE" && action.value) {
          const append = prev => prev ? `${prev}, ${action.value}` : action.value;
          setNextExclude(append);
          if (setInitExclude) setInitExclude(append);
          addLog("info", "CHAT", `✦ Exclure → "${action.value}"`);
        }
        if (action.type === "SET_SOURCE" && action.bookTitle) {
          setClassicSource(s => ({ ...s, type: "known", bookTitle: action.bookTitle, context: "" }));
          addLog("info", "CHAT", `✦ Source → "${action.bookTitle}"`);
          if (action.searchNow) setTimeout(() => searchClassicSource(action.bookTitle), 600);
        }
        if (action.type === "SET_AXES" && Array.isArray(action.axes) && action.axes.length) {
          setAxes(action.axes);
          setPendingAction({ isFinal: false, finalEnding: null, closeChapter: false });
          addLog("info", "CHAT", `✦ ${action.axes.length} axes injectés`);
        }
        if (action.type === "SELECT_AXIS" && typeof action.index === "number") {
          setSelectedAxis(action.index);
          addLog("info", "CHAT", `✦ Axe sélectionné → #${action.index + 1}`);
        }
        if (action.type === "SET_ADVANCED") { /* déjà traité */ }
        if (action.type === "GENERATE_INCIPIT") {
          setTimeout(() => { generate && generate(); }, 300);
          addLog("info", "CHAT", `✦ Génération incipit lancée`);
        }
        if (action.type === "GENERATE_AXES") {
          setTimeout(() => { generateAxes && generateAxes(false, null, false); }, 300);
          addLog("info", "CHAT", `✦ Génération axes lancée`);
        }
        if (action.type === "GENERATE_AXES_FINAL") {
          const ending = action.ending || "open";
          setTimeout(() => { generateAxes && generateAxes(true, ending, false); }, 300);
          addLog("info", "CHAT", `✦ Axes de fin (${ending}) lancés`);
        }
        if (action.type === "GENERATE_AXES_CHAPTER") {
          setTimeout(() => { generateAxes && generateAxes(false, null, true); }, 300);
          addLog("info", "CHAT", `✦ Axes fin de chapitre lancés`);
        }
        if (action.type === "GENERATE_SUITE") {
          setTimeout(() => { generateSuite(false, null, false, null); }, 300);
          addLog("info", "CHAT", `✦ Suite lancée`);
        }
        if (action.type === "GENERATE_SUITE_AXIS" && action.description) {
          setTimeout(() => { generateSuite(false, null, false, action.description); }, 300);
          addLog("info", "CHAT", `✦ Suite avec axe personnalisé lancée`);
        }
        if (action.type === "UNDO_LAST_PART") {
          if (parts.length > 0) {
            deletePart && deletePart(parts.length - 1);
            if (lastAxes?.axes?.length) {
              setAxes(lastAxes.axes);
              setPendingAction(lastAxes.pendingAction || null);
              if (lastAxes.include) setNextInclude(lastAxes.include);
              if (lastAxes.exclude) setNextExclude(lastAxes.exclude);
            }
            addLog("info", "CHAT", `✦ Dernière partie annulée — axes restaurés`);
          }
        }
        if (action.type === "DELETE_PART") {
          const idx = typeof action.index === "number" ? action.index : parts.length - 1;
          deletePart && deletePart(idx);
          addLog("info", "CHAT", `✦ Partie #${idx} supprimée`);
        }
        if (action.type === "EXTEND_LAST_PARAGRAPH") {
          const words = typeof action.words === "number" ? action.words : 200;
          extendLastParagraph && extendLastParagraph(words);
          addLog("info", "CHAT", `✦ Extension dernier paragraphe ~${words} mots`);
        }
        if (action.type === "EXTEND_PARAGRAPH" && action.paraRef) {
          const words = typeof action.words === "number" ? action.words : 200;
          extendParagraph && extendParagraph(action.paraRef, words);
          addLog("info", "CHAT", `✦ Extension §${action.paraRef} ~${words} mots`);
        }
        if (action.type === "REWRITE_PARAGRAPH" && action.paraRef) {
          rewriteParagraph && rewriteParagraph(action.paraRef, action.include || "", action.exclude || "");
          addLog("info", "CHAT", `✦ Réécriture §${action.paraRef}`);
        }
        if (action.type === "DELETE_LAST_PARAGRAPH") {
          if (parts.length > 0) {
            const lastPart = parts[parts.length - 1];
            const paras = lastPart.text.split(/\n\n+/).filter(p => p.trim());
            if (paras.length <= 1) {
              deletePart && deletePart(parts.length - 1);
              addLog("info", "CHAT", `✦ Dernier paragraphe (part entière) supprimé`);
            } else {
              const newText = paras.slice(0, -1).join("\n\n");
              updateLastPart && updateLastPart(newText);
              addLog("info", "CHAT", `✦ Dernier paragraphe supprimé`);
            }
          }
        }
        if (action.type === "MOVE_PART" && typeof action.index === "number") {
          movePart && movePart(action.index, action.direction ?? -1);
          addLog("info", "CHAT", `✦ Partie #${action.index} déplacée`);
        }
        if (action.type === "TRIGGER_NSFW_MODAL") {
          triggerNsfwModal && triggerNsfwModal();
          addLog("info", "CHAT", `✦ Fenêtre activation mode adulte ouverte`);
        }
        if (action.type === "SAVE_PROJECT") {
          setTimeout(() => { saveProject && saveProject(); }, 300);
          addLog("info", "CHAT", `✦ Sauvegarde projet déclenchée`);
        }
        if (action.type === "CLOSE_CHAPTER") {
          closeCurrentChapter && closeCurrentChapter();
        }
        if (action.type === "TRANSLATE" && action.lang) {
          setTranslateTargetLang(action.lang);
          setTimeout(() => { translateBook && translateBook(action.lang); }, 300);
          addLog("info", "CHAT", `✦ Traduction → ${action.lang}`);
        }
        } catch(actionErr) { addLog("warn", "CHAT", `⚠ Action ${action.type} : ${actionErr.message}`); }
      }

      // ── GET_BLOCK : le bot demande le texte complet d'un ou plusieurs blocs ──
      const getBlockActions = actions.filter(a => a.type === "GET_BLOCK" && a.id);
      if (getBlockActions.length > 0) {
        const requestedIds = getBlockActions.flatMap(a => Array.isArray(a.id) ? a.id : [a.id]);
        const blockContents = requestedIds.map(id => {
          const b = blocks.find(bl => bl.id === id);
          if (!b) return `[${id}] introuvable`;
          return `[${id}] ${b.firstRef}→${b.lastRef} :\n${b.text}`;
        }).join("\n\n");

        addLog("info", "CHAT", `↩ Envoi blocs : ${requestedIds.join(", ")}`);

        // Générer les résumés manquants pour les blocs demandés (en arrière-plan)
        requestedIds.forEach(id => {
          const idx = blocks.findIndex(bl => bl.id === id);
          if (idx >= 0 && !blocks[idx].summary) {
            summarizeBlock(blocks[idx], choices?.language || language).then(summary => {
              if (summary) setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, summary } : b));
            });
          }
        });

        // Second appel avec le contenu des blocs injecté
        const messagesWithBlocks = [
          { role: "user", content: systemPrompt + "\n\n---\nPremier message : prêt à aider." },
          { role: "assistant", content: "Bonjour ! Quel type d'histoire souhaitez-vous écrire ?" },
          ...newHistory.map(({ role, content }) => ({ role, content })),
          { role: "assistant", content: raw },
          { role: "user", content: `CONTENU DES BLOCS DEMANDÉS :\n\n${blockContents}\n\nMerci de répondre à la question de l'auteur en utilisant ces passages.` },
        ];
        const raw2 = await callClaude(messagesWithBlocks, 1000, 30000, 1, false);
        const cleanText2 = raw2.replace(/<action>[\s\S]*?<\/action>/g, "").trim();
        setHistory(prev => [...prev, { role: "assistant", content: cleanText2, actions: [] }]);
        setWorking(false);
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }

      // Si des actions de config ont été appliquées (hors GENERATE_SUITE), scroller vers le bouton Générer
      const hasConfigActions = actions.some(a => ["SET_GENRES","SET_NARRATOR","SET_LANGUAGE","SET_DURATION","SET_STYLE","SET_INCLUDE","SET_EXCLUDE","SET_SOURCE"].includes(a.type));
      if (hasConfigActions && generateBtnRef?.current && parts.length === 0) {
        setTimeout(() => {
          generateBtnRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          if (setGeneratePulse) {
            setGeneratePulse(true);
            setTimeout(() => setGeneratePulse(false), 3000);
          }
        }, 800);
      }
      setHistory(prev => [...prev, { role: "assistant", content: cleanText, actions }]);
    } catch(e) {
      setHistory(prev => [...prev, { role: "assistant", content: "⚠ Erreur : " + e.message, actions: [] }]);
    }
    setWorking(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const C2 = C; // alias - uses theme context
  const actionLabels = {
    SET_GENRES: "🎭 genres", SET_NARRATOR: "👁 narrateur", SET_LANGUAGE: "🌐 langue",
    SET_DURATION: "⏱ durée", SET_STYLE: "✍ style", SET_INCLUDE: "✚ inclure",
    SET_EXCLUDE: "✖ exclure", SET_SOURCE: "📚 source", SET_AXES: "⊞ axes",
    SET_ADVANCED: "⚙ avancé", SET_TITLE: "📝 titre", SET_WORDS: "📏 longueur",
    SET_BOOK_MODE: "📖 mode", SET_ENDED: "🏁 fin", SELECT_AXIS: "➤ axe",
    GENERATE_INCIPIT: "▶ incipit", GENERATE_AXES: "⊞ axes", GENERATE_AXES_FINAL: "⊞ axes fin",
    GENERATE_AXES_CHAPTER: "⊞ axes chapitre", CLOSE_CHAPTER: "✕ clore chapitre", GENERATE_SUITE: "▶ suite",
    GENERATE_SUITE_AXIS: "▶ suite+axe", UNDO_LAST_PART: "↩ annuler",
    GET_BLOCK: "📖 lire bloc",
    DELETE_PART: "🗑 supprimer part", DELETE_LAST_PARAGRAPH: "🗑 supprimer §", EXTEND_LAST_PARAGRAPH: "⤢ étendre §fin", EXTEND_PARAGRAPH: "⤢ étendre §N", REWRITE_PARAGRAPH: "↺ réécrire §N", MOVE_PART: "↕ déplacer",
    SAVE_PROJECT: "💾 sauvegarder", TRANSLATE: "🌐 traduire"
  };

  // ── Rendu enrichi des messages : §ref et chapitres cliquables ────
  const renderChatContent = (text) => {
    const result = [];
    const re = /(\*\*(.+?)\*\*|\[?§(\d+)\.(\d+)\]?|chapitres?\s+(I{1,3}V?|VI{0,3}|IX|X{0,3}IX?|[0-9]+)(?!\w))/gi;
    let last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) result.push(<span key={`t${last}`}>{text.slice(last, m.index)}</span>);
      if (m[0].startsWith("**")) {
        result.push(<strong key={`b${m.index}`}>{m[2]}</strong>);
      } else if (m[0].startsWith("§")) {
        const ref = `§${m[3]}.${m[4]}`;
        result.push(
          <span key={`p${m.index}`}
            onClick={() => {
              chatInjectRef?.current?.(ref);
              const el = document.querySelector(`[data-para-ref="${ref}"]`);
              if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.style.transition = "background 0.3s"; el.style.background = `${C.gold}30`; setTimeout(() => { el.style.background = "transparent"; }, 1800); }
            }}
            title={`Aller au ${ref}`}
            style={{ color: C.gold, cursor: "pointer", textDecoration: "underline dotted", textUnderlineOffset: "2px", fontFamily: "monospace", fontSize: "0.7rem" }}
          >{ref}</span>
        );
      } else {
        const chapStr = m[5];
        const romanToIdx = { I:0,II:1,III:2,IV:3,V:4,VI:5,VII:6,VIII:7,IX:8,X:9,XI:10,XII:11,XIII:12,XIV:13,XV:14 };
        const ci = isNaN(chapStr) ? (romanToIdx[chapStr.toUpperCase()] ?? 0) : parseInt(chapStr) - 1;
        result.push(
          <span key={`c${m.index}`}
            onClick={() => document.getElementById(`bp-chap-${ci}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            title={`Aller au chapitre ${chapStr}`}
            style={{ color: C.gold, cursor: "pointer", textDecoration: "underline dotted", textUnderlineOffset: "2px" }}
          >{m[0]}</span>
        );
      }
      last = m.index + m[0].length;
    }
    if (last < text.length) result.push(<span key={`t${last}`}>{text.slice(last)}</span>);
    return result;
  };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
      {open && (
        <div style={{ position: "absolute", bottom: "3rem", right: 0, width: "340px", maxHeight: "520px", background: C2.bg, border: `1px solid ${C2.border}`, borderRadius: 6, display: "flex", flexDirection: "column", boxShadow: "0 -8px 32px rgba(0,0,0,0.6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.9rem", borderBottom: `1px solid ${C2.border}`, background: C2.card, borderRadius: "6px 6px 0 0" }}>
            <span style={{ color: C2.gold, fontSize: "0.72rem", letterSpacing: "0.15em" }}>✦ ASSISTANT NARRATIF</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {onIndexBlocks && blocksCount > 0 && (
                <button onClick={onIndexBlocks} disabled={indexingBlocks}
                  title={`${blocksSummarized}/${blocksCount} blocs indexés — cliquer pour résumer les blocs manquants (améliore les réponses du chatbot)`}
                  style={{ background: "transparent", border: `1px solid ${blocksSummarized < blocksCount ? C2.gold + "66" : C2.border}`, borderRadius: 4, color: blocksSummarized < blocksCount ? C2.gold : C2.muted, fontSize: "0.62rem", padding: "0.15rem 0.45rem", cursor: indexingBlocks ? "wait" : "pointer", fontFamily: "monospace", opacity: indexingBlocks ? 0.6 : 1, transition: "all 0.2s" }}>
                  {indexingBlocks ? "⟳" : `📑 ${blocksSummarized}/${blocksCount}`}
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: C2.muted, cursor: "pointer", fontSize: "0.9rem" }}>✕</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {history.length === 0 && (
              <p style={{ color: C2.muted, fontSize: "0.7rem", fontStyle: "italic", textAlign: "center", marginTop: "1rem", lineHeight: 1.6 }}>
                Décrivez votre projet en quelques mots…<br/>
                <span style={{ fontSize: "0.62rem", opacity: 0.6 }}>Je vous guiderai étape par étape.</span>
              </p>
            )}
            {history.map((msg, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "88%", padding: "0.5rem 0.75rem", borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: msg.role === "user" ? (C2.isDark ? "#1a2a3a" : "#e8f0f8") : C2.card, border: `1px solid ${msg.role === "user" ? (C2.isDark ? "#2a3a4a" : "#b8cfe8") : C2.border}`, fontSize: "0.72rem", color: C2.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {msg.role === "assistant" ? renderChatContent(msg.content) : msg.content}
                </div>
                {msg.actions?.length > 0 && (
                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                    {msg.actions.map((a, ai) => (
                      <span key={ai} style={{ background: C2.isDark ? "#1a2a1a" : "#e8f5e8", border: `1px solid ${C2.isDark ? "#2a3a2a" : "#a8d8a8"}`, color: C2.green, fontSize: "0.58rem", padding: "0.1rem 0.4rem", borderRadius: 3 }}>
                        {actionLabels[a.type] || a.type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {working && (
              <div style={{ display: "flex", gap: "0.3rem", alignItems: "center", padding: "0.4rem 0.6rem" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C2.gold, animation: `pulse 1.2s ease ${i*0.2}s infinite` }} />)}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: "0.5rem 0.6rem", borderTop: `1px solid ${C2.border}`, display: "flex", gap: "0.4rem" }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Votre message… (Entrée pour envoyer)" rows={2}
              style={{ flex: 1, background: C.inputBg, border: `1px solid ${C2.border}`, borderRadius: 3, padding: "0.35rem 0.5rem", color: C2.text, fontSize: "0.7rem", resize: "none", fontFamily: "inherit" }} />
            <button onClick={send} disabled={working || !input.trim()}
              style={{ background: C2.gold, border: "none", borderRadius: 3, padding: "0 0.6rem", color: "#1a1510", fontWeight: "bold", fontSize: "0.9rem", cursor: working || !input.trim() ? "not-allowed" : "pointer", opacity: working || !input.trim() ? 0.4 : 1 }}>
              ➤
            </button>
          </div>
        </div>
      )}
      <button onClick={() => {
          if (!open) {
            let seen = false;
            try { seen = localStorage.getItem("atelier_chatbot_warn_seen") === "1"; } catch {}
            if (!seen && onChatbotWarn) { onChatbotWarn(); return; }
            setUnread(0);
          }
          setOpen(v => !v);
        }}
        style={{ width: 44, height: 44, borderRadius: "50%", background: open ? C2.gold : C2.card, border: `1px solid ${open ? C2.gold : C2.border}`, color: open ? C2.bg : C2.gold, fontSize: "1.2rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", position: "relative" }}>
        {open ? "✕" : "💬"}
        {unread > 0 && !open && (
          <span style={{ position: "absolute", top: -4, right: -4, background: "#e06060", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{unread}</span>
        )}
      </button>
    </div>
  );
}


function DebugPanel({ advancedMode, onAdvancedToggle, chatProps, themeMode, setThemeMode, onShowHelp }) {
  const C = useTheme();
  const logs = useDebugLogs();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs, open]);

  const levelColor = { info: "#7ec87e", warn: "#c9a96e", error: "#e06060", api: "#8abcd4" };
  const filtered = filter === "all" ? logs : logs.filter(l => l.level === filter || l.category === filter.toUpperCase());
  const counts = { error: logs.filter(l => l.level === "error").length, warn: logs.filter(l => l.level === "warn").length };

  const copyAll = () => {
    const text = logs.map(l => `[${l.time}] [${l.level.toUpperCase()}] [${l.category}] ${l.message}${l.detail ? "\n  " + l.detail : ""}`).join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atelier-logs-${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, fontFamily: "monospace", pointerEvents: "none" }}>
      {/* ── Toggle Mode Avancé + sélecteur thème ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.25rem 0.75rem", background: "rgba(0,0,0,0)", pointerEvents: "none" }}>
        {/* Encart gauche : mode avancé + thème */}
        <div style={{ pointerEvents: "auto", background: C.panelBg, border: `1px solid ${advancedMode ? C.gold + "44" : C.border}`, borderRadius: 6, padding: "0.3rem 0.7rem", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <Toggle on={advancedMode} onChange={onAdvancedToggle} label="Mode avancé" color={C.gold} />
          {advancedMode && onShowHelp && (
            <button onClick={onShowHelp} title="Revoir le mode d'emploi du mode avancé"
              style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: "50%", color: C.muted, fontSize: "0.65rem", width: "1.2rem", height: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1, flexShrink: 0 }}>
              ?
            </button>
          )}
          {advancedMode && setThemeMode && (
            <>
              <div style={{ width: 1, height: 16, background: C.border, opacity: 0.5 }} />
              <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                {[["auto","⟳"],["light","☀"],["dark","☾"]].map(([mode, icon]) => (
                  <button key={mode} onClick={() => setThemeMode(mode)}
                    style={{ background: themeMode === mode ? `${C.gold}22` : "transparent", border: `1px solid ${themeMode === mode ? C.gold : "transparent"}`, borderRadius: 4, color: themeMode === mode ? C.gold : C.muted, fontSize: "0.72rem", padding: "0.1rem 0.35rem", cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.2s", lineHeight: 1.4 }}
                    title={mode === "auto" ? "Auto (système)" : mode === "light" ? "Thème clair" : "Thème sombre"}>
                    {icon}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Bulle chat — droite, uniquement en mode avancé */}
        {advancedMode && chatProps && (
          <div style={{ pointerEvents: "auto" }}>
            <NarrativeChatBubble {...chatProps} />
          </div>
        )}
      </div>
      {/* ── Trigger bar ── */}
      <div
        onClick={() => setOpen(v => { const next = !v; setDebugPanelOpen(next); return next; })}
        style={{ textAlign: "center", padding: "0.2rem 1rem", cursor: "pointer", background: C.triggerBg, backdropFilter: "blur(4px)", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", userSelect: "none", position: "relative", pointerEvents: "auto" }}>
        <span style={{ fontSize: "0.55rem", color: C.muted, letterSpacing: "0.1em", position: "absolute", left: "0.75rem" }}>{APP_VERSION}</span>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: C.muted, opacity: 0.6 }}>
          {open ? "▾ fermer les logs" : "▸ logs debug"}
        </span>
        {logs.length > 0 && !open && (
          <span style={{ fontSize: "0.58rem", color: C.muted, opacity: 0.5 }}>({logs.length})</span>
        )}
        {counts.error > 0 && (
          <span style={{ fontSize: "0.58rem", color: "#e06060", opacity: 0.7 }}>⚠ {counts.error} erreur{counts.error > 1 ? "s" : ""}</span>
        )}
        {counts.warn > 0 && counts.error === 0 && (
          <span style={{ fontSize: "0.58rem", color: C.gold, opacity: 0.6 }}>△ {counts.warn} avert.</span>
        )}
      </div>

      {/* ── Panel ── */}
      {open && (
        <div style={{ background: C.isDark ? "#07060a" : "#f5f2ed", borderTop: `1px solid ${C.border}`, maxHeight: "38vh", display: "flex", flexDirection: "column", pointerEvents: "auto" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.35rem 0.75rem", borderBottom: `1px solid ${C.inputBorder}`, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.58rem", color: C.muted, letterSpacing: "0.2em" }}>FILTRE</span>
            {["all","api","gen","epub","import","info","warn","error"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ background: filter === f ? `${C.gold}22` : "transparent", border: `1px solid ${filter === f ? C.gold : C.border}`, color: filter === f ? C.gold : C.muted, fontSize: "0.58rem", padding: "0.15rem 0.45rem", borderRadius: 2, cursor: "pointer", letterSpacing: "0.1em" }}>
                {f.toUpperCase()}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={copyAll} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontSize: "0.58rem", padding: "0.15rem 0.6rem", borderRadius: 2, cursor: "pointer" }}>
              ⬇ logs.txt
            </button>
          </div>

          {/* Log list */}
          <div style={{ overflowY: "auto", flex: 1, padding: "0.25rem 0" }}>
            {filtered.length === 0 && (
              <p style={{ color: C.muted, fontSize: "0.65rem", textAlign: "center", padding: "1rem", fontStyle: "italic" }}>Aucun log</p>
            )}
            {filtered.map(log => (
              <div key={log.id}
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                style={{ padding: "0.2rem 0.75rem", cursor: log.detail ? "pointer" : "default", borderBottom: `1px solid ${C.isDark ? "#0f0e11" : "#e8e4de"}`, display: "flex", gap: "0.5rem", alignItems: "flex-start", background: expandedId === log.id ? (C.isDark ? "#0f0e14" : "#eceae5") : "transparent" }}>
                <span style={{ fontSize: "0.58rem", color: C.muted, whiteSpace: "nowrap", marginTop: "0.1rem" }}>{log.time}</span>
                <span style={{ fontSize: "0.6rem", color: levelColor[log.level] || C.muted, whiteSpace: "nowrap", marginTop: "0.05rem" }}>
                  [{log.category}]
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "0.67rem", color: "#8a7a60", wordBreak: "break-word" }}>{log.message}</span>
                  {log.detail && expandedId === log.id && (
                    <pre style={{ fontSize: "0.6rem", color: "#5a5040", marginTop: "0.25rem", whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#0a0908", padding: "0.4rem", borderRadius: 2, border: "1px solid #1a1714" }}>{log.detail}</pre>
                  )}
                </div>
                {log.detail && <span style={{ fontSize: "0.55rem", color: C.muted, marginTop: "0.1rem" }}>{expandedId === log.id ? "▴" : "▾"}</span>}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────
// ── Contexte partagé pour GybhNode (évite la redéfinition dans le render) ──
const GybhCtx = React.createContext(null);

// ── Composant GybhNode défini hors de App pour stabiliser le focus des inputs ──
function GybhNode({ nodeId, depth = 0 }) {
  const C = useTheme();
  const ctx = React.useContext(GybhCtx);
  if (!ctx) return null;
  const { gybhNodes, gybhExpandedNodes, gybhPendingNode, gybhWritingNode, gybhReadingNode,
          gybhRootId, gybhLoadingAxes, gybhMaxDepth, setGybhNodes, setGybhExpandedNodes, setGybhReadingNode,
          setGybhPendingNode, generateGybhText, generateGybhAxes, validateGybhAxes } = ctx;
  const S = makeS(C);

  const node = gybhNodes[nodeId];
  if (!node) return null;
  const isExpanded = gybhExpandedNodes[nodeId] !== false;
  const isPending = gybhPendingNode === nodeId;
  const isWriting = gybhWritingNode === nodeId;
  const hasText = !!node.text;
  const isReading = gybhReadingNode === nodeId;

  const depthColors = ["#c9a96e","#8abcce","#7ec87e","#b88acc","#e09060","#60a8c0"];
  const color = depthColors[depth % depthColors.length];

  return (
    <div style={{ marginLeft: depth > 0 ? "1.2rem" : 0, borderLeft: depth > 0 ? `1px solid ${color}22` : "none", paddingLeft: depth > 0 ? "0.8rem" : 0, marginBottom: "0.3rem" }}>
      {/* En-tête nœud */}
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start", padding: "0.5rem 0.6rem", background: isPending ? `${color}10` : "transparent", border: `1px solid ${isPending ? color : C.border}`, borderRadius: 4, cursor: "pointer" }}
        onClick={() => setGybhExpandedNodes(prev => ({ ...prev, [nodeId]: !isExpanded }))}>
        <span style={{ color, fontSize: "0.7rem", minWidth: "1rem", marginTop: "0.1rem" }}>
          {node.isEnding ? (node.endingType === "good" ? "★" : node.endingType === "bad" ? "✦" : "◆") : isExpanded ? "▾" : "▸"}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {node.choiceText && (
            <div style={{ color: color, fontSize: "0.68rem", letterSpacing: "0.08em", marginBottom: "0.2rem", fontStyle: "italic" }}>
              « {node.choiceText} »
            </div>
          )}
          <div style={{ color: hasText ? "#d8c8a8" : "#7a6a50", fontSize: "0.75rem", lineHeight: 1.5 }}>
            {node.summary?.slice(0, 100)}{(node.summary?.length || 0) > 100 ? "…" : ""}
          </div>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.6rem", color: "#3a3028" }}>§{node.id.slice(-4)}</span>
            <span style={{ fontSize: "0.6rem", color: "#3a3028" }}>niv.{node.depth}</span>
            {hasText && <span style={{ fontSize: "0.6rem", color: "#3a6a3a" }}>✓ texte</span>}
            {node.isEnding && <span style={{ fontSize: "0.6rem", color: color }}>FIN</span>}
            {isWriting && <span style={{ fontSize: "0.6rem", color: C.gold }}>⟳ écriture…</span>}
          </div>
        </div>
        {/* Actions rapides */}
        {!node.isEnding && isExpanded && (
          <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            {!hasText && (
              <button onClick={() => generateGybhText(nodeId)} disabled={!!gybhWritingNode}
                style={{ ...S.btn(color, "small"), fontSize: "0.58rem", padding: "0.15rem 0.4rem", opacity: gybhWritingNode ? 0.4 : 1 }}>
                ✍
              </button>
            )}
            {node.choices === null && !node.pendingAxes && (
              <button onClick={() => { if (node.depth < gybhMaxDepth) { setGybhPendingNode(nodeId); generateGybhAxes(nodeId); } }}
                disabled={gybhLoadingAxes || node.depth >= gybhMaxDepth}
                title={node.depth >= gybhMaxDepth ? `Profondeur max (${gybhMaxDepth}) atteinte` : "Générer des axes"}
                style={{ ...S.btn(node.depth >= gybhMaxDepth ? "#3a2a2a" : "#5a4a38", "small"), fontSize: "0.58rem", padding: "0.15rem 0.4rem", opacity: node.depth >= gybhMaxDepth ? 0.3 : 1 }}>
                ＋
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mini barre de progression écriture */}
      {isWriting && (
        <div style={{ margin: "0.2rem 0 0.4rem 0", height: 3, background: "#1a1814", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${color}55, ${color})`, borderRadius: 2, animation: "progressSlide 1.8s ease-in-out infinite", backgroundSize: "200% 100%" }} />
        </div>
      )}

      {/* Panneau axes en attente de validation */}
      {isExpanded && node.pendingAxes && (
        <div style={{ margin: "0.5rem 0 0.5rem 0.5rem", background: "#0a0f0a", border: `1px solid ${color}44`, borderRadius: 4, padding: "0.9rem 1rem" }}>
          <div style={{ color: color, fontSize: "0.6rem", letterSpacing: "0.25em", marginBottom: "0.75rem" }}>
            ✦ AXES PROPOSÉS — validez ou demandez de nouveaux axes
          </div>
          {node.pendingAxes.map((axe, i) => (
            <div key={i} style={{ background: "#0f1408", border: "1px solid #2a3020", borderRadius: 3, padding: "0.7rem 0.8rem", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                <div style={{ color: depthColors[(depth+1) % depthColors.length], fontSize: "0.72rem", fontWeight: "bold", flex: 1 }}>
                  Axe {i+1} — « {axe.choiceText} »
                </div>
                {axe.isEnding && (
                  <span style={{ fontSize: "0.6rem", color: axe.endingType === "good" ? "#7ec87e" : axe.endingType === "bad" ? "#c86060" : C.gold, marginLeft: "0.5rem", flexShrink: 0 }}>
                    {axe.endingType === "good" ? "★ Fin heureuse" : axe.endingType === "bad" ? "✦ Fin tragique" : "◆ Fin"}
                  </span>
                )}
                {axe.convergeTo && (
                  <span style={{ fontSize: "0.6rem", color: "#8abcce", marginLeft: "0.5rem" }}>↗ converge §{axe.convergeTo?.slice(-4)}</span>
                )}
              </div>
              <div style={{ color: "#7a6a50", fontSize: "0.7rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                {axe.summary}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                <div>
                  <div style={{ color: C.green, fontSize: "0.58rem", marginBottom: "0.2rem" }}>✦ Inclure</div>
                  <input value={node.axeIncludes[i]} onChange={e => {
                    const v = [...node.axeIncludes]; v[i] = e.target.value;
                    setGybhNodes(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], axeIncludes: v } }));
                  }} placeholder="éléments à intégrer…"
                    style={{ ...S.input, fontSize: "0.65rem", minHeight: "unset", height: "30px" }} />
                </div>
                <div>
                  <div style={{ color: "#e06060", fontSize: "0.58rem", marginBottom: "0.2rem" }}>✕ Exclure</div>
                  <input value={node.axeExcludes[i]} onChange={e => {
                    const v = [...node.axeExcludes]; v[i] = e.target.value;
                    setGybhNodes(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], axeExcludes: v } }));
                  }} placeholder="à éviter…"
                    style={{ ...S.input, fontSize: "0.65rem", minHeight: "unset", height: "30px" }} />
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
            <button onClick={() => validateGybhAxes(nodeId)}
              style={{ ...S.btn(color), fontSize: "0.7rem", padding: "0.4rem 1rem" }}>
              ✓ Valider ces axes
            </button>
            <button onClick={() => { setGybhNodes(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], pendingAxes: null } })); generateGybhAxes(nodeId); }}
              disabled={gybhLoadingAxes}
              style={{ ...S.btn("#4a3a28", "small"), fontSize: "0.65rem" }}>
              ↺ Nouveaux axes
            </button>
          </div>
        </div>
      )}

      {/* Aperçu du texte en mode lecture */}
      {isExpanded && isReading && node.text && (
        <div style={{ margin: "0.4rem 0 0.4rem 0.5rem", background: C.bg, border: `1px solid ${color}33`, borderRadius: 3, padding: "1rem 1.2rem", fontFamily: "Georgia, serif", lineHeight: 1.85, fontSize: "0.9rem", color: C.text }}>
          {node.text.split("\n\n").map((p, i) => p.trim() ? <p key={i} style={{ margin: "0 0 0.9rem" }}>{p}</p> : null)}
          {!node.isEnding && node.choices?.length > 0 && (
            <div style={{ borderTop: `1px dashed ${color}44`, paddingTop: "0.75rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {node.choices.map((c, i) => (
                <button key={i} onClick={() => setGybhReadingNode(c.childId)}
                  style={{ ...S.btn("#2a3a2a", "small"), textAlign: "left", fontSize: "0.75rem", padding: "0.4rem 0.75rem", color: "#8abcce" }}>
                  → {c.text}
                </button>
              ))}
            </div>
          )}
          {node.isEnding && (
            <div style={{ textAlign: "center", marginTop: "1rem", color: color, fontSize: "0.8rem", opacity: 0.7 }}>
              {node.endingType === "good" ? "★ Fin heureuse" : node.endingType === "bad" ? "✦ Fin tragique" : "◆ Fin"} — <button onClick={() => setGybhReadingNode(gybhRootId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#5a6a5a", fontSize: "0.7rem", textDecoration: "underline" }}>Recommencer</button>
            </div>
          )}
        </div>
      )}

      {/* Enfants */}
      {isExpanded && node.choices?.length > 0 && (
        <div style={{ marginTop: "0.25rem" }}>
          {node.choices.map((c, i) => (
            <GybhNode key={c.childId} nodeId={c.childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  // ── Thème ──────────────────────────────────────────────────────
  const [themeMode, setThemeMode] = useState(() => {
    try { return localStorage.getItem("atelier_theme") || "auto"; } catch { return "auto"; }
  });
  const sysDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const [sysDarkState, setSysDarkState] = useState(sysDark);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const handler = e => setSysDarkState(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  useEffect(() => {
    try {
      const seen = localStorage.getItem("atelier_start_guide_seen") === "1";
      if (!seen) setShowStartGuide(true);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("atelier_theme", themeMode); } catch {}
  }, [themeMode]);
  const isDark = themeMode === "dark" || (themeMode === "auto" && sysDarkState);
  const theme = isDark ? THEME_DARK : THEME_LIGHT;
  // Auto-save
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const autoSaveKey = "atelier_autosave_v1";

  const C = theme;
  const S = makeS(theme);

  // Settings
  const [language, setLanguage] = useState("french");
  const [duration, setDuration] = useState(null);
  const [narrator, setNarrator] = useState(null);
  const [genres, setGenres] = useState([]);
  const [genreWeights, setGenreWeights] = useState({}); // { fantasy: 2, sf: 1 } — poids 1-3, mode avancé seulement
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showAdvancedHelp, setShowAdvancedHelp] = useState(false);
  const [showChatbotWarn, setShowChatbotWarn] = useState(false);
  const [showStartGuide, setShowStartGuide] = useState(false);
  const [showRecitHelp, setShowRecitHelp] = useState(false);
  const [showGenreHelp, setShowGenreHelp] = useState(false);
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [startGuideDontShow, setStartGuideDontShow] = useState(() => {
    try { return localStorage.getItem("atelier_start_guide_seen") !== "0"; } catch { return true; }
  });
  const [advancedHelpDontShow, setAdvancedHelpDontShow] = useState(() => {
    try { return localStorage.getItem("atelier_advanced_help_seen") !== "0"; } catch { return true; }
  });
  const [nsfwEnabled, setNsfwEnabled] = useState(false);
  const [showNsfwModal, setShowNsfwModal] = useState(false);
  const [initInclude, setInitInclude] = useState("");
  const [initExclude, setInitExclude] = useState("");
  const [writingStyle, setWritingStyle] = useState("");

  // Source narrative — récit classique (miroir du GYBH)
  const [classicSource, setClassicSource] = useState({ type: "original", bookTitle: "", context: "" });
  const [classicSourceLoading, setClassicSourceLoading] = useState(false);
  // Import texte (utilisé par classicSource.type === "upload")
  const [importText, setImportText] = useState("");
  const [importFileName, setImportFileName] = useState("");
  const [importAnalysis, setImportAnalysis] = useState(null);
  const [analyzingImport, setAnalyzingImport] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const importFileRef = useRef(null);

  // Story state
  const [parts, setParts] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [blocks, setBlocks] = useState([]); // RAG blocks: { id, chapterIdx, text, summary, paraRefs }
  // Carnet de bord — personnages et lieux
  const [characters, setCharacters] = useState([]); // { id, name, role, birthYear, birthYearEstimated, description, lastChapter }
  const [locations, setLocations] = useState([]);   // { id, name, type, description, lastChapter }
  const [showCarnet, setShowCarnet] = useState(false);
  const [extractingCarnet, setExtractingCarnet] = useState(false);
  const [showCarnetUpgrade, setShowCarnetUpgrade] = useState(false); // modale mise à jour carnet ancien fichier
  const [editingCarnet, setEditingCarnet] = useState(null); // { type: "char"|"loc", id: string } | null
  const [indexingBlocks, setIndexingBlocks] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [choices, setChoices] = useState(null);
  const [ended, setEnded] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  // Continuation controls
  const [nextInclude, setNextInclude] = useState("");
  const [nextExclude, setNextExclude] = useState("");
  const [nextNsfw, setNextNsfw] = useState(false);
  const [nextWords, setNextWords] = useState(1000);
  // Edition inline d'une partie : { globalIdx, text }
  const [editingPart, setEditingPart] = useState(null);
  const [showEndingPicker, setShowEndingPicker] = useState(false);
  const [selectedEnding, setSelectedEnding] = useState(null);
  const [chapterSuggestion, setChapterSuggestion] = useState(null);

  // Axes de continuation
  const [pendingAction, setPendingAction] = useState(null); // { isFinal, finalEnding, closeChapter }
  const [axes, setAxes] = useState(null); // [{title, description}]
  const [lastAxes, setLastAxes] = useState(null); // axes du dernier cycle (pour régénérer)
  const [selectedAxis, setSelectedAxis] = useState(null);
  const [loadingAxes, setLoadingAxes] = useState(false);
  const [ignoreAxes, setIgnoreAxes] = useState(false);

  // Rewrite in style
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [rewriteTargetStyle, setRewriteTargetStyle] = useState("");
  const [rewritingStyle, setRewritingStyle] = useState(false);

  // Translation state
  const [translations, setTranslations] = useState({}); // { lang: { parts: [...], title: "" } }
  const [activeLang, setActiveLang] = useState(null);   // null = langue originale
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState(0); // 0-100
  const [showTranslatePanel, setShowTranslatePanel] = useState(false);
  const [translateTargetLang, setTranslateTargetLang] = useState("");

  // ── GYBH (Game Your Book Hero) state ──────────────────────────
  const [bookMode, setBookMode] = useState("classic"); // "classic" | "gybh"
  const [gybhNodes, setGybhNodes] = useState({});      // { id: node }
  const [gybhRootId, setGybhRootId] = useState(null);
  const [gybhMaxDepth, setGybhMaxDepth] = useState(4);
  const [gybhSource, setGybhSource] = useState({ type: "original", bookTitle: "", text: "", wikiContext: "", wikiOpen: false }); // source narrative
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiCandidates, setWikiCandidates] = useState([]); // liste résultats Wikipedia
  const [searchResults, setSearchResults] = useState(null); // {tmdb, openLib, wiki} résultats à valider
  // phase: "idle"|"frame"|"skeleton"|"writing"|"reading"|"done"
  const [gybhPhase, setGybhPhase] = useState("idle");
  const [gybhFrame, setGybhFrame] = useState(null);    // { pitch, hero, stakes, opening }
  const [gybhLoadingFrame, setGybhLoadingFrame] = useState(false);
  const [gybhRegenLoading, setGybhRegenLoading] = useState(null); // "hero"|"stakes"|"opening"|null
  const [gybhPendingNode, setGybhPendingNode] = useState(null); // nodeId en attente de validation
  const [gybhLoadingAxes, setGybhLoadingAxes] = useState(false);
  const [gybhWritingNode, setGybhWritingNode] = useState(null); // nodeId en cours d'écriture
  const [gybhReadingNode, setGybhReadingNode] = useState(null); // nodeId en lecture interactive
  const [gybhExpandedNodes, setGybhExpandedNodes] = useState({}); // { id: bool }
  const [gybhProgress, setGybhProgress] = useState({ step: "", pct: 0 }); // progression globale
  const [expressModeRunning, setExpressModeRunning] = useState(false);        // mode autopilot en cours
  const [expressSectionStep, setExpressSectionStep] = useState("");   // progression section courante
  // Guidage de la trame — inclure/exclure par dimension
  const [gybhGuide, setGybhGuide] = useState({
    pitchInc: "", pitchDec: "",
    heroInc: "", heroDec: "",
    stakesInc: "", stakesDec: "",
    openingInc: "", openingDec: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");

  // Book state
  const [authorName, setAuthorName] = useState("");
  const [book, setBook] = useState(null);
  const [bookImages, setBookImages] = useState({}); // { coverDataUrl, backCoverDataUrl, images:{ci:dataUrl} } — persisté indép. de book
  const [bookTypo, setBookTypo] = useState({ font: "Georgia, serif", size: 1.0 }); // réglages typo éditeur
  const [showBook, setShowBook] = useState(false);
  const [buildingBook, setBuildingBook] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savingEpub, setSavingEpub] = useState(false);
  const [saveLink, setSaveLink] = useState(null);
  const [saveFormat, setSaveFormat] = useState("pdf");
  const [saving, setSaving] = useState(false);
  const [htmlModalContent, setHtmlModalContent] = useState(null); // inline HTML book viewer

  const t = UI_LANGS[language] || UI_LANGS.french;

  const fullText = parts.map(p => p.text).join("\n\n— ✦ —\n\n");
  const approxWords = fullText.split(/\s+/).filter(Boolean).length;
  const partsByChapter = chapters.map((ch, ci) => ({ ...ch, chapterIdx: ci, parts: parts.map((p, gi) => ({ ...p, globalIdx: gi })).filter(p => p.chapterIdx === ci) }));
  const romanNum = n => ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"][n] || String(n+1);
  const buildGenreStr = (g, weights = {}) => g.map(v => {
    const label = GENRES.find(x => x.value === v)?.label || v;
    const w = weights[v] || 1;
    return w >= 3 ? `${label} (dominant)` : w === 2 ? `${label} (important)` : label;
  }).join(" × ");

  const toggleGenre = (val) => {
    const g = GENRES.find(g => g.value === val);
    if (g?.nsfw && !nsfwEnabled) return;
    if (advancedMode) {
      // Mode avancé : boucle 0→1→2→3→0
      setGenreWeights(prev => {
        const current = genres.includes(val) ? (prev[val] || 1) : 0;
        const next = (current + 1) % 4;
        const newW = { ...prev };
        if (next === 0) { delete newW[val]; } else { newW[val] = next; }
        return newW;
      });
      setGenres(prev => {
        const currentW = prev.includes(val) ? (genreWeights[val] || 1) : 0;
        const next = (currentW + 1) % 4;
        return next === 0 ? prev.filter(x => x !== val) : prev.includes(val) ? prev : [...prev, val];
      });
    } else {
      setGenres(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
    }
  };
  const hasNsfw = genres.includes("erotic");
  const canGenerate = genres.length > 0 && duration && narrator && (!hasNsfw || nsfwEnabled);
  const canContinueImport = importText && genres.length > 0 && duration && narrator && !analyzingImport;

  const handleNsfwToggle = (newVal) => {
    if (newVal && !nsfwEnabled) setShowNsfwModal(true); // toujours demander le mot de passe
    else if (!newVal) { setNsfwEnabled(false); setNextNsfw(false); setGenres(prev => prev.filter(g => g !== "erotic")); }
  };
  const handleAdvancedToggle = (newVal) => {
    if (newVal) {
      let seen = false;
      try { seen = localStorage.getItem("atelier_advanced_help_seen") === "1"; } catch {}
      if (!seen) setShowAdvancedHelp(true);
    } else {
      // Désactivation mode avancé : réinitialiser NSFW complètement
      setNsfwEnabled(false); setNextNsfw(false);
      setGenres(prev => prev.filter(g => g !== "erotic"));
    }
    setAdvancedMode(newVal);
  };

  // NSFW guard for prompts
  const sanitizeForNsfw = (str) => {
    if (nsfwEnabled) return str;
    // Strip common nsfw keywords from user input
    return str;
  };
  const nsfwPromptGuard = nsfwEnabled ? "" : "\nCONTENU STRICT : aucun contenu sexuel, violent explicite ou adulte. Histoire tous publics.";

  const analyzeImportedText = async (text) => {
    setAnalyzingImport(true); setImportAnalysis(null);
    const genreValues = GENRES.filter(g => !g.nsfw).map(g => g.value).join(", ");
    const prompt = `Analyse ce texte littéraire et réponds UNIQUEMENT en JSON valide sans aucun texte avant ou après.

Texte (extrait) :
${text.slice(0, 3000)}

Réponds avec ce format exact :
{
  "genres": ["valeur1", "valeur2"],
  "narrator": "third" | "first" | "second",
  "style": "Nom Prénom de l'auteur ou null",
  "styleConfidence": "certain" | "probable" | "incertain",
  "language": "french" | "english" | "spanish" | "german" | "italian" | "portuguese" | "japanese" | "chinese",
  "summary": "Résumé en 1-2 phrases de ce dont parle le texte"
}

Règles :
- genres : 1 à 3 valeurs parmi : ${genreValues}
- narrator : "first" si je/j', "second" si tu/vous, "third" sinon
- style : uniquement si tu reconnais clairement un style d'auteur, sinon null
- styleConfidence : à quel point tu es sûr du style détecté`;

    try {
      const prefill = `{`;
      const raw = await callClaude([
        { role: "user", content: prompt },
        { role: "assistant", content: prefill }
      ], 400, 45000, 1);
      const fullRaw = prefill + raw;
      const clean = fullRaw.replace(/```json[\s\S]*?```|```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Pas de JSON trouvé dans : " + clean.slice(0, 100));
      const parsed = JSON.parse(jsonMatch[0]);
      setImportAnalysis(parsed);
      // Pré-remplir les champs
      if (parsed.genres?.length) setGenres(parsed.genres.filter(g => GENRES.find(x => x.value === g)));
      if (parsed.genreWeights) setGenreWeights(parsed.genreWeights);
      if (parsed.characters?.length) setCharacters(parsed.characters);
      if (parsed.locations?.length) setLocations(parsed.locations);
      if (parsed.narrator) setNarrator(parsed.narrator);
      if (parsed.language) setLanguage(parsed.language);
      if (parsed.style) {
        const allAuthors = AUTHORS.flatMap(g => g.authors);
        const found = allAuthors.find(a => a.toLowerCase().includes(parsed.style.toLowerCase()) || parsed.style.toLowerCase().includes(a.toLowerCase().split(" ").pop()));
        if (found) setWritingStyle(found);
      }
      addLog("info", "IMPORT", `✓ Analyse terminée — genres: ${parsed.genres?.join(", ")}, langue: ${parsed.language}`);
    } catch(e) {
      addLog("warn", "IMPORT", `⚠ Analyse échouée : ${e.message}`);
      setImportAnalysis({ error: true });
    }
    setAnalyzingImport(false);
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["txt", "md", "docx", "pdf", "epub"].includes(ext)) {
      addLog("warn", "IMPORT", `Format non supporté : .${ext}`);
      setError("Format non supporté. Utilisez .txt, .md, .docx, .pdf ou .epub");
      return;
    }
    addLog("info", "IMPORT", `Import fichier : ${file.name} (${(file.size/1024).toFixed(1)} Ko)`);
    setImportFileName(file.name);
    setAnalyzingImport(true);
    try {
      let text = "";
      if (ext === "txt" || ext === "md") {
        text = await file.text();
      } else if (ext === "docx") {
        // DOCX = ZIP contenant word/document.xml — extraction pure JS
        const ab = await file.arrayBuffer();
        const xmlStr = await extractFileFromZip(new Uint8Array(ab), "word/document.xml");
        if (!xmlStr) throw new Error("Impossible de lire le fichier DOCX");
        text = xmlStr
          .replace(/<w:p[ >][^>]*>/g, "\n")
          .replace(/<w:br[^>]*/g, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ")
          .replace(/\n{3,}/g,"\n\n").trim();
      } else if (ext === "pdf") {
        // Extraction PDF via Claude Vision (envoi en base64)
        setLoadingMsg?.("Lecture du PDF…");
        try {
          const ab = await file.arrayBuffer();
          const uint8 = new Uint8Array(ab);
          const b64 = btoa(uint8.reduce((s, b) => s + String.fromCharCode(b), ""));
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 8000,
              messages: [{
                role: "user",
                content: [
                  { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
                  { type: "text", text: "Extrais le texte littéraire de ce document. Conserve les sauts de paragraphe (deux sauts de ligne entre chaque paragraphe). Ne reformule rien — reproduis le texte exact. Réponds UNIQUEMENT avec le texte extrait, sans commentaire." }
                ]
              }]
            })
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error.message);
          text = data.content?.[0]?.text || "";
          if (!text.trim()) throw new Error("Aucun texte extrait du PDF");
          addLog("info", "IMPORT", `✓ PDF extrait via Claude Vision — ~${text.split(/\s+/).filter(Boolean).length} mots`);
        } catch(pdfErr) {
          throw new Error("Extraction PDF échouée : " + pdfErr.message + ". Essayez de copier le texte dans un fichier .txt");
        }
      } else if (ext === "epub") {
        // EPUB = ZIP — extraction pure JS
        const ab = await file.arrayBuffer();
        const zipBytes = new Uint8Array(ab);
        const fileMap = await readAllZipFiles(zipBytes);
        const dec = new TextDecoder();
        const htmlFiles = Object.keys(fileMap).filter(n =>
          /\.(xhtml|html|htm)$/i.test(n) && !/(toc|nav|cover)/i.test(n)
        ).sort();
        const epubParts = [];
        for (const fname of htmlFiles) {
          const content = dec.decode(fileMap[fname]);
          const stripped = content
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"")
            .replace(/<[^>]+>/g," ")
            .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
            .replace(/&nbsp;/g," ").replace(/&#xA0;/g," ")
            .replace(/\s{3,}/g,"\n\n").trim();
          if (stripped.length > 50) epubParts.push(stripped);
        }
        text = epubParts.join("\n\n");
      }
      if (!text || !text.trim()) throw new Error("Fichier vide ou non lisible");
      const cleanText = purgeLayoutMarkers(text);
      addLog("info", "IMPORT", `✓ Fichier lu — ~${cleanText.split(/\s+/).filter(Boolean).length} mots extraits`);
      setImportText(cleanText);
      analyzeImportedText(cleanText);
    } catch(e) {
      addLog("error", "IMPORT", `✕ Erreur lecture : ${e.message}`);
      setError("Erreur lecture fichier : " + e.message);
      setAnalyzingImport(false);
    }
  };

  // ── Détection des marqueurs de chapitres dans un texte importé ────
  const detectAndSplitChapters = (text) => {
    const chapterRegex = /^[ \t]*((?:chapitre|chapter|cap[ií]tulo|capitolo|kapitel|prologue|pr[oô]logo|prolog|epilogue|[eé]pilogue|epilog|partie|part|cz[eę][sś][cć]|\u0433\u043b\u0430\u0432\u0430)\s*[\dIVXLCivxlc]*[.\s]?.*|[\dIVXLCivxlc]+[.\s\u2014]+\s*\n|[\u2014\-\u2013]{2,}\s*(?:[IVXLCivxlc]+|\d+)\s*[\u2014\-\u2013]{2,}|\*{3,}|#{1,3}\s+.+)$/gim;

    const matches = [];
    let m;
    while ((m = chapterRegex.exec(text)) !== null) {
      matches.push({ index: m.index, title: m[0].trim() });
    }

    addLog("info", "IMPORT", `Détection chapitres : ${matches.length} marqueur(s) trouvé(s)${matches.length ? " — " + matches.slice(0,3).map(x => `"${x.title.slice(0,30)}")`).join(", ") : ""}`);

    if (matches.length < 2) return null;

    const chaptersData = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end   = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const chapterText = text.slice(start, end).trim();
      const bodyText = chapterText.replace(/^[^\n]+\n/, "").trim();
      if (bodyText.length < 100) continue;
      const rawTitle = matches[i].title.replace(/^#+\s*/, "").replace(/[*—\-–]/g, "").trim();
      const title = rawTitle.slice(0, 60) || `Chapitre ${chaptersData.length + 1}`;
      chaptersData.push({ title, text: bodyText });
    }

    if (chaptersData.length >= 2) {
      addLog("info", "IMPORT", `✓ ${chaptersData.length} chapitres valides : ${chaptersData.map(c => `"${c.title.slice(0,25)}"`).join(", ")}`);
    } else {
      addLog("warn", "IMPORT", `⚠ Marqueurs trouvés mais chapitres trop courts — import en chapitre unique`);
    }

    return chaptersData.length >= 2 ? chaptersData : null;
  };

  const launchContinuation = async () => {
    setLoading(true); setError(""); setSaveLink(null);
    const c = { genres, duration, narrator, language, nsfw: nsfwEnabled, writingStyle };
    setChoices(c);
    setNextNsfw(nsfwEnabled);
    setNextWords(DURATIONS.find(d => d.value === c.duration)?.words || 1000);

    // ── Tentative de découpage par chapitres ──────────────────────────
    const detected = detectAndSplitChapters(importText);

    if (detected && detected.length >= 2) {
      setLoadingMsg(`Découpage en ${detected.length} chapitres…`);
      addLog("info", "IMPORT", `✓ ${detected.length} chapitres détectés — découpage en cours`);

      // Créer les parts et chapitres
      const newParts = [];
      const newChapters = [];

      for (let ci = 0; ci < detected.length; ci++) {
        newParts.push({ text: detected[ci].text, include: "", exclude: "", chapterIdx: ci });
        const isLast = ci === detected.length - 1;
        newChapters.push({ title: detected[ci].title, closed: !isLast, summary: null });
      }

      setParts(newParts);
      setChapters(newChapters);
      setCurrentChapter(detected.length - 1);
      setBookTitle(""); setEnded(false);

      // Générer les résumés des chapitres fermés en cascade (tous sauf le dernier)
      const lang = c.language || "french";
      setLoadingMsg(`Résumés des chapitres en cours…`);
      for (let ci = 0; ci < detected.length - 1; ci++) {
        setLoadingMsg(`Résumé chapitre ${ci + 1}/${detected.length - 1}…`);
        const chapParts = newParts.filter(p => p.chapterIdx === ci);
        const chapText = chapParts.map(p => p.text).join("\n\n");
        const langInstr = langInstructions[lang] || "Réponds en français.";
        try {
          const summary = await callClaude([{
            role: "user",
            content: `${langInstr}\nRésume ce chapitre en 150-200 mots, en conservant : les noms des personnages, les lieux, les événements clés, l'ambiance et la tension narrative.\n\nChapitre :\n${chapText.slice(0, 8000)}\n\nRéponds UNIQUEMENT avec le résumé, sans titre ni commentaire.`
          }], 400, 45000, 1);
          newChapters[ci] = { ...newChapters[ci], summary: summary.trim() };
          setChapters([...newChapters]);
          addLog("info", "IMPORT", `✓ Résumé chapitre ${ci + 1} — ${summary.trim().split(/\s+/).length} mots`);
        } catch(e) {
          addLog("warn", "IMPORT", `⚠ Résumé chapitre ${ci + 1} échoué : ${e.message}`);
        }
      }

      addLog("info", "IMPORT", `✓ Import terminé — ${detected.length} chapitres, ${detected.length - 1} résumés en cache`);
    } else {
      // Pas de chapitres détectés → comportement original
      addLog("info", "IMPORT", `Aucun marqueur de chapitre détecté — import en chapitre unique`);
      setParts([{ text: importText, include: "", exclude: "", chapterIdx: 0 }]);
      setChapters([{ title: "Chapitre I", closed: false, summary: null }]);
      setCurrentChapter(0); setBookTitle(""); setEnded(false);
    }

    setLoading(false); setLoadingMsg("");
  };

  const generate = async () => {
    setLoading(true); setError(""); setSaveLink(null);
    const c = { genres, duration, narrator, language, nsfw: nsfwEnabled, writingStyle };
    setChoices(c);
    setNextNsfw(nsfwEnabled);
    setNextWords(DURATIONS.find(d => d.value === c.duration)?.words || 1000);

    // Mode "texte importé" : on démarre depuis le texte chargé
    if (classicSource.type === "upload" && importText.trim()) {
      setLoadingMsg(t.writing);
      const detected = detectAndSplitChapters(importText);
      if (detected.length > 1) {
        setParts(detected.map((text, i) => ({ text, include: "", exclude: "", chapterIdx: i })));
        setChapters(detected.map((_, i) => ({ title: `Chapitre ${i + 1}`, closed: i < detected.length - 1 })));
        setCurrentChapter(detected.length - 1);
      } else {
        setParts([{ text: importText, include: "", exclude: "", chapterIdx: 0 }]);
        setChapters([{ title: "Chapitre I", closed: false }]);
        setCurrentChapter(0);
      }
      if (importAnalysis?.narrator) setNarrator(importAnalysis.narrator);
      setBookTitle(""); setEnded(false);
      setLoading(false); setLoadingMsg("");
      return;
    }

    setLoadingMsg(t.writing);
    const genreStr = buildGenreStr(c.genres);
    addLog("info", "GEN", `Génération initiale — genre: ${genreStr}, durée: ${c.duration}, style: ${c.writingStyle || "aucun"}, langue: ${c.language}`);
    const langInstr = langInstructions[c.language] || "Écris en français.";
    const includeStr = initInclude.trim() ? `\nElements to include: ${sanitizeForNsfw(initInclude.trim())}` : "";
    const excludeStr = initExclude.trim() ? `\nElements to avoid: ${initExclude.trim()}` : "";
    const styleFingerprint = writingStyle ? AUTHOR_STYLES[writingStyle] : null;
    const styleStr = writingStyle ? `\nSTYLE IMPOSÉ — à la manière de ${writingStyle}. Applique rigoureusement ces caractéristiques stylistiques : ${styleFingerprint || `ton, rythme et procédés narratifs propres à ${writingStyle}`}. Le style doit être perceptible dès la première phrase.` : "";
    const nsfwStr = c.nsfw ? "\nExplicit adult content is authorized." : nsfwPromptGuard;
    const words = DURATIONS.find(d => d.value === c.duration)?.words || 1000;
    const sourceHint = buildClassicSourceHint();
    const prompt = `${langInstr}${sourceHint}\nÉcris une histoire de ${words} mots environ.\nGenre(s) : ${genreStr}\nNarrateur : ${narratorLabels[c.narrator]}\nLaisse la fin ouverte ou en suspens.${styleStr}${includeStr}${excludeStr}${nsfwStr}\n\nSoigne le style et les descriptions. Écris uniquement l'histoire, sans titre ni commentaire.`;
    try {
      const text = await callClaude([{ role: "user", content: prompt }]);
      if (!text || !text.trim()) throw new Error(t.errorEmpty);
      addLog("info", "GEN", `✓ Histoire initiale générée — ${text.split(/\s+/).filter(Boolean).length} mots`);
      setParts([{ text, include: initInclude, exclude: initExclude, chapterIdx: 0 }]);
      setChapters([{ title: "Chapitre I", closed: false }]);
      setCurrentChapter(0); setBookTitle(""); setEnded(false);
    } catch(e) { addLog("error", "GEN", `✕ Échec génération initiale : ${e.message}`); setError(t.errorPfx + e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  };

  const generateAxes = async (isFinal, finalEnding, closeChapter) => {
    setLoadingAxes(true); setAxes(null); setSelectedAxis(null);
    setPendingAction({ isFinal, finalEnding, closeChapter });
    addLog("info", "GEN", `Génération axes narratifs — ${closeChapter ? "fin de chapitre" : isFinal ? `fin (${finalEnding})` : "suite"}`);
    const langInstr = langInstructions[choices.language] || "Écris en français.";
    const axisCount = advancedMode ? 4 : 2;
    const typeInstr = closeChapter
      ? "pour clore dramatiquement ce chapitre"
      : isFinal && finalEnding ? `pour conclure l'histoire (fin ${endingLabels[finalEnding]})`
      : "pour la suite de l'histoire";
    const includeDirective = nextInclude.trim() ? `\nCONTRAINTE ABSOLUE SUR TOUS LES AXES — à intégrer impérativement dans chaque proposition : ${nextInclude.trim()}` : "";
    const excludeDirective = nextExclude.trim() ? `\nÀ EXCLURE ABSOLUMENT de tous les axes : ${nextExclude.trim()}` : "";
    // Construire un résumé intelligent de toute l'histoire + fin récente
    const fullText = parts.map(p => p.text).join("\n\n");
    const lastPartText = parts[parts.length - 1]?.text || "";
    const recentText = lastPartText.length >= 2000
      ? lastPartText.slice(-2000)
      : fullText.slice(-2000); // dernière page toujours intacte
    const langInstrCtx = langInstructions[choices.language] || "Réponds en français.";
    let historySummary = "";
    if (fullText.length > 2500) {
      try {
        const textToSummarize = fullText.slice(0, fullText.length - 2000);
        historySummary = await callClaude([{ role: "user", content: `${langInstrCtx}\nRésume ce passage en 150-200 mots en conservant : tous les personnages et leurs situations, les lieux, les événements clés dans l'ordre chronologique, les enjeux en cours. Ce résumé sera utilisé pour proposer des axes narratifs cohérents.\n\n${textToSummarize.slice(0, 8000)}\n\nRéponds UNIQUEMENT avec le résumé, sans titre ni commentaire.` }], 400, 30000, 1);
        addLog("info", "GEN", `✓ Résumé contexte axes — ${Math.round(textToSummarize.length/1000)}k chars condensés`);
      } catch(e) {
        addLog("warn", "GEN", `⚠ Résumé axes échoué : ${e.message}`);
        historySummary = fullText.slice(0, 2000);
      }
    }
    const contextForAxes = historySummary
      ? `[RÉSUMÉ DE L'HISTOIRE]\n${historySummary}\n\n[POSITION ACTUELLE — continuer depuis ici]\n${recentText}`
      : recentText;
    const sourceHintAxes = buildClassicSourceHint();
    const userPrompt = `${langInstr}${sourceHintAxes}${includeDirective}${excludeDirective}\n\nVoici l'histoire :\n\n${contextForAxes}\n\nPropose exactement ${axisCount} axes narratifs contrastés ${typeInstr}. Les axes doivent partir de la POSITION ACTUELLE et aller de l'avant — jamais revenir sur des événements déjà écrits. Chaque "title" = 4-6 mots. Chaque "description" = 2-3 phrases sur l'axe narratif et l'atmosphère.`;
    const prefill = `[{"title":"`;
    try {
      const tryParseAxes = (raw) => {
        const clean = ("[" + raw).replace(/```json[\s\S]*?```|```/g, "").trim();
        const fullMatch = clean.match(/\[[\s\S]*?\]/);
        if (fullMatch) {
          try {
            const p = JSON.parse(fullMatch[0].replace(/[\u2018\u2019\u201C\u201D]/g, "'").replace(/,\s*([}\]])/g, '$1'));
            if (Array.isArray(p) && p.length > 0) return p;
          } catch(_) {}
        }
        const items = [];
        const re = /\{[^{}]*"title"\s*:\s*"([^"]+)"[^{}]*"description"\s*:\s*"([^"]+)"[^{}]*\}/g;
        let m;
        while ((m = re.exec(raw)) !== null) items.push({ title: m[1], description: m[2] });
        if (items.length > 0) return items;
        return null;
      };
      const raw = await callClaude([
        { role: "user", content: userPrompt },
        { role: "assistant", content: prefill }
      ], advancedMode ? 800 : 400, null, 2, true);
      const parsed = tryParseAxes(prefill.slice(1) + raw);
      if (Array.isArray(parsed) && parsed.length > 0) { setAxes(parsed); addLog("info", "GEN", `✓ ${parsed.length} axes générés`); }
      else throw new Error("Pas de JSON trouvé");
    } catch(e) {
      addLog("warn", "GEN", `⚠ Axes échoués (${e.message}), passage en écriture libre`);
      setAxes(null); setPendingAction(null);
      generateSuite(isFinal, finalEnding, closeChapter, null);
    }
    setLoadingAxes(false);
  };

  const generateSuite = async (isFinal = false, finalEnding = null, closeChapter = false, axisDescription = undefined) => {
    // Mémoriser les axes et directives du cycle en cours avant de les effacer
    if (axes?.length) setLastAxes({ axes, include: nextInclude, exclude: nextExclude, pendingAction });
    setAxes(null); setPendingAction(null); setSelectedAxis(null);
    setLoading(true); setError(""); setSaveLink(null); setChapterSuggestion(null);
    setLoadingMsg(closeChapter ? t.closingChap : isFinal ? t.writingEnd : t.writingSuite);
    addLog("info", "GEN", `Suite — ${closeChapter ? "fin de chapitre" : isFinal ? `fin (${finalEnding})` : "continuation"}, axe: ${axisDescription ? axisDescription.slice(0,60)+"…" : "libre"}`);
    const langInstr = langInstructions[choices.language] || "Écris en français.";
    // Contexte intelligent : résumé des parties anciennes + parties récentes intactes
    const contextTrimmed = await buildSmartContext(parts, choices.language || "french", chapters, blocks);
    const includeStr = nextInclude.trim() ? `\nDIRECTIVE PRIORITAIRE — ces éléments DOIVENT apparaître dans la suite, c'est obligatoire : ${sanitizeForNsfw(nextInclude.trim())}` : "";
    const excludeStr = nextExclude.trim() ? `\nElements to avoid: ${nextExclude.trim()}` : "";
    const effectiveNsfw = nsfwEnabled && nextNsfw && advancedMode;
    const nsfwStr = effectiveNsfw ? "\nExplicit adult content is authorized." : nsfwPromptGuard;
    const suiteFingerprint = choices?.writingStyle ? AUTHOR_STYLES[choices.writingStyle] : null;
    const styleStr = choices?.writingStyle ? `\nMAINTIENS IMPÉRATIVEMENT le style de ${choices.writingStyle} : ${suiteFingerprint || `ton et procédés propres à ${choices.writingStyle}`}.` : "";
    const endingInstr = closeChapter
      ? "\nCeci est la FIN DE CHAPITRE. Conclus dramatiquement, laisse une tension pour la suite."
      : isFinal && finalEnding ? `\nThis is the FINAL part. Write a ${endingLabels[finalEnding]}.`
      : "\nThis is NOT the final part — leave the story in suspense.";
    const axisInstr = axisDescription ? `\nSuis impérativement cet axe narratif : ${axisDescription}` : "";
    const sourceHint = buildClassicSourceHint();
    const lastSentence = (() => {
      const lastPartText = parts[parts.length - 1]?.text || "";
      const sentences = lastPartText.trim().split(/(?<=[.!?»])\s+/);
      return sentences.slice(-3).join(" ").trim();
    })();
    const anchorInstr = lastSentence ? `\nPOINT DE DÉPART ABSOLU : le texte s'arrête exactement sur : "${lastSentence.slice(-200)}" — la suite doit partir de là, dans ce lieu, avec ces personnages, sans aucun saut temporel ou spatial non justifié.` : "";
    const carnetContext = buildCarnetContext(currentChapter);
    const prompt = `${langInstr}${sourceHint}\n${carnetContext}Voici une histoire :\n\n${contextTrimmed}\n\nÉcris la suite directe de ${nextWords} mots environ. RÈGLES IMPÉRATIVES : commence IMMÉDIATEMENT par de l'action ou du dialogue nouveaux — INTERDIT de résumer, rappeler ou paraphraser ce qui précède, même en une phrase. Le lecteur a déjà lu le texte ci-dessus. Garde le même style et les mêmes personnages.${includeStr}${excludeStr}${styleStr}${endingInstr}${axisInstr}${anchorInstr}${nsfwStr}\n\nÉcris uniquement la suite, sans titre ni commentaire. Ne reproduis aucune phrase déjà écrite.`;
    try {
      // timeout null = adaptatif automatique (180s pour 6000 tokens)
      const text = await callClaude([{ role: "user", content: prompt }], 6000, null);
      addLog("info", "GEN", `✓ Suite générée — ${text.split(/\s+/).filter(Boolean).length} mots`);
      const newParts = [...parts, { text, include: nextInclude, exclude: nextExclude, chapterIdx: currentChapter }];
      setParts(newParts);
      setNextInclude(""); setNextExclude("");
      setShowEndingPicker(false); setSelectedEnding(null);
      if (closeChapter) {
        const closingIdx = currentChapter;
        setChapters(prev => prev.map((ch, i) => i === closingIdx ? { ...ch, closed: true } : ch));
        generateAndCacheChapterSummary(closingIdx, newParts.filter(p => (p.chapterIdx ?? 0) === closingIdx), choices?.language || "french");
      } else if (!isFinal) {
        // Résumé du chapitre en cours (non fermé) — pour conserver le contexte entre générations
        generateAndCacheChapterSummary(currentChapter, newParts.filter(p => (p.chapterIdx ?? 0) === currentChapter), choices?.language || "french");
        detectChapterBreak(contextTrimmed + "\n\n" + text, choices.language);
      }
      // Résumer automatiquement le dernier bloc après génération (1 appel API)
      setTimeout(async () => {
        const newBlocks = buildBlocksFromParts(newParts, chapters);
        newBlocks.forEach(b => { b.hash = hashBlock(b.text); });
        // Réutiliser les résumés existants
        newBlocks.forEach(b => {
          const existing = blocks.find(eb => eb.hash === b.hash && eb.summary);
          if (existing) b.summary = existing.summary;
        });
        setBlocks(newBlocks);
        // Résumer uniquement le dernier bloc (nouveau texte)
        const lastBlock = newBlocks[newBlocks.length - 1];
        if (lastBlock && !lastBlock.summary) {
          const summary = await summarizeBlock(lastBlock, choices?.language || language);
          if (summary) {
            newBlocks[newBlocks.length - 1] = { ...lastBlock, summary };
            setBlocks([...newBlocks]);
            addLog("info", "RAG", `✓ Bloc ${lastBlock.id} indexé automatiquement`);
          }
        }
      }, 1500);
      if (isFinal) {
        setEnded(true);
        const genreStr = buildGenreStr(choices?.genres || []);
        setLoadingMsg(t.genTitle);
        try {
          if (!bookTitle) { // seulement si pas de titre
            const t = await generateTitle(contextTrimmed + "\n\n" + text, genreStr, choices?.language || "french");
            if (t?.trim()) { setBookTitle(t); addLog("info", "GEN", `✓ Titre généré : "${t}"`); } else setBookTitle(genreStr);
          }
        } catch(e) { addLog("warn", "GEN", `⚠ Échec génération titre : ${e.message}`); if (!bookTitle) setBookTitle(genreStr); }
      }
    } catch(e) { addLog("error", "GEN", `✕ Échec suite : ${e.message}`); setError(t.errorPfx + e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  };

  const detectChapterBreak = async (fullStory, language) => {
    try {
      const resp = await callClaude([{ role: "user", content: `${langInstructions[choices?.language || language] || "Write in English."}\nRead this story excerpt. Answer ONLY with "yes" or "no". Would a chapter break be natural here?\n\nEnd excerpt:\n${fullStory.slice(-600)}` }], 20);
      const r = resp.trim().toLowerCase(); if (r.startsWith("yes")||r.startsWith("oui")||r.startsWith("sí")||r.startsWith("ja")||r.startsWith("sì")||r.startsWith("sim")||r.startsWith("はい")||r.startsWith("是")) setChapterSuggestion("suggest");
    } catch {}
  };

  // ── Système de blocs RAG ──────────────────────────────────────────
  const BLOCK_TARGET_WORDS = 600;
  const BLOCK_MIN_PARAS = 5;

  // Découper les parts en blocs de ~300 mots, avec références §chap.para
  const buildBlocksFromParts = (currentParts, currentChapters) => {
    const newBlocks = [];
    let blockId = 0;

    // Grouper par chapitre
    const chapterGroups = {};
    currentParts.forEach((part, gi) => {
      const ci = part.chapterIdx ?? 0;
      if (!chapterGroups[ci]) chapterGroups[ci] = [];
      chapterGroups[ci].push({ part, gi });
    });

    const sortedCis = Object.keys(chapterGroups).map(Number).sort((a, b) => a - b);

    sortedCis.forEach(ci => {
      const chNum = ci + 1;
      const group = chapterGroups[ci];

      // Construire la liste ordonnée de paragraphes avec leurs refs §
      const allParas = [];
      group.forEach(({ part, gi }) => {
        let offset = 0;
        for (let k = 0; k < gi; k++) {
          if ((currentParts[k]?.chapterIdx ?? 0) === ci) {
            offset += currentParts[k].text.split("\n\n").filter(p => p.trim() && p.trim() !== "— ✦ —").length;
          }
        }
        part.text.split("\n\n").forEach((para, i) => {
          if (!para.trim() || para.trim() === "— ✦ —") return;
          const localIdx = offset + part.text.split("\n\n").slice(0, i).filter(p => p.trim() && p.trim() !== "— ✦ —").length + 1;
          allParas.push({ ref: `§${chNum}.${localIdx}`, text: para.trim() });
        });
      });

      // Grouper en blocs de ~300 mots
      let currentBlockParas = [];
      let currentWordCount = 0;

      const flushBlock = () => {
        if (!currentBlockParas.length) return;
        const blockText = currentBlockParas.map(p => p.text).join("\n\n");
        const paraRefs = currentBlockParas.map(p => p.ref);
        newBlocks.push({
          id: `B${++blockId}`,
          chapterIdx: ci,
          text: blockText,
          summary: null, // sera généré async
          wordCount: currentWordCount,
          paraRefs,
          firstRef: paraRefs[0],
          lastRef: paraRefs[paraRefs.length - 1],
        });
        currentBlockParas = [];
        currentWordCount = 0;
      };

      allParas.forEach(para => {
        const words = para.text.split(/\s+/).filter(Boolean).length;
        if (currentWordCount + words > BLOCK_TARGET_WORDS && currentBlockParas.length >= BLOCK_MIN_PARAS) {
          flushBlock();
        }
        currentBlockParas.push(para);
        currentWordCount += words;
      });
      // Fusionner le dernier bloc s'il est trop petit (< BLOCK_MIN_PARAS) avec le précédent
      if (currentBlockParas.length > 0 && currentBlockParas.length < BLOCK_MIN_PARAS && newBlocks.length > 0) {
        const prev = newBlocks[newBlocks.length - 1];
        const extraText = currentBlockParas.map(p => p.text).join("\n\n");
        prev.text = prev.text + "\n\n" + extraText;
        prev.wordCount += currentWordCount;
        prev.paraRefs = [...prev.paraRefs, ...currentBlockParas.map(p => p.ref)];
        prev.lastRef = currentBlockParas[currentBlockParas.length - 1].ref;
        currentBlockParas = []; currentWordCount = 0;
      } else {
        flushBlock();
      }
    });

    return newBlocks;
  };

  // Hash simple pour détecter les changements de contenu d'un bloc
  const hashBlock = (text) => {
    let h = 0;
    for (let i = 0; i < Math.min(text.length, 500); i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
    return h.toString(36);
  };

  // Générer le résumé d'un bloc via API
  const summarizeBlock = async (block, lang) => {
    const langInstr = langInstructions[lang || choices?.language || "french"] || "Réponds en français.";
    try {
      const summary = await callClaude([{ role: "user", content: `${langInstr}\nRésume ce passage en 80-100 mots, en conservant : les noms des personnages, les lieux, les actions clés et les événements importants. Réponds UNIQUEMENT avec le résumé, sans titre ni commentaire.\n\n${block.text}` }], 250, 8000, 0.3);
      return summary.trim().replace(/^["«]|["»]$/g, "");
    } catch { return ""; }
  };

  // Reconstruire tous les blocs SANS générer les résumés (0 appel API)
  const rebuildBlocks = async (currentParts, currentChapters, lang, existingBlocks = []) => {
    const newBlocks = buildBlocksFromParts(currentParts, currentChapters);
    // Ajouter le hash et récupérer les résumés existants si le contenu n'a pas changé
    newBlocks.forEach(b => {
      b.hash = hashBlock(b.text);
      // 1. Résumé de bloc existant avec même contenu (priorité max)
      const existing = existingBlocks.find(eb => eb.hash === b.hash && eb.summary);
      if (existing) { b.summary = existing.summary; return; }
      // 2. Fallback : résumé de chapitre existant (ancien système v2)
      const chapSummary = currentChapters[b.chapterIdx]?.summary;
      if (chapSummary && !existing) {
        b.summary = `[résumé du chapitre] ${chapSummary}`;
        b.summaryIsChapter = true; // marqué pour être remplacé à l'indexation
      }
    });
    setBlocks(newBlocks);
    const reused = newBlocks.filter(b => b.summary && !b.summaryIsChapter).length;
    const fromChapter = newBlocks.filter(b => b.summaryIsChapter).length;
    const missing = newBlocks.filter(b => !b.summary).length;
    addLog("info", "RAG", `✓ ${newBlocks.length} blocs — ${reused} résumés réutilisés, ${fromChapter} depuis chapitres, ${missing} en attente`);
    return newBlocks;
  };

  // Indexer manuellement tous les blocs sans résumé (ou avec résumé provisoire de chapitre)
  const indexAllBlocks = async () => {
    if (indexingBlocks || !blocks.length) return;
    setIndexingBlocks(true);
    const current = [...blocks];
    const toSummarize = current.filter(b => !b.summary || b.summaryIsChapter);
    addLog("info", "RAG", `↻ Indexation manuelle — ${toSummarize.length} blocs à résumer`);
    for (let i = 0; i < current.length; i++) {
      if (!current[i].summary || current[i].summaryIsChapter) {
        await new Promise(r => setTimeout(r, 400));
        const summary = await summarizeBlock(current[i], choices?.language || language);
        current[i] = { ...current[i], summary };
        setBlocks([...current]);
      }
    }
    addLog("info", "RAG", `✓ Indexation terminée — ${current.length} blocs résumés`);
    setIndexingBlocks(false);
  };
  const invalidateBlocksForRefs = async (affectedRefs, currentParts, currentChapters, lang) => {
    const newBlocks = buildBlocksFromParts(currentParts, currentChapters);
    newBlocks.forEach(b => { b.hash = hashBlock(b.text); });
    // Garder les résumés des blocs non touchés (même hash)
    newBlocks.forEach((b, i) => {
      const existing = blocks.find(eb => eb.hash === b.hash && eb.summary);
      if (existing) newBlocks[i] = { ...b, summary: existing.summary };
    });
    setBlocks(newBlocks);
    // Regénérer seulement les blocs invalidés
    for (let i = 0; i < newBlocks.length; i++) {
      if (!newBlocks[i].summary) {
        await new Promise(r => setTimeout(r, 400));
        const summary = await summarizeBlock(newBlocks[i], lang);
        newBlocks[i] = { ...newBlocks[i], summary };
        setBlocks([...newBlocks]);
      }
    }
  };

  // ── Injection Carnet dans les prompts ──
  const buildCarnetContext = (currentChapterIdx) => {
    if (!characters.length && !locations.length) return "";
    // Compute narrative year of current chapter (or nearest previous)
    let narrativeYear = null;
    for (let i = currentChapterIdx; i >= 0; i--) {
      if (chapters[i]?.narrativeYear) { narrativeYear = chapters[i].narrativeYear; break; }
    }
    const charLines = characters
      .filter(c => c.role !== "mentionné" || characters.length <= 6)
      .map(c => {
        let line = `${c.name} (${c.role})`;
        if (c.birthYear != null && narrativeYear) {
          const age = narrativeYear - c.birthYear;
          line += ` — ${age} ans${c.birthYearEstimated ? " environ" : ""} en ${narrativeYear}`;
        }
        if (c.description) line += ` — ${c.description}`;
        return line;
      });
    const locLines = locations.map(l => `${l.name} (${l.type})${l.description ? " — " + l.description : ""}`);
    const parts = [];
    if (charLines.length) parts.push(`PERSONNAGES :\n${charLines.map(l => `• ${l}`).join("\n")}`);
    if (locLines.length) parts.push(`LIEUX :\n${locLines.map(l => `• ${l}`).join("\n")}`);
    return parts.length ? `[CARNET DE BORD — référence absolue, ne jamais contredire]\n${parts.join("\n")}\n` : "";
  };

  // ── Résumé de chapitre (pour buildSmartContext / génération de suite) ──
  const generateAndCacheChapterSummary = async (chapterIdx, chapterParts, lang) => {
    if (!chapterParts.length) return;
    const chapterText = chapterParts.map(p => p.text).join("\n\n");
    if (chapterText.length < 500) return;
    const langInstr = langInstructions[lang || choices?.language || "french"] || "Réponds en français.";
    try {
      const summary = await callClaude([{
        role: "user",
        content: `${langInstr}\nRésume ce chapitre en 150-200 mots, en conservant : les noms des personnages, les lieux, les événements clés, l'ambiance et la tension narrative. Ce résumé sera utilisé comme contexte pour la suite.\n\nChapitre :\n${chapterText.slice(0, 8000)}\n\nRéponds UNIQUEMENT avec le résumé, sans titre ni commentaire.`
      }], 400, 45000, 1);
      setChapters(prev => prev.map((ch, i) => i === chapterIdx ? { ...ch, summary: summary.trim() } : ch));
      addLog("info", "CTX", `✓ Résumé chapitre ${chapterIdx + 1} — ${summary.trim().split(/\s+/).length} mots`);
    } catch(e) {
      addLog("warn", "CTX", `⚠ Résumé chapitre ${chapterIdx + 1} échoué : ${e.message}`);
    }
  };

  // ── Fonctions de merge pures (opèrent sur des tableaux, sans setState) ──
  const normalizeCarnetName = s => s.toLowerCase().replace(/[^a-zàâäéèêëîïôùûüç]/g, " ").replace(/\s+/g, " ").trim();

  const mergeCharacters = (existing, newChars, chapterIdx) => {
    const merged = [...existing];
    for (const nc of newChars) {
      const normNew = normalizeCarnetName(nc.name);
      const existIdx = merged.findIndex(ex => {
        const normEx = normalizeCarnetName(ex.name);
        return normEx === normNew || normEx.includes(normNew) || normNew.includes(normEx);
      });
      if (existIdx >= 0) {
        const ex = merged[existIdx];
        merged[existIdx] = {
          ...ex,
          name: ex.name.length >= nc.name.length ? ex.name : nc.name,
          birthYear: (ex.birthYear != null && !ex.birthYearEstimated) ? ex.birthYear
            : (nc.birthYear != null && !nc.birthYearEstimated) ? nc.birthYear
            : ex.birthYear ?? nc.birthYear,
          birthYearEstimated: ex.birthYear != null && !ex.birthYearEstimated ? false
            : nc.birthYear != null && !nc.birthYearEstimated ? false
            : ex.birthYearEstimated ?? nc.birthYearEstimated,
          // Concatène les descriptions si elles apportent de l'info nouvelle
          description: (() => {
            if (!ex.description) return nc.description || "";
            if (!nc.description) return ex.description;
            // Garde la plus longue, ou concatène si elles sont très différentes
            return nc.description.length > ex.description.length ? nc.description : ex.description;
          })(),
          role: ["protagoniste","antagoniste","secondaire","mentionné"].indexOf(nc.role) <
                ["protagoniste","antagoniste","secondaire","mentionné"].indexOf(ex.role) ? nc.role : ex.role,
          lastChapter: Math.max(ex.lastChapter ?? 0, chapterIdx),
        };
      } else {
        merged.push({ ...nc, id: `char_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, lastChapter: chapterIdx });
      }
    }
    return merged;
  };

  const mergeLocations = (existing, newLocs, chapterIdx) => {
    const merged = [...existing];
    for (const nl of newLocs) {
      const normNew = normalizeCarnetName(nl.name);
      const existIdx = merged.findIndex(ex =>
        normalizeCarnetName(ex.name) === normNew ||
        normalizeCarnetName(ex.name).includes(normNew) ||
        normNew.includes(normalizeCarnetName(ex.name))
      );
      if (existIdx >= 0) {
        merged[existIdx] = {
          ...merged[existIdx],
          description: (merged[existIdx].description?.length ?? 0) >= (nl.description?.length ?? 0)
            ? merged[existIdx].description : nl.description,
          lastChapter: Math.max(merged[existIdx].lastChapter ?? 0, chapterIdx),
        };
      } else {
        merged.push({ ...nl, id: `loc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, lastChapter: chapterIdx });
      }
    }
    return merged;
  };

  // ── Extraction LLM d'un chapitre → { characters, locations, narrativeYear } ──
  // Nettoyage et parsing JSON robuste (réutilisé dans les deux passes)
  const parseCarnetJSON = (raw, label) => {
    let cleaned = raw.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Aucun bloc JSON trouvé");
    cleaned = jsonMatch[0];
    // Caractères de contrôle → espace
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F]/g, m =>
      (m === '\n' || m === '\r' || m === '\t') ? ' ' : '');
    // Guillemets typographiques → droits
    cleaned = cleaned.replace(/[""«»]/g, '"');
    // \' invalide en JSON → apostrophe simple
    cleaned = cleaned.replace(/\\'/g, "'");
    try {
      return JSON.parse(cleaned);
    } catch(e) {
      addLog("warn", "CARNET", `⚠ JSON repair (${label}) : ${e.message.slice(0, 60)}`);
      const errPos = parseInt(e.message.match(/position (\d+)/)?.[1] || "0");
      if (errPos > 100) {
        const truncated = cleaned.slice(0, errPos - 1).replace(/,?\s*$/, '') + ']}';
        return JSON.parse(truncated);
      }
      throw e;
    }
  };

  const extractChapterCarnet = async (chapterIdx, chapterParts, lang) => {
    const chapterText = chapterParts.map(p => p.text).join("\n\n");
    if (chapterText.length < 300) return null;
    const langInstr = langInstructions[lang || "french"] || "Réponds en français.";

    // ── PASSE 1 : extraction rapide — noms, rôles, lieux, année narrative ──
    // Descriptions très courtes pour tenir dans les tokens
    const raw1 = await callClaude([{ role: "user", content:
      `${langInstr}\nRetourne UNIQUEMENT un JSON (aucun texte avant ou après, pas de markdown).\n\nREGLES STRICTES pour les PERSONNAGES :\n- Inclus UNIQUEMENT les personnages qui agissent, parlent ou jouent un rôle actif dans la scène\n- EXCLURE : personnages historiques réels simplement cités ou mentionnés en référence (ex: Bismarck, Thiers, Hugo, Proudhon, Marx…), personnages dont le nom apparaît dans un titre de livre ou de journal, foules anonymes\n- Un personnage doit être présent dans la narration (pas juste dans une pensée ou une liste)\n- Fusionne les variantes (ex: "Madame Rouvier" + "Célestine Rouvier" → "Célestine Rouvier")\n- role : "protagoniste" si c'est le héros principal, "antagoniste" si opposant actif, "secondaire" si présent et actif, "mentionné" SEULEMENT pour des personnages nommés mais absents de la scène\n\nREGLES STRICTES pour les LIEUX :\n- Inclus UNIQUEMENT les lieux où des scènes se déroulent réellement (un personnage s'y trouve physiquement)\n- EXCLURE : lieux mentionnés en passant, lieux dans des titres ou noms propres, pays ou villes évoqués sans action\n- Maximum 4-5 lieux par chapitre\n\nJSON attendu :\n{"narrativeYear":1895,"characters":[{"name":"Prénom Nom","role":"protagoniste|secondaire|antagoniste|mentionné","birthYear":1853,"birthYearEstimated":false}],"locations":[{"name":"Nom","type":"ville|bâtiment|pays|région|autre"}]}\n\nTexte :\n${chapterText.slice(0, 8000)}`
    }], 800, 60000, 1);
    const pass1 = parseCarnetJSON(raw1, `ch.${chapterIdx+1} passe1`);
    const narrativeYear = pass1.narrativeYear || null;
    const rawChars = pass1.characters || [];
    const rawLocs = (pass1.locations || []).map(l => ({ ...l, description: "" }));

    // ── PASSE 2 : enrichissement — descriptions détaillées pour protagonistes + secondaires uniquement ──
    // Enrichissement uniquement pour les personnages actifs (pas les "mentionné")
    const mainChars = rawChars.filter(c => c.role === "protagoniste" || c.role === "secondaire" || c.role === "antagoniste");
    let enrichedDescriptions = {};
    if (mainChars.length > 0) {
      const nameList = mainChars.map(c => `- ${c.name} (${c.role})`).join("\n");
      const raw2 = await callClaude([{ role: "user", content:
        `${langInstr}\nRetourne UNIQUEMENT un JSON (aucun texte avant ou après, pas de markdown).\n\nPour chacun des personnages suivants, rédige une description de 2-3 phrases couvrant : apparence physique si décrite dans le texte, caractère et traits de personnalité, rôle dans l'intrigue, relations clés avec les autres personnages.\n\nPersonnages :\n${nameList}\n\nJSON attendu :\n{"descriptions":{"Prénom Nom":"Description 2-3 phrases..."}}\n\nTexte du chapitre :\n${chapterText.slice(0, 8000)}`
      }], 1200, 60000, 1);
      try {
        const pass2 = parseCarnetJSON(raw2, `ch.${chapterIdx+1} passe2`);
        enrichedDescriptions = pass2.descriptions || {};
      } catch(e) {
        addLog("warn", "CARNET", `⚠ Enrichissement ch.${chapterIdx+1} échoué, descriptions courtes conservées`);
      }
    }

    // Fusion : ajoute description enrichie si disponible
    const characters = rawChars.map(c => ({
      ...c,
      description: enrichedDescriptions[c.name] || c.description || ""
    }));

    return { characters, locations: rawLocs, narrativeYear };
  };

  // ── Extraction + merge en une seule passe (appelé au fil de la génération) ──
  const extractAndMergeCarnet = async (chapterIdx, chapterParts, lang) => {
    if (!chapterParts.length) return;
    setExtractingCarnet(true);
    try {
      const result = await extractChapterCarnet(chapterIdx, chapterParts, lang);
      if (!result) return;
      const { characters: newChars, locations: newLocs, narrativeYear } = result;
      if (narrativeYear) {
        setChapters(prev => prev.map((ch, i) => i === chapterIdx ? { ...ch, narrativeYear } : ch));
      }
      setCharacters(prev => mergeCharacters(prev, newChars, chapterIdx));
      setLocations(prev => mergeLocations(prev, newLocs, chapterIdx));
      addLog("info", "CARNET", `✓ Carnet ch.${chapterIdx + 1} — ${newChars.length} personnages, ${newLocs.length} lieux${narrativeYear ? `, an ${narrativeYear}` : ""}`);
    } catch(e) {
      addLog("warn", "CARNET", `⚠ Extraction carnet ch.${chapterIdx + 1} échouée : ${e.message}`);
    } finally {
      setExtractingCarnet(false);
    }
  };

  // ── Mise à jour carnet depuis tous les chapitres (fichier ancien) ──
  // Accumule tout en mémoire locale avant un seul setState final
  const upgradeCarnetFromAllChapters = async () => {
    setShowCarnetUpgrade(false);
    setExtractingCarnet(true);
    const maxChap = parts.reduce((mx, p) => Math.max(mx, p.chapterIdx ?? 0), 0);
    let accChars = [];
    let accLocs = [];
    const chapNarrativeYears = {};
    for (let ci = 0; ci <= maxChap; ci++) {
      const chParts = parts.filter(p => (p.chapterIdx ?? 0) === ci);
      if (!chParts.length) continue;
      try {
        const result = await extractChapterCarnet(ci, chParts, choices?.language || language);
        if (!result) continue;
        const { characters: newChars, locations: newLocs, narrativeYear } = result;
        // Merge en mémoire locale — pas de setState intermédiaire
        accChars = mergeCharacters(accChars, newChars, ci);
        accLocs = mergeLocations(accLocs, newLocs, ci);
        if (narrativeYear) chapNarrativeYears[ci] = narrativeYear;
        addLog("info", "CARNET", `✓ Ch.${ci + 1} analysé — ${newChars.length} personnages, ${newLocs.length} lieux`);
      } catch(e) {
        addLog("warn", "CARNET", `⚠ Ch.${ci + 1} échoué : ${e.message}`);
      }
    }
    // Un seul setState pour chaque — cohérent et sans race condition
    setCharacters(accChars);
    setLocations(accLocs);
    if (Object.keys(chapNarrativeYears).length) {
      setChapters(prev => prev.map((ch, i) => chapNarrativeYears[i] ? { ...ch, narrativeYear: chapNarrativeYears[i] } : ch));
    }
    setExtractingCarnet(false);
    setShowCarnet(true);
    addLog("info", "CARNET", `✦ Carnet complet — ${accChars.length} personnages, ${accLocs.length} lieux`);
  };

  const openNewChapter = () => {
    const newIdx = chapters.length;
    setChapters(prev => [...prev, { title: `Chapitre ${romanNum(newIdx)}`, closed: false }]);
    setCurrentChapter(newIdx);
  };

  const closeCurrentChapter = () => {
    const closingIdx = currentChapter;
    const closingParts = parts.filter(p => (p.chapterIdx ?? 0) === closingIdx);
    if (!closingParts.length) { addLog("warn", "CHAT", `⚠ Aucune partie dans le chapitre ${closingIdx + 1}`); return; }
    setChapters(prev => prev.map((ch, i) => i === closingIdx ? { ...ch, closed: true } : ch));
    generateAndCacheChapterSummary(closingIdx, closingParts, choices?.language || "french");
    extractAndMergeCarnet(closingIdx, closingParts, choices?.language || "french");
    openNewChapter();
    addLog("info", "CHAT", `✦ Chapitre ${closingIdx + 1} clos — chapitre ${closingIdx + 2} ouvert`);
  };

  const updateChapterTitle = (idx, val) => setChapters(prev => prev.map((ch, i) => i === idx ? { ...ch, title: val } : ch));

  const insertChapterBreak = (globalIdx) => {
    if (globalIdx === 0) return;
    const partBefore = parts[globalIdx - 1];
    const currentChapIdx = partBefore?.chapterIdx ?? 0;
    const newChapIdx = currentChapIdx + 1;
    const romanArr = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
    const newParts = parts.map((p, i) => i < globalIdx ? p : { ...p, chapterIdx: (p.chapterIdx ?? 0) + 1 });
    setParts(newParts);
    setChapters(prev => {
      const newChapters = [
        ...prev.slice(0, newChapIdx),
        { title: `Chapitre ${romanArr[newChapIdx] || String(newChapIdx + 1)}`, closed: false },
        ...prev.slice(newChapIdx),
      ];
      const finalChapters = newChapters.map((ch, i) =>
        i === currentChapIdx ? { ...ch, closed: true } : i > newChapIdx ? { ...ch, summary: undefined } : ch
      );
      const closedParts = newParts.filter(p => (p.chapterIdx ?? 0) === currentChapIdx);
      generateAndCacheChapterSummary(currentChapIdx, closedParts, choices?.language || language);
      extractAndMergeCarnet(currentChapIdx, closedParts, choices?.language || language);
      addLog("info", "GEN", `✦ Coupure chapitre — résumé §${currentChapIdx + 1} en cours`);
      return finalChapters;
    });
  };

  const regenerateLast = async () => {
    if (!parts.length) return;
    setLoading(true); setError(""); setSaveLink(null); setChapterSuggestion(null);
    setLoadingMsg(t.rewriting);
    const lastPart = parts[parts.length - 1];
    const context = parts.slice(0, -1).map(p => p.text).join("\n\n");
    const langInstr = langInstructions[choices.language] || "Écris en français.";
    const genreStr = buildGenreStr(choices.genres);
    const isFirst = parts.length === 1;
    const nsfwStr = (nsfwEnabled && lastPart.nsfw) ? "\nExplicit adult content is authorized." : nsfwPromptGuard;
    const regenFingerprint = choices?.writingStyle ? AUTHOR_STYLES[choices.writingStyle] : null;
    const styleStr = choices?.writingStyle ? `\nSTYLE IMPOSÉ — à la manière de ${choices.writingStyle} : ${regenFingerprint || `ton et procédés propres à ${choices.writingStyle}`}. Le style doit être perceptible dès la première phrase.` : "";
    const prompt = isFirst
      ? `${langInstr}\nÉcris une NOUVELLE VERSION d'une histoire de ${nextWords} mots.\nGenre(s) : ${genreStr}\nNarrateur : ${narratorLabels[choices.narrator]}\nLaisse la fin ouverte.${styleStr}${nsfwStr}\n\nÉcris uniquement l'histoire, sans titre.`
      : `${langInstr}\nVoici le début d'une histoire :\n\n${context}\n\nÉcris une NOUVELLE VERSION différente de la suite (${nextWords} mots). Garde le style, change les événements.${styleStr}${nsfwStr}\n\nÉcris uniquement la suite, sans titre.`;
    try {
      const text = await callClaude([{ role: "user", content: prompt }]);
      if (!text || !text.trim()) throw new Error(t.errorEmpty);
      setParts(prev => [...prev.slice(0, -1), { text, include: lastPart.include, exclude: lastPart.exclude, chapterIdx: lastPart.chapterIdx ?? currentChapter }]);
    } catch(e) { setError(t.errorPfx + e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  };

  const rewriteInStyle = async () => {
    if (!rewriteTargetStyle || !parts.length) return;
    setShowRewriteModal(false);
    setRewritingStyle(true); setError(""); setSaveLink(null);
    const langInstr = langInstructions[choices?.language || "french"] || "Écris en français.";
    const fingerprint = AUTHOR_STYLES[rewriteTargetStyle];
    const styleDesc = fingerprint || `ton, rythme et procédés narratifs propres à ${rewriteTargetStyle}`;
    const storyText = fullText;
    const wordCount = approxWords;
    const nsfwStr = nsfwEnabled ? "\nContenu adulte explicite autorisé." : nsfwPromptGuard;
    const prompt = `${langInstr}
Voici une histoire :

${storyText}

Réécris INTÉGRALEMENT cette histoire d'environ ${wordCount} mots en adoptant rigoureusement le style de ${rewriteTargetStyle}.
Caractéristiques stylistiques à appliquer impérativement : ${styleDesc}

Règles :
- Conserve tous les personnages, l'intrigue et les événements
- Transforme profondément la prose, la syntaxe, le vocabulaire et le rythme
- Le style de ${rewriteTargetStyle} doit être perceptible dès la première phrase
- Conserve la structure narrative (chapitres, parties)${nsfwStr}

Écris uniquement le texte réécrit, sans titre ni commentaire.`;
    try {
      const text = await callClaude([{ role: "user", content: prompt }], 8000, 120000);
      if (!text || !text.trim()) throw new Error("Réponse vide. Réessayez.");
      // Replace all parts with the rewritten text as a single part, preserving chapter structure
      setParts([{ text, include: "", exclude: "", chapterIdx: 0 }]);
      setChapters([{ title: chapters[0]?.title || "Chapitre I", closed: false }]);
      setCurrentChapter(0);
      // Update choices style
      setChoices(prev => prev ? { ...prev, writingStyle: rewriteTargetStyle } : prev);
      setRewriteTargetStyle("");
    } catch(e) { setError("Erreur réécriture : " + e.message); }
    finally { setRewritingStyle(false); }
  };

  // ── Traduction littéraire ────────────────────────────────────────

  // ══════════════════════════════════════════════════════════════════
  // ── GYBH — Livre dont vous êtes le héros ─────────────────────────
  // ══════════════════════════════════════════════════════════════════

  const GYBH_MAX_ENDINGS = 15; // défaut mode avancé
  const GYBH_ENDINGS_FOR_DEPTH = { 2: 4, 3: 6, 4: 10, 5: 14, 6: 15 };
  const gybhMaxEndings = GYBH_ENDINGS_FOR_DEPTH[gybhMaxDepth] || GYBH_MAX_ENDINGS;

  // Compter les fins dans l'arbre courant
  const countGybhEndings = (nodes) =>
    Object.values(nodes).filter(n => n.isEnding).length;

  // Compter les feuilles (nœuds sans enfants, hors fins)
  const countGybhLeaves = (nodes) =>
    Object.values(nodes).filter(n => !n.isEnding && (!n.choices || n.choices.length === 0)).length;

  // Résumé de tous les nœuds existants pour les prompts de convergence
  const buildNodesSummary = (nodes) =>
    Object.values(nodes).map(n =>
      `[${n.id}] depth=${n.depth} "${n.summary?.slice(0, 80) || "—"}"${n.isEnding ? " (FIN)" : ""}`
    ).join("\n");

  // Générer un ID unique — compteur incrémental pour éviter les collisions Date.now()
  const _nodeCounter = useRef(0);
  const _expressAbort = useRef(false); // signal d'arrêt d'urgence
  const newNodeId = () => "n" + (++_nodeCounter.current).toString(36) + Math.random().toString(36).slice(2, 5);

  // ── 1. Générer la trame globale ──
  // ── Helper : bloc source narrative pour les prompts GYBH ──────────
  // ── Recherche de contexte pour "livre connu" en mode classique ───
  const searchClassicSource = async (overrideTitle) => {
    const title = (overrideTitle || classicSource.bookTitle).trim();
    if (!title) return;
    setClassicSourceLoading(true);
    setClassicSource(s => ({ ...s, context: "" }));
    addLog("info", "SOURCE", `🔍 Recherche contexte : "${title}"`);
    const langInstr = langInstructions[language] || "Réponds en français.";
    const prompt = `${langInstr}
Tu es une encyclopédie littéraire et cinématographique. Donne une fiche détaillée sur l'œuvre : "${title}"

Réponds UNIQUEMENT avec ce JSON (sans texte avant ni après, sans balises markdown) :
{
  "found": true,
  "fullTitle": "titre exact",
  "author": "auteur ou réalisateur",
  "year": "année",
  "genre": "genre(s)",
  "setting": "univers et époque (2-3 phrases)",
  "protagonist": "personnage principal (2-3 phrases)",
  "keyCharacters": "autres personnages importants (2-3 phrases)",
  "plot": "résumé de l'intrigue (4-5 phrases, début → milieu → fin)",
  "themes": "thèmes principaux",
  "tone": "ton et style de l'œuvre",
  "keyLocations": "lieux emblématiques",
  "continuationIdeas": "3 pistes intéressantes pour continuer ou faire diverger cette histoire"
}
Si l'œuvre est inconnue, réponds uniquement : {"found": false}`;
    try {
      const raw = await callClaude([
        { role: "user", content: prompt },
        { role: "assistant", content: "{" }
      ], 1200, 30000, 0, true);
      const joined = "{" + raw;
      const start = joined.indexOf("{"); const end = joined.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("JSON introuvable");
      const data = JSON.parse(joined.slice(start, end + 1));
      if (!data.found) {
        setClassicSource(s => ({ ...s, context: "⚠ Œuvre non reconnue. Saisissez le contexte manuellement." }));
        addLog("warn", "SOURCE", `✗ Œuvre inconnue : "${title}"`);
      } else {
        const ctx = `📚 "${data.fullTitle}" — ${data.author} (${data.year})
Genre : ${data.genre}
Univers : ${data.setting}
Protagoniste : ${data.protagonist}
Personnages clés : ${data.keyCharacters}
Intrigue : ${data.plot}
Thèmes : ${data.themes}
Ton : ${data.tone}
Lieux : ${data.keyLocations}
Pistes de continuation : ${data.continuationIdeas}`;
        setClassicSource(s => ({ ...s, context: ctx }));
        addLog("info", "SOURCE", `✓ Contexte généré pour "${data.fullTitle}"`);
      }
    } catch(e) {
      setClassicSource(s => ({ ...s, context: "⚠ Erreur lors de la recherche. Saisissez le contexte manuellement." }));
      addLog("error", "SOURCE", `✕ Recherche échouée : ${e.message}`);
    }
    setClassicSourceLoading(false);
  };

  // ── Construit le bloc source pour les prompts du récit classique ──
  const buildClassicSourceHint = () => {
    if (classicSource.type === "known" && classicSource.bookTitle.trim()) {
      const ctx = classicSource.context?.trim() && !classicSource.context.startsWith("⚠")
        ? `\n\nCONTEXTE DE L'ŒUVRE :\n${classicSource.context.slice(0, 3000)}`
        : "";
      return `\nSOURCE : Ce récit est inspiré de "${classicSource.bookTitle.trim()}". Respecte fidèlement l'univers, les personnages et le ton de l'œuvre source.${ctx}`;
    }
    if (classicSource.type === "upload" && importText.trim()) {
      return `\nSOURCE : Ce récit continue un texte fourni. Respecte les personnages, l'univers et le style déjà établis.`;
    }
    return "";
  };

  const buildGybhSourceHint = () => {
    if (gybhSource.type === "known" && gybhSource.bookTitle.trim()) {
      const wikiBlock = gybhSource.wikiContext?.trim()
        ? `\n\nCONTEXTE WIKIPEDIA :\n${gybhSource.wikiContext.trim().slice(0, 3000)}`
        : "";
      return `\nSOURCE : Ce récit est basé sur "${gybhSource.bookTitle.trim()}". Respecte fidèlement l'univers, les personnages et le ton du livre source. Les embranchements sont des DIVERGENCES narratives par rapport à l'histoire originale.${wikiBlock}`;
    }
    if (gybhSource.type === "upload" && gybhSource.text.trim()) {
      return `\nSOURCE : Ce récit est basé sur un texte fourni par l'auteur. Respecte fidèlement les personnages, l'univers et le ton de ce texte. Les embranchements sont des DIVERGENCES par rapport au texte source.`;
    }
    return "";
  };

  const generateGybhFrame = async () => {
    setGybhLoadingFrame(true); setError("");
    const langInstr = langInstructions[language] || "Écris en français.";
    const genreStr  = buildGenreStr(genres, genreWeights);
    const styleHint = writingStyle ? `Style d'écriture : ${writingStyle}.` : "";

    // Bloc source narrative
    let sourceBlock = "";
    if (gybhSource.type === "known" && gybhSource.bookTitle.trim()) {
      const wikiExtra = gybhSource.wikiContext?.trim()
        ? `\n\nCONTEXTE DÉTAILLÉ (Wikipedia) :\n${gybhSource.wikiContext.trim().slice(0, 3000)}`
        : "";
      sourceBlock = `\nSOURCE NARRATIVE — LIVRE EXISTANT : "${gybhSource.bookTitle.trim()}"${wikiExtra}
Tu dois t'inspirer fidèlement de l'univers, des personnages, du ton et de la structure narrative de ce livre.
La trame GYBH doit proposer des DIVERGENCES par rapport au récit original — des embranchements qui explorent "et si..." à des moments clés de l'histoire.
Conserve les noms des personnages, lieux et éléments emblématiques du livre source.`;
    } else if (gybhSource.type === "upload" && gybhSource.text.trim()) {
      sourceBlock = `\nSOURCE NARRATIVE — TEXTE FOURNI (extrait) :
${gybhSource.text.slice(0, 4000)}

Tu dois t'inspirer fidèlement de cet univers, de ces personnages, du ton et des enjeux narratifs de ce texte.
La trame GYBH doit proposer des DIVERGENCES par rapport au texte source — des embranchements qui explorent des tournants alternatifs.
Conserve les noms des personnages, lieux et éléments du texte source.`;
    }

    const prompt = `${langInstr}
${styleHint ? styleHint + "\n" : ""}Genre(s) : ${genreStr}
Point de vue : ${narratorLabels[narrator] || "troisième personne"}${initInclude ? `\nÉléments à inclure : ${initInclude}` : ""}${initExclude ? `\nÉléments à éviter : ${initExclude}` : ""}${gybhGuide.pitchInc ? `\nTrame — inclure : ${gybhGuide.pitchInc}` : ""}${gybhGuide.pitchDec ? `\nTrame — éviter : ${gybhGuide.pitchDec}` : ""}${gybhGuide.heroInc ? `\nPersonnage — inclure : ${gybhGuide.heroInc}` : ""}${gybhGuide.heroDec ? `\nPersonnage — éviter : ${gybhGuide.heroDec}` : ""}${gybhGuide.stakesInc ? `\nEnjeu — inclure : ${gybhGuide.stakesInc}` : ""}${gybhGuide.stakesDec ? `\nEnjeu — éviter : ${gybhGuide.stakesDec}` : ""}${gybhGuide.openingInc ? `\nOuverture — inclure : ${gybhGuide.openingInc}` : ""}${gybhGuide.openingDec ? `\nOuverture — éviter : ${gybhGuide.openingDec}` : ""}${sourceBlock}

Crée la trame d'un livre interactif "Dont vous êtes le Héros" (${gybhMaxDepth} niveaux, max ${GYBH_MAX_ENDINGS} fins).

RÈGLE NARRATIVE ESSENTIELLE : L'histoire doit couvrir un ARC COMPLET en ${gybhMaxDepth} niveaux — de la situation initiale jusqu'au dénouement final (victoire, défaite, révélation). Chaque niveau doit faire progresser l'enjeu vers quelque chose de plus grand. Le niveau 1 est le déclencheur, le niveau ${gybhMaxDepth} est la résolution. Ne pas s'enliser sur un seul événement — l'histoire doit avancer.

Réponds UNIQUEMENT avec ce JSON, sans aucun texte avant ni après :
{"title":"...","pitch":"...","hero":"...","stakes":"...","opening":"..."}

Contraintes : title=4-6 mots, pitch=2-3 phrases décrivant l'arc complet du début à la fin possible, hero=1-2 phrases, stakes=1 phrase sur l'enjeu final, opening=2-3 phrases plantant le décor et le déclencheur.`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }], 500, null);
      // Parsing robuste : chercher le premier { et le dernier } correspondant
      const start = raw.indexOf("{");
      const end   = raw.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) {
        const isNsfw = genres.includes("erotic");
        if (isNsfw) {
          setError("⚠ Le contenu érotique ne peut pas être généré dans cet environnement. Essayez un autre genre, ou combinez Érotique avec Romance ou Thriller pour un résultat suggestif.");
        } else {
          setError("Erreur trame : réponse inattendue du modèle. Réessayez.");
        }
        addLog("warn", "GYBH", `✕ Trame : pas de JSON dans la réponse — refus probable du modèle`);
        setGybhLoadingFrame(false);
        return;
      }
      const frame = JSON.parse(raw.slice(start, end + 1));
      if (!frame.title || !frame.pitch) throw new Error("Champs manquants dans le JSON");
      setGybhFrame(frame);
      setBookTitle(frame.title || "");
      setGybhPhase("frame");
      addLog("info", "GYBH", `✓ Trame générée : "${frame.title}"`);
    } catch(e) {
      setError("Erreur trame : " + e.message);
      addLog("error", "GYBH", `✕ Trame échouée : ${e.message}`);
    }
    setGybhLoadingFrame(false);
  };

  // ── 2. Valider la trame et créer le nœud racine ──
  const validateGybhFrame = () => {
    const rootId = newNodeId();
    const rootNode = {
      id: rootId, depth: 0, parentId: null, choiceText: null,
      summary: gybhFrame.opening, text: null,
      choices: null, // null = axes pas encore générés
      isEnding: false, endingType: null, sectionNumber: null,
      pendingAxes: null, // axes proposés par Claude en attente de validation
      axeIncludes: ["", ""], axeExcludes: ["", ""], // include/exclude par axe
    };
    setGybhNodes({ [rootId]: rootNode });
    setGybhRootId(rootId);
    setGybhPhase("skeleton");
    setGybhPendingNode(rootId);
    addLog("info", "GYBH", `✓ Trame validée — nœud racine créé`);
  };

  // ── 2c. Mode Auto-Pilot (mode avancé) ────────────────────────────
  // Joue le rôle de l'utilisateur : valide la trame, génère les axes,
  // choisit narrativement le meilleur à chaque embranchement,
  // génère tous les textes — et livre un arbre GYBH complet modifiable.
  const runGybhExpress = async () => {
    setExpressModeRunning(true);
    _expressAbort.current = false;
    setError("");

    const langInstr = langInstructions[language] || "Écris en français.";
    const currentFrame = gybhFrame;
    const maxDepth = gybhMaxDepth;
    const maxEndings = GYBH_ENDINGS_FOR_DEPTH[maxDepth] || GYBH_MAX_ENDINGS;
    const sectionWordTarget = { micro: 150, flash: 300, short: 500, long: 1000 }[duration] || 300;

    try {
      // ── Étape 1 : Créer le nœud racine ──
      setGybhProgress({ step: "Initialisation de l'arbre…", pct: 2 });
      setExpressSectionStep("");
      const rootId = "n" + (++_nodeCounter.current).toString(36) + Math.random().toString(36).slice(2,5);
      let nodes = {
        [rootId]: {
          id: rootId, depth: 0, parentId: null, choiceText: null,
          summary: currentFrame.opening, title: currentFrame.title || null, text: null, choices: null,
          isEnding: false, endingType: null, sectionNumber: null,
          pendingAxes: null, axeIncludes: ["",""], axeExcludes: ["",""],
          include: "", exclude: "",
        }
      };
      setGybhRootId(rootId);
      setGybhNodes({ ...nodes });
      setGybhPhase("skeleton");

      // ── Étape 2 : Squelette global en une seule requête ──
      setGybhProgress({ step: "Conception de l'arbre narratif complet…", pct: 5 });
      setExpressSectionStep("Génération du squelette…");

      const sourceHint = buildGybhSourceHint();
      const skeletonPrompt = `${langInstr}
${sourceHint ? sourceHint + "\n" : ""}Tu es un auteur de livres "Dont Vous Êtes le Héros". Crée le squelette narratif COMPLET d'un livre interactif.

TRAME : ${currentFrame.pitch}
HÉROS : ${currentFrame.hero}
ENJEU FINAL : ${currentFrame.stakes}
NŒUD RACINE (id="${rootId}", depth=0) : ${currentFrame.opening}

PROGRESSION NARRATIVE OBLIGATOIRE — chaque niveau doit faire avancer l'histoire :
- Niveau 0 (racine) : situation initiale, déclencheur
- Niveau 1 : première conséquence, l'enjeu se précise
- Niveau 2 : escalade, complication majeure
- Niveau 3 : tournant décisif, point de non-retour
- Niveau ${maxDepth - 1} → fins : résolution, dénouement
⚠ INTERDIT : s'enliser sur le même événement ou détail d'un niveau à l'autre. Chaque niveau = nouvelle étape narrative vers le dénouement.

CONTRAINTES STRUCTURELLES :
- Profondeur max : ${maxDepth} niveaux (racine = niveau 0)
- Exactement ${maxEndings} fins (isEnding:true)
- Chaque nœud non-fin et non-convergent : exactement 2 enfants
- OBLIGATOIRE : au moins ${Math.max(2, Math.floor(maxEndings / 2))} convergences (convergeTo = id d'un nœud déjà dans la liste)
- Les convergences surviennent quand deux chemins mènent au même tournant narratif
- Les nœuds de niveau ${maxDepth - 1} ont isEnding:true

RÈGLES choiceText :
- Verbe à l'infinitif, 6-10 mots
- Exprime une ACTION ou INTENTION du lecteur
- Ne révèle PAS le résultat ni l'issue

FORMAT — tableau JSON de tous les nœuds sauf la racine :
[{"id":"a1","parentId":"${rootId}","choiceText":"...","title":"...","summary":"...","isEnding":false,"endingType":null,"convergeTo":null},...]

Pour convergeTo : mettre l'id d'un nœud déjà présent dans la liste (pas la racine), sinon null.
Réponds UNIQUEMENT avec le tableau JSON.`;

      let skeletonOk = false;
      try {
        const prefill = `[{"id":"`;
        const skRaw = await callClaude([
          { role: "user", content: skeletonPrompt },
          { role: "assistant", content: prefill }
        ], 4000, 180000, 0, false);
        const fullRaw = prefill + skRaw;
        const si = fullRaw.indexOf("["); const se = fullRaw.lastIndexOf("]");
        if (si === -1 || se === -1) throw new Error("JSON squelette introuvable");
        const skeletonNodes = JSON.parse(fullRaw.slice(si, se + 1));
        if (!Array.isArray(skeletonNodes) || skeletonNodes.length < 2) throw new Error("Squelette trop court");

        addLog("info", "GYBH-EXPRESS", `✓ Squelette reçu — ${skeletonNodes.length} nœuds`);
        setGybhProgress({ step: "Construction de l'arbre…", pct: 20 });

        // Mapper les ids temporaires → vrais ids
        const idMap = { [rootId]: rootId };
        for (const sn of skeletonNodes) {
          if (!idMap[sn.id]) idMap[sn.id] = newNodeId();
        }

        // Créer tous les nœuds
        for (const sn of skeletonNodes) {
          const realId = idMap[sn.id];
          const realParentId = idMap[sn.parentId] || sn.parentId;
          const realConvergeTo = sn.convergeTo ? (idMap[sn.convergeTo] || null) : null;
          const isEnding = !!sn.isEnding;
          nodes[realId] = {
            id: realId, depth: 0, parentId: realParentId,
            choiceText: sn.choiceText || "", title: sn.title || null,
            summary: sn.summary || "", text: null,
            choices: isEnding ? [] : (realConvergeTo ? null : null),
            isEnding, endingType: sn.endingType || null,
            pendingAxes: null, axeIncludes: ["",""], axeExcludes: ["",""],
            include: "", exclude: "", sectionNumber: null,
            convergeTo: realConvergeTo || null,
          };
        }

        // Calculer les profondeurs
        const calcDepth = (id, visited = new Set()) => {
          if (visited.has(id)) return 0;
          visited.add(id);
          const n = nodes[id];
          if (!n || !n.parentId || n.parentId === id) return 0;
          return 1 + calcDepth(n.parentId, new Set(visited));
        };
        for (const id of Object.keys(nodes)) nodes[id].depth = calcDepth(id);

        // Construire les choices de chaque parent
        for (const id of Object.keys(nodes)) {
          if (id === rootId) continue;
          const n = nodes[id];
          if (!n.parentId || !nodes[n.parentId]) continue;
          const parent = nodes[n.parentId];
          if (!parent.choices) parent.choices = [];
          if (!parent.choices.find(c => c.childId === id)) {
            parent.choices.push({ text: n.choiceText, childId: n.convergeTo || id });
          }
        }

        // Forcer les fins au niveau maxDepth
        for (const id of Object.keys(nodes)) {
          const n = nodes[id];
          if (n.depth >= maxDepth && !n.isEnding && !n.convergeTo) {
            n.isEnding = true; n.endingType = n.endingType || "neutral"; n.choices = [];
            addLog("warn", "GYBH-EXPRESS", `⚠ Nœud ${id} forcé FIN (depth=${n.depth})`);
          }
        }

        const endingsCount = Object.values(nodes).filter(n => n.isEnding).length;
        const convergences = Object.values(nodes).filter(n => n.convergeTo).length;
        addLog("info", "GYBH-EXPRESS", `✓ Arbre — ${Object.keys(nodes).length} nœuds, ${endingsCount} fins, ${convergences} convergences`);
        setGybhNodes({ ...nodes });
        setGybhProgress({ step: `Squelette — ${Object.keys(nodes).length} nœuds, ${convergences} convergences`, pct: 40 });
        skeletonOk = true;

      } catch(e) {
        addLog("warn", "GYBH-EXPRESS", `⚠ Squelette global échoué: ${e.message} — fallback nœud par nœud`);
      }

      // ── Fallback : génération nœud par nœud ──
      if (!skeletonOk) {
        const queue = [rootId];
        let processed = 0;
        const nodeRetries = {};
        const totalEstimate = Math.pow(2, maxDepth - 1) || 1;

        while (queue.length > 0) {
          const nodeId = queue.shift();
          const node = nodes[nodeId];
          if (!node || node.isEnding) continue;
          processed++;

          const pct = 5 + Math.min(35, Math.round((processed / Math.max(totalEstimate, processed + queue.length)) * 35));
          setGybhProgress({ step: `Squelette — nœud ${processed} (${queue.length} en attente)…`, pct });

          const allNodes = Object.values(nodes);
          const ancestorIds = new Set();
          let anc = node;
          while (anc) { ancestorIds.add(anc.id); anc = anc.parentId ? nodes[anc.parentId] : null; }
          const nodesSummary = allNodes.map(n => `[${n.id}] depth=${n.depth} "${n.summary?.slice(0,80)||"—"}"${n.isEnding?" (FIN)":""}`).join("\n");
          const convergenceCandidates = allNodes.filter(n => !ancestorIds.has(n.id) && !n.isEnding && n.id !== node.id && n.choices !== null);
          const convergenceBlock = convergenceCandidates.length > 0
            ? `\nPOUR CONVERGENCE :\n${convergenceCandidates.map(n => `[${n.id}] "${n.summary?.slice(0,60)}"`).join("\n")}`
            : "";
          const endingsLeft = maxEndings - allNodes.filter(n => n.isEnding).length;
          const isNearMax = node.depth >= maxDepth - 1;
          const pathToNode = [];
          let cur = node;
          while (cur) { pathToNode.unshift(cur.summary?.slice(0,60) || ""); cur = cur.parentId ? nodes[cur.parentId] : null; }

          const axesPrompt = `${langInstr}
CONTEXTE : Trame="${currentFrame.pitch}"
NŒUDS : ${nodesSummary}${convergenceBlock}
CHEMIN : ${pathToNode.join(" → ")}
NŒUD ACTUEL (depth=${node.depth}/${maxDepth}) : ${node.summary}
Fins restantes: ${endingsLeft}/${maxEndings}
${isNearMax ? "DERNIER NIVEAU : les 2 axes DOIVENT être isEnding:true" : ""}
Propose 2 axes. convergeTo = id d'un nœud existant si narrativement logique, sinon null.
JSON UNIQUEMENT :
[{"title":"...","choiceText":"...","summary":"...","convergeTo":null,"isEnding":false,"endingType":null},{"title":"...","choiceText":"...","summary":"...","convergeTo":null,"isEnding":false,"endingType":null}]`;

          try {
            const axRaw = await callClaude([{ role: "user", content: axesPrompt }], 600, 90000);
            const as = axRaw.indexOf("["); const ae = axRaw.lastIndexOf("]");
            if (as === -1 || ae === -1) throw new Error("JSON introuvable");
            const axes = JSON.parse(axRaw.slice(as, ae + 1));
            if (!Array.isArray(axes) || axes.length !== 2) throw new Error("Format invalide");

            axes.forEach(axe => {
              if (!isNearMax) { axe.isEnding = false; axe.endingType = null; }
              if (isNearMax) { axe.isEnding = true; if (!axe.endingType) axe.endingType = "neutral"; }
            });

            const choices = [];
            axes.forEach((axe, i) => {
              const realConvergeTo = axe.convergeTo && nodes[axe.convergeTo] ? axe.convergeTo : null;
              if (realConvergeTo) {
                choices.push({ text: axe.choiceText, childId: realConvergeTo });
                addLog("info", "GYBH-EXPRESS", `↩ Convergence vers ${realConvergeTo}`);
              } else {
                const childId = newNodeId();
                const childDepth = node.depth + 1;
                nodes[childId] = {
                  id: childId, depth: childDepth, parentId: nodeId,
                  choiceText: axe.choiceText, summary: axe.summary, title: axe.title || null,
                  text: null, choices: axe.isEnding ? [] : null,
                  isEnding: axe.isEnding, endingType: axe.endingType || null,
                  pendingAxes: null, axeIncludes: ["",""], axeExcludes: ["",""],
                  include: "", exclude: "", sectionNumber: null, convergeTo: null,
                };
                choices.push({ text: axe.choiceText, childId });
                if (!axe.isEnding) {
                  if (i === 0) queue.unshift(childId); else queue.push(childId);
                }
              }
            });
            nodes[nodeId] = { ...nodes[nodeId], choices, pendingAxes: null };
            setGybhNodes({ ...nodes });
          } catch(e) {
            nodeRetries[nodeId] = (nodeRetries[nodeId] || 0) + 1;
            if (nodeRetries[nodeId] < 2) { queue.push(nodeId); processed--; }
            else addLog("warn", "GYBH-EXPRESS", `✕ Nœud ${nodeId} abandonné: ${e.message}`);
          }
        }
        setGybhNodes({ ...nodes });
        setGybhPendingNode(null);
        addLog("info", "GYBH-EXPRESS", `✓ Squelette (fallback) — ${Object.keys(nodes).length} nœuds`);
      }

      // ── Étape 3 : Génération de tous les textes ──
      if (_expressAbort.current) throw new Error("Arrêt demandé par l'utilisateur");
      const pending = Object.values(nodes).filter(n => !n.text && !n.convergeTo);
      const total = pending.length;

      for (let i = 0; i < total; i++) {
        if (_expressAbort.current) { addLog("info", "GYBH-EXPRESS", `⏹ Arrêt à la section ${i+1}/${total}`); break; }
        const node = pending[i];
        const pct = 42 + Math.round((i / total) * 56);
        setGybhProgress({ step: `Écriture — section ${i+1}/${total}`, pct });
        setExpressSectionStep(`Génération du texte ${i+1}/${total}…`);
        setGybhWritingNode(node.id);
        setGybhExpandedNodes(prev => ({ ...prev, [node.id]: true }));

        try {
          const styleHint = writingStyle ? `Style d'écriture : ${writingStyle}.\n${AUTHOR_STYLES[writingStyle] ? "Caractéristiques : " + AUTHOR_STYLES[writingStyle] : ""}` : "";
          const isRoot = node.id === rootId;
          const wordTarget = sectionWordTarget;

          const pathParts = [];
          let cur = node.parentId ? nodes[node.parentId] : null;
          const visited = new Set();
          while (cur && !visited.has(cur.id)) {
            visited.add(cur.id);
            if (cur.text) pathParts.unshift(cur.text.slice(0, 500));
            cur = cur.parentId ? nodes[cur.parentId] : null;
          }

          const endingHint = node.isEnding
            ? `\nCe passage est une FIN (${node.endingType === "good" ? "heureuse" : node.endingType === "bad" ? "tragique" : "neutre"}). Conclus l'histoire de façon satisfaisante et mémorable.`
            : `\nTermine ce passage sur une situation qui appelle naturellement le choix. Les choix proposés seront :\n${(node.choices || []).map((c, idx) => `- Option ${idx+1} : "${c.text}"`).join("\n")}`;
          const introHint = isRoot
            ? `\nC'est l'INTRODUCTION du livre : plante le décor, présente le héros et l'enjeu principal. Ne mentionne pas les options — termine sur un moment de tension.`
            : "";

          const prompt = `${langInstr}
${styleHint}
TRAME GÉNÉRALE : ${currentFrame.pitch}
ENJEU : ${currentFrame.stakes}${buildGybhSourceHint()}

CONTEXTE NARRATIF (ne pas répéter, continuer directement) :
${pathParts.join("\n\n---\n\n") || "(début de l'histoire)"}

RÉSUMÉ DE CE PASSAGE :
${node.summary}
${introHint}
${endingHint}

Écris ce passage d'environ ${wordTarget} mots. IMPORTANT : commence directement l'action de ce passage, sans reprendre ni résumer les événements précédents. Écris UNIQUEMENT le texte narratif, sans titre ni numéro de section.`;

          const maxTok = Math.max(400, Math.round(wordTarget * 2.2));
          const timeoutMs = maxTok < 800 ? 60000 : 120000;
          const text = await callClaude([{ role: "user", content: prompt }], maxTok, timeoutMs, 0, false);
          if (!text?.trim()) throw new Error("Réponse vide");

          nodes[node.id] = { ...nodes[node.id], text: text.trim() };
          setGybhNodes({ ...nodes });
          addLog("info", "GYBH-EXPRESS", `✓ Section ${i+1}/${total} — ${node.id} (~${text.split(/\s+/).filter(Boolean).length} mots)`);
        } catch(e) {
          addLog("warn", "GYBH-EXPRESS", `⚠ Section ${i+1}/${total} échouée : ${e.message}`);
        }
      }

      setGybhWritingNode(null);
      setExpressSectionStep("");
      const failed = Object.values(nodes).filter(n => !n.text && !n.convergeTo).length;
      if (failed > 0) {
        setGybhProgress({ step: `⚠ ${Object.keys(nodes).length - failed}/${Object.keys(nodes).length} sections — ${failed} à relancer`, pct: 100 });
      } else {
        setGybhProgress({ step: `✓ Arbre complet — ${Object.keys(nodes).length} sections`, pct: 100 });
        addLog("info", "GYBH-EXPRESS", `✓ Auto-pilot terminé — ${Object.keys(nodes).length} sections, ${Object.values(nodes).filter(n=>n.isEnding).length} fins`);
      }
      setGybhExpandedNodes({ [rootId]: true });

    } catch(e) {
      setError("Erreur auto-pilot : " + e.message);
      addLog("error", "GYBH-EXPRESS", `✕ Auto-pilot échoué : ${e.message}`);
      setGybhProgress({ step: "", pct: 0 });
      setExpressSectionStep("");
    }
    setExpressModeRunning(false);
  };

  // ── 3. Générer les axes pour un nœud ──

  // ── 2b. Régénérer une seule dimension de la trame ──
  const regenerateGybhDimension = async (dimension) => {
    // dimension: "hero" | "stakes" | "opening"
    setGybhRegenLoading(dimension); setError("");
    const langInstr = langInstructions[language] || "Écris en français.";
    const genreStr  = buildGenreStr(genres, genreWeights);
    const dimLabels = { pitch: "trame générale", hero: "personnage", stakes: "enjeu central", opening: "passage d'ouverture" };
    const dimInc = { pitch: gybhGuide.pitchInc, hero: gybhGuide.heroInc, stakes: gybhGuide.stakesInc, opening: gybhGuide.openingInc };
    const dimDec = { pitch: gybhGuide.pitchDec, hero: gybhGuide.heroDec, stakes: gybhGuide.stakesDec, opening: gybhGuide.openingDec };
    const dimLen = { pitch: "2-3 phrases", hero: "1-2 phrases", stakes: "1 phrase", opening: "2-3 phrases" };
    const prompt = `${langInstr}
Genre(s) : ${genreStr}
Trame du livre : ${gybhFrame?.pitch || ""}
${dimInc[dimension] ? `Inclure dans le ${dimLabels[dimension]} : ${dimInc[dimension]}` : ""}
${dimDec[dimension] ? `Éviter dans le ${dimLabels[dimension]} : ${dimDec[dimension]}` : ""}

Réécris uniquement le champ "${dimension}" pour ce livre interactif.
Longueur : ${dimLen[dimension]}.
Réponds UNIQUEMENT avec le texte, sans guillemets ni JSON.`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }], 200, null);
      if (!raw?.trim()) throw new Error("Réponse vide");
      setGybhFrame(prev => ({ ...prev, [dimension]: raw.trim() }));
      addLog("info", "GYBH", `✓ ${dimLabels[dimension]} régénéré`);
    } catch(e) {
      setError("Erreur régénération : " + e.message);
    }
    setGybhRegenLoading(null);
  };


  // ── Compléter automatiquement un arbre en cours de construction ──
  const completeGybhAuto = async () => {
    setExpressModeRunning(true);
    _expressAbort.current = false;
    setError("");
    const langInstr = langInstructions[language] || "Écris en français.";
    const maxDepth = gybhMaxDepth;
    const maxEndings = GYBH_ENDINGS_FOR_DEPTH[maxDepth] || GYBH_MAX_ENDINGS;
    const sectionWordTarget = { micro: 150, flash: 300, short: 500, long: 1000 }[duration] || 300;

    try {
      let nodes = { ...gybhNodes };

      // ── Phase 0 : Valider les axes en attente (pendingAxes non encore validés) ──
      const pendingValidation = Object.values(nodes).filter(n => n.pendingAxes && n.choices === null);
      if (pendingValidation.length > 0) {
        addLog("info", "GYBH-EXPRESS", `▶ Validation de ${pendingValidation.length} axe(s) en attente…`);
        for (const node of pendingValidation) {
          const choices = [];
          const childDepth = node.depth + 1;
          const mustBeEnding = childDepth >= maxDepth;
          node.pendingAxes.forEach(axe => {
            const childId = newNodeId();
            const isEnding = mustBeEnding ? true : (axe.isEnding || false);
            nodes[childId] = {
              id: childId, depth: childDepth, parentId: node.id,
              choiceText: axe.choiceText, summary: axe.summary, title: axe.title || null,
              text: null, choices: isEnding ? [] : null,
              isEnding, endingType: isEnding ? (axe.endingType || "neutral") : null,
              pendingAxes: null, axeIncludes: ["",""], axeExcludes: ["",""],
              include: "", exclude: "", sectionNumber: null,
            };
            choices.push({ text: axe.choiceText, childId });
            addLog("info", "GYBH-EXPRESS", `+ Nœud ${childId} validé (depth=${childDepth}${isEnding ? ", FIN" : ""})`);
          });
          nodes[node.id] = { ...nodes[node.id], choices, pendingAxes: null };
        }
        setGybhNodes({ ...nodes });
      }

      // ── Phase 1 : Compléter les axes manquants ──
      const needAxes = Object.values(nodes).filter(n =>
        !n.isEnding && n.choices === null && !n.pendingAxes && n.depth < maxDepth
      );

      if (needAxes.length > 0) {
        addLog("info", "GYBH-EXPRESS", `▶ Complétion auto — ${needAxes.length} nœud(s) sans axes`);
        const nodeRetries = {};
        const queue = needAxes.map(n => n.id);
        let processed = 0;

        while (queue.length > 0) {
          const nodeId = queue.shift();
          const node = nodes[nodeId];
          if (!node || node.isEnding || node.choices !== null) continue;
          processed++;
          setGybhProgress({ step: `Axes — nœud ${processed} (${queue.length} restants)…`, pct: 5 + Math.min(35, Math.round((processed / Math.max(needAxes.length, processed + queue.length)) * 35)) });

          const isNearMax = node.depth >= maxDepth - 1;
          const endingsLeft = maxEndings - Object.values(nodes).filter(n => n.isEnding).length;
          const pathToNode = [];
          let cur2 = node;
          while (cur2) { pathToNode.unshift(cur2.summary || ""); cur2 = cur2.parentId ? nodes[cur2.parentId] : null; }
          const ancIds = new Set();
          let anc = node;
          while (anc) { ancIds.add(anc.id); anc = anc.parentId ? nodes[anc.parentId] : null; }
          const nodesSummary = Object.values(nodes)
            .filter(n => ancIds.has(n.id) || n.depth <= 1 || n.isEnding)
            .map(n => `[${n.id}] depth=${n.depth} "${n.summary?.slice(0,80)||"—"}"${n.isEnding?" (FIN)":""}`)
            .join("\n");

          const prompt = `${langInstr}
CONTEXTE DU LIVRE :
Trame : ${gybhFrame?.pitch || ""}
Enjeu : ${gybhFrame?.stakes || ""}${buildGybhSourceHint()}

NŒUDS EXISTANTS :
${nodesSummary}

CHEMIN NARRATIF JUSQU'ICI :
${pathToNode.map((s, i) => `Niveau ${i}: ${s}`).join("\n")}

NŒUD ACTUEL (depth=${node.depth}/${maxDepth}) :
${node.summary}

CONTRAINTES :
- Fins restantes disponibles : ${endingsLeft}
- Profondeur max : ${maxDepth}
${isNearMax ? "- CE NŒUD EST AU DERNIER NIVEAU : les deux axes doivent mener à des FINS (isEnding: true)" : ""}

Propose exactement 2 axes narratifs contrastés.
Règle : "title"=titre court (3-5 mots), "choiceText"=action ou intention du lecteur (6-10 mots, commence par un verbe à l'infinitif, NE RÉVÈLE PAS le résultat), "summary"=résumé (2 phrases), "convergeTo"=null, "isEnding"=true/false, "endingType"="good"/"bad"/"neutral"/null.

Réponds UNIQUEMENT avec ce JSON :
[{"title":"...","choiceText":"...","summary":"...","convergeTo":null,"isEnding":false,"endingType":null},{"title":"...","choiceText":"...","summary":"...","convergeTo":null,"isEnding":false,"endingType":null}]`;

          try {
            const prefill = `[{"title":"`;
            const raw = await callClaude([
              { role: "user", content: prompt },
              { role: "assistant", content: prefill }
            ], 600, 90000, 0, false);
            const fullRaw = prefill + raw;
            const start = fullRaw.indexOf("["); const end = fullRaw.lastIndexOf("]");
            if (start === -1 || end === -1) throw new Error("JSON introuvable");
            const axes = JSON.parse(fullRaw.slice(start, end + 1));
            if (!Array.isArray(axes) || axes.length !== 2) throw new Error("Format invalide");

            const choices = [];
            const childDepth = node.depth + 1;
            const mustBeEnding = childDepth >= maxDepth;
            axes.forEach((axe) => {
              const childId = newNodeId();
              const isEnding = mustBeEnding ? true : (axe.isEnding || false);
              nodes[childId] = {
                id: childId, depth: childDepth, parentId: nodeId,
                choiceText: axe.choiceText, summary: axe.summary, title: axe.title || null,
                text: null, choices: isEnding ? [] : null,
                isEnding, endingType: isEnding ? (axe.endingType || "neutral") : null,
                pendingAxes: null, axeIncludes: ["",""], axeExcludes: ["",""],
                include: "", exclude: "", sectionNumber: null,
              };
              choices.push({ text: axe.choiceText, childId });
              addLog("info", "GYBH-EXPRESS", `+ Nœud ${childId} créé (depth=${childDepth}${isEnding ? ", FIN" : ""})`);
              if (!isEnding && childDepth < maxDepth) queue.push(childId);
            });
            nodes[nodeId] = { ...nodes[nodeId], choices, pendingAxes: null };
            setGybhNodes({ ...nodes });
          } catch(e) {
            nodeRetries[nodeId] = (nodeRetries[nodeId] || 0) + 1;
            if (nodeRetries[nodeId] < 2) {
              queue.push(nodeId);
              addLog("warn", "GYBH-EXPRESS", `⚠ Retry nœud ${nodeId} (${nodeRetries[nodeId]}/2) : ${e.message}`);
            } else {
              addLog("warn", "GYBH-EXPRESS", `⚠ Nœud ${nodeId} abandonné après 2 tentatives`);
            }
          }
        }
      }

      // ── Phase 2 : Écrire les textes manquants ──
      const needTexts = Object.values(nodes).filter(n => !n.text);
      if (needTexts.length === 0) {
        setGybhProgress({ step: "✓ Arbre déjà complet", pct: 100 });
        setExpressModeRunning(false); return;
      }

      addLog("info", "GYBH-EXPRESS", `▶ Écriture — ${needTexts.length} section(s) sans texte`);
      const total = needTexts.length;
      for (let i = 0; i < total; i++) {
        const node = needTexts[i];
        setGybhProgress({ step: `Écriture — section ${i+1}/${total}`, pct: 42 + Math.round((i / total) * 56) });
        setGybhWritingNode(node.id);
        setGybhExpandedNodes(prev => ({ ...prev, [node.id]: true }));

        try {
          const styleHint = writingStyle ? `Style d'écriture : ${writingStyle}.\n${AUTHOR_STYLES[writingStyle] ? "Caractéristiques : " + AUTHOR_STYLES[writingStyle] : ""}` : "";
          const isRoot = node.id === gybhRootId;
          const pathParts = [];
          let cur = node.parentId ? nodes[node.parentId] : null;
          const visited = new Set();
          while (cur && !visited.has(cur.id)) {
            visited.add(cur.id); if (cur.text) pathParts.unshift(cur.text.slice(0, 500));
            cur = cur.parentId ? nodes[cur.parentId] : null;
          }
          const endingHint = node.isEnding
            ? `\nCe passage est une FIN (${node.endingType === "good" ? "heureuse" : node.endingType === "bad" ? "tragique" : "neutre"}). Conclus l'histoire de façon satisfaisante et mémorable.`
            : `\nTermine ce passage sur une situation qui appelle naturellement le choix. Les choix seront :\n${(node.choices || []).map((c, idx) => `- Option ${idx+1} : "${c.text}"`).join("\n")}`;
          const introHint = isRoot ? `\nC'est l'INTRODUCTION du livre : plante le décor, présente le héros et l'enjeu. Termine sur un moment de tension.` : "";

          const prompt = `${langInstr}\n${styleHint}\nTRAME GÉNÉRALE : ${gybhFrame?.pitch || ""}\nENJEU : ${gybhFrame?.stakes || ""}${buildGybhSourceHint()}\n\nCONTEXTE NARRATIF (ne pas répéter, continuer directement) :\n${pathParts.join("\n\n---\n\n") || "(début de l'histoire)"}\n\nRÉSUMÉ DE CE PASSAGE :\n${node.summary}${introHint}${endingHint}\n\nÉcris ce passage d'environ ${sectionWordTarget} mots. IMPORTANT : commence directement l'action de ce passage, sans reprendre ni résumer les événements précédents. Écris UNIQUEMENT le texte narratif, sans titre ni numéro.`;

          const maxTok = Math.max(400, Math.round(sectionWordTarget * 2.2));
          const text = await callClaude([{ role: "user", content: prompt }], maxTok, maxTok < 800 ? 60000 : 120000, 0, false);
          if (!text?.trim()) throw new Error("Réponse vide");
          nodes[node.id] = { ...nodes[node.id], text: text.trim() };
          setGybhNodes({ ...nodes });
          addLog("info", "GYBH-EXPRESS", `✓ Section ${i+1}/${total} — ${node.id}`);
        } catch(e) {
          addLog("warn", "GYBH-EXPRESS", `⚠ Section ${i+1}/${total} échouée : ${e.message}`);
        }
      }

      setGybhWritingNode(null);
      const failed = Object.values(nodes).filter(n => !n.text).length;
      setGybhProgress({ step: failed > 0 ? `⚠ ${Object.keys(nodes).length - failed}/${Object.keys(nodes).length} sections — ${failed} à relancer` : `✓ Arbre complet — ${Object.keys(nodes).length} sections`, pct: 100 });
      addLog("info", "GYBH-EXPRESS", `✓ Complétion terminée — ${Object.keys(nodes).length} nœuds, ${failed} manquants`);

    } catch(e) {
      setError("Erreur complétion auto : " + e.message);
      addLog("error", "GYBH-EXPRESS", `✕ Complétion échouée : ${e.message}`);
      setGybhProgress({ step: "", pct: 0 });
    }
    setExpressModeRunning(false);
    setGybhWritingNode(null);
  };

  const generateGybhAxes = async (nodeId) => {
    setGybhLoadingAxes(true); setError("");
    const node = gybhNodes[nodeId];
    const langInstr = langInstructions[language] || "Écris en français.";
    const nodesSummary = buildNodesSummary(gybhNodes);
    const endingsLeft = gybhMaxEndings - countGybhEndings(gybhNodes);
    const leavesCount = countGybhLeaves(gybhNodes);
    const isNearMax = node.depth >= gybhMaxDepth - 1;

    // Chemin narratif parcouru jusqu'à ce nœud
    const pathToNode = [];
    let cur = node;
    while (cur) {
      pathToNode.unshift(cur.summary || "");
      cur = cur.parentId ? gybhNodes[cur.parentId] : null;
    }

    // Directives include/exclude par axe (si déjà renseignées avant de demander de nouveaux axes)
    const includeDirectives = (node.axeIncludes || []).map((v, i) => v?.trim() ? `- Axe ${i+1} DOIT inclure : ${v.trim()}` : "").filter(Boolean).join("\n");
    const excludeDirectives = (node.axeExcludes || []).map((v, i) => v?.trim() ? `- Axe ${i+1} DOIT éviter : ${v.trim()}` : "").filter(Boolean).join("\n");
    const directivesBlock = (includeDirectives || excludeDirectives)
      ? `\nDIRECTIVES PRIORITAIRES — OBLIGATOIRES, à respecter impérativement pour chaque axe :\n${includeDirectives}${includeDirectives && excludeDirectives ? "\n" : ""}${excludeDirectives}`
      : "";

    // Nœuds candidats à la convergence : nœuds d'autres branches (non-ancêtres, non-fins, déjà avec du contenu)
    const ancestorIds = new Set();
    let ancCur = node;
    while (ancCur) { ancestorIds.add(ancCur.id); ancCur = ancCur.parentId ? gybhNodes[ancCur.parentId] : null; }
    const convergenceCandidates = Object.values(gybhNodes).filter(n =>
      !ancestorIds.has(n.id) && !n.isEnding && n.id !== nodeId && n.summary
    );
    const convergenceBlock = convergenceCandidates.length > 0
      ? `\nNŒUDS DISPONIBLES POUR CONVERGENCE (autres branches vers lesquelles tu peux rediriger) :\n${convergenceCandidates.map(n => `[${n.id}] depth=${n.depth} — "${n.summary?.slice(0,80)}"`).join("\n")}`
      : "";

    const prompt = `${langInstr}
CONTEXTE DU LIVRE :
Trame : ${gybhFrame?.pitch || ""}
Enjeu : ${gybhFrame?.stakes || ""}${buildGybhSourceHint()}

NŒUDS EXISTANTS :
${nodesSummary || "(aucun)"}${convergenceBlock}

CHEMIN NARRATIF JUSQU'ICI :
${pathToNode.map((s, i) => `Niveau ${i}: ${s}`).join("\n")}

NŒUD ACTUEL (depth=${node.depth}/${gybhMaxDepth}) :
${node.summary}

CONTRAINTES :
- Fins restantes disponibles : ${endingsLeft}
- Feuilles actives sans axes : ${leavesCount}
- Profondeur max : ${gybhMaxDepth}
${isNearMax ? "- CE NŒUD EST AU DERNIER NIVEAU : les deux axes doivent mener à des FINS (isEnding: true)" : ""}${directivesBlock}

CONSIGNE : Propose exactement 2 axes narratifs contrastés pour la suite de ce passage.
Pour chaque axe :
- title : titre de section évocateur (3-5 mots)
- choiceText : action ou intention du lecteur (6-10 mots, commence par un verbe à l'infinitif, NE RÉVÈLE PAS le résultat)
- summary : résumé du nœud (2 phrases) — ignoré si convergeTo est renseigné
- convergeTo : null OU l'id d'un nœud existant d'une autre branche si narrativement cohérent. UTILISE LA CONVERGENCE quand un choix ramène naturellement le lecteur vers une situation déjà vécue dans une autre branche (même lieu, même personnage, même enjeu). Exemple : si le nœud [nXXX] décrit "Luke rejoint la base rebelle" et que ce choix y mène logiquement, mets convergeTo="nXXX".
- isEnding : true/false
- endingType : "good"/"bad"/"neutral"/null

Réponds UNIQUEMENT avec ce tableau JSON, sans rien avant ni après :
[{"title":"...","choiceText":"...","summary":"...","convergeTo":null,"isEnding":false,"endingType":null},{"title":"...","choiceText":"...","summary":"...","convergeTo":null,"isEnding":false,"endingType":null}]`;

    try {
      const raw = await callClaude([{ role: "user", content: prompt }], 600, null);
      // Parsing robuste : premier [ au dernier ]
      const start = raw.indexOf("[");
      const end   = raw.lastIndexOf("]");
      if (start === -1 || end === -1 || end <= start) throw new Error("JSON introuvable dans la réponse");
      const axes = JSON.parse(raw.slice(start, end + 1));
      if (!Array.isArray(axes) || axes.length !== 2) throw new Error("Format invalide — attendu 2 axes");
      // Stocker les axes proposés dans le nœud
      setGybhNodes(prev => ({
        ...prev,
        [nodeId]: { ...prev[nodeId], pendingAxes: axes }
        // axeIncludes/axeExcludes intentionnellement conservés
      }));
      addLog("info", "GYBH", `✓ Axes générés pour nœud ${nodeId} (depth=${node.depth})`);
    } catch(e) {
      setError("Erreur axes : " + e.message);
      addLog("error", "GYBH", `✕ Axes échoués : ${e.message}`);
    }
    setGybhLoadingAxes(false);
  };

  // ── 4. Valider les axes d'un nœud et créer les nœuds enfants ──
  const validateGybhAxes = (nodeId) => {
    const node = gybhNodes[nodeId];
    const { pendingAxes, axeIncludes, axeExcludes } = node;
    if (!pendingAxes) return;

    const newNodes = { ...gybhNodes };
    const choices = [];
    const childDepth = node.depth + 1;
    const mustBeEnding = childDepth >= gybhMaxDepth; // ← enforcement dur de maxDepth

    pendingAxes.forEach((axe, i) => {
      if (axe.convergeTo && newNodes[axe.convergeTo]) {
        choices.push({ text: axe.choiceText, childId: axe.convergeTo });
        addLog("info", "GYBH", `↗ Convergence axe ${i+1} → ${axe.convergeTo}`);
      } else {
        const childId = newNodeId();
        const isEnding = mustBeEnding ? true : (axe.isEnding || false);
        const endingType = isEnding ? (axe.endingType || "neutral") : null;
        if (mustBeEnding && !axe.isEnding) {
          addLog("warn", "GYBH", `⚠ Nœud ${childId} forcé FIN (depth=${childDepth} >= maxDepth=${gybhMaxDepth})`);
        }
        newNodes[childId] = {
          id: childId, depth: childDepth, parentId: nodeId,
          choiceText: axe.choiceText, summary: axe.summary, title: axe.title || null, text: null,
          choices: isEnding ? [] : null,
          isEnding, endingType,
          pendingAxes: null, axeIncludes: ["", ""], axeExcludes: ["", ""],
          include: axeIncludes[i] || "", exclude: axeExcludes[i] || "",
          sectionNumber: null,
        };
        choices.push({ text: axe.choiceText, childId });
        addLog("info", "GYBH", `+ Nœud ${childId} créé (depth=${childDepth}${isEnding ? ", FIN" : ""})`);
      }
    });

    newNodes[nodeId] = { ...newNodes[nodeId], choices, pendingAxes: null };
    setGybhNodes(newNodes);

    const nextPending = Object.values(newNodes).find(n =>
      !n.isEnding && n.choices === null && n.id !== nodeId
    );
    setGybhPendingNode(nextPending?.id || null);
    if (!nextPending) {
      addLog("info", "GYBH", "✓ Squelette complet — tous les nœuds ont leurs axes");
    }
  };

  // ── 5. Générer le texte d'un nœud ──
  const generateGybhText = async (nodeId) => {
    setGybhWritingNode(nodeId); setError("");
    const node = gybhNodes[nodeId];
    const langInstr = langInstructions[language] || "Écris en français.";
    const styleHint = writingStyle ? `Style d'écriture : ${writingStyle}.\n${AUTHOR_STYLES[writingStyle] ? "Caractéristiques : " + AUTHOR_STYLES[writingStyle] : ""}` : "";

    // Contexte : chemin jusqu'à ce nœud (ancêtres uniquement, pas le nœud lui-même)
    const pathParts = [];
    let cur = node.parentId ? gybhNodes[node.parentId] : null;
    const visited = new Set();
    while (cur && !visited.has(cur.id)) {
      visited.add(cur.id);
      if (cur.text) pathParts.unshift(cur.text.slice(0, 400));
      cur = cur.parentId ? gybhNodes[cur.parentId] : null;
    }

    const isRoot = nodeId === gybhRootId;
    const secWT = { micro: 500, flash: 1000, short: 2000, long: 5000 }[duration] || 300;
    const wordTarget = isRoot ? Math.round(secWT * 1.5) : secWT;
    const endingHint = node.isEnding
      ? `\nCe passage est une FIN (${node.endingType === "good" ? "heureuse" : node.endingType === "bad" ? "tragique" : "neutre"}). Conclus l'histoire de façon satisfaisante.`
      : `\nTermine ce passage par une phrase de transition naturelle. Les choix disponibles seront :\n${(node.choices || []).map((c, i) => `- Option ${i+1} : "${c.text}"`).join("\n")}`;

    const prompt = `${langInstr}
${styleHint}
${node.include ? `Inclure dans ce passage : ${node.include}` : ""}
${node.exclude ? `Éviter dans ce passage : ${node.exclude}` : ""}

CONTEXTE NARRATIF (chemin parcouru) :
${pathParts.join("\n\n---\n\n") || "(début de l'histoire)"}

RÉSUMÉ DE CE PASSAGE :
${node.summary}
${endingHint}

Écris ce passage d'environ ${wordTarget} mots. IMPORTANT : commence directement l'action de ce passage, sans reprendre ni résumer les événements précédents. Écris UNIQUEMENT le texte narratif, sans titre ni numéro de section.`;

    try {
      const maxTok = Math.max(400, Math.round(wordTarget * 2.2));
      const timeoutMs = maxTok < 800 ? 60000 : 120000;
      const text = await callClaude([{ role: "user", content: prompt }], maxTok, timeoutMs, 2, true);
      if (!text?.trim()) throw new Error("Réponse vide");
      setGybhNodes(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], text: text.trim() } }));
      addLog("info", "GYBH", `✓ Texte généré pour ${nodeId} (~${text.split(/\s+/).filter(Boolean).length} mots)`);
    } catch(e) {
      setError("Erreur génération : " + e.message);
      addLog("error", "GYBH", `✕ Texte échoué ${nodeId} : ${e.message}`);
    }
    setGybhWritingNode(null);
  };

  // ── Générer tous les textes manquants ──

  // ── Mode simple : génération entièrement automatique ──────────────
  const DEPTH_FOR_DURATION = { micro: 3, flash: 4, short: 5, long: 6 };

  const generateGybhAuto = async () => {
    const autoDepth = DEPTH_FOR_DURATION[duration] || 3;
    const autoMaxEndings = GYBH_ENDINGS_FOR_DEPTH[autoDepth] || GYBH_MAX_ENDINGS;
    setGybhMaxDepth(autoDepth);
    setGybhPhase("skeleton"); // passer en mode GYBH actif

    const langInstr = langInstructions[language] || "Écris en français.";
    const genreStr  = buildGenreStr(genres, genreWeights);
    const narratorStr = narratorLabels[narrator] || "troisième personne";

    try {
      // ── Étape 1 : Trame ──────────────────────────────
      setGybhProgress({ step: "Création de la trame…", pct: 5 });
      const framePrompt = `${langInstr}
Genre(s) : ${genreStr}
Point de vue : ${narratorStr}${initInclude ? `
Éléments à inclure : ${initInclude}` : ""}${initExclude ? `
Éléments à éviter : ${initExclude}` : ""}
Crée la trame d'un livre interactif "Dont vous êtes le Héros" (${autoDepth} niveaux, max ${GYBH_MAX_ENDINGS} fins).
Réponds UNIQUEMENT avec ce JSON, sans aucun texte avant ni après :
{"title":"...","pitch":"...","hero":"...","stakes":"...","opening":"..."}
Contraintes : title=4-6 mots, pitch=2-3 phrases, hero=1-2 phrases, stakes=1 phrase, opening=2-3 phrases.`;

      const frameRaw = await callClaude([{ role: "user", content: framePrompt }], 500, null);
      const fs = frameRaw.indexOf("{"); const fe = frameRaw.lastIndexOf("}");
      if (fs === -1 || fe === -1) {
        const isNsfw = genres.includes("erotic");
        if (isNsfw) throw new Error("Le contenu érotique ne peut pas être généré dans cet environnement. Essayez un autre genre.");
        throw new Error("Trame : JSON introuvable — réponse inattendue du modèle");
      }
      const frame = JSON.parse(frameRaw.slice(fs, fe + 1));
      if (!frame.title || !frame.pitch) throw new Error("Trame : champs manquants");
      setGybhFrame(frame);
      setBookTitle(frame.title || "");

      // ── Étape 2 : Squelette complet ──────────────────
      setGybhProgress({ step: "Construction du squelette…", pct: 15 });

      // Créer le nœud racine
      const rootId = newNodeId();
      let nodes = {
        [rootId]: {
          id: rootId, depth: 0, parentId: null, choiceText: null,
          summary: frame.opening, title: frame.title || null, text: null, choices: null,
          isEnding: false, endingType: null, sectionNumber: null,
          pendingAxes: null, axeIncludes: ["",""], axeExcludes: ["",""],
          include: "", exclude: "",
        }
      };
      setGybhRootId(rootId);
      setGybhNodes(nodes);

      // Générer les axes nœud par nœud (BFS) jusqu'à la profondeur max
      const queue = [rootId];
      // Estimation indicative
      const totalNodes = Math.pow(2, autoDepth - 1) - 1 || 1;
      let processed = 0;
      const nodeRetries = {};

      while (queue.length > 0) {
        const nodeId = queue.shift();
        const node = nodes[nodeId];
        if (!node || node.isEnding) continue;
        processed++;
        const pct = 15 + Math.min(45, Math.round((processed / Math.max(totalNodes, processed + queue.length)) * 45));
        setGybhProgress({ step: `Squelette — nœud ${processed} (${queue.length} en attente)…`, pct });

        // Générer les axes — nodesSummary limité aux nœuds pertinents
        const allNodesArr = Object.values(nodes);
        const ancIds = new Set();
        let ancCur = node;
        while (ancCur) { ancIds.add(ancCur.id); ancCur = ancCur.parentId ? nodes[ancCur.parentId] : null; }
        const nodesSummary = allNodesArr
          .filter(n => ancIds.has(n.id) || n.depth <= 1 || n.isEnding)
          .map(n => `[${n.id}] depth=${n.depth} "${n.summary?.slice(0,80)||"—"}"${n.isEnding?" (FIN)":""}`)
          .join("\n");
        const endingsLeft = autoMaxEndings - Object.values(nodes).filter(n => n.isEnding).length;
        const isNearMax = node.depth >= autoDepth - 1;
        const pathToNode = [];
        let cur = node;
        while (cur) { pathToNode.unshift(cur.summary || ""); cur = cur.parentId ? nodes[cur.parentId] : null; }

        const axesPrompt = `${langInstr}
CONTEXTE : Trame="${frame.pitch}" Enjeu="${frame.stakes}"
NŒUDS EXISTANTS :
${nodesSummary}
CHEMIN : ${pathToNode.map((s,i)=>`Niv${i}:${s.slice(0,60)}`).join(" → ")}
NŒUD ACTUEL (depth=${node.depth}/${autoDepth}) : ${node.summary}
CONTRAINTES : fins restantes=${endingsLeft}, fins max=${autoMaxEndings}, profondeur max=${autoDepth}
${isNearMax ? "CE NŒUD EST AU DERNIER NIVEAU : les 2 axes DOIVENT être des FINS (isEnding:true)" : ""}
Propose 2 axes contrastés. Réponds UNIQUEMENT avec ce JSON :
[{"title":"...","choiceText":"...","summary":"...","convergeTo":null,"isEnding":false,"endingType":null},{"title":"...","choiceText":"...","summary":"...","convergeTo":null,"isEnding":false,"endingType":null}]
Règle : "title" = titre de section court et évocateur (3-5 mots), "choiceText" = action ou intention du lecteur (6-10 mots, commence par un verbe à l'infinitif, NE RÉVÈLE PAS le résultat).`;

        try {
          const axRaw = await callClaude([{ role: "user", content: axesPrompt }], 600, 90000);
          const as = axRaw.indexOf("["); const ae = axRaw.lastIndexOf("]");
          if (as === -1 || ae === -1) throw new Error("Axes JSON introuvable");
          const axes = JSON.parse(axRaw.slice(as, ae + 1));
          if (!Array.isArray(axes) || axes.length !== 2) throw new Error("Format axes invalide");

          // CRUCIAL : forcer isEnding selon la profondeur — Claude ne doit pas terminer des branches prématurément
          axes.forEach(axe => {
            if (!isNearMax) { axe.isEnding = false; axe.endingType = null; }
            if (isNearMax) { axe.isEnding = true; if (!axe.endingType) axe.endingType = "neutral"; }
          });

          const choices = [];
          axes.forEach(axe => {
            if (axe.convergeTo && nodes[axe.convergeTo]) {
              choices.push({ text: axe.choiceText, childId: axe.convergeTo });
            } else {
              const childId = newNodeId();
              nodes[childId] = {
                id: childId, depth: node.depth + 1, parentId: nodeId,
                choiceText: axe.choiceText, summary: axe.summary, title: axe.title || null, text: null,
                choices: axe.isEnding ? [] : null,
                isEnding: axe.isEnding, endingType: axe.endingType || null,
                pendingAxes: null, axeIncludes: ["",""], axeExcludes: ["",""],
                include: "", exclude: "", sectionNumber: null,
              };
              choices.push({ text: axe.choiceText, childId });
              if (!axe.isEnding) queue.push(childId);
            }
          });
          nodes[nodeId] = { ...nodes[nodeId], choices };
          setGybhNodes({ ...nodes });
        } catch(e) {
          nodeRetries[nodeId] = (nodeRetries[nodeId] || 0) + 1;
          if (nodeRetries[nodeId] < 2) {
            addLog("warn", "GYBH", `⚠ Axes auto nœud ${nodeId} : ${e.message} — retry (${nodeRetries[nodeId]}/2)`);
            queue.push(nodeId);
            processed--;
          } else {
            addLog("warn", "GYBH", `✕ Axes auto nœud ${nodeId} abandonné après 2 tentatives`);
          }
        }
      }

      setGybhNodes({ ...nodes });
      addLog("info", "GYBH", `✓ Squelette auto — ${Object.keys(nodes).length} nœuds`);

      // ── Étape 3 : Textes ─────────────────────────────
      // IMPORTANT : on travaille directement sur l'objet local `nodes` pour éviter
      // les stale closures (generateGybhText lirait un state React périmé dans la boucle)

      // Chaque section reçoit la taille choisie par l'utilisateur.
      // L'intro (nœud racine) est un peu plus longue pour planter le décor.
      // Le total global s'additionne naturellement selon les choix du lecteur.
      const sectionWordTarget = { micro: 500, flash: 1000, short: 2000, long: 5000 }[duration] || 300;
      const introWordTarget   = sectionWordTarget; // même longueur que les autres sections

      const pending = Object.values(nodes).filter(n => !n.text);
      const total = pending.length;
      for (let i = 0; i < total; i++) {
        const node = pending[i];
        const pct = 60 + Math.round((i / total) * 38);
        setGybhProgress({ step: `Écriture passage ${i+1}/${total}…`, pct });
        setGybhWritingNode(node.id);
        try {
          const langInstr = langInstructions[language] || "Écris en français.";
          const styleHint = writingStyle ? `Style d'écriture : ${writingStyle}.\n${AUTHOR_STYLES[writingStyle] ? "Caractéristiques : " + AUTHOR_STYLES[writingStyle] : ""}` : "";

          // Le nœud racine = intro longue, les autres = taille proportionnelle
          const isRoot = node.id === rootId;
          const wordTarget = isRoot ? introWordTarget : sectionWordTarget;

          // Chemin narratif : on lit depuis l'objet local `nodes` (ancêtres uniquement, pas le nœud lui-même)
          const pathParts = [];
          let cur = node.parentId ? nodes[node.parentId] : null;
          const visited = new Set();
          while (cur && !visited.has(cur.id)) {
            visited.add(cur.id);
            if (cur.text) pathParts.unshift(cur.text.slice(0, 500));
            cur = cur.parentId ? nodes[cur.parentId] : null;
          }

          const endingHint = node.isEnding
            ? `\nCe passage est une FIN (${node.endingType === "good" ? "heureuse" : node.endingType === "bad" ? "tragique" : "neutre"}). Conclus l'histoire de façon satisfaisante et mémorable.`
            : `\nTermine ce passage sur une situation concrète qui appelle naturellement le choix. Les choix proposés seront :\n${(node.choices || []).map((c, idx) => `- Option ${idx+1} : "${c.text}"`).join("\n")}`;

          const introHint = isRoot
            ? `\nC'est l'INTRODUCTION du livre : plante le décor, présente le héros et l'enjeu principal de façon immersive. Ne mentionne pas les options — termine sur un moment de tension ou de cliffhanger qui appelle une décision.`
            : "";

          const prompt = `${langInstr}
${styleHint}
${node.include ? `Inclure dans ce passage : ${node.include}` : ""}
${node.exclude ? `Éviter dans ce passage : ${node.exclude}` : ""}

TRAME GÉNÉRALE : ${frame.pitch}
ENJEU : ${frame.stakes}${buildGybhSourceHint()}

CONTEXTE NARRATIF (passages précédents — ne pas répéter, continuer directement) :
${pathParts.join("\n\n---\n\n") || "(début de l'histoire)"}

RÉSUMÉ DE CE PASSAGE :
${node.summary}
${introHint}
${endingHint}

Écris ce passage d'environ ${wordTarget} mots. IMPORTANT : commence directement l'action de ce passage, sans reprendre ni résumer les événements précédents. Écris UNIQUEMENT le texte narratif, sans titre ni numéro de section.`;

          const maxTok = Math.max(400, Math.round(wordTarget * 2.2));
          const timeoutMs = maxTok < 800 ? 60000 : 120000;
          const text = await callClaude([{ role: "user", content: prompt }], maxTok, timeoutMs, 0, false);
          if (!text?.trim()) throw new Error("Réponse vide");

          // Mettre à jour l'objet local ET le state React
          nodes[node.id] = { ...nodes[node.id], text: text.trim() };
          setGybhNodes({ ...nodes });
          addLog("info", "GYBH", `✓ Texte généré pour ${node.id} (~${text.split(/\s+/).filter(Boolean).length} mots, cible: ${wordTarget})`);
        } catch(e) {
          addLog("warn", "GYBH", `⚠ Texte auto nœud ${node.id} : ${e.message}`);
        }
      }

      setGybhWritingNode(null);
      const failedNodes = Object.values(nodes).filter(n => !n.text);
      if (failedNodes.length > 0) {
        setGybhProgress({ step: `⚠ ${Object.keys(nodes).length - failedNodes.length}/${Object.keys(nodes).length} passages générés — ${failedNodes.length} échoué(s)`, pct: 100 });
        setGybhPhase("writing_failed");
        addLog("warn", "GYBH", `⚠ Génération partielle — ${failedNodes.length} passage(s) manquant(s). Utilisez "↺ Relancer" pour compléter.`);
      } else {
        setGybhProgress({ step: "Livre prêt !", pct: 100 });
        setGybhPhase("reading");
        addLog("info", "GYBH", `✓ Livre LDVELH généré — ${Object.keys(nodes).length} sections`);
      }

    } catch(e) {
      setError("Erreur génération auto : " + e.message);
      addLog("error", "GYBH", `✕ Génération auto échouée : ${e.message}`);
      setGybhProgress({ step: "", pct: 0 });
    }
  };


  const generateAllGybhTexts = async () => {
    const pending = Object.values(gybhNodes).filter(n => !n.text);
    const total = pending.length;
    addLog("info", "GYBH", `Génération de ${total} passages…`);
    setGybhProgress({ step: `Écriture — passage 0/${total}`, pct: 0 });
    let done = 0; let failed = 0;
    for (const node of pending) {
      setGybhProgress({ step: `Écriture — passage ${done + 1}/${total}`, pct: Math.round(((done) / total) * 100) });
      addLog("info", "GYBH", `⟳ Passage ${done + 1}/${total} — nœud ${node.id.slice(-6)}`);
      try {
        await generateGybhText(node.id);
        done++;
      } catch(e) {
        failed++;
        addLog("error", "GYBH", `✕ Passage ${node.id.slice(-6)} échoué (${e.message}) — passage au suivant`);
      }
    }
    setGybhProgress({ step: failed > 0 ? `⚠ ${done}/${total} passages générés — ${failed} échoué(s)` : "Livre prêt !", pct: 100 });
    if (failed > 0) {
      setGybhPhase("writing_failed");
      addLog("warn", "GYBH", `⚠ ${done}/${total} passages générés — ${failed} échec(s). Utilisez "↺ Relancer" pour compléter.`);
    } else {
      setGybhPhase("reading");
      addLog("info", "GYBH", `✓ Tous les ${total} passages générés — livre prêt`);
    }
  };

  const retryFailedGybhNodes = async () => {
    const failed = Object.values(gybhNodes).filter(n => !n.text);
    if (!failed.length) { setGybhPhase("reading"); return; }
    const total = failed.length;
    addLog("info", "GYBH", `↺ Relance de ${total} passage(s) manquant(s)…`);
    setGybhPhase("writing");
    setGybhProgress({ step: `Relance — 0/${total}…`, pct: 0 });

    // Travailler sur une copie locale pour éviter les stale closures
    let nodes = { ...gybhNodes };
    let done = 0; let stillFailed = 0;

    for (const node of failed) {
      setGybhProgress({ step: `Relance — passage ${done + 1}/${total}…`, pct: Math.round((done / total) * 100) });
      setGybhWritingNode(node.id);
      try {
        const langInstr = langInstructions[choices?.language || language] || "Écris en français.";
        const styleHint = choices?.writingStyle ? `Style d'écriture : ${choices.writingStyle}.\n${AUTHOR_STYLES[choices.writingStyle] ? "Caractéristiques : " + AUTHOR_STYLES[choices.writingStyle] : ""}` : "";
        const frame = gybhFrame;
        const isRoot = node.id === gybhRootId;

        const sectionWT = { micro: 500, flash: 1000, short: 2000, long: 5000 }[choices?.duration || duration] || 300;
        const introWordTarget = sectionWT;
        const sectionWordTarget = sectionWT;
        const wordTarget = isRoot ? introWordTarget : sectionWordTarget;

        const pathParts = [];
        let cur = node.parentId ? nodes[node.parentId] : null;
        const visited = new Set();
        while (cur && !visited.has(cur.id)) {
          visited.add(cur.id);
          if (nodes[cur.id]?.text) pathParts.unshift(nodes[cur.id].text.slice(0, 500));
          cur = cur.parentId ? nodes[cur.parentId] : null;
        }

        const endingHint = node.isEnding
          ? `\nCe passage est une FIN (${node.endingType === "good" ? "heureuse" : node.endingType === "bad" ? "tragique" : "neutre"}). Conclus l'histoire de façon satisfaisante et mémorable.`
          : `\nTermine ce passage sur une situation concrète qui appelle naturellement le choix. Les choix proposés seront :\n${(node.choices || []).map((c, idx) => `- Option ${idx+1} : "${c.text}"`).join("\n")}`;

        const introHint = isRoot ? `\nC'est l'INTRODUCTION du livre : plante le décor, présente le héros et l'enjeu principal de façon immersive. Ne mentionne pas les options — termine sur un moment de tension ou de cliffhanger.` : "";

        const prompt = `${langInstr}
${styleHint}
TRAME GÉNÉRALE : ${frame?.pitch || ""}
ENJEU : ${frame?.stakes || ""}

CONTEXTE NARRATIF (passages précédents — ne pas répéter, continuer directement) :
${pathParts.join("\n\n---\n\n") || "(début de l'histoire)"}

RÉSUMÉ DE CE PASSAGE :
${node.summary}
${introHint}
${endingHint}

Écris ce passage d'environ ${wordTarget} mots. IMPORTANT : commence directement l'action de ce passage, sans reprendre ni résumer les événements précédents. Écris UNIQUEMENT le texte narratif, sans titre ni numéro de section.`;

        const maxTok = Math.max(400, Math.round(wordTarget * 2.2));
        const text = await callClaude([{ role: "user", content: prompt }], maxTok, 90000, 1, true);
        if (!text?.trim()) throw new Error("Réponse vide");
        nodes[node.id] = { ...nodes[node.id], text: text.trim() };
        setGybhNodes({ ...nodes });
        addLog("info", "GYBH", `✓ Passage relancé : ${node.id} (~${text.split(/\s+/).filter(Boolean).length} mots)`);
        done++;
      } catch(e) {
        stillFailed++;
        addLog("warn", "GYBH", `⚠ Relance échouée : ${node.id} — ${e.message}`);
      }
    }

    setGybhWritingNode(null);
    const remaining = Object.values(nodes).filter(n => !n.text).length;
    if (remaining > 0) {
      setGybhPhase("writing_failed");
      setGybhProgress({ step: `⚠ ${done} relancé(s), ${remaining} encore manquant(s)`, pct: 100 });
      addLog("warn", "GYBH", `⚠ Relance partielle — ${remaining} passage(s) encore manquant(s)`);
    } else {
      setGybhPhase("reading");
      setGybhProgress({ step: "Livre prêt !", pct: 100 });
      addLog("info", "GYBH", `✓ Tous les passages relancés avec succès — livre prêt`);
    }
  };


  const exportGybhHtml = () => {
    // Parcours BFS pour numéroter
    const ordered = [];
    const queue = [gybhRootId];
    const visited = new Set();
    while (queue.length) {
      const id = queue.shift();
      if (visited.has(id) || !gybhNodes[id]) continue;
      visited.add(id);
      ordered.push(id);
      const node = gybhNodes[id];
      (node.choices || []).forEach(c => { if (!visited.has(c.childId)) queue.push(c.childId); });
    }
    // Assigner les numéros
    const numMap = {};
    ordered.forEach((id, i) => { numMap[id] = i + 1; });

    const title = bookTitle || "Livre dont vous êtes le héros";
    const genreStr = buildGenreStr(genres, genreWeights);

    const sections = ordered.map(id => {
      const node = gybhNodes[id];
      const num = numMap[id];
      const endingBadge = node.isEnding
        ? `<div class="ending-badge ${node.endingType || 'neutral'}">${node.endingType === "good" ? "★ Fin heureuse" : node.endingType === "bad" ? "✦ Fin tragique" : "◆ Fin"}</div>`
        : "";
      const choicesHtml = (!node.isEnding && node.choices?.length)
        ? `<div class="choices">${node.choices.map(c =>
            `<a href="#s${numMap[c.childId]}" class="choice-link">→ ${c.text} <span class="goto">(§${numMap[c.childId]})</span></a>`
          ).join("")}</div>`
        : "";
      const text = (node.text || node.summary || "").split("\n\n")
        .map(p => p.trim() ? `<p>${p.trim()}</p>` : "").join("");
      return `<section id="s${num}">
  <h2 class="section-num">${num}${node.title ? ` <span class="section-title">— ${node.title}</span>` : ""}</h2>
  ${text}
  ${endingBadge}
  ${choicesHtml}
</section>`;
    }).join("\n\n");

    const html = `<!DOCTYPE html>
<html lang="${language === 'french' ? 'fr' : language.slice(0,2)}">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0908; color: #e8d5a8; font-family: Georgia, serif; max-width: 720px; margin: 0 auto; padding: 2rem 1.5rem 4rem; line-height: 1.9; font-size: 1.05rem; }
  h1 { color: #c9a96e; font-size: 2rem; text-align: center; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
  .meta { text-align: center; color: #5a4a38; font-size: 0.8rem; margin-bottom: 3rem; font-style: italic; }
  section { border-top: 1px solid #2a2520; padding: 2rem 0; }
  h2.section-num { color: #c9a96e; font-size: 1.5rem; text-align: center; margin-bottom: 1.5rem; letter-spacing: 0.3em; opacity: 0.8; }
  h2.section-num .section-title { font-size: 1.1rem; font-style: italic; letter-spacing: 0.05em; opacity: 0.9; }
  p { margin-bottom: 1.2rem; }
  .choices { margin-top: 1.5rem; border-top: 1px dashed #3a3028; padding-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .choice-link { display: block; color: #8abcce; text-decoration: none; font-size: 0.9rem; padding: 0.5rem 0.75rem; border: 1px solid #2a3a4a; border-radius: 3px; transition: all 0.15s; }
  .choice-link:hover { background: rgba(138,188,206,0.08); border-color: #8abcce; }
  .goto { color: #4a6a7a; font-size: 0.8rem; }
  .ending-badge { text-align: center; margin-top: 1rem; font-size: 0.85rem; letter-spacing: 0.2em; opacity: 0.7; }
  .ending-badge.good { color: #7ec87e; }
  .ending-badge.bad { color: #c86060; }
  .ending-badge.neutral { color: #c9a96e; }
  nav.toc { background: #0f0e11; border: 1px solid #2a2520; border-radius: 4px; padding: 1rem 1.5rem; margin-bottom: 3rem; }
  nav.toc h3 { color: #c9a96e; font-size: 0.75rem; letter-spacing: 0.25em; margin-bottom: 0.75rem; }
  nav.toc a { display: block; color: #7a6a50; font-size: 0.75rem; text-decoration: none; padding: 0.15rem 0; }
  nav.toc a:hover { color: #c9a96e; }
</style>
</head>
<body>
<h1>${title}</h1>
<div class="meta">${genreStr} · ${ordered.length} sections · ${Object.values(gybhNodes).filter(n=>n.isEnding).length} fins</div>

<nav class="toc">
  <h3>✦ TABLE DES SECTIONS</h3>
  ${ordered.map(id => {
    const node = gybhNodes[id];
    const num = numMap[id];
    return `<a href="#s${num}">${num}. ${node.choiceText || title}${node.isEnding ? " ★" : ""}</a>`;
  }).join("\n  ")}
</nav>

${sections}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s\-_]/g, "").trim() || "livre-interactif";
    a.href = url; a.download = `${safeName}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    addLog("info", "GYBH", `✓ Export HTML — ${ordered.length} sections`);
  };

  // ── Export EPUB interactif LDVELH ─────────────────────────────────
  const exportGybhEpub = async () => {
    // BFS ordering
    const ordered = [];
    const queue = [gybhRootId];
    const visited = new Set();
    while (queue.length) {
      const id = queue.shift();
      if (visited.has(id) || !gybhNodes[id]) continue;
      visited.add(id);
      ordered.push(id);
      (gybhNodes[id].choices || []).forEach(c => { if (!visited.has(c.childId)) queue.push(c.childId); });
    }
    const numMap = {};
    ordered.forEach((id, i) => { numMap[id] = i + 1; });

    const title = bookTitle || "Récit dont vous êtes le héros";
    const authorStr = authorName || "Atelier des Récits";
    const genreStr = buildGenreStr(genres, genreWeights);
    const uid = `urn:uuid:gybh-${Date.now()}`;

    // Build XHTML for each section
    const buildSectionXhtml = (id) => {
      const node = gybhNodes[id];
      const num = numMap[id];
      const paras = (node.text || node.summary || "").split("\n\n").filter(p => p.trim()).map(p => `    <p>${p.trim().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>`).join("\n");
      const endingBadge = node.isEnding
        ? `\n    <p class="ending">${node.endingType === "good" ? "★ Fin heureuse" : node.endingType === "bad" ? "✦ Fin tragique" : "◆ Fin"}</p>`
        : "";
      const choicesXhtml = (!node.isEnding && node.choices?.length)
        ? `\n    <div class="choices">\n${node.choices.map(c => `      <a href="s${numMap[c.childId]}.xhtml" class="choice">→ ${c.text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")} <span class="goto">(§${numMap[c.childId]})</span></a>`).join("\n")}\n    </div>`
        : "";
      return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>§${num}${node.title ? ` — ${node.title}` : ""}</title>
  <link rel="stylesheet" type="text/css" href="../Styles/style.css"/>
</head>
<body>
  <div class="section-header">
    <span class="section-num">§ ${num}</span>${node.title ? `\n    <span class="section-title"> — ${node.title.replace(/&/g,"&amp;")}</span>` : ""}
  </div>
${paras}${endingBadge}${choicesXhtml}
  <p class="back-top"><a href="../Text/toc.xhtml">↑ Table des sections</a></p>
</body>
</html>`;
    };

    // TOC XHTML
    const tocXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>${title.replace(/&/g,"&amp;")} — Table des sections</title>
  <link rel="stylesheet" type="text/css" href="../Styles/style.css"/>
</head>
<body>
  <h1>${title.replace(/&/g,"&amp;")}</h1>
  <p class="meta">${genreStr} · ${ordered.length} sections · ${Object.values(gybhNodes).filter(n=>n.isEnding).length} fins</p>
  <nav class="toc">
    <h2>✦ TABLE DES SECTIONS</h2>
${ordered.map(id => {
  const node = gybhNodes[id];
  const num = numMap[id];
  return `    <p><a href="s${num}.xhtml">§${num}. ${(node.choiceText || node.title || title).replace(/&/g,"&amp;")}${node.isEnding ? " ★" : ""}</a></p>`;
}).join("\n")}
  </nav>
</body>
</html>`;

    // CSS
    const css = `body { background: #0a0908; color: #e8d5a8; font-family: Georgia, serif; max-width: 680px; margin: 0 auto; padding: 2rem 1.5rem 4rem; line-height: 1.9; font-size: 1.05rem; }
h1 { color: #c9a96e; font-size: 1.8rem; text-align: center; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
.meta { text-align: center; color: #5a4a38; font-size: 0.8rem; margin-bottom: 2rem; font-style: italic; }
.section-header { text-align: center; margin-bottom: 1.5rem; border-bottom: 1px solid #2a2520; padding-bottom: 0.75rem; }
.section-num { color: #c9a96e; font-size: 1.4rem; letter-spacing: 0.3em; }
.section-title { color: #a08060; font-size: 1rem; font-style: italic; }
p { margin-bottom: 1.2rem; }
.choices { margin-top: 1.5rem; border-top: 1px dashed #3a3028; padding-top: 1rem; }
a.choice { display: block; color: #8abcce; text-decoration: none; font-size: 0.92rem; padding: 0.45rem 0.75rem; margin-bottom: 0.4rem; border: 1px solid #2a3a4a; border-radius: 3px; }
.goto { color: #4a6a7a; font-size: 0.8rem; }
.ending { text-align: center; margin-top: 1rem; font-size: 0.85rem; letter-spacing: 0.2em; opacity: 0.7; color: #c9a96e; }
.back-top { text-align: center; font-size: 0.72rem; margin-top: 2rem; opacity: 0.4; }
.back-top a { color: #8a7a60; text-decoration: none; }
nav.toc { background: #0f0e11; border: 1px solid #2a2520; border-radius: 4px; padding: 1rem 1.5rem; margin-top: 1.5rem; }
nav.toc h2 { color: #c9a96e; font-size: 0.75rem; letter-spacing: 0.25em; margin-bottom: 0.75rem; }
nav.toc a { color: #7a6a50; text-decoration: none; font-size: 0.78rem; }`;

    // NCX
    const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${title.replace(/&/g,"&amp;")}</text></docTitle>
  <navMap>
    <navPoint id="toc" playOrder="1">
      <navLabel><text>Table des sections</text></navLabel>
      <content src="Text/toc.xhtml"/>
    </navPoint>
${ordered.map((id, i) => {
  const node = gybhNodes[id];
  const num = numMap[id];
  return `    <navPoint id="s${num}" playOrder="${i+2}">
      <navLabel><text>§${num}${node.title ? ` — ${node.title.replace(/&/g,"&amp;")}` : ""}</text></navLabel>
      <content src="Text/s${num}.xhtml"/>
    </navPoint>`;
}).join("\n")}
  </navMap>
</ncx>`;

    // OPF
    const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${title.replace(/&/g,"&amp;")}</dc:title>
    <dc:creator>${authorStr.replace(/&/g,"&amp;")}</dc:creator>
    <dc:language>${language === "french" ? "fr" : language.slice(0,2)}</dc:language>
    <dc:identifier id="bookid">${uid}</dc:identifier>
    <dc:description>Récit dont vous êtes le héros — ${genreStr}</dc:description>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="Styles/style.css" media-type="text/css"/>
    <item id="toc-page" href="Text/toc.xhtml" media-type="application/xhtml+xml"/>
${ordered.map(id => {
  const num = numMap[id];
  return `    <item id="s${num}" href="Text/s${num}.xhtml" media-type="application/xhtml+xml"/>`;
}).join("\n")}
  </manifest>
  <spine toc="ncx">
    <itemref idref="toc-page"/>
${ordered.map(id => `    <itemref idref="s${numMap[id]}"/>`).join("\n")}
  </spine>
</package>`;

    // Build ZIP (EPUB is a ZIP)
    // We'll use JSZip via CDN-free approach — build the zip manually using a minimal zip writer
    const files = {};
    files["mimetype"] = "application/epub+zip";
    files["META-INF/container.xml"] = `<?xml version="1.0" encoding="UTF-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n  </rootfiles>\n</container>`;
    files["OEBPS/content.opf"] = opf;
    files["OEBPS/toc.ncx"] = ncx;
    files["OEBPS/Styles/style.css"] = css;
    files["OEBPS/Text/toc.xhtml"] = tocXhtml;
    ordered.forEach(id => { files[`OEBPS/Text/s${numMap[id]}.xhtml`] = buildSectionXhtml(id); });

    // Minimal ZIP builder (no compression, store only)
    const enc = new TextEncoder();
    const parts_zip = [];
    const centralDir = [];
    let offset = 0;

    const crc32 = (data) => {
      let crc = 0xFFFFFFFF;
      const table = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        table[i] = c;
      }
      for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
      return (crc ^ 0xFFFFFFFF) >>> 0;
    };
    const u16 = (n) => { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; };
    const u32 = (n) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };
    const concat = (...arrs) => { const total = arrs.reduce((s,a)=>s+a.length,0); const out = new Uint8Array(total); let p=0; arrs.forEach(a=>{out.set(a,p);p+=a.length;}); return out; };

    for (const [name, content] of Object.entries(files)) {
      const nameBytes = enc.encode(name);
      const dataBytes = typeof content === "string" ? enc.encode(content) : content;
      const crc = crc32(dataBytes);
      const local = concat(
        new Uint8Array([0x50,0x4B,0x03,0x04]), // sig
        u16(20), u16(0), u16(0), // version, flags, method (store)
        u16(0), u16(0), // mod time, mod date
        u32(crc), u32(dataBytes.length), u32(dataBytes.length),
        u16(nameBytes.length), u16(0),
        nameBytes, dataBytes
      );
      centralDir.push({ nameBytes, crc, size: dataBytes.length, offset });
      parts_zip.push(local);
      offset += local.length;
    }

    const cdEntries = centralDir.map(({nameBytes, crc, size, offset: off}) => concat(
      new Uint8Array([0x50,0x4B,0x01,0x02]),
      u16(20), u16(20), u16(0), u16(0),
      u16(0), u16(0),
      u32(crc), u32(size), u32(size),
      u16(nameBytes.length), u16(0), u16(0),
      u16(0), u16(0), u32(0),
      u32(off), nameBytes
    ));
    const cdSize = cdEntries.reduce((s,e)=>s+e.length,0);
    const eocd = concat(
      new Uint8Array([0x50,0x4B,0x05,0x06,0,0,0,0]),
      u16(centralDir.length), u16(centralDir.length),
      u32(cdSize), u32(offset),
      u16(0)
    );
    const zipBytes = concat(...parts_zip, ...cdEntries, eocd);
    const blob = new Blob([zipBytes], { type: "application/epub+zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s\-_]/g,"").trim() || "livre-interactif";
    a.href = url; a.download = `${safeName}.epub`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    addLog("info", "GYBH", `✓ Export EPUB — ${ordered.length} sections`);
  };

  // ── Export PDF interactif LDVELH (liens cliquables) ───────────────
  const exportGybhPdf = () => {
    // BFS
    const ordered = [];
    const queue = [gybhRootId];
    const visited = new Set();
    while (queue.length) {
      const id = queue.shift();
      if (visited.has(id) || !gybhNodes[id]) continue;
      visited.add(id);
      ordered.push(id);
      (gybhNodes[id].choices || []).forEach(c => { if (!visited.has(c.childId)) queue.push(c.childId); });
    }
    const numMap = {};
    ordered.forEach((id, i) => { numMap[id] = i + 1; });
    const title = bookTitle || "Récit dont vous êtes le héros";
    const genreStr = buildGenreStr(genres, genreWeights);

    // Build a self-contained HTML that prints as PDF with clickable internal links
    // Users open in browser and Ctrl+P → Print/Save as PDF (links preserved)
    const sections = ordered.map(id => {
      const node = gybhNodes[id];
      const num = numMap[id];
      const paras = (node.text || node.summary || "").split("\n\n").filter(p=>p.trim()).map(p=>`<p>${p.trim()}</p>`).join("");
      const endingBadge = node.isEnding
        ? `<div class="ending">${node.endingType === "good" ? "★ Fin heureuse" : node.endingType === "bad" ? "✦ Fin tragique" : "◆ Fin"}</div>`
        : "";
      const choicesHtml = (!node.isEnding && node.choices?.length)
        ? `<div class="choices">${node.choices.map(c =>
            `<a href="#s${numMap[c.childId]}" class="choice">→ ${c.text} <span class="goto">(§${numMap[c.childId]})</span></a>`
          ).join("")}</div>`
        : "";
      return `<div class="section" id="s${num}">
  <div class="snum">§ ${num}${node.title ? ` <span class="stitle">— ${node.title}</span>` : ""}</div>
  ${paras}${endingBadge}${choicesHtml}
</div>`;
    }).join("\n");

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page { size: A5; margin: 18mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; color: #1a1410; font-family: Georgia, serif; font-size: 10.5pt; line-height: 1.75; }
  .cover { page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; padding: 2rem; text-align: center; }
  .cover-label { font-size: 7pt; letter-spacing: 0.4em; color: #8a7a60; margin-bottom: 1.5rem; text-transform: uppercase; }
  .cover-title { font-size: 20pt; color: #2a1a08; letter-spacing: 0.05em; margin-bottom: 1rem; line-height: 1.3; }
  .cover-meta { font-size: 8pt; color: #8a7a60; font-style: italic; margin-top: 2rem; }
  .cover-rule { width: 60px; height: 1px; background: #c9a96e; margin: 1.5rem auto; }
  .toc { page-break-after: always; padding: 2rem 0; }
  .toc h2 { font-size: 8pt; letter-spacing: 0.3em; color: #8a7a60; margin-bottom: 1.5rem; border-bottom: 1px solid #ddd; padding-bottom: 0.75rem; }
  .toc-entry { font-size: 8.5pt; padding: 0.15rem 0; color: #3a2a18; }
  .toc-entry a { color: inherit; text-decoration: none; }
  .toc-entry a:hover { color: #c9a96e; }
  .section { page-break-before: always; padding-top: 1.5rem; }
  .snum { font-size: 13pt; color: #c9a96e; text-align: center; margin-bottom: 1.2rem; border-bottom: 1px solid #e8d5a8; padding-bottom: 0.5rem; letter-spacing: 0.15em; }
  .stitle { font-size: 9.5pt; font-style: italic; color: #8a7060; }
  p { margin-bottom: 0.9rem; text-align: justify; }
  .choices { margin-top: 1.2rem; border-top: 1px dashed #c9a96e55; padding-top: 0.75rem; }
  a.choice { display: block; font-size: 9pt; color: #2a5a7a; text-decoration: none; margin-bottom: 0.35rem; padding: 0.3rem 0.6rem; border: 0.5pt solid #9ac; border-radius: 2pt; }
  .goto { color: #6a9aac; font-size: 8pt; }
  .ending { text-align: center; margin-top: 1rem; font-size: 9pt; color: #8a6a50; letter-spacing: 0.15em; }
  @media print {
    a.choice { color: #2a5a7a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .snum { color: #c9a96e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  .print-hint { position: fixed; bottom: 1rem; right: 1rem; background: #1a1814; color: #c9a96e; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.72rem; font-family: sans-serif; opacity: 0.85; pointer-events: none; }
</style>
</head>
<body>
<div class="cover">
  <div class="cover-label">🎲 Récit dont vous êtes le héros</div>
  <div class="cover-rule"></div>
  <div class="cover-title">${title}</div>
  <div class="cover-rule"></div>
  <div class="cover-meta">${genreStr} · ${ordered.length} sections · ${Object.values(gybhNodes).filter(n=>n.isEnding).length} fins</div>
</div>

<div class="toc">
  <h2>✦ TABLE DES SECTIONS</h2>
  ${ordered.map(id => {
    const node = gybhNodes[id];
    const num = numMap[id];
    return `<div class="toc-entry"><a href="#s${num}">§${num}. ${node.choiceText || node.title || "…"}${node.isEnding ? " ★" : ""}</a></div>`;
  }).join("\n  ")}
</div>

${sections}

<div class="print-hint">Ctrl+P → Enregistrer en PDF pour conserver les liens</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s\-_]/g,"").trim() || "livre-interactif");
    a.href = url; a.download = `${safeName}-PDF.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    addLog("info", "GYBH", `✓ Export PDF-ready HTML — ${ordered.length} sections`);
  };

  const LANG_LABELS = {
    french: "Français", english: "English", spanish: "Español",
    german: "Deutsch", italian: "Italiano", portuguese: "Português",
    japanese: "日本語", chinese: "中文",
  };

  const translateBook = async (targetLang) => {
    if (!targetLang || targetLang === (choices?.language || language)) return;
    // Si déjà traduit dans cette langue, juste basculer
    if (translations[targetLang]) { setActiveLang(targetLang); setShowTranslatePanel(false); return; }

    setTranslating(true); setTranslateProgress(0); setError("");
    setShowTranslatePanel(false);
    const srcLang = LANG_LABELS[choices?.language || language] || "français";
    const tgtLang = LANG_LABELS[targetLang] || targetLang;
    const styleHint = choices?.writingStyle
      ? `\nRespects scrupuleusement le style littéraire de ${choices.writingStyle} dans la langue cible.`
      : "";
    const fingerprint = choices?.writingStyle ? AUTHOR_STYLES[choices.writingStyle] : null;
    const styleFull = fingerprint ? `\nCaractéristiques stylistiques à transposer : ${fingerprint}` : styleHint;

    addLog("info", "TRAD", `Traduction ${srcLang} → ${tgtLang} — ${parts.length} parties`);

    try {
      const translatedParts = [];
      for (let i = 0; i < parts.length; i++) {
        setTranslateProgress(Math.round((i / parts.length) * 90));
        const part = parts[i];
        const wordCount = part.text.split(/\s+/).filter(Boolean).length;
        const prompt = `Tu es un traducteur littéraire expert. Traduis le texte suivant du ${srcLang} vers le ${tgtLang}.${styleFull}

Règles impératives :
- Traduction littéraire, pas mot à mot — adapte les expressions idiomatiques, les tournures culturelles, le rythme
- Conserve la ponctuation narrative, les effets de style, les ellipses, les ruptures de rythme
- Ne traduis pas les noms propres de personnages ni de lieux
- Garde exactement la même structure de paragraphes
- Réponds UNIQUEMENT avec le texte traduit, sans commentaire ni titre

TEXTE À TRADUIRE :
${part.text}`;
        const maxTok = Math.min(Math.round(wordCount * 2.2), 6000);
        const translated = await callClaude([{ role: "user", content: prompt }], maxTok, null);
        if (!translated?.trim()) throw new Error(`Partie ${i+1} : réponse vide`);
        translatedParts.push({ ...part, text: translated.trim() });
        addLog("info", "TRAD", `✓ Partie ${i+1}/${parts.length} traduite`);
      }

      // Traduire le titre
      setTranslateProgress(93);
      let translatedTitle = bookTitle;
      if (bookTitle) {
        try {
          const titlePrompt = `Traduis ce titre de livre du ${srcLang} vers le ${tgtLang}. Réponds UNIQUEMENT avec le titre traduit, sans guillemets ni commentaire.\n\nTitre : ${bookTitle}`;
          const tt = await callClaude([{ role: "user", content: titlePrompt }], 60, null);
          if (tt?.trim()) translatedTitle = tt.trim();
        } catch(e) { addLog("warn", "TRAD", `⚠ Titre non traduit : ${e.message}`); }
      }

      setTranslateProgress(100);
      setTranslations(prev => ({ ...prev, [targetLang]: { parts: translatedParts, title: translatedTitle } }));
      setActiveLang(targetLang);
      addLog("info", "TRAD", `✓ Traduction ${tgtLang} complète — ${translatedParts.length} parties`);
    } catch(e) {
      addLog("error", "TRAD", `✕ Échec traduction : ${e.message}`);
      setError("Erreur traduction : " + e.message);
    } finally {
      setTranslating(false); setTranslateProgress(0);
    }
  };

  const reset = () => {
    try { localStorage.removeItem(autoSaveKey); } catch {}
    setParts([]); setChapters([]); setCurrentChapter(0); setChoices(null);
    setError(""); setEnded(false); setBookTitle(""); setEditingTitle(false);
    setSaveLink(null); setNextInclude(""); setNextExclude("");
    setGenres([]); setDuration(null); setNarrator(null);
    setWritingStyle(""); setImportText(""); setImportFileName(""); setImportAnalysis(null); setImportMode(false);
    setShowEndingPicker(false); setSelectedEnding(null);
    setBook(null); setShowBook(false); setAuthorName("");
    setNextNsfw(false); setNextWords(1000); setChapterSuggestion(null);
    setAxes(null); setPendingAction(null); setSelectedAxis(null); setIgnoreAxes(false); setLoadingAxes(false);
    setShowRewriteModal(false); setRewriteTargetStyle(""); setRewritingStyle(false);
    setTranslations({}); setActiveLang(null); setTranslating(false); setShowTranslatePanel(false); setTranslateTargetLang("");
    setBookMode("classic"); setGybhNodes({}); setGybhRootId(null); setGybhPhase("idle"); setGybhFrame(null);
    setGybhPendingNode(null); setGybhReadingNode(null); setGybhExpandedNodes({});
    setGybhGuide({ pitchInc:"", pitchDec:"", heroInc:"", heroDec:"", stakesInc:"", stakesDec:"", openingInc:"", openingDec:"" });
    setGybhProgress({ step: "", pct: 0 });
    setExpressModeRunning(false); setExpressSectionStep("");
  };

  // ── Auto-save toutes les 2 minutes si une histoire est en cours ──
  // ── Reconstruction automatique des blocs RAG à chaque changement de parts ──
  const rebuildBlocksTimerRef = useRef(null);
  const blocksRef = useRef([]);
  const partsFingerprintRef = useRef("");
  useEffect(() => {
    // Fingerprint basé sur le contenu de parts pour éviter les re-déclenchements inutiles
    const fingerprint = parts.map(p => p.text?.length + "|" + (p.chapterIdx ?? 0)).join(",");
    if (fingerprint === partsFingerprintRef.current) return; // rien n'a changé
    partsFingerprintRef.current = fingerprint;

    if (!parts.length) { setBlocks([]); blocksRef.current = []; return; }
    clearTimeout(rebuildBlocksTimerRef.current);
    rebuildBlocksTimerRef.current = setTimeout(() => {
      rebuildBlocks(parts, chapters, choices?.language || language, blocksRef.current);
    }, 1500);
    return () => clearTimeout(rebuildBlocksTimerRef.current);
  }, [parts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!parts.length) return; // rien à sauvegarder
    const autoSave = async () => {
      try {
        setAutoSaveStatus("saving");
        const snapshot = {
          version: 1, savedAt: new Date().toISOString(), auto: true,
          language, duration, narrator, genres, genreWeights, writingStyle, nsfwEnabled, authorName,
          parts, chapters, currentChapter, choices, ended, bookTitle,
          characters, locations,
        };
        localStorage.setItem(autoSaveKey, JSON.stringify(snapshot));
        setAutoSaveStatus("saved");
        addLog("info", "PROJECT", "✓ Auto-save effectué");
        setTimeout(() => setAutoSaveStatus(null), 3000);
      } catch(e) {
        setAutoSaveStatus("error");
        addLog("warn", "PROJECT", `⚠ Auto-save échoué : ${e.message}`);
        setTimeout(() => setAutoSaveStatus(null), 4000);
      }
    };
    const interval = setInterval(autoSave, 120000); // toutes les 2 minutes
    return () => clearInterval(interval);
  }, [parts, chapters, currentChapter, choices, ended, bookTitle, language, duration, narrator, genres, genreWeights, writingStyle, nsfwEnabled, authorName, characters, locations]);

  // ── Vérifier si une auto-save existe au démarrage ──────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(autoSaveKey);
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data?.parts?.length > 0) {
        setShowRestoreBanner(true);
      }
    } catch {}
    addLog("info", "APP", `✦ Atelier des Récits ${APP_VERSION} — démarré`);
  }, []);

  // ── Restaurer depuis l'auto-save ────────────────────────────────
  const restoreAutoSave = () => {
    try {
      const saved = localStorage.getItem(autoSaveKey);
      if (!saved) return;
      const p = JSON.parse(saved);
      reset();
      setTimeout(() => {
        if (p.language) setLanguage(p.language);
        if (p.duration) setDuration(p.duration);
        if (p.narrator) setNarrator(p.narrator);
        if (p.genres) setGenres(p.genres);
        if (p.genreWeights) setGenreWeights(p.genreWeights);
        if (p.writingStyle) setWritingStyle(p.writingStyle);
        // nsfwEnabled jamais restauré automatiquement — toujours demander le mot de passe
        if (p.authorName) setAuthorName(p.authorName);
        setParts(purgeParts(p.parts || []));
        setChapters(p.chapters || []);
        setCurrentChapter(p.currentChapter ?? 0);
        setChoices(p.choices || null);
        setEnded(p.ended ?? false);
        if (p.bookTitle) setBookTitle(p.bookTitle);
        if (p.characters?.length) setCharacters(p.characters);
        if (p.locations?.length) setLocations(p.locations);
        addLog("info", "PROJECT", `✓ Auto-save restauré — "${p.bookTitle || "sans titre"}", ${p.parts?.length || 0} parties`);
      }, 50);
    } catch(e) {
      addLog("error", "PROJECT", `✕ Restauration auto-save échouée : ${e.message}`);
    }
    setShowRestoreBanner(false);
  };

  const dismissRestoreBanner = () => {
    setShowRestoreBanner(false);
    localStorage.removeItem(autoSaveKey);
  };

  // ── Sauvegarde / Restauration de projet ──────────────────────────
  const projectFileRef = useRef(null);
  const generateBtnRef = useRef(null);
  const chatInjectRef  = useRef(null); // rempli par NarrativeChatBubble pour injecter du texte dans le chat
  const [generatePulse, setGeneratePulse] = useState(false);

  // ── Helper : trouver un paragraphe par référence chapitre.para (ex: "1.3") ou index global ──
  const getParagraphByRef = (ref) => {
    // ref peut être "1.3" (chapitre 1, §3) ou un entier global (legacy)
    let targetChapter = null, targetParaInChapter = null, targetGlobal = null;
    if (typeof ref === "string" && ref.includes(".")) {
      const parts_ = ref.split(".");
      targetChapter = parseInt(parts_[0]) - 1; // 0-based
      targetParaInChapter = parseInt(parts_[1]); // 1-based dans le chapitre
    } else {
      targetGlobal = parseInt(ref);
    }
    let globalCount = 0;
    let chapterParaCounts = {}; // chapterIdx → count
    for (let gi = 0; gi < parts.length; gi++) {
      const chIdx = parts[gi].chapterIdx ?? 0;
      if (!(chIdx in chapterParaCounts)) chapterParaCounts[chIdx] = 0;
      const allParas = parts[gi].text.split("\n\n");
      let realIdx = -1, localCount = 0;
      for (let i = 0; i < allParas.length; i++) {
        const isReal = allParas[i].trim() && allParas[i].trim() !== "— ✦ —";
        if (isReal) {
          globalCount++;
          chapterParaCounts[chIdx]++;
          localCount++;
          const matchGlobal = targetGlobal !== null && globalCount === targetGlobal;
          const matchChapter = targetChapter !== null && chIdx === targetChapter && chapterParaCounts[chIdx] === targetParaInChapter;
          if (matchGlobal || matchChapter) {
            return { gi, realIdx: i, para: allParas[i], allParas };
          }
        }
      }
    }
    return null;
  };

  // ── Étendre un paragraphe par référence chapitre.para (ex: "1.3") ─
  const extendParagraph = async (ref, targetWords = 200) => {
    const found = getParagraphByRef(ref);
    if (!found) { addLog("warn", "CHAT", `⚠ Paragraphe §${ref} introuvable`); return; }
    const { gi, realIdx, para, allParas } = found;
    const parasBefore = parts.slice(0, gi).map(p => p.text).join("\n\n") + "\n\n" + allParas.slice(0, realIdx).join("\n\n");
    const parasAfter = allParas.slice(realIdx + 1).join("\n\n") + "\n\n" + parts.slice(gi + 1).map(p => p.text).join("\n\n");
    const langInstr = langInstructions[choices?.language || "french"] || "Écris en français.";
    const prompt = `${langInstr}\nTu étends UN paragraphe d'une histoire en ajoutant des détails, des sensations ou des dialogues, sans perdre la cohérence narrative.\n\nCONTEXTE AVANT :\n${parasBefore.slice(-1500) || "(début de l'histoire)"}\n\nPARAGRAPHE À ÉTENDRE :\n${para}\n\nCONTEXTE APRÈS :\n${parasAfter.slice(0, 800) || "(fin de l'histoire)"}\n\nÉcris une VERSION ÉTENDUE d'environ ${targetWords} mots. Réponds UNIQUEMENT avec le paragraphe étendu, sans titre ni commentaire.`;
    try {
      addLog("info", "CHAT", `✦ Extension §${ref} (~${targetWords} mots)`);
      const result = await callClaude([{ role: "user", content: prompt }], Math.round(targetWords * 1.6) + 100, 30000, 1);
      setParts(prev => prev.map((p, i) => {
        if (i !== gi) return p;
        const ps = p.text.split("\n\n"); ps[realIdx] = result.trim(); return { ...p, text: ps.join("\n\n") };
      }));
      addLog("info", "CHAT", `✦ §${ref} étendu`);
    } catch(e) { addLog("warn", "CHAT", `⚠ Extension §${ref} échouée`); }
  };

  // ── Réécrire un paragraphe par référence chapitre.para (ex: "1.3") ─
  const rewriteParagraph = async (ref, include = "", exclude = "") => {
    const found = getParagraphByRef(ref);
    if (!found) { addLog("warn", "CHAT", `⚠ Paragraphe §${ref} introuvable`); return; }
    const { gi, realIdx, para, allParas } = found;
    const parasBefore = parts.slice(0, gi).map(p => p.text).join("\n\n") + "\n\n" + allParas.slice(0, realIdx).join("\n\n");
    const parasAfter = allParas.slice(realIdx + 1).join("\n\n") + "\n\n" + parts.slice(gi + 1).map(p => p.text).join("\n\n");
    const langInstr = langInstructions[choices?.language || "french"] || "Écris en français.";
    const incl = include ? `\nÉléments à inclure : ${include}` : "";
    const excl = exclude ? `\nÉléments à éviter : ${exclude}` : "";
    const prompt = `${langInstr}\nTu réécris UN SEUL paragraphe d'une histoire en conservant la cohérence avec le contexte.\n\nCONTEXTE AVANT :\n${parasBefore.slice(-1500) || "(début de l'histoire)"}\n\nPARAGRAPHE ACTUEL :\n${para}\n\nCONTEXTE APRÈS :\n${parasAfter.slice(0, 800) || "(fin de l'histoire)"}${incl}${excl}\n\nRécris ce paragraphe. Réponds UNIQUEMENT avec le paragraphe réécrit, sans titre ni commentaire.`;
    try {
      addLog("info", "CHAT", `✦ Réécriture §${ref}`);
      const result = await callClaude([{ role: "user", content: prompt }], 600, 30000, 1);
      setParts(prev => prev.map((p, i) => {
        if (i !== gi) return p;
        const ps = p.text.split("\n\n"); ps[realIdx] = result.trim(); return { ...p, text: ps.join("\n\n") };
      }));
      addLog("info", "CHAT", `✦ §${ref} réécrit`);
    } catch(e) { addLog("warn", "CHAT", `⚠ Réécriture §${ref} échouée`); }
  };

  // ── Étendre le dernier paragraphe de la dernière partie ─────────
  const extendLastParagraph = async (targetWords = 150) => {
    if (!parts.length) return;
    const lastPart = parts[parts.length - 1];
    const paras = lastPart.text.split(/\n\n+/).filter(p => p.trim());
    if (!paras.length) return;
    const lastPara = paras[paras.length - 1];
    const parasBefore = parts.slice(0, -1).map(p => p.text).join("\n\n")
      + (paras.length > 1 ? "\n\n" + paras.slice(0, -1).join("\n\n") : "");
    const langInstr = langInstructions[choices?.language || "french"] || "Écris en français.";
    const prompt = `${langInstr}\nTu étends UN paragraphe d'une histoire en ajoutant des détails, des sensations ou des dialogues, sans perdre la cohérence narrative.\n\nCONTEXTE AVANT :\n${parasBefore.slice(-1500) || "(début de l'histoire)"}\n\nPARAGRAPHE À ÉTENDRE :\n${lastPara}\n\nÉcris une VERSION ÉTENDUE d'environ ${targetWords} mots, cohérente avec le contexte. Réponds UNIQUEMENT avec le paragraphe étendu, sans titre ni commentaire.`;
    const maxTok = Math.round(targetWords * 1.6) + 100;
    try {
      addLog("info", "CHAT", `✦ Extension dernier paragraphe (~${targetWords} mots)`);
      const result = await callClaude([{ role: "user", content: prompt }], maxTok, 30000, 1);
      const newParas = [...paras.slice(0, -1), result.trim()];
      const newText = newParas.join("\n\n");
      setParts(prev => prev.map((p, i) => i === prev.length - 1 ? { ...p, text: newText } : p));
      addLog("info", "CHAT", `✦ Paragraphe étendu — ${result.split(/\s+/).length} mots`);
    } catch(e) {
      addLog("warn", "CHAT", `⚠ Extension échouée : ${e.message}`);
    }
  };

  const saveProject = () => {
    const project = {
      version: 3,  // ← version courante du schéma
      savedAt: new Date().toISOString(),
      // Paramètres
      language, duration, narrator, genres, genreWeights, writingStyle,
      nsfwEnabled, authorName,
      // Source narrative classique
      classicSource,
      // Histoire
      parts, chapters, currentChapter, choices,
      ended, bookTitle, translations,
      // Blocs RAG (index + résumés)
      blocks,
      // Carnet de bord
      characters, locations,
      // Livre (avec images base64)
      book: book ? {
        title: book.title,
        author: book.author,
        genreStr: book.genreStr,
        summary: book.summary,
        coverDataUrl: book.coverDataUrl || null,
        extras: book.extras || {},
        backCoverDataUrl: book.backCoverDataUrl || null,
        images: book.images || {},
      } : null,
    };
    const title = bookTitle || buildGenreStr(genres, genreWeights) || "projet";
    const safeName = title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s\-_]/g, "").trim() || "projet";
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${safeName}.atelier`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    addLog("info", "PROJECT", `✓ Projet sauvegardé v2 — "${title}"`);
  };

  // ── Purge des marqueurs de mise en page (════, ✦ ✦ ✦, ✎, etc.) ──
  // Appelé sur tout texte entrant : import fichier, .atelier, autosave
  const purgeLayoutMarkers = (text) => {
    if (!text || typeof text !== "string") return text;
    return text
      .replace(/[═]{3,}/g, "")            // ════════
      .replace(/✦\s*✦\s*✦/g, "")          // ✦ ✦ ✦
      .replace(/✎/g, "")                   // icône crayon
      .replace(/^(Chapitre\s+\w+)\s*$/gim, "") // "Chapitre II" seul sur sa ligne (sans texte autour)
      .replace(/\n{3,}/g, "\n\n")          // triple sauts de ligne résiduels
      .trim();
  };

  // Applique purgeLayoutMarkers sur toutes les parts d'un projet chargé
  const purgeParts = (parts) => (parts || []).map(p => ({
    ...p,
    text: purgeLayoutMarkers(p.text || ""),
  }));

  // ── Migration schéma .atelier entre versions ──────────────────────
  const migrateProject = (p) => {
    const fromVersion = p.version || 1;
    let migrated = { ...p };
    const migrations = [];

    // v1 → v2 : normalisation des parts (chaque part doit avoir chapterIdx)
    if (fromVersion < 2) {
      migrated.parts = (migrated.parts || []).map((part, i) => ({
        ...part,
        chapterIdx: part.chapterIdx ?? 0,
        include:    part.include    ?? "",
        exclude:    part.exclude    ?? "",
      }));
      // chapters : s'assurer que chaque chapitre a les bons champs
      migrated.chapters = (migrated.chapters || []).map(ch => ({
        title:   ch.title   ?? "",
        closed:  ch.closed  ?? false,
        summary: ch.summary ?? null,
      }));
      // choices : s'assurer que les champs récents existent
      if (migrated.choices) {
        migrated.choices = {
          language:     migrated.choices.language     ?? migrated.language ?? "french",
          duration:     migrated.choices.duration     ?? migrated.duration ?? "short",
          narrator:     migrated.choices.narrator     ?? migrated.narrator ?? "third",
          genres:       migrated.choices.genres       ?? migrated.genres   ?? [],
          writingStyle: migrated.choices.writingStyle ?? migrated.writingStyle ?? "",
          ...migrated.choices,
        };
      }
      migrations.push("v1→v2 : normalisation parts/chapters/choices");
    }

    // Futurs : v2 → v3, etc.
    // v2 → v3 : ajout des blocs RAG (reconstruits automatiquement au chargement via useEffect)
    if (fromVersion < 3) {
      migrated.blocks = migrated.blocks || []; // sera reconstruit par useEffect sur parts
      migrations.push("v2→v3 : index de blocs RAG initialisé");
    }

    migrated.version = 3;
    if (migrations.length > 0) {
      addLog("info", "PROJECT", `↑ Migration appliquée : ${migrations.join(", ")}`);
    }
    return migrated;
  };

  const loadProject = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      if (!raw.parts) throw new Error("Fichier .atelier invalide (pas de champ 'parts')");

      // Migration automatique selon la version
      const p = migrateProject(raw);

      // Restaurer tous les états
      reset();
      setTimeout(() => {
        if (p.language) setLanguage(p.language);
        if (p.duration) setDuration(p.duration);
        if (p.narrator) setNarrator(p.narrator);
        if (p.genres) setGenres(p.genres);
        if (p.genreWeights) setGenreWeights(p.genreWeights);
        if (p.writingStyle) setWritingStyle(p.writingStyle);
        // nsfwEnabled jamais restauré automatiquement — toujours demander le mot de passe
        if (p.authorName) setAuthorName(p.authorName);
        if (p.classicSource) setClassicSource(p.classicSource);
        setParts(purgeParts(p.parts || []));
        setChapters(p.chapters || []);
        setCurrentChapter(p.currentChapter ?? 0);
        setChoices(p.choices || null);
        setEnded(p.ended ?? false);
        if (p.bookTitle) setBookTitle(p.bookTitle);
        if (p.translations) setTranslations(p.translations);
        // Restaurer les blocs RAG (ou laisser le useEffect les reconstruire)
        if (p.blocks?.length) setBlocks(p.blocks);
        // Carnet de bord — absents dans les anciens fichiers, pas de problème
        if (p.characters?.length) setCharacters(p.characters);
        if (p.locations?.length) setLocations(p.locations);
        // Détection fichier ancien : texte présent mais pas de carnet → proposer la mise à jour
        const hasContent = (p.parts?.length ?? 0) > 0;
        const hasCarnet = (p.characters?.length ?? 0) > 0 || (p.locations?.length ?? 0) > 0;
        if (hasContent && !hasCarnet) setTimeout(() => setShowCarnetUpgrade(true), 100);
        if (p.book) {
          setBook({ ...p.book, parts: p.parts, chapters: p.chapters });
          if (p.book.summary && p.book.summary !== "…") setShowBook(true);
          // Synchroniser bookImages depuis le projet restauré
          setBookImages({
            coverDataUrl: p.book.coverDataUrl || null,
            backCoverDataUrl: p.book.backCoverDataUrl || null,
            images: p.book.images || {},
          });
        }
        const fromV = raw.version || 1;
        addLog("info", "PROJECT", `✓ Projet restauré v${fromV}→v3 — "${p.bookTitle || "sans titre"}", ${p.parts?.length || 0} parties`);
      }, 50);
    } catch(e) {
      setError("Erreur ouverture projet : " + e.message);
      addLog("error", "PROJECT", `✕ Échec ouverture : ${e.message}`);
    }
  };

  // ── Build book ───────────────────────────────────────────────────
  const buildBook = async () => {
    setBuildingBook(true); setError("");
    const genreStr = buildGenreStr(choices?.genres || []);
    const storyText = parts.map(p => p.text).join("\n\n");
    const language = choices?.language || "french";

    // Ouvrir l'éditeur immédiatement avec les valeurs disponibles
    const currentTitle = bookTitle || genreStr;
    // Récupérer les images existantes (bookImages ou ancien book) pour ne pas les perdre à la réouverture
    const existingCover = bookImages?.coverDataUrl || book?.coverDataUrl || null;
    const existingBack = bookImages?.backCoverDataUrl || book?.backCoverDataUrl || null;
    const existingImages = { ...(book?.images || {}), ...(bookImages?.images || {}) };
    const existingSummary = book?.summary && book.summary !== "…" ? book.summary : "…";
    const existingExtras = book?.extras || {};
    const initialBook = { title: currentTitle, author: authorName, genreStr, parts, chapters, summary: existingSummary, images: existingImages, coverDataUrl: existingCover, backCoverDataUrl: existingBack, extras: existingExtras };
    setBook(initialBook);
    // bookImages reste inchangé — déjà à jour
    setShowBook(true);
    setBuildingBook(false);

    // Générer titre uniquement s'il n'en existe pas déjà un
    if (!bookTitle || bookTitle === genreStr) {
      try {
        const title = await generateTitle(storyText, genreStr, language);
        if (title?.trim()) {
          setBookTitle(title);
          setBook(prev => prev ? { ...prev, title: title.trim() } : prev);
        }
      } catch {}
    }
    try {
      const summary = await generateSummary(storyText, language);
      if (summary?.trim()) {
        setBook(prev => prev ? { ...prev, summary: summary.trim() } : prev);
      }
    } catch {}
  };

  // ── Open book as HTML page in inline modal (simple mode) ─────────
  const openBookHtml = () => {
    const genreStr = buildGenreStr(choices?.genres || []);
    const title = bookTitle || genreStr;
    const chapList = chapters.length > 0 ? chapters : [{ title: "Chapitre I" }];
    let storyHtml = "";
    chapList.forEach((ch, ci) => {
      const chParts = parts.filter(p => (p.chapterIdx ?? 0) === ci);
      if (!chParts.length) return;
      if (ci > 0) storyHtml += `<div class="chap-break"></div>`;
      storyHtml += `<div class="chap-head"><div class="orn">* * *</div><div class="num">${["I","II","III","IV","V","VI","VII","VIII","IX","X"][ci]||ci+1}</div>${chapList.length>1?`<div class="ct">${ch.title}</div>`:""}</div>`;
      chParts.forEach((part, pi) => {
        if (pi > 0) storyHtml += `<div class="sep">* * *</div>`;
        part.text.split("\n\n").forEach((para, i) => {
          if (para.trim() === "— ✦ —") storyHtml += `<div class="sep">* * *</div>`;
          else if (para.trim()) storyHtml += `<p${(ci===0&&pi===0&&i===0)?"":" class=\"in\""}>${para.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>`;
        });
      });
    });
    const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const safeTitle = esc(title);
    const safeAuthor = esc(authorName || "");
    const safeGenre = esc(genreStr);
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${safeTitle}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#09080a;color:#d4c8b0;font-family:Georgia,'Times New Roman',serif;font-size:13pt;line-height:1.95}
.cover{width:100%;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#1a1208,#0f0a06)}
.cover-inner{text-align:center;padding:4rem 3rem}
.cover-genre{letter-spacing:.35em;color:#c9a96e;font-size:.62rem;opacity:.8;margin-bottom:1.2rem;text-transform:uppercase}
.cover-rule{width:55px;height:1px;background:#c9a96e;margin:.9rem auto;opacity:.6}
.cover h1{color:#e8d5a8;font-size:2.4rem;letter-spacing:.08em;line-height:1.25;margin:.8rem 0}
.cover-author{color:#9a8a70;font-style:italic;font-size:1rem;letter-spacing:.12em;margin-top:.5rem}
.story{max-width:720px;margin:0 auto;padding:4rem 2.5rem}
.chap-head{text-align:center;margin-bottom:3rem;padding-bottom:2rem;border-bottom:1px solid #2a2520}
.orn{color:#c9a96e;opacity:.3;letter-spacing:.5em;font-size:.8rem;margin-bottom:.5rem}
.num{color:#c9a96e;font-size:1.1rem;letter-spacing:.35em;opacity:.65}
.ct{color:#9a8a70;font-style:italic;font-size:.82rem;margin-top:.3rem}
.chap-break{border-top:1px solid #2a2520;margin:3rem 0;padding-top:3rem}
p{margin-bottom:1.5em;text-align:justify}
p.in{text-indent:1.6em}
.sep{text-align:center;color:#c9a96e;opacity:.3;margin:2.5rem 0;letter-spacing:.5em}
.colophon-block{max-width:720px;margin:3rem auto 0;padding:3rem 2.5rem 4rem;text-align:center;border-top:1px solid #1a1815}
.colophon-text{color:#3a3428;font-size:.6rem;letter-spacing:.25em}
</style></head><body>
<div class="cover"><div class="cover-inner">
<div class="cover-genre">${safeGenre}</div>
<div class="cover-rule"></div>
<h1>${safeTitle}</h1>
<div class="cover-rule"></div>
${safeAuthor ? `<p class="cover-author">${safeAuthor}</p>` : ""}
</div></div>
${extras.preface?.enabled && extras.preface?.text ? `<div class="story"><div class="preface"><p style="font-style:italic;font-family:${extras.preface.font||"Georgia,serif"};font-size:${(extras.preface.size||1)*13}pt">${extras.preface.text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>")}</p></div></div>` : ""}<div class="story">${storyHtml}</div>
<div class="colophon-block"><p class="colophon-text">ATELIER DES RECITS</p></div>
</body></html>`;
    setHtmlModalContent(html);
  };

  const handleUpdateImage = (type, ci, dataUrl) => {
    setBook(prev => {
      if (!prev) return prev;
      if (type === "cover") return { ...prev, coverDataUrl: dataUrl };
      if (type === "back") return { ...prev, backCoverDataUrl: dataUrl };
      if (type === "chapter") {
        const images = { ...prev.images };
        if (dataUrl === null) delete images[ci];
        else images[ci] = dataUrl;
        return { ...prev, images };
      }
      return prev;
    });
    // Mise à jour aussi dans bookImages (indépendant de book, persisté)
    setBookImages(prev => {
      if (type === "cover") return { ...prev, coverDataUrl: dataUrl };
      if (type === "back") return { ...prev, backCoverDataUrl: dataUrl };
      if (type === "chapter") {
        const imgs = { ...prev.images };
        if (dataUrl === null) delete imgs[ci];
        else imgs[ci] = dataUrl;
        return { ...prev, images: imgs };
      }
      return prev;
    });
  };

  // ── Download HTML ────────────────────────────────────────────────
  const downloadBook = (coverDataUrl, backCoverDataUrl, images, extras = {}) => {
    if (!book) return;
    // Mémoriser les extras dans book pour le PDF illustré
    if (extras && Object.keys(extras).length) {
      setBook(prev => prev ? { ...prev, extras } : prev);
    }
    setDownloading(true);
    const { title, author, genreStr, parts: bParts, chapters: bChapters, summary } = book;
    const chapList = bChapters || [{ title: "Chapitre I" }];
    let storyHtml = "";
    chapList.forEach((ch, ci) => {
      const chParts = bParts.filter(p => (p.chapterIdx ?? 0) === ci);
      if (!chParts.length) return;
      const imgUrl = images?.[ci];
      if (ci > 0) storyHtml += `<div class="chap-break"></div>`;
      if (imgUrl) storyHtml += `<figure class="illus"><img src="${imgUrl}" alt="${ch.title}" style="width:100%;display:block;max-height:50vh;object-fit:cover"/><figcaption>${ch.title}</figcaption></figure>`;
      storyHtml += `<div class="chap-head"><div class="orn">✦ ✦ ✦</div><div class="num">${["I","II","III","IV","V","VI","VII","VIII","IX","X"][ci]||ci+1}</div>${chapList.length>1?`<div class="ct">${ch.title}</div>`:""}</div>`;
      chParts.forEach((part, pi) => {
        if (pi > 0) storyHtml += `<div class="sep">✦ ✦ ✦</div>`;
        part.text.split("\n\n").forEach((para, i) => {
          if (para.trim() === "— ✦ —") storyHtml += `<div class="sep">✦ ✦ ✦</div>`;
          else if (para.trim()) storyHtml += `<p${(ci===0&&pi===0&&i===0)?"":" class=\"in\""}>${para.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>`;
        });
      });
    });
    const coverHtml = coverDataUrl ? `<img src="${coverDataUrl}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0" alt=""/>` : `<div style="width:100%;height:100%;background:linear-gradient(160deg,#1a1208,#0f0a06)"></div>`;
    const backHtml = backCoverDataUrl ? `<div style="text-align:center;margin-bottom:1.5rem"><img src="${backCoverDataUrl}" style="width:100%;max-height:300px;object-fit:cover;display:block" alt=""/></div>` : "";
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title><style>
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{background:#09080a;color:#d4c8b0;font-family:'EB Garamond',Georgia,serif;font-size:13pt;line-height:1.95}
.cover{position:relative;width:100%;min-height:100vh;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;page-break-after:always}
.cover-overlay{position:relative;z-index:2;background:linear-gradient(transparent,rgba(0,0,0,.93) 40%);padding:5rem 3rem 2.5rem;text-align:center}
.cover h1{font-family:Georgia,serif;color:#e8d5a8;font-size:2.2rem;letter-spacing:.08em;line-height:1.25;text-shadow:0 2px 30px rgba(0,0,0,.9)}
.cover-rule{width:55px;height:1px;background:#c9a96e;margin:.9rem auto;opacity:.6}
.cover-author{color:#9a8a70;font-style:italic;font-size:1rem;letter-spacing:.12em}
.cover-genre{letter-spacing:.35em;color:#c9a96e;font-size:.62rem;opacity:.8;margin-bottom:.5rem}
.story{max-width:720px;margin:0 auto;padding:4rem 2.5rem}
.chap-head{text-align:center;margin-bottom:3rem;padding-bottom:2rem;border-bottom:1px solid #2a2520}
.orn{color:#c9a96e;opacity:.2;letter-spacing:.5em;font-size:.8rem;margin-bottom:.5rem}
.num{color:#c9a96e;font-size:1.1rem;letter-spacing:.35em;opacity:.65}
.ct{color:#9a8a70;font-style:italic;font-size:.82rem;margin-top:.3rem}
.chap-break{border-top:1px solid #2a2520;margin:3rem 0;padding-top:3rem}
p{margin-bottom:1.5em;text-align:justify}p.in{text-indent:1.6em}
.sep{text-align:center;color:#c9a96e;opacity:.2;margin:2.5rem 0;letter-spacing:.5em}
figure.illus{margin:3rem -1rem;background:#080708;border-top:1px solid #222;border-bottom:1px solid #222;padding:.5rem}
figure.illus figcaption{text-align:center;color:#444;font-size:.6rem;letter-spacing:.2em;padding:.3rem;font-family:Georgia,serif}
.preface{max-width:720px;margin:0 auto 0;padding:4rem 2.5rem 2rem;border-bottom:1px solid #2a2520;font-style:italic}.preface p{line-height:2;color:#b8a880;text-align:justify}.last{max-width:720px;margin:3rem auto 0;page-break-before:always;padding:3rem 3rem 3.5rem}
.last-lbl{text-align:center;margin-bottom:1.2rem}
.last-lbl span{color:#c9a96e;font-size:.58rem;letter-spacing:.35em;opacity:.55}
.last-rule{width:40px;height:1px;background:linear-gradient(90deg,transparent,#c9a96e,transparent);margin:0 auto .7rem}
.last-sum{color:#b8a880;font-style:italic;line-height:1.95;text-align:justify;margin-bottom:2rem}
.colophon{text-align:center;border-top:1px solid #1a1815;padding-top:1.2rem;color:#3a3428;font-size:.6rem;letter-spacing:.25em}
</style></head><body>
<div class="cover"><div style="position:absolute;inset:0">${coverHtml}</div>
<div class="cover-overlay"><div class="cover-genre">${genreStr.toUpperCase()}</div><div class="cover-rule"></div><h1>${title}</h1><div class="cover-rule"></div>${author?`<p class="cover-author">${author}</p>`:""}</div></div>
<div class="story">${storyHtml}</div>
${extras.credits?.enabled && extras.credits?.text ? `<div class="last" style="font-size:${(extras.credits.size||0.85)*13}pt;font-family:${extras.credits.font||"Georgia,serif"}"><p style="text-align:center;font-style:italic;opacity:0.7">${extras.credits.text.replace(/&/g,"&amp;").replace(/\n/g,"<br>")}</p></div>` : ""}<div class="last">${backHtml}<div class="last-lbl"><div class="last-rule"></div><span>{t.resumeLabel}</span></div><p class="last-sum">${summary?.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")||""}</p><div class="colophon">${authorName||t.colophon}</div></div>
</body></html>`;
    try {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${title || "histoire"}.html`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch(e) { setError(t.errorDl + e.message); }
    setDownloading(false);
  };

  // ── Download EPUB ────────────────────────────────────────────────
  const downloadEpub = async (coverDataUrl, backCoverDataUrl, images) => {
    if (!book || !ended) return;
    setSavingEpub(true); setError("");
    const epubTitle = bookTitle || book.title || buildGenreStr(choices?.genres || []);
    const withImages = !!(coverDataUrl || backCoverDataUrl || Object.keys(images||{}).length);
    addLog("info", "EPUB", `Génération EPUB — "${epubTitle}", images: ${withImages ? "oui" : "non"}`);
    try {
      const enrichedParts = parts.map(p => ({ ...p, chapterTitle: chapters[p.chapterIdx ?? 0]?.title || "Chapitre I" }));
      const blob = await generateEpub({
        title: epubTitle,
        author: authorName || t.colophon,
        summary: book.summary || "",
        parts: enrichedParts,
        chapters,
        genreStr: buildGenreStr(choices?.genres || []),
        images,
        coverDataUrl,
        backCoverDataUrl,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${epubTitle}.epub`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      addLog("info", "EPUB", `✓ EPUB téléchargé — ${(blob.size/1024).toFixed(1)} Ko`);
    } catch(e) { addLog("error", "EPUB", `✕ Erreur EPUB : ${e.message}`); setError(t.errorEpub + e.message); }
    setSavingEpub(false);
  };

  // ── Download raw .txt ────────────────────────────────────────────
  const downloadTxt = () => {
    if (!parts.length) return;
    const title = bookTitle || buildGenreStr(choices?.genres || []) || "histoire";
    const header = `${title}\n${"─".repeat(Math.min(title.length, 60))}\n\n`;
    const body = (chapters.length > 0 ? chapters : [{ title: "Chapitre I" }]).map((ch, ci) => {
      const chParts = parts.filter(p => (p.chapterIdx ?? 0) === ci);
      if (!chParts.length) return "";
      const chHeader = chapters.length > 1 ? `\n\n${"═".repeat(40)}\n${ch.title}\n${"═".repeat(40)}\n\n` : "";
      return chHeader + chParts.map((p, pi) => (pi > 0 ? "\n\n— ✦ —\n\n" : "") + p.text).join("");
    }).join("").trim();
    const content = header + body;
    const safeName = title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s\-_]/g, "").trim() || "histoire";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${safeName}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    addLog("info", "TXT", `✓ Sauvegarde .txt — "${title}", ~${approxWords} mots`);
  };
  const save = async () => {
    if (!ended) return;
    setSaving(true); setError("");
    const genreStr = buildGenreStr(choices?.genres || []);
    const title = bookTitle || `${genreStr} — ${new Date().toLocaleDateString("fr-FR")}`;
    const triggerDl = (content, fname, type) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fname;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    };
    try {
      if (saveFormat === "pdf" || saveFormat === "pdf-illus") {
        const withIllus = saveFormat === "pdf-illus";
        addLog("info", "PDF", `Génération PDF${withIllus ? " illustré" : ""} — "${title}"`);
        const blob = await generatePdfBlob({
          title,
          author: authorName || "",
          genreStr,
          chapters,
          parts,
          summary: book?.summary && book.summary !== "…" ? book.summary : "",
          coverDataUrl: withIllus ? (bookImages?.coverDataUrl || book?.coverDataUrl || null) : null,
          backCoverDataUrl: withIllus ? (bookImages?.backCoverDataUrl || book?.backCoverDataUrl || null) : null,
          images: withIllus ? ({ ...book?.images, ...bookImages?.images }) : {},
          preface: book?.extras?.preface || null,
          credits: book?.extras?.credits || null,
          bookCharacters: book?.extras?.showCharacters ? (characters || []) : [],
          typo: book?.extras?.typo || {},
          folio: book?.extras?.folio || {},
          tocConfig: book?.extras?.tocConfig || { show: true, position: "start" },
          coverStyle: book?.extras?.coverStyle || {},
        });
        const safeName = title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s\-_]/g, "").trim() || "histoire";
        const suffix = withIllus ? "-illustre" : "";
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${safeName}${suffix}.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
        addLog("info", "PDF", `✓ PDF${withIllus ? " illustré" : ""} — ${(blob.size/1024).toFixed(1)} Ko`);
        setSaveLink(withIllus ? "✅ PDF illustré téléchargé" : "✅ PDF téléchargé directement");
      } else {
        triggerDl(`${title}\n${"=".repeat(Math.min(title.length,60))}\n${genreStr}\n\n${fullText}`, `${title}.txt`, "text/plain;charset=utf-8");
        setSaveLink(t.txtMsg);
      }
    } catch(e) { addLog("error", "PDF", `✕ Erreur PDF : ${e.message}`); setError(t.errorPfx + e.message); }
    setSaving(false);
  };


  // ── Render GYBH ──────────────────────────────────────────────────
  if (bookMode === "gybh" && gybhPhase !== "idle") {
    const endingsCount = countGybhEndings(gybhNodes);
    const totalNodes = Object.keys(gybhNodes).length;
    const allTextsReady = totalNodes > 0 && Object.values(gybhNodes).every(n => n.text);

    // ── Composant nœud dans l'arbre (défini hors render pour stabiliser le focus) ──
    // GybhNode utilise GybhCtx — le provider est posé juste autour de l'arbre

    const gybhCtxValue = {
      gybhNodes, gybhExpandedNodes, gybhPendingNode, gybhWritingNode, gybhReadingNode,
      gybhRootId, gybhLoadingAxes, gybhMaxDepth, setGybhNodes, setGybhExpandedNodes,
      setGybhReadingNode, setGybhPendingNode, generateGybhText, generateGybhAxes, validateGybhAxes
    };

    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Georgia, serif", padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <style>{`button:hover{opacity:.82}@keyframes progressSlide{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes pulse{0%,100%{transform:scale(.8);opacity:.3}50%{transform:scale(1.2);opacity:1}}`}</style>

        {/* Header */}
        <div style={{ width: "100%", maxWidth: 800, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <button onClick={reset} style={S.btn("#555", "small")}>← Recommencer</button>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ color: C.gold, fontSize: "0.6rem", letterSpacing: "0.4em" }}>🎲 RÉCIT DONT VOUS ÊTES LE HÉROS</div>
            <div style={{ color: C.text, fontSize: "1rem", fontFamily: "Georgia, serif", marginTop: "0.2rem" }}>{bookTitle || "Nouveau livre interactif"}</div>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {allTextsReady && (
              <>
                <button onClick={() => setGybhReadingNode(gybhReadingNode ? null : gybhRootId)}
                  style={{ ...S.btn(gybhReadingNode ? C.gold : "#3a6a5a", "small"), fontSize: "0.7rem" }}>
                  {gybhReadingNode ? "📋 Arbre" : "▶ Lire"}
                </button>
                <button onClick={exportGybhHtml}
                  style={{ ...S.btn(C.blue, "small"), fontSize: "0.7rem" }}>
                  ⬇ HTML
                </button>
                <button onClick={exportGybhEpub}
                  style={{ ...S.btn("#7a5a9a", "small"), fontSize: "0.7rem" }}>
                  📖 EPUB
                </button>
                <button onClick={exportGybhPdf}
                  style={{ ...S.btn("#6a3a2a", "small"), fontSize: "0.7rem" }}>
                  📄 PDF
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 800 }}>

          {/* ── Barre de progression globale (mode simple + génération textes avancé) ── */}
          {gybhProgress.pct > 0 && gybhProgress.pct < 100 && (
            <div style={{ background: C.card, border: "1px solid #2a2520", borderRadius: 4, padding: "1.2rem 1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <span style={{ color: "#8a7a60", fontSize: "0.72rem", fontStyle: "italic" }}>{gybhProgress.step}</span>
                <span style={{ color: C.gold, fontSize: "0.75rem", fontWeight: "bold" }}>{gybhProgress.pct}%</span>
              </div>
              <div style={{ background: "#1a1814", borderRadius: 3, height: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${gybhProgress.pct}%`, background: `linear-gradient(90deg, ${C.gold}88, ${C.gold})`, borderRadius: 3, transition: "width 0.4s ease" }} />
              </div>
              {/* Dots d'animation */}
              <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginTop: "0.75rem" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, animation: `pulse 1.2s ease ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}

          {/* Livre prêt */}
          {gybhProgress.pct === 100 && gybhPhase !== "writing_failed" && (
            <div style={{ background: "#0a120a", border: "1px solid #3a5a3a", borderRadius: 6, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center", animation: "fadein 0.4s ease" }}>
              <div style={{ color: "#7ec87e", fontSize: "0.65rem", letterSpacing: "0.3em", marginBottom: "0.75rem" }}>✦ LIVRE INTERACTIF PRÊT</div>
              <div style={{ color: C.gold, fontFamily: "Georgia, serif", fontSize: "1.1rem", marginBottom: "1.25rem" }}>{bookTitle}</div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => { setGybhReadingNode(gybhRootId); setGybhProgress({ step: "", pct: 0 }); }}
                  style={{ ...S.btn("#3a6a5a"), fontSize: "0.85rem", padding: "0.7rem 1.8rem", letterSpacing: "0.15em" }}>
                  ▶ LIRE LE LIVRE
                </button>
                <button onClick={exportGybhHtml}
                  style={{ ...S.btn(C.blue, "small"), fontSize: "0.75rem" }}>
                  ⬇ HTML
                </button>
                <button onClick={exportGybhEpub}
                  style={{ ...S.btn("#7a5a9a", "small"), fontSize: "0.75rem" }}>
                  📖 EPUB
                </button>
                <button onClick={exportGybhPdf}
                  style={{ ...S.btn("#6a3a2a", "small"), fontSize: "0.75rem" }}>
                  📄 PDF
                </button>
              </div>
              {!advancedMode && (
                <p style={{ color: "#3a5a3a", fontSize: "0.62rem", marginTop: "0.75rem", fontStyle: "italic" }}>
                  {Object.keys(gybhNodes).length} sections · {countGybhEndings(gybhNodes)} fins
                </p>
              )}
            </div>
          )}

          {/* Génération partielle — passages manquants */}
          {gybhPhase === "writing_failed" && (
            <div style={{ background: "#120a0a", border: "1px solid #5a3a3a", borderRadius: 6, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚠️</div>
              <div style={{ color: "#c87070", fontSize: "0.7rem", letterSpacing: "0.25em", marginBottom: "0.5rem" }}>GÉNÉRATION INCOMPLÈTE</div>
              <div style={{ color: "#8a6a6a", fontSize: "0.78rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                {gybhProgress.step}<br/>
                <span style={{ color: "#5a4a4a", fontSize: "0.68rem", fontStyle: "italic" }}>
                  Cela peut arriver si la limite de tokens a été atteinte. Attendez quelques instants puis relancez.
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={retryFailedGybhNodes} disabled={!!gybhWritingNode}
                  style={{ ...S.btn(C.gold), fontSize: "0.82rem", padding: "0.65rem 1.6rem" }}>
                  {gybhWritingNode ? "⟳ Relance en cours…" : `↺ Relancer les passages manquants (${Object.values(gybhNodes).filter(n=>!n.text).length})`}
                </button>
                {Object.values(gybhNodes).filter(n => n.text).length > 0 && (
                  <button onClick={() => { setGybhPhase("reading"); setGybhProgress({ step: "", pct: 0 }); }}
                    style={{ ...S.btn("#555", "small"), fontSize: "0.72rem" }}>
                    Lire quand même
                  </button>
                )}
              </div>
              <div style={{ color: "#3a2a2a", fontSize: "0.62rem", marginTop: "0.75rem", fontStyle: "italic" }}>
                {Object.values(gybhNodes).filter(n => n.text).length}/{Object.keys(gybhNodes).length} sections générées
              </div>
            </div>
          )}

          {/* Phase trame — validation (mode avancé uniquement) */}
          {advancedMode && gybhPhase === "frame" && gybhFrame && (
            <div style={{ background: "#0a120a", border: "1px solid #3a5a3a", borderRadius: 6, padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ color: C.green, fontSize: "0.6rem", letterSpacing: "0.35em", marginBottom: "1rem" }}>✦ TRAME GÉNÉRÉE — affinez chaque dimension ou validez</div>

              {/* Titre */}
              <h2 style={{ color: C.gold, fontFamily: "Georgia, serif", marginBottom: "0.75rem", fontSize: "1.3rem" }}>{gybhFrame.title}</h2>

              {/* Dimensions avec régénération sélective */}
              {[
                { key: "pitch",   label: "TRAME GÉNÉRALE",      inc: "pitchInc",   dec: "pitchDec"   },
                { key: "hero",    label: "PERSONNAGE",          inc: "heroInc",    dec: "heroDec"    },
                { key: "stakes",  label: "ENJEU CENTRAL",       inc: "stakesInc",  dec: "stakesDec"  },
                { key: "opening", label: "PASSAGE D'OUVERTURE", inc: "openingInc", dec: "openingDec" },
              ].map(({ key, label, inc, dec }) => (
                <div key={key} style={{ background: "#0f1a0f", border: "1px solid #2a3a2a", borderRadius: 3, padding: "0.7rem 0.8rem", marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <div style={{ color: "#4a6a4a", fontSize: "0.58rem", letterSpacing: "0.15em" }}>{label}</div>
                    <button
                      onClick={() => regenerateGybhDimension(key)}
                      disabled={!!gybhRegenLoading}
                      style={{ ...S.btn("#2a3a2a", "small"), fontSize: "0.58rem", padding: "0.15rem 0.5rem", opacity: gybhRegenLoading ? 0.4 : 1 }}>
                      {gybhRegenLoading === key ? "⟳" : "↺"}
                    </button>
                  </div>
                  <div style={{ color: "#b8d8b8", fontSize: "0.73rem", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                    {gybhRegenLoading === key
                      ? <span style={{ color: "#4a6a4a", fontStyle: "italic" }}>⟳ Régénération en cours…</span>
                      : gybhFrame[key]
                    }
                  </div>
                  {/* Champs inclure/exclure pour cette dimension */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem", borderTop: "1px solid #1a2a1a", paddingTop: "0.45rem" }}>
                    <div>
                      <div style={{ color: "#4a7a4a", fontSize: "0.55rem", marginBottom: "0.1rem" }}>✦ Inclure</div>
                      <input value={gybhGuide[inc]} onChange={e => setGybhGuide(prev => ({ ...prev, [inc]: e.target.value }))}
                        placeholder="…"
                        style={{ ...S.input, fontSize: "0.6rem", minHeight: "unset", height: "26px", padding: "0.15rem 0.4rem" }} />
                    </div>
                    <div>
                      <div style={{ color: "#7a4a4a", fontSize: "0.55rem", marginBottom: "0.1rem" }}>✕ Exclure</div>
                      <input value={gybhGuide[dec]} onChange={e => setGybhGuide(prev => ({ ...prev, [dec]: e.target.value }))}
                        placeholder="…"
                        style={{ ...S.input, fontSize: "0.6rem", minHeight: "unset", height: "26px", padding: "0.15rem 0.4rem" }} />
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                <button onClick={validateGybhFrame} style={{ ...S.btn(C.green), fontSize: "0.8rem", padding: "0.6rem 1.5rem" }}>
                  ✓ Valider cette trame
                </button>
                <button onClick={runGybhExpress} disabled={expressModeRunning}
                  style={{ ...S.btn("#2a4a7a"), fontSize: "0.8rem", padding: "0.6rem 1.5rem", opacity: expressModeRunning ? 0.5 : 1 }}>
                  🪄 Génération automatique
                </button>
                <button onClick={generateGybhFrame} disabled={gybhLoadingFrame}
                  style={{ ...S.btn("#4a3a28", "small") }}>
                  ↺ Nouvelle trame complète
                </button>
              </div>
            </div>
          )}

          {/* Compteurs — mode avancé uniquement */}
          {advancedMode && gybhPhase === "skeleton" && (
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {[
                { label: "Nœuds", value: totalNodes, color: C.gold },
                { label: "Fins", value: `${endingsCount}/${gybhMaxEndings}`, color: endingsCount >= gybhMaxEndings ? "#e06060" : "#7ec87e" },
                { label: "Niveaux", value: `${gybhMaxDepth} max`, color: C.blue },
                { label: "À valider", value: Object.values(gybhNodes).filter(n => n.pendingAxes).length, color: "#e09060" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: C.card, border: "1px solid #2a2520", borderRadius: 3, padding: "0.4rem 0.75rem", flex: 1, minWidth: 80, textAlign: "center" }}>
                  <div style={{ color: "#4a3a28", fontSize: "0.58rem", letterSpacing: "0.1em" }}>{label}</div>
                  <div style={{ color, fontSize: "0.9rem", fontWeight: "bold" }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Actions globales squelette — mode avancé uniquement */}
          {advancedMode && gybhPhase === "skeleton" && gybhRootId && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {gybhPendingNode && !gybhNodes[gybhPendingNode]?.pendingAxes && (
                <button onClick={() => generateGybhAxes(gybhPendingNode)} disabled={gybhLoadingAxes || expressModeRunning}
                  style={{ ...S.btn(C.gold, "small"), fontSize: "0.72rem" }}>
                  {gybhLoadingAxes ? "⟳ Génération…" : `✦ Générer axes pour nœud suivant`}
                </button>
              )}
              {!allTextsReady && (
                <button onClick={completeGybhAuto} disabled={expressModeRunning || !!gybhWritingNode}
                  style={{ ...S.btn("#2a4a7a", "small"), fontSize: "0.72rem", opacity: expressModeRunning ? 0.5 : 1 }}>
                  {expressModeRunning ? "⟳ Complétion en cours…" : "🪄 Compléter automatiquement"}
                </button>
              )}
              {!gybhPendingNode && !allTextsReady && (
                <button onClick={generateAllGybhTexts} disabled={!!gybhWritingNode || expressModeRunning}
                  style={{ ...S.btn(C.green), fontSize: "0.78rem", padding: "0.5rem 1.2rem" }}>
                  {gybhWritingNode ? "⟳ Écriture en cours…" : "✍ Générer tous les textes"}
                </button>
              )}
            </div>
          )}

          {/* Arbre des nœuds — mode avancé uniquement */}
          {advancedMode && gybhRootId && !gybhReadingNode && (
            <div style={{ background: C.card, border: "1px solid #2a2520", borderRadius: 4, padding: "1rem" }}>
              <GybhCtx.Provider value={gybhCtxValue}>
                <GybhNode nodeId={gybhRootId} depth={0} />
              </GybhCtx.Provider>
            </div>
          )}

          {/* Mode lecture — affiche le nœud courant */}
          {gybhReadingNode && gybhNodes[gybhReadingNode] && (() => {
            // ── Calcul numéros BFS ──
            const bfsOrder = []; const bfsVisited = new Set(); const bfsQueue = [gybhRootId];
            while (bfsQueue.length) { const bid = bfsQueue.shift(); if (bfsVisited.has(bid)||!gybhNodes[bid]) continue; bfsVisited.add(bid); bfsOrder.push(bid); (gybhNodes[bid].choices||[]).forEach(c=>{ if(!bfsVisited.has(c.childId)) bfsQueue.push(c.childId); }); }
            const numMap = {}; bfsOrder.forEach((id,i)=>{ numMap[id]=i+1; });

            // ── Reconstituer le chemin depuis la racine jusqu'au nœud courant ──
            const buildPath = (targetId) => {
              const path = [];
              let cur = gybhNodes[targetId];
              while (cur) {
                path.unshift(cur.id);
                cur = cur.parentId ? gybhNodes[cur.parentId] : null;
              }
              return path;
            };
            const path = buildPath(gybhReadingNode);

            // ── Fonction inline pour régénérer un nœud manquant ──
            const regenNode = async (nodeId) => {
              setGybhWritingNode(nodeId);
              try {
                const n = gybhNodes[nodeId];
                const langInstr = langInstructions[choices?.language || language] || "Écris en français.";
                const sHint = choices?.writingStyle ? `Style : ${choices.writingStyle}.` : "";
                const secWT = { micro: 500, flash: 1000, short: 2000, long: 5000 }[choices?.duration || duration] || 500;
                const wt = secWT;
                const endH = n.isEnding
                  ? `\nConclus l'histoire (fin ${n.endingType === "good" ? "heureuse" : n.endingType === "bad" ? "tragique" : "neutre"}).`
                  : `\nTermine sur une situation qui appelle le choix :\n${(n.choices||[]).map((c,i)=>`- Option ${i+1} : "${c.text}"`).join("\n")}`;
                const pr = `${langInstr}\n${sHint}\nTRAME : ${gybhFrame?.pitch||""}\nENJEU : ${gybhFrame?.stakes||""}\nRÉSUMÉ : ${n.summary}${endH}\n\nÉcris ce passage d'environ ${wt} mots. UNIQUEMENT le texte narratif, sans titre.`;
                const mt = Math.max(400, Math.round(wt * 2.2));
                const text = await callClaude([{ role: "user", content: pr }], mt, 120000, 1, true);
                if (!text?.trim()) throw new Error("Réponse vide");
                setGybhNodes(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], text: text.trim() } }));
                addLog("info", "GYBH", `✓ Passage régénéré : ${nodeId}`);
              } catch(e) { addLog("warn", "GYBH", `⚠ Régénération échouée : ${e.message}`); }
              setGybhWritingNode(null);
            };

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {path.map((nodeId, pathIdx) => {
                  const n = gybhNodes[nodeId];
                  if (!n) return null;
                  const sNum = numMap[nodeId] ?? "—";
                  const isLast = pathIdx === path.length - 1;
                  // Quel choix a été fait depuis ce nœud ? (childId dans le chemin suivant)
                  const nextNodeId = path[pathIdx + 1];
                  const choiceMade = nextNodeId ? (n.choices||[]).find(c => c.childId === nextNodeId) : null;

                  return (
                    <div key={nodeId}>
                      {/* ── Section de texte ── */}
                      <div style={{ background: C.card, border: "1px solid #2a2520", borderTop: pathIdx === 0 ? `2px solid ${C.gold}55` : "1px solid #2a2520", borderRadius: pathIdx === 0 ? "4px 4px 0 0" : "0", padding: "2rem 1.75rem", lineHeight: 1.95, fontSize: "1.05rem", color: C.text }}>
                        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                          <div style={{ color: C.gold, fontSize: "0.75rem", letterSpacing: "0.3em", opacity: 0.4, marginBottom: "0.3rem" }}>§ {sNum}</div>
                          {n.title && <div style={{ color: "#c8b888", fontFamily: "Georgia, serif", fontSize: "1.1rem", fontStyle: "italic", letterSpacing: "0.05em" }}>{n.title}</div>}
                        </div>
                        {n.text
                          ? n.text.split("\n\n").map((p, i) => p.trim() ? <p key={i} style={{ margin: "0 0 1.3rem" }}>{p}</p> : null)
                          : (
                            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                              <div style={{ color: "#7a5a5a", fontSize: "0.8rem", fontStyle: "italic", marginBottom: "1rem" }}>⚠ Passage non généré</div>
                              <button onClick={() => regenNode(nodeId)} disabled={!!gybhWritingNode}
                                style={{ ...S.btn(C.gold, "small"), fontSize: "0.75rem" }}>
                                {gybhWritingNode === nodeId ? "⟳ Génération…" : "↺ Générer ce passage"}
                              </button>
                            </div>
                          )
                        }
                        {/* Badge fin */}
                        {n.isEnding && (
                          <div style={{ textAlign: "center", marginTop: "1rem" }}>
                            <div style={{ color: n.endingType === "good" ? "#7ec87e" : n.endingType === "bad" ? "#c86060" : C.gold, fontSize: "0.85rem", letterSpacing: "0.2em" }}>
                              {n.endingType === "good" ? "★ FIN HEUREUSE" : n.endingType === "bad" ? "✦ FIN TRAGIQUE" : "◆ FIN"}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── Zone de choix sous cette section ── */}
                      {!n.isEnding && (n.choices||[]).length > 0 && (
                        <div style={{ background: "#0c0b09", border: "1px solid #2a2520", borderTop: "none", borderBottom: isLast ? "none" : "1px solid #2a2520", padding: "1rem 1.75rem" }}>
                          <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: "#4a3a28", marginBottom: "0.6rem" }}>
                            {choiceMade ? "CHOIX EFFECTUÉ — cliquez sur un autre pour changer de branche" : "FAITES VOTRE CHOIX"}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                            {(n.choices||[]).map((c, ci) => {
                              const isSelected = choiceMade?.childId === c.childId;
                              return (
                                <button key={ci}
                                  onClick={() => {
                                    // Reconstruire le chemin jusqu'à ce nœud + nouveau choix
                                    setGybhReadingNode(c.childId);
                                  }}
                                  style={{
                                    ...S.btn(isSelected ? C.gold : "#1a2a1a"),
                                    textAlign: "left", fontSize: "0.85rem", padding: "0.6rem 1rem",
                                    color: isSelected ? C.gold : "#8abcce",
                                    border: isSelected ? `1px solid ${C.gold}` : "1px solid #2a3a4a",
                                    background: isSelected ? `${C.gold}12` : "transparent",
                                    fontWeight: isSelected ? "bold" : "normal",
                                  }}>
                                  {isSelected ? "✓ " : "→ "}{c.text}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ── Actions finales ── */}
                <div style={{ background: "#0c0b09", border: "1px solid #2a2520", borderTop: "none", borderRadius: "0 0 4px 4px", padding: "1rem 1.75rem", display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
                  {gybhNodes[gybhReadingNode]?.isEnding && (
                    <button onClick={() => setGybhReadingNode(gybhRootId)}
                      style={{ ...S.btn("#3a6a5a", "small"), fontSize: "0.78rem" }}>
                      ↺ Recommencer depuis le début
                    </button>
                  )}
                  <button onClick={() => { setGybhReadingNode(null); setGybhProgress({ step: "", pct: 0 }); }}
                    style={{ ...S.btn("#3a3028", "small"), fontSize: "0.78rem" }}>
                    📋 Voir l'arbre
                  </button>
                  <button onClick={exportGybhHtml}
                    style={{ ...S.btn(C.blue, "small"), fontSize: "0.78rem" }}>
                    ⬇ HTML
                  </button>
                  <button onClick={exportGybhEpub}
                    style={{ ...S.btn("#7a5a9a", "small"), fontSize: "0.78rem" }}>
                    📖 EPUB
                  </button>
                  <button onClick={exportGybhPdf}
                    style={{ ...S.btn("#6a3a2a", "small"), fontSize: "0.78rem" }}>
                    📄 PDF
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
        <DebugPanel advancedMode={advancedMode} onAdvancedToggle={handleAdvancedToggle} themeMode={themeMode} setThemeMode={setThemeMode} onShowHelp={() => setShowAdvancedHelp(true)} chatProps={{
          parts, chapters, choices, genres, writingStyle, language, advancedMode,
          setAdvancedMode, setNextInclude, setNextExclude, setAxes, setPendingAction,
          bookTitle, narrator, setWritingStyle, generateSuite, generateAxes, generate,
          setGenres, setNarrator, setLanguage, setDuration, setClassicSource,
          classicSource, searchClassicSource,
          setInitInclude, setInitExclude,
          generateBtnRef, setGeneratePulse,
          importText,
          axes, selectedAxis, setSelectedAxis, lastAxes,
          nextWords, setNextWords,
          bookMode, setBookMode,
          ended, setEnded,
          showEndingPicker, setShowEndingPicker,
          chapterSuggestion, setChapterSuggestion,
          currentChapter, setCurrentChapter,
          showRewriteModal, setShowRewriteModal,
          rewriteTargetStyle, setRewriteTargetStyle,
          showTranslatePanel, setShowTranslatePanel,
          translateTargetLang, setTranslateTargetLang,
          translateBook, saveProject, closeCurrentChapter,
          movePart: (idx, dir) => setParts(prev => { const np = [...prev]; const t = idx + dir; if (t < 0 || t >= np.length) return np; [np[idx], np[t]] = [np[t], np[idx]]; return np; }),
          updateLastPart: (newText) => setParts(prev => prev.map((p, i) => i === prev.length - 1 ? { ...p, text: newText } : p)),
          extendLastParagraph, extendParagraph, rewriteParagraph, chatInjectRef,
          nsfwEnabled, triggerNsfwModal: () => setShowNsfwModal(true), onIndexBlocks: indexAllBlocks, indexingBlocks, blocksCount: blocks.length, blocksSummarized: blocks.filter(b => b.summary && !b.summaryIsChapter).length, onChatbotWarn: () => setShowChatbotWarn(true),
          nextNsfw, setNextNsfw,
          setBookTitle,
          duration, setDuration, blocks
        }} />
      </div>
    );
  }


  // ── Render BookPreview ───────────────────────────────────────────
  if (showBook && book) {
    return (
      <ThemeContext.Provider value={theme}>
        <BookPreview
          book={book}
          onClose={() => setShowBook(false)}
          onDownload={downloadBook}
          downloading={downloading}
          onUpdateImage={handleUpdateImage}
          savingEpub={savingEpub}
          onDownloadEpub={downloadEpub}
          advancedMode={advancedMode}
          t={t}
          characters={characters}
          locations={locations}
          onExtrasChange={(extras) => setBook(prev => prev ? { ...prev, extras } : prev)}
          onPartsChange={(newParts) => {
            setParts(newParts);
            setBook(prev => prev ? { ...prev, parts: newParts } : prev);
          }}
          onChaptersChange={(newChapters) => {
            setChapters(newChapters);
            setBook(prev => prev ? { ...prev, chapters: newChapters } : prev);
          }}
          chatInjectRef={chatInjectRef}
        />
      </ThemeContext.Provider>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────
  return (
    <ThemeContext.Provider value={theme}>
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "Georgia, serif", padding: "2rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", transition: "background 0.3s, color 0.3s" }}>
      <style>{`textarea:focus,input:focus{border-color:${theme.gold}!important;outline:none}button:hover{opacity:.82}@keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes pulse{0%,100%{transform:scale(.8);opacity:.3}50%{transform:scale(1.2);opacity:1}}.word-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;border-radius:2px;outline:none;cursor:pointer}.word-slider::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${theme.gold};border:2px solid ${theme.bg};cursor:pointer}.word-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:${theme.gold};border:2px solid ${theme.bg};cursor:pointer}`}</style>

      {/* ── Banner restauration auto-save ── */}
      {showRestoreBanner && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9000, background: C.card, borderBottom: `2px solid ${C.gold}`, padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ color: C.gold, fontSize: "0.8rem", letterSpacing: "0.05em" }}>
            💾 Une session précédente a été sauvegardée automatiquement. Voulez-vous la restaurer ?
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={restoreAutoSave} style={{ ...S.btn(C.gold, "small"), fontSize: "0.72rem" }}>✓ Restaurer</button>
            <button onClick={dismissRestoreBanner} style={{ ...S.btn("#555", "small"), fontSize: "0.72rem" }}>✕ Ignorer</button>
          </div>
        </div>
      )}

      {/* ── Indicateur auto-save ── */}
      {autoSaveStatus && (
        <div style={{ position: "fixed", bottom: "3.5rem", right: "1rem", zIndex: 888, fontSize: "0.65rem", color: autoSaveStatus === "error" ? "#e07070" : C.gold, opacity: 0.8, letterSpacing: "0.08em", fontStyle: "italic", pointerEvents: "none", animation: "fadein 0.3s ease" }}>
          {autoSaveStatus === "saving" ? "💾 Sauvegarde…" : autoSaveStatus === "saved" ? "✓ Auto-sauvegardé" : "⚠ Auto-save échoué"}
        </div>
      )}

      {/* NSFW modal */}
      {showNsfwModal && <NsfwPasswordModal t={t} onSuccess={()=>{setNsfwEnabled(true); setNextNsfw(true); setShowNsfwModal(false);}} onCancel={()=>setShowNsfwModal(false)}/>}

      {/* ── ? flottant haut droite ── */}
      <button onClick={() => setShowStartGuide(true)}
        title="Guide de démarrage"
        style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 500, width: 28, height: 28, borderRadius: "50%", background: C.panelBg, border: `1px solid ${C.gold}55`, color: C.gold, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7, backdropFilter: "blur(4px)", transition: "opacity 0.2s", fontFamily: "Georgia, serif" }}
        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
        onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
        ?
      </button>

      {/* ── Guide de démarrage ── */}
      {showStartGuide && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: C.panelBg, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "2rem 2.5rem", maxWidth: 660, width: "100%", fontFamily: "Georgia, serif", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto", marginTop: "auto", marginBottom: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: "0.25rem", fontSize: "1.3rem" }}>📖</div>
            <h3 style={{ color: C.gold, margin: "0 0 0.25rem", textAlign: "center", fontSize: "1.05rem", letterSpacing: "0.1em" }}>Bienvenue dans l'Atelier des Récits</h3>
            <p style={{ color: C.muted, fontSize: "0.75rem", textAlign: "center", margin: "0 0 1.5rem", fontStyle: "italic" }}>Écrivons ensemble une histoire</p>

            {[
              ["🌍", "Langue", "Choisissez la langue dans laquelle l'histoire sera écrite. Le texte généré, les titres et les dialogues suivront cette langue."],
              ["📖", "Type de récit", null, [
                ["📖 Récit classique", "L'histoire se déroule de façon linéaire. Vous générez suite après suite, organisez le texte en chapitres, choisissez la fin. Idéal pour un roman ou une nouvelle."],
                ["🎲 Dont vous êtes le héros — Mode simple", "Vous définissez le cadre et l'application génère automatiquement toute l'arborescence de choix. Rapide et complet."],
              ]],
              ["⏱", "Longueur", "Définissez le nombre de mots du premier passage. Cette longueur s'applique aussi aux suites. Vous pouvez la modifier entre chaque génération."],
              ["🎭", "Genre(s)", "Choisissez un ou plusieurs genres littéraires. Les genres se combinent et influencent l'univers, le ton et les personnages. Fantasy + Romance, SF + Thriller… tout est possible."],
              ["👁", "Point de vue", "Choisissez le narrateur : première personne (je), troisième personne (il/elle), ou omniscient. Ce choix influence profondément le style narratif."],
            ].map(([icon, title, desc, sub]) => (
              <div key={title} style={{ display: "flex", gap: "0.9rem", marginBottom: "1rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.1rem", minWidth: "1.5rem", textAlign: "center", marginTop: "0.1rem", flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.gold, fontSize: "0.83rem", fontWeight: "bold", marginBottom: "0.2rem" }}>{title}</div>
                  {desc && <div style={{ color: C.text, fontSize: "0.77rem", lineHeight: 1.55, opacity: 0.85 }}>{desc}</div>}
                  {sub && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.35rem" }}>
                      {sub.map(([label, d]) => (
                        <div key={label} style={{ background: `${C.gold}08`, border: `1px solid ${C.gold}22`, borderRadius: 5, padding: "0.35rem 0.6rem" }}>
                          <div style={{ color: C.gold, fontSize: "0.74rem", marginBottom: "0.15rem", opacity: 0.9 }}>{label}</div>
                          <div style={{ color: C.text, fontSize: "0.73rem", lineHeight: 1.5, opacity: 0.8 }}>{d}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div style={{ background: `${C.gold}10`, border: `1px solid ${C.gold}33`, borderRadius: 6, padding: "0.65rem 0.9rem", marginBottom: "1.25rem" }}>
              <span style={{ color: C.gold, fontSize: "0.78rem", fontWeight: "bold" }}>✦ Mode avancé</span>
              <span style={{ color: C.text, fontSize: "0.75rem", opacity: 0.8, marginLeft: "0.5rem" }}>Activez-le pour débloquer les axes narratifs, les styles d'auteurs, l'assistant IA et bien plus. Accessible via le toggle en bas de page.</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", cursor: "pointer", color: C.muted, fontSize: "0.73rem", userSelect: "none" }}>
                <input type="checkbox" checked={startGuideDontShow}
                  onChange={e => setStartGuideDontShow(e.target.checked)}
                  style={{ accentColor: C.gold, cursor: "pointer" }} />
                Ne plus montrer au démarrage
              </label>
              <button onClick={() => {
                try { localStorage.setItem("atelier_start_guide_seen", startGuideDontShow ? "1" : "0"); } catch {}
                setShowStartGuide(false);
              }}
                style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}88`, borderRadius: 6, color: C.gold, padding: "0.55rem 2.5rem", cursor: "pointer", fontSize: "0.9rem", fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>
                OK — commençons !
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode avancé — mode d'emploi */}
      {showAdvancedHelp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: C.panelBg, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "2rem 2.5rem", maxWidth: 700, width: "100%", fontFamily: "Georgia, serif", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto", marginTop: "auto", marginBottom: "auto" }}>
            <div style={{ fontSize: "1.2rem", textAlign: "center", marginBottom: "0.4rem" }}>✦</div>
            <h3 style={{ color: C.gold, margin: "0 0 0.25rem", textAlign: "center", fontSize: "1.05rem", letterSpacing: "0.1em" }}>Mode avancé — toutes les fonctionnalités</h3>
            <p style={{ color: C.muted, fontSize: "0.73rem", textAlign: "center", margin: "0 0 1.25rem", fontStyle: "italic" }}>Configuration enrichie et outils narratifs</p>

            <div style={{ marginBottom: "0.6rem" }}>
              <div style={{ color: C.gold, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7, marginBottom: "0.5rem" }}>Configuration</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem 1.2rem" }}>
                {[
                  ["🖋", "Style d'auteur", "Imposez le style littéraire d'un auteur précis (Flaubert, Lovecraft, P.K. Dick…). La prose, le rythme et le vocabulaire s'adaptent."],
                  ["📚", "Source narrative", "Partez d'un livre existant (l'IA connaît l'univers), importez un texte, ou laissez l'imagination libre."],
                  ["✏️", "Inclusion / Exclusion initiale", "Précisez dès le départ des éléments à inclure ou à éviter dans le premier passage généré."],
                  ["🔞", "Contenu adulte (NSFW)", "Débloquez la génération de contenu explicite dès la configuration initiale (code requis). Actif aussi pendant la génération."],
                  ["🎲", "Mode CYOA avancé", "En mode 'Dont vous êtes le héros', construisez l'arborescence nœud par nœud avec un contrôle total sur les embranchements."],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.95rem", minWidth: "1.3rem", textAlign: "center", marginTop: "0.05rem", flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ color: C.gold, fontSize: "0.78rem", fontWeight: "bold", marginBottom: "0.12rem" }}>{title}</div>
                      <div style={{ color: C.text, fontSize: "0.73rem", lineHeight: 1.5, opacity: 0.82 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: "100%", height: 1, background: C.border, opacity: 0.4, margin: "0.9rem 0" }} />

            <div style={{ marginBottom: "0.6rem" }}>
              <div style={{ color: C.gold, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7, marginBottom: "0.5rem" }}>Pendant la génération</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem 1.2rem" }}>
                {[
                  ["🧭", "Axes narratifs", "Générez 3 directions possibles pour la suite et choisissez celle qui vous convient."],
                  ["✦", "Fin de chapitre", "Clôturez le chapitre avec une conclusion dramatique et ouvrez le suivant."],
                  ["📝", "Inclusion / Exclusion", "Guidez chaque suite en imposant des éléments précis à inclure ou éviter."],
                  ["↺", "Réécriture de style", "Réécrivez tout le texte existant dans le style d'un auteur choisi."],
                  ["⤢", "Extension de paragraphe", "Développez un paragraphe existant en cliquant sur son numéro §."],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.95rem", minWidth: "1.3rem", textAlign: "center", marginTop: "0.05rem", flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ color: C.gold, fontSize: "0.78rem", fontWeight: "bold", marginBottom: "0.12rem" }}>{title}</div>
                      <div style={{ color: C.text, fontSize: "0.73rem", lineHeight: 1.5, opacity: 0.82 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: "100%", height: 1, background: C.border, opacity: 0.4, margin: "0.9rem 0" }} />

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ color: C.gold, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7, marginBottom: "0.5rem" }}>Assistant narratif (chatbot)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem 1.2rem" }}>
                {[
                  ["🤖", "Chatbot narratif", "Posez des questions sur votre histoire : cohérence, personnages, rebondissements. Consomme des crédits API à chaque message."],
                  ["📑", "Indexation RAG", "Résumez l'histoire en blocs pour que l'assistant navigue efficacement dans les longs textes."],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.95rem", minWidth: "1.3rem", textAlign: "center", marginTop: "0.05rem", flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ color: C.gold, fontSize: "0.78rem", fontWeight: "bold", marginBottom: "0.12rem" }}>{title}</div>
                      <div style={{ color: C.text, fontSize: "0.73rem", lineHeight: 1.5, opacity: 0.82 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ color: C.muted, fontSize: "0.71rem", fontStyle: "italic", margin: "0 0 0.9rem", lineHeight: 1.5, textAlign: "center" }}>
              💡 En compte gratuit, le chatbot et les résumés automatiques consomment des crédits — utilisez-les avec discernement.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", cursor: "pointer", color: C.muted, fontSize: "0.73rem", userSelect: "none" }}>
                <input type="checkbox" checked={advancedHelpDontShow}
                  onChange={e => setAdvancedHelpDontShow(e.target.checked)}
                  style={{ accentColor: C.gold, cursor: "pointer" }} />
                Ne plus montrer au démarrage
              </label>
              <button onClick={() => {
                try { localStorage.setItem("atelier_advanced_help_seen", advancedHelpDontShow ? "1" : "0"); } catch {}
                setShowAdvancedHelp(false);
              }}
                style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}88`, borderRadius: 6, color: C.gold, padding: "0.55rem 2.5rem", cursor: "pointer", fontSize: "0.9rem", fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot — avertissement crédits */}
      {showChatbotWarn && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: C.panelBg, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "2rem", maxWidth: 400, width: "100%", fontFamily: "Georgia, serif", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: "1.4rem", textAlign: "center", marginBottom: "0.75rem" }}>🤖</div>
            <h3 style={{ color: C.gold, margin: "0 0 1rem", textAlign: "center", fontSize: "1rem", letterSpacing: "0.08em" }}>Assistant narratif</h3>
            <p style={{ color: C.text, fontSize: "0.85rem", lineHeight: 1.65, margin: "0 0 0.85rem" }}>
              Le chatbot effectue un <strong style={{ color: C.gold }}>appel API à chaque message</strong>. Sur un compte gratuit, quelques échanges peuvent suffire à épuiser votre quota de la session.
            </p>
            <p style={{ color: C.text, fontSize: "0.85rem", lineHeight: 1.65, margin: "0 0 1.5rem" }}>
              Utilisez-le pour des questions importantes (cohérence, personnages, rebondissements) et préférez la génération directe pour le reste.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setShowChatbotWarn(false)}
                style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: "0.5rem 1.1rem", cursor: "pointer", fontSize: "0.85rem", fontFamily: "Georgia, serif" }}>
                Annuler
              </button>
              <button onClick={() => {
                try { localStorage.setItem("atelier_chatbot_warn_seen", "1"); } catch {}
                setShowChatbotWarn(false);
                // La bulle s'ouvrira via le prochain clic
              }}
                style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}88`, borderRadius: 6, color: C.gold, padding: "0.5rem 1.1rem", cursor: "pointer", fontSize: "0.85rem", fontFamily: "Georgia, serif" }}>
                J'ai compris — utiliser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale mise à jour carnet (fichier ancien) ── */}
      {showCarnetUpgrade && (() => {
        const chapCount = Math.max(...parts.map(p => (p.chapterIdx ?? 0))) + 1 || 1;
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
            <div style={{ background: C.panelBg, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "2rem 2.5rem", maxWidth: 500, width: "100%", fontFamily: "Georgia, serif", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto", marginTop: "auto", marginBottom: "auto" }}>
              <div style={{ fontSize: "1.3rem", textAlign: "center", marginBottom: "0.5rem" }}>📋</div>
              <h3 style={{ color: C.gold, margin: "0 0 0.75rem", textAlign: "center", fontSize: "1rem", letterSpacing: "0.08em" }}>Carnet de bord absent</h3>
              <p style={{ color: C.text, fontSize: "0.82rem", lineHeight: 1.65, margin: "0 0 0.85rem" }}>
                Ce fichier a été créé avec une version antérieure de l'Atelier. Il ne contient pas encore de <strong style={{ color: C.gold }}>Carnet de bord</strong> (personnages et lieux).
              </p>
              <p style={{ color: C.text, fontSize: "0.82rem", lineHeight: 1.65, margin: "0 0 1rem" }}>
                Voulez-vous analyser l'histoire maintenant pour le construire automatiquement ?
              </p>
              <div style={{ background: `${C.gold}0d`, border: `1px solid ${C.gold}33`, borderRadius: 6, padding: "0.7rem 1rem", marginBottom: "1.25rem" }}>
                <div style={{ color: C.gold, fontSize: "0.75rem", fontWeight: "bold", marginBottom: "0.25rem" }}>⚠ Consommation API</div>
                <div style={{ color: C.text, fontSize: "0.75rem", lineHeight: 1.5, opacity: 0.85 }}>
                  Cette opération effectuera <strong style={{ color: C.gold }}>{chapCount} appel{chapCount > 1 ? "s" : ""} API</strong> (1 par chapitre). Sur un compte gratuit, cela peut consommer une part notable de votre quota de session.
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button onClick={() => setShowCarnetUpgrade(false)}
                  style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.85rem", fontFamily: "Georgia, serif" }}>
                  Plus tard
                </button>
                <button onClick={upgradeCarnetFromAllChapters}
                  style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}88`, borderRadius: 6, color: C.gold, padding: "0.5rem 1.5rem", cursor: "pointer", fontSize: "0.85rem", fontFamily: "Georgia, serif" }}>
                  Analyser ({chapCount} chapitre{chapCount > 1 ? "s" : ""})
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Modale Type de récit ── */}
      {showRecitHelp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: C.panelBg, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "2rem 2.5rem", maxWidth: 640, width: "100%", fontFamily: "Georgia, serif", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto", marginTop: "auto", marginBottom: "auto" }}>
            <div style={{ fontSize: "1.2rem", textAlign: "center", marginBottom: "0.4rem" }}>📖</div>
            <h3 style={{ color: C.gold, margin: "0 0 1.25rem", textAlign: "center", fontSize: "1.05rem", letterSpacing: "0.1em" }}>Types de récit</h3>
            {[
              ["📖", "Récit classique", "L'histoire se déroule de façon linéaire. Vous générez le premier passage, puis des suites successives. Vous organisez le texte en chapitres, choisissez la fin, et pouvez réécrire ou étendre n'importe quel passage. Idéal pour un roman, une nouvelle ou un texte narratif continu."],
              ["🎲", "Dont vous êtes le héros — Mode simple", "Vous définissez le cadre de l'histoire (univers, personnage, point de départ) et l'application génère automatiquement toute l'arborescence de choix et de fins possibles. Rapide et complet, sans intervention de votre part. À la fin, vous pouvez exporter le livre en HTML navigable."],
              ["🎲✦", "Dont vous êtes le héros — Mode avancé", "Nécessite d'activer le mode avancé (toggle en bas de page). Vous construisez l'arborescence nœud par nœud : vous choisissez les embranchements, rédigez ou générez chaque passage, définissez les choix proposés au lecteur. Contrôle total sur la structure narrative."],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: "0.9rem", marginBottom: "1.1rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.1rem", minWidth: "1.8rem", textAlign: "center", marginTop: "0.1rem", flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ color: C.gold, fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.25rem" }}>{title}</div>
                  <div style={{ color: C.text, fontSize: "0.78rem", lineHeight: 1.6, opacity: 0.85 }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
              <button onClick={() => setShowRecitHelp(false)}
                style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}88`, borderRadius: 6, color: C.gold, padding: "0.55rem 2.5rem", cursor: "pointer", fontSize: "0.9rem", fontFamily: "Georgia, serif" }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale Genre ── */}
      {showGenreHelp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: C.panelBg, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "2rem 2.5rem", maxWidth: 540, width: "100%", fontFamily: "Georgia, serif", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto", marginTop: "auto", marginBottom: "auto" }}>
            <div style={{ fontSize: "1.2rem", textAlign: "center", marginBottom: "0.4rem" }}>🎭</div>
            <h3 style={{ color: C.gold, margin: "0 0 1rem", textAlign: "center", fontSize: "1.05rem", letterSpacing: "0.1em" }}>Genres littéraires</h3>
            <p style={{ color: C.text, fontSize: "0.82rem", lineHeight: 1.65, margin: "0 0 0.9rem" }}>
              Vous pouvez sélectionner <strong style={{ color: C.gold }}>plusieurs genres</strong> qui se combinent pour définir l'univers, le ton et les personnages. Par exemple : <em>Fantasy + Romance</em> donnera une histoire épique avec une dimension sentimentale forte, <em>SF + Thriller</em> produira un récit de science-fiction haletant.
            </p>
            {advancedMode && (
              <div style={{ background: `${C.gold}0d`, border: `1px solid ${C.gold}33`, borderRadius: 6, padding: "0.75rem 1rem", marginBottom: "0.9rem" }}>
                <div style={{ color: C.gold, fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.35rem" }}>✦ Poids des genres (mode avancé)</div>
                <p style={{ color: C.text, fontSize: "0.78rem", lineHeight: 1.6, margin: 0 }}>
                  En mode avancé, cliquez plusieurs fois sur un genre pour augmenter son importance dans le récit. Les points indiquent le poids :
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.5rem" }}>
                  {[["●○○", "Présent — influence légère"], ["●●○", "Important — influence marquée"], ["●●●", "Dominant — influence forte"]].map(([dots, label]) => (
                    <div key={dots} style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                      <span style={{ color: C.gold, fontFamily: "monospace", fontSize: "0.75rem", minWidth: "2.5rem" }}>{dots}</span>
                      <span style={{ color: C.text, fontSize: "0.75rem", opacity: 0.85 }}>{label}</span>
                    </div>
                  ))}
                </div>
                <p style={{ color: C.muted, fontSize: "0.72rem", fontStyle: "italic", margin: "0.5rem 0 0" }}>
                  Un 4ème clic désélectionne le genre.
                </p>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button onClick={() => setShowGenreHelp(false)}
                style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}88`, borderRadius: 6, color: C.gold, padding: "0.55rem 2.5rem", cursor: "pointer", fontSize: "0.9rem", fontFamily: "Georgia, serif" }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <h1 style={{ fontSize: "clamp(1.5rem,5vw,2.5rem)", color: C.gold, letterSpacing: "0.15em", textAlign: "center", margin: "0 0 0.3rem", textShadow: "0 0 40px rgba(201,169,110,0.2)" }}>
        {t.appTitle}
      </h1>
      <div style={{ textAlign:"center", marginBottom:"0.3rem" }}><span style={{ color:"#5a5040", fontSize:"0.65rem", letterSpacing:"0.18em" }}>✦ {t.powered}</span></div>
      <p style={{ color: C.muted, fontStyle: "italic", marginBottom: "2.5rem", textAlign: "center" }}>{t.appSub}</p>

      {/* ── FORMULAIRE ── */}
      {parts.length === 0 && !loading && (
        <div style={{ width: "100%", maxWidth: 620, animation: "fadein 0.4s ease" }}>
          <Section label={t.langLabel}>
            {LANGUAGES.map(l => (
              <button key={l.value} onClick={() => setLanguage(l.value)} style={S.chip(language === l.value)}>
                {l.flag} {(UI_LANGS[l.value]||UI_LANGS.french).appTitle.split(" ")[0]}
                {language===l.value && <span style={{ marginLeft:".3rem", fontSize:".7rem", color:"#c9a96e" }}>✓</span>}
              </button>
            ))}
          </Section>

          {/* ── Sélecteur mode classique / LDVELH ── */}
          {!importMode && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase" }}>Type de récit</span>
                <button onClick={() => setShowRecitHelp(true)} title="En savoir plus sur les types de récit"
                  style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: "50%", color: C.muted, fontSize: "0.6rem", width: "1.1rem", height: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1, flexShrink: 0 }}>
                  ?
                </button>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => { setBookMode("classic"); setBookTitle(""); setGybhPhase("idle"); }}
                  style={{ ...S.chip(bookMode === "classic"), flex: 1, textAlign: "center", fontSize: "0.75rem", padding: "0.5rem 0.25rem" }}>
                  📖 Récit classique
                </button>
                <button onClick={() => { setBookMode("gybh"); setBookTitle(""); setImportMode(false); setImportText(""); setImportAnalysis(null); }}
                  style={{ ...S.chip(bookMode === "gybh"), flex: 1, textAlign: "center", fontSize: "0.75rem", padding: "0.5rem 0.25rem" }}>
                  🎲 Récit dont vous êtes le héros
                </button>
              </div>
            </div>
          )}

          <Section label={t.durLabel}>
            {t.durations.map(d => (
              <button key={d.v} onClick={() => setDuration(d.v)} style={S.chip(duration === d.v)}>
                {d.l}<span style={{ opacity: .5, fontSize: ".73rem" }}> — {d.d}</span>
              </button>
            ))}
          </Section>

          <Section label={
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {genres.length > 1 ? t.genreSelected(genres.length, buildGenreStr(genres, genreWeights)) : t.genreLabel}
              <button onClick={() => setShowGenreHelp(true)} title="Comment fonctionnent les genres"
                style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: "50%", color: C.muted, fontSize: "0.55rem", width: "1rem", height: "1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1, flexShrink: 0, verticalAlign: "middle" }}>
                ?
              </button>
            </span>
          }>
            {GENRES.map(g => {
              const locked = g.nsfw && !nsfwEnabled;
              const active = genres.includes(g.value);
              const w = active ? (genreWeights[g.value] || 1) : 0;
              const dots = advancedMode && active ? (
                <span style={{ marginLeft: "0.35rem", fontSize: "0.6rem", letterSpacing: "0.05em", color: C.gold }}>
                  {"●".repeat(w)}{"○".repeat(3 - w)}
                </span>
              ) : active ? <span style={{ marginLeft: ".3rem", fontSize: ".7rem", color: C.gold }}>✓</span> : null;
              return (
                <button key={g.value} onClick={() => toggleGenre(g.value)}
                  style={{ ...S.chip(active), opacity: locked ? 0.2 : 1, cursor: locked ? "not-allowed" : "pointer", filter: locked ? "blur(2px) grayscale(1)" : "none" }}>
                  {g.emoji} {locked ? "██████" : (t.genres.find(x => x.v === g.value)?.l || g.label)}{dots}
                </button>
              );
            })}
          </Section>

          <Section label={t.narratorLabel}>
            {["third","first","second"].map(v => <button key={v} onClick={() => setNarrator(v)} style={S.chip(narrator === v)}>{t.narrators[v]}</button>)}
          </Section>

          {/* Mode avancé : style d'écriture + personnalisation + NSFW */}
          {advancedMode && (
            <div style={{ background: C.card, border: "1px solid #2a2520", borderRadius: 4, padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={S.label}>{t.customLabel}</div>
                <Toggle on={nsfwEnabled} onChange={handleNsfwToggle} label={t.adultLabel} color="#c94040" />
              </div>

              {/* Style d'écriture */}
              {/* ── Source narrative — récit classique (mode avancé) ── */}
              {bookMode === "classic" && (
                <div style={{ marginBottom: "1.25rem", borderBottom: "1px solid #2a2520", paddingBottom: "1.25rem" }}>
                  <div style={{ ...S.label, color: C.blue, marginBottom: "0.5rem" }}>📖 Source narrative</div>
                  <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem" }}>
                    {[
                      { val: "original", label: "✦ Création libre" },
                      { val: "known",    label: "📚 Livre / Film" },
                      { val: "upload",   label: "📄 Texte importé" },
                    ].map(({ val, label }) => (
                      <button key={val} onClick={() => setClassicSource(s => ({ ...s, type: val }))}
                        style={{ ...S.chip(classicSource.type === val), flex: 1, textAlign: "center", fontSize: "0.7rem", padding: "0.4rem 0.25rem" }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {classicSource.type === "known" && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <input type="text" placeholder="Ex: Dune — Frank Herbert, Star Wars EP IV…"
                          value={classicSource.bookTitle}
                          onChange={e => setClassicSource(s => ({ ...s, bookTitle: e.target.value, context: "" }))}
                          onKeyDown={e => e.key === "Enter" && searchClassicSource()}
                          style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 3, padding: "0.4rem 0.6rem", color: C.text, fontSize: "0.75rem" }}
                        />
                        <button onClick={searchClassicSource} disabled={classicSourceLoading || !classicSource.bookTitle.trim()}
                          title="Générer une fiche depuis la connaissance de Claude"
                          style={{ ...S.btn("#2a3a4a", "small"), fontSize: "0.75rem", padding: "0.4rem 0.7rem", opacity: (!classicSource.bookTitle.trim() || classicSourceLoading) ? 0.4 : 1, whiteSpace: "nowrap" }}>
                          {classicSourceLoading ? "⟳" : "🔍"}
                        </button>
                      </div>
                      {classicSource.context && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                            <span style={{ color: classicSource.context.startsWith("⚠") ? "#e09060" : "#7ec87e", fontSize: "0.62rem" }}>
                              {classicSource.context.startsWith("⚠") ? classicSource.context : "✓ Fiche générée — éditable"}
                            </span>
                            <button onClick={() => setClassicSource(s => ({ ...s, context: "" }))}
                              style={{ ...S.btn("#3a2020", "small"), fontSize: "0.55rem", padding: "0.15rem 0.4rem" }}>✕</button>
                          </div>
                          {!classicSource.context.startsWith("⚠") && (
                            <textarea value={classicSource.context}
                              onChange={e => setClassicSource(s => ({ ...s, context: e.target.value }))}
                              rows={5}
                              style={{ width: "100%", background: C.inputBg, border: "1px solid #2a3a2a", borderRadius: 3, padding: "0.4rem 0.6rem", color: "#b0a890", fontSize: "0.62rem", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }}
                            />
                          )}
                        </div>
                      )}
                      {!classicSource.context && (
                        <p style={{ color: "#4a3a28", fontSize: "0.62rem", marginTop: "0.3rem", fontStyle: "italic" }}>
                          Clique sur 🔍 pour que Claude génère une fiche de l'œuvre.
                        </p>
                      )}
                    </div>
                  )}

                  {classicSource.type === "upload" && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <div
                        onClick={() => importFileRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.blue; }}
                        onDragLeave={e => { e.currentTarget.style.borderColor = "#2a3a4a"; }}
                        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#2a3a4a"; const f = e.dataTransfer.files?.[0]; if (f) handleImportFile(f); }}
                        style={{ border: `1px dashed ${importText ? C.blue : "#2a3a4a"}`, borderRadius: 4, padding: "0.85rem", textAlign: "center", cursor: "pointer", background: importText ? "rgba(100,160,220,0.05)" : "transparent", transition: "all 0.2s" }}>
                        {importText ? (
                          <div>
                            <div style={{ color: C.blue, fontSize: "0.78rem", marginBottom: "0.2rem" }}>✓ {importFileName}</div>
                            <div style={{ color: "#4a6a8a", fontSize: "0.65rem" }}>{importText.split(/\s+/).filter(Boolean).length.toLocaleString()} mots — cliquer pour changer</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: "1.5rem", opacity: 0.3, marginBottom: "0.3rem" }}>📄</div>
                            <div style={{ color: "#4a6a8a", fontSize: "0.75rem" }}>Glisser-déposer ou cliquer pour charger</div>
                            <div style={{ color: "#3a4a5a", fontSize: "0.65rem", marginTop: "0.2rem", fontStyle: "italic" }}>Formats : .txt, .md, .docx, .pdf, .epub</div>
                          </div>
                        )}
                      </div>
                      <input ref={importFileRef} type="file" accept=".txt,.md,.docx,.pdf,.epub" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ""; }} />
                      {analyzingImport && <p style={{ color: C.blue, fontSize: "0.7rem", marginTop: "0.4rem", fontStyle: "italic" }}>✦ Analyse en cours…</p>}
                      {importAnalysis && !importAnalysis.error && !analyzingImport && (
                        <div style={{ marginTop: "0.5rem", padding: "0.6rem", background: "#080f14", border: `1px solid ${C.blue}44`, borderRadius: 4, fontSize: "0.7rem" }}>
                          <div style={{ color: C.blue, fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "0.3rem" }}>✦ ANALYSE</div>
                          {importAnalysis.summary && <p style={{ color: "#7a9ab8", fontStyle: "italic", lineHeight: 1.5, marginBottom: "0.3rem" }}>{importAnalysis.summary}</p>}
                          <div style={{ color: "#4a6a8a", fontSize: "0.6rem" }}>
                            {(importAnalysis.genres || []).map(g => GENRES.find(x => x.value === g)).filter(Boolean).map(g => `${g.emoji} ${g.label}`).join(" · ")}
                            {importAnalysis.narrator && ` · ${{ third: "3ème personne", first: "1ère personne", second: "2ème personne" }[importAnalysis.narrator]}`}
                          </div>
                        </div>
                      )}
                      {importAnalysis?.error && !analyzingImport && (
                        <p style={{ color: "#e07070", fontSize: "0.7rem", marginTop: "0.4rem", fontStyle: "italic" }}>⚠ Analyse échouée — renseignez le genre manuellement.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Style d'écriture */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ ...S.label, color: C.gold, marginBottom: "0.4rem" }}>✦ Style d'écriture</div>
                <div style={{ position: "relative" }}>
                  <select
                    value={writingStyle}
                    onChange={e => setWritingStyle(e.target.value)}
                    style={{ ...S.input, minHeight: "unset", height: "38px", resize: "none", appearance: "none", WebkitAppearance: "none", paddingRight: "2rem", cursor: "pointer", color: writingStyle ? C.text : "#5a4a3a" }}>
                    <option value="">— Aucun style particulier —</option>
                    {AUTHORS.map(group => (
                      <optgroup key={group.group} label={`── ${group.group} ──`}>
                        {group.authors.map(author => (
                          <option key={author} value={author}>À la manière de {author}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", color: C.gold, pointerEvents: "none", fontSize: "0.7rem" }}>▾</span>
                </div>
                {writingStyle && (
                  <p style={{ color: "#7a6a50", fontSize: "0.7rem", fontStyle: "italic", marginTop: "0.35rem" }}>
                    ✦ L'histoire sera rédigée à la manière de <span style={{ color: C.gold }}>{writingStyle}</span>
                  </p>
                )}
              </div>

              <CustomZone include={initInclude} exclude={initExclude} setInclude={setInitInclude} setExclude={setInitExclude} />
            </div>
          )}

          {/* ── Options GYBH avancées (curseur profondeur + guidage) ── */}
          {/* ── Options GYBH avancées (curseur profondeur) ── */}
          {advancedMode && !importMode && bookMode === "gybh" && (
            <div style={{ background: C.card, border: "1px solid #2a2520", borderRadius: 4, padding: "0.9rem 1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ ...S.label, marginBottom: "0.6rem" }}>✦ Options récit interactif</div>

              {/* Source narrative */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ ...S.label, fontSize: "0.7rem", marginBottom: "0.4rem" }}>Source narrative</div>
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  {[
                    { val: "original", label: "✦ Création libre" },
                    { val: "known",    label: "📚 Livre connu" },
                    { val: "upload",   label: "📄 Texte importé" },
                  ].map(({ val, label }) => (
                    <button key={val} onClick={() => setGybhSource(s => ({ ...s, type: val }))}
                      style={{ ...S.btn(gybhSource.type === val ? C.gold : C.border, "small"), fontSize: "0.65rem", flex: 1, opacity: 1, border: gybhSource.type === val ? `1px solid ${C.gold}` : "1px solid #3a3028" }}>
                      {label}
                    </button>
                  ))}
                </div>

                {gybhSource.type === "known" && (
                  <div>
                    {/* Ligne titre + bouton Wikipedia */}
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="Titre et auteur (ex: Dune — Frank Herbert)"
                        value={gybhSource.bookTitle}
                        onChange={e => { setGybhSource(s => ({ ...s, bookTitle: e.target.value, wikiContext: "", wikiOpen: false })); setWikiCandidates([]); }}
                        style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 3, padding: "0.4rem 0.6rem", color: C.text, fontSize: "0.75rem", boxSizing: "border-box" }}
                      />
                      <button
                        onClick={async () => {
                          const query = gybhSource.bookTitle.trim();
                          if (!query) return;
                          setWikiLoading(true); setSearchResults(null); setGybhSource(s => ({ ...s, wikiContext: "", wikiOpen: false }));

                          const cleanWikitext = (t) => t
                            .replace(/==+\s*[^=]+\s*==+/g, "")
                            .replace(/^\s*vignette\s*\|[^\n]*/gm, "")
                            .replace(/^\s*thumb\s*\|[^\n]*/gm, "")
                            .replace(/^\s*(File|Image|Fichier):[^\n]*/gim, "")
                            .replace(/\[\[(?:File|Image|Fichier|Cat\u00e9gorie|Category):[^\]]*\]\]/gi, "")
                            .replace(/\[\[([^\]|]*\|)?([^\]]+)\]\]/g, "$2")
                            .replace(/\{\{[^}]*\}\}/g, "")
                            .replace(/<ref[^>]*\/>/g, "")
                            .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
                            .replace(/<[^>]+>/g, "")
                            .replace(/<!--[\s\S]*?-->/g, "")
                            .replace(/'{2,}/g, "")
                            .replace(/^\*\s*\S[^:\n]{0,25}\n/gm, "")
                            .replace(/^[|!][^\n]*/gm, "")
                            .replace(/\n{3,}/g, "\n\n")
                            .trim();

                          const fetchWikiText = async (pageTitle, lang) => {
                            const sectionsUrl = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=sections&format=json&origin=*`;
                            const sr = await fetch(sectionsUrl); const sd = await sr.json();
                            const sections = sd.parse?.sections || [];
                            const narrativeKeywords = ["synopsis", "résumé", "intrigue", "personnage", "plot", "summary", "characters", "story"];
                            const targetSections = sections.filter(s => narrativeKeywords.some(k => s.line.toLowerCase().includes(k)));
                            if (targetSections.length > 0) {
                              const texts = await Promise.all(targetSections.slice(0, 3).map(async (sec) => {
                                const u = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=wikitext&section=${sec.index}&format=json&origin=*`;
                                const r = await fetch(u); const d = await r.json();
                                return `[${sec.line}]\n` + cleanWikitext(d.parse?.wikitext?.["*"] || "").slice(0, 1200);
                              }));
                              return texts.join("\n\n");
                            }
                            const introUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
                            const ir = await fetch(introUrl); const id2 = await ir.json();
                            return Object.values(id2.query?.pages || {})[0]?.extract?.slice(0, 2000) || "";
                          };

                          try {
                            const [tmdbRaw, olRaw, wikiRaw] = await Promise.allSettled([
                              // TMDB — retourner les 10 premiers résultats
                              (async () => {
                                const apiUrl = `https://api.themoviedb.org/3/search/multi?api_key=666af4054cb4c8ae4aea723902cf60b7&query=${encodeURIComponent(query)}&language=fr-FR`;
                                const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`);
                                const d = await r.json();
                                const data = JSON.parse(d.contents || "{}");
                                return (data.results || [])
                                  .filter(r => r.media_type === "movie" || r.media_type === "tv")
                                  .slice(0, 10)
                                  .map(r => ({ type: r.media_type === "tv" ? "Série TV" : "Film", title: r.title || r.name, year: (r.release_date || r.first_air_date || "").slice(0,4), text: r.overview || "" }));
                              })(),
                              // Open Library — 3 recherches combinées, 10 résultats max
                              (async () => {
                                const words = query.trim().split(/\s+/);
                                const q2 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
                                const q3 = words.filter((_, i) => i % 2 === 0).join(" ");
                                const queries = [...new Set([query, q2, q3].filter(q => q.length > 2))];
                                const seen = new Set();
                                const candidates = [];
                                await Promise.all(queries.map(async (q) => {
                                  try {
                                    const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10&fields=key,title,author_name,subject`);
                                    const d = await r.json();
                                    for (const book of (d.docs || [])) {
                                      if (!seen.has(book.key)) { seen.add(book.key); candidates.push(book); }
                                    }
                                  } catch(e) {}
                                }));
                                const results = [];
                                for (const book of candidates.slice(0, 15)) {
                                  try {
                                    const wr = await fetch(`https://openlibrary.org${book.key}.json`);
                                    const wd = await wr.json();
                                    const desc = typeof wd.description === "string" ? wd.description : wd.description?.value || "";
                                    if (desc.length > 30) results.push({ title: book.title, author: book.author_name?.[0] || "", subjects: (book.subject || []).slice(0,6).join(", "), text: desc });
                                    if (results.length >= 10) break;
                                  } catch(e) {}
                                }
                                return results;
                              })(),
                              // Wikipedia — 10 résultats FR + EN combinés
                              (async () => {
                                const searchLang = async (lang) => {
                                  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=10&format=json&origin=*`;
                                  const r = await fetch(url); const d = await r.json();
                                  return (d.query?.search || []).map(x => ({ title: x.title, lang, snippet: x.snippet?.replace(/<[^>]+>/g,"") || "" }));
                                };
                                const [frResults, enResults] = await Promise.all([searchLang("fr"), searchLang("en")]);
                                // Combiner FR en premier, EN en complément, dédupliqués sur le titre
                                const seen = new Set();
                                const combined = [];
                                for (const r of [...frResults, ...enResults]) {
                                  const key = r.title.toLowerCase();
                                  if (!seen.has(key)) { seen.add(key); combined.push(r); }
                                  if (combined.length >= 10) break;
                                }
                                return combined;
                              })()
                            ]);

                            const tmdbList = tmdbRaw.status === "fulfilled" ? (tmdbRaw.value || []) : [];
                            const olList = olRaw.status === "fulfilled" ? (olRaw.value || []) : [];
                            const wikiList = wikiRaw.status === "fulfilled" ? (wikiRaw.value || []) : [];

                            if (!tmdbList.length && !olList.length && !wikiList.length) {
                              setGybhSource(s => ({ ...s, wikiContext: "Aucun résultat trouvé." }));
                            } else {
                              setSearchResults({
                                tmdbList, olList, wikiList,
                                tmdbIdx: 0, olIdx: 0, wikiIdx: 0,
                                checked: { tmdb: tmdbList.length > 0, openLib: false, wiki: wikiList.length > 0 && !tmdbList.length },
                                wikiTextCache: {}
                              });
                            }
                          } catch(e) { setGybhSource(s => ({ ...s, wikiContext: "Erreur : " + e.message })); }
                          setWikiLoading(false);
                        }}
                        disabled={wikiLoading || !gybhSource.bookTitle.trim()}
                        style={{ ...S.btn("#1a2a3a", "small"), fontSize: "0.65rem", whiteSpace: "nowrap", border: "1px solid #2a4a6a", flexShrink: 0 }}
                      >
                        {wikiLoading ? "⏳ Recherche…" : "🔍 Enrichir"}
                      </button>
                    </div>

                    {/* Liste de candidats si plusieurs résultats */}
                    {wikiCandidates.length > 1 && (
                      <div style={{ marginTop: "0.4rem", background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 3, padding: "0.3rem" }}>
                        <p style={{ color: "#8a7a60", fontSize: "0.62rem", margin: "0 0 0.3rem 0" }}>Plusieurs résultats — choisissez :</p>
                        {wikiCandidates.map((r, i) => (
                          <button key={i} onClick={async () => {
                            setWikiLoading(true); setWikiCandidates([]);
                            const url = `https://${r.lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(r.title)}&format=json&origin=*`;
                            try {
                              const res = await fetch(url); const d = await res.json();
                              const pages = Object.values(d.query?.pages || {});
                              const extract = pages[0]?.extract || "";
                              setGybhSource(s => ({ ...s, wikiContext: extract.slice(0, 4000), wikiOpen: true }));
                            } catch(e) { setGybhSource(s => ({ ...s, wikiContext: "Erreur : " + e.message })); }
                            setWikiLoading(false);
                          }} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", borderBottom: i < wikiCandidates.length-1 ? "1px solid #2a2018" : "none", color: "#c8b090", fontSize: "0.68rem", padding: "0.25rem 0.3rem", cursor: "pointer" }}>
                            [{r.lang.toUpperCase()}] {r.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Panneau de validation des résultats */}
                    {searchResults && !gybhSource.wikiContext && (() => {
                      const cleanSnippet = (t) => (t || "").replace(/<[^>]+>/g,"").replace(/==+[^=]+==+/g,"").trim();
                      return (
                      <div style={{ marginTop: "0.5rem", border: "1px solid #2a3a4a", borderRadius: 4, overflow: "hidden", fontSize: "0.68rem" }}>
                        <div style={{ background: "#0d1520", padding: "0.35rem 0.7rem", borderBottom: "1px solid #1a2a3a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#7ab0d8", letterSpacing: "0.08em", fontSize: "0.62rem" }}>SOURCES TROUVÉES</span>
                          <span style={{ color: "#3a5a7a", fontSize: "0.58rem" }}>Sélectionnez et choisissez le bon résultat</span>
                        </div>

                        {/* ── TMDB ── */}
                        {searchResults.tmdbList.length > 0 && (
                          <div style={{ padding: "0.45rem 0.7rem", borderBottom: "1px solid #111a22", background: searchResults.checked.tmdb ? "#0a1520" : "#070d14" }}>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                              <input type="checkbox" checked={searchResults.checked.tmdb}
                                onChange={e => setSearchResults(s => ({ ...s, checked: { ...s.checked, tmdb: e.target.checked } }))} />
                              <span style={{ color: "#5a9fd4", fontWeight: "bold", fontSize: "0.65rem" }}>🎬 TMDB (Films & Séries)</span>
                            </div>
                            <select value={searchResults.tmdbIdx}
                              onChange={e => setSearchResults(s => ({ ...s, tmdbIdx: +e.target.value }))}
                              style={{ width: "100%", background: "#0d1a28", border: "1px solid #2a4a6a", color: "#a0c4e0", fontSize: "0.65rem", padding: "0.25rem 0.4rem", borderRadius: 3, marginBottom: "0.25rem" }}>
                              {searchResults.tmdbList.map((r, i) => (
                                <option key={i} value={i}>{r.type} — {r.title} {r.year ? `(${r.year})` : ""}</option>
                              ))}
                            </select>
                            <p style={{ color: "#6a8aaa", fontSize: "0.62rem", margin: 0, fontStyle: "italic", lineHeight: 1.4 }}>
                              {searchResults.tmdbList[searchResults.tmdbIdx]?.text.slice(0, 200)}{searchResults.tmdbList[searchResults.tmdbIdx]?.text.length > 200 ? "…" : ""}
                            </p>
                          </div>
                        )}

                        {/* ── Open Library ── */}
                        {searchResults.olList.length > 0 && (
                          <div style={{ padding: "0.45rem 0.7rem", borderBottom: "1px solid #111a22", background: searchResults.checked.openLib ? "#151208" : "#0a0d06" }}>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                              <input type="checkbox" checked={searchResults.checked.openLib}
                                onChange={e => setSearchResults(s => ({ ...s, checked: { ...s.checked, openLib: e.target.checked } }))} />
                              <span style={{ color: "#c8a850", fontWeight: "bold", fontSize: "0.65rem" }}>📚 Open Library (Livres)</span>
                            </div>
                            <select value={searchResults.olIdx}
                              onChange={e => setSearchResults(s => ({ ...s, olIdx: +e.target.value }))}
                              style={{ width: "100%", background: "#1a1608", border: "1px solid #4a3a18", color: "#d0b870", fontSize: "0.65rem", padding: "0.25rem 0.4rem", borderRadius: 3, marginBottom: "0.25rem" }}>
                              {searchResults.olList.map((r, i) => (
                                <option key={i} value={i}>{r.title}{r.author ? ` — ${r.author}` : ""}</option>
                              ))}
                            </select>
                            <p style={{ color: "#8a7840", fontSize: "0.62rem", margin: 0, fontStyle: "italic", lineHeight: 1.4 }}>
                              {searchResults.olList[searchResults.olIdx]?.text.slice(0, 200)}{searchResults.olList[searchResults.olIdx]?.text.length > 200 ? "…" : ""}
                            </p>
                          </div>
                        )}

                        {/* ── Wikipedia ── */}
                        {searchResults.wikiList.length > 0 && (
                          <div style={{ padding: "0.45rem 0.7rem", borderBottom: "1px solid #111a22", background: searchResults.checked.wiki ? "#0a1510" : "#070d09" }}>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                              <input type="checkbox" checked={searchResults.checked.wiki}
                                onChange={e => setSearchResults(s => ({ ...s, checked: { ...s.checked, wiki: e.target.checked } }))} />
                              <span style={{ color: "#5ab870", fontWeight: "bold", fontSize: "0.65rem" }}>📖 Wikipedia</span>
                            </div>
                            <select value={searchResults.wikiIdx}
                              onChange={e => setSearchResults(s => ({ ...s, wikiIdx: +e.target.value }))}
                              style={{ width: "100%", background: "#0d1a10", border: "1px solid #2a4a30", color: "#80c890", fontSize: "0.65rem", padding: "0.25rem 0.4rem", borderRadius: 3, marginBottom: "0.25rem" }}>
                              {searchResults.wikiList.map((r, i) => (
                                <option key={i} value={i}>[{r.lang.toUpperCase()}] {r.title}</option>
                              ))}
                            </select>
                            <p style={{ color: "#50885a", fontSize: "0.62rem", margin: 0, fontStyle: "italic", lineHeight: 1.4 }}>
                              {cleanSnippet(searchResults.wikiList[searchResults.wikiIdx]?.snippet).slice(0, 200)}…
                            </p>
                          </div>
                        )}

                        {/* ── Boutons ── */}
                        <div style={{ display: "flex", gap: "0.5rem", padding: "0.4rem 0.7rem", background: "#060c12", justifyContent: "flex-end", alignItems: "center" }}>
                          <button onClick={() => setSearchResults(null)}
                            style={{ background: "transparent", border: `1px solid ${C.inputBorder}`, color: "#8a7060", fontSize: "0.65rem", padding: "0.3rem 0.8rem", borderRadius: 3, cursor: "pointer" }}>
                            ✕ Annuler
                          </button>
                          <button onClick={async () => {
                            setWikiLoading(true);
                            const cleanWikitext = (t) => t
                              .replace(/==+\s*[^=]+\s*==+/g, "")
                              .replace(/^\s*vignette\s*\|[^\n]*/gm, "")
                              .replace(/^\s*thumb\s*\|[^\n]*/gm, "")
                              .replace(/^\s*(File|Image|Fichier):[^\n]*/gim, "")
                              .replace(/\[\[(?:File|Image|Fichier|Cat\u00e9gorie|Category):[^\]]*\]\]/gi, "")
                              .replace(/\[\[([^\]|]*\|)?([^\]]+)\]\]/g, "$2")
                              .replace(/\{\{[^}]*\}\}/g, "")
                              .replace(/<ref[^>]*\/>/g, "")
                              .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
                              .replace(/<[^>]+>/g, "")
                              .replace(/<!--[\s\S]*?-->/g, "")
                              .replace(/'{2,}/g, "")
                              .replace(/^\*\s*\S[^:\n]{0,25}\n/gm, "")
                              .replace(/^[|!][^\n]*/gm, "")
                              .replace(/\n{3,}/g, "\n\n").trim();
                            const fetchWikiText = async (pageTitle, lang) => {
                              const sectionsUrl = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=sections&format=json&origin=*`;
                              const sr = await fetch(sectionsUrl); const sd = await sr.json();
                              const sections = sd.parse?.sections || [];
                              const narrativeKeywords = ["synopsis", "résumé", "intrigue", "personnage", "plot", "summary", "characters", "story"];
                              const targetSections = sections.filter(s => narrativeKeywords.some(k => s.line.toLowerCase().includes(k)));
                              if (targetSections.length > 0) {
                                const texts = await Promise.all(targetSections.slice(0, 3).map(async (sec) => {
                                  const u = `https://${lang}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=wikitext&section=${sec.index}&format=json&origin=*`;
                                  const r = await fetch(u); const d = await r.json();
                                  return `[${sec.line}]\n` + cleanWikitext(d.parse?.wikitext?.["*"] || "").slice(0, 1200);
                                }));
                                return texts.join("\n\n");
                              }
                              const introUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
                              const ir = await fetch(introUrl); const id2 = await ir.json();
                              return Object.values(id2.query?.pages || {})[0]?.extract?.slice(0, 2000) || "";
                            };
                            const parts = [];
                            if (searchResults.checked.tmdb && searchResults.tmdbList[searchResults.tmdbIdx]) {
                              const t = searchResults.tmdbList[searchResults.tmdbIdx];
                              parts.push(`🎬 ${t.type} : ${t.title} (${t.year})\n\n${t.text}`);
                            }
                            if (searchResults.checked.openLib && searchResults.olList[searchResults.olIdx]) {
                              const b = searchResults.olList[searchResults.olIdx];
                              parts.push(`📚 ${b.title}${b.author ? " — " + b.author : ""}\n\n${b.text}${b.subjects ? "\nThèmes : " + b.subjects : ""}`);
                            }
                            if (searchResults.checked.wiki && searchResults.wikiList[searchResults.wikiIdx]) {
                              const w = searchResults.wikiList[searchResults.wikiIdx];
                              const text = await fetchWikiText(w.title, w.lang);
                              parts.push(`📖 ${w.title}\n\n${text}`);
                            }
                            const ctx = parts.join("\n\n---\n\n").slice(0, 5000);
                            setGybhSource(s => ({ ...s, wikiContext: ctx || "", wikiOpen: !!ctx }));
                            setSearchResults(null);
                            setWikiLoading(false);
                          }} style={{ background: "#1a3a5a", border: "1px solid #3a6a9a", color: "#a0d0f0", fontSize: "0.65rem", padding: "0.3rem 1rem", borderRadius: 3, cursor: "pointer", fontWeight: "bold" }}>
                            ✓ Valider la sélection
                          </button>
                        </div>
                      </div>
                      );
                    })()}

                    {/* Accordéon contexte validé */}
                    {gybhSource.wikiContext && (
                      <div style={{ marginTop: "0.4rem", border: "1px solid #2a4a2a", borderRadius: 3, overflow: "hidden" }}>
                        <button onClick={() => setGybhSource(s => ({ ...s, wikiOpen: !s.wikiOpen }))}
                          style={{ width: "100%", textAlign: "left", background: "#1a2a1a", border: "none", color: "#7ec87e", fontSize: "0.65rem", padding: "0.3rem 0.5rem", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                          <span>✓ Contexte enrichi — {gybhSource.wikiContext.split(/\s+/).length} mots</span>
                          <span>{gybhSource.wikiOpen ? "▲" : "▼"}</span>
                        </button>
                        {gybhSource.wikiOpen && (
                          <textarea value={gybhSource.wikiContext}
                            onChange={e => setGybhSource(s => ({ ...s, wikiContext: e.target.value }))}
                            rows={6}
                            style={{ width: "100%", background: "#111", border: "none", borderTop: "1px solid #2a4a2a", color: "#b0c8b0", fontSize: "0.65rem", padding: "0.4rem", boxSizing: "border-box", resize: "vertical", fontFamily: "monospace" }} />
                        )}
                        <div style={{ background: "#1a2a1a", padding: "0.2rem 0.5rem", display: "flex", justifyContent: "flex-end" }}>
                          <button onClick={() => { setGybhSource(s => ({ ...s, wikiContext: "", wikiOpen: false })); setSearchResults(null); }}
                            style={{ background: "#3a1010", border: "1px solid #6a2020", color: "#e08080", fontSize: "0.58rem", padding: "0.2rem 0.6rem", borderRadius: 2, cursor: "pointer" }}>✕ Effacer</button>
                        </div>
                      </div>
                    )}

                    <p style={{ color: "#4a3a28", fontSize: "0.62rem", marginTop: "0.3rem", fontStyle: "italic" }}>
                      {gybhSource.wikiContext ? "✓ Contexte Wikipedia enrichi — le modèle connaîtra l'univers du livre." : "Claude s'inspirera de l'univers et proposera des divergences narratives par rapport à l'histoire originale."}
                    </p>
                  </div>
                )}

                {gybhSource.type === "upload" && (
                  <div>
                    {gybhSource.text ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: "#7ec87e", fontSize: "0.7rem" }}>✓ Texte chargé — ~{gybhSource.text.split(/\s+/).filter(Boolean).length} mots</span>
                        <button onClick={() => setGybhSource(s => ({ ...s, text: "" }))}
                          style={{ ...S.btn("#4a2020", "small"), fontSize: "0.6rem" }}>✕ Retirer</button>
                      </div>
                    ) : (
                      <div>
                        <button onClick={() => {
                          const inp = document.createElement("input");
                          inp.type = "file"; inp.accept = ".txt,.md,.docx,.pdf,.epub";
                          inp.onchange = async e => {
                            const f = e.target.files?.[0]; if (!f) return;
                            const ext = f.name.split(".").pop().toLowerCase();
                            try {
                              let text = "";
                              if (ext === "txt" || ext === "md") {
                                text = await f.text();
                              } else if (ext === "docx") {
                                const ab = await f.arrayBuffer();
                                const zip = new Uint8Array(ab);
                                const fm = await readAllZipFiles(zip);
                                const xml = new TextDecoder().decode(fm["word/document.xml"] || new Uint8Array());
                                text = xml.replace(/<w:p[ >][^>]*>/g,"\n").replace(/<[^>]+>/g,"").replace(/\n{3,}/g,"\n\n").trim();
                              } else if (ext === "epub") {
                                const ab = await f.arrayBuffer();
                                const fm = await readAllZipFiles(new Uint8Array(ab));
                                const htmlFiles = Object.entries(fm).filter(([k]) => /\.(xhtml|html)$/i.test(k) && !/toc|nav|cover/i.test(k)).sort(([a],[b])=>a.localeCompare(b));
                                const parts = [];
                                for (const [, bytes] of htmlFiles.slice(0,30)) {
                                  const html = new TextDecoder().decode(bytes);
                                  const stripped = html.replace(/<[^>]+>/g," ").replace(/\s{3,}/g,"\n\n").trim();
                                  if (stripped.length > 50) parts.push(stripped);
                                }
                                text = parts.join("\n\n");
                              } else if (ext === "pdf") {
                                text = "(PDF : extraction via upload non supportée ici — utilisez le format .txt ou .docx)";
                              }
                              if (text.trim()) setGybhSource(s => ({ ...s, text: text.trim() }));
                            } catch(e) { setError("Erreur lecture : " + e.message); }
                          };
                          inp.click();
                        }} style={{ ...S.btn("#2a3a4a", "small"), fontSize: "0.68rem" }}>
                          📄 Importer un fichier (.txt, .md, .docx, .epub)
                        </button>
                        <p style={{ color: "#4a3a28", fontSize: "0.62rem", marginTop: "0.3rem", fontStyle: "italic" }}>
                          Claude extraira l'univers, les personnages et le ton pour créer un GYBH divergent.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ ...S.label, marginBottom: 0, fontSize: "0.7rem" }}>Niveaux de profondeur</span>
                <span style={{ color: C.gold, fontSize: "0.8rem", fontWeight: "bold" }}>{gybhMaxDepth}</span>
              </div>
              <input type="range" min={2} max={6} step={1} value={gybhMaxDepth}
                onChange={e => setGybhMaxDepth(Number(e.target.value))}
                style={{ width: "100%", accentColor: C.gold }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.2rem", marginBottom: "0.5rem" }}>
                {[2,3,4,5,6].map(n => (
                  <span key={n} style={{ fontSize: "0.6rem", color: n === gybhMaxDepth ? C.gold : "#3a3028", width: "20%", textAlign: n===2?"left":n===6?"right":"center" }}>
                    {n}niv{n===2?" (~7§)":n===3?" (~12§)":n===4?" (~20§)":n===5?" (~28§)":" (~35§)"}
                  </span>
                ))}
              </div>
              <p style={{ color: "#4a3a28", fontSize: "0.62rem", fontStyle: "italic" }}>
                Max {gybhMaxEndings} fins — Claude gère les convergences automatiquement
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
              {bookMode === "gybh" ? (
                advancedMode ? (
                  <button onClick={generateGybhFrame} disabled={!canGenerate || gybhLoadingFrame}
                    style={{ ...S.btn("#8a5a2a"), letterSpacing: "0.18em", fontSize: "0.82rem", padding: "0.9rem 2.5rem", opacity: (canGenerate && !gybhLoadingFrame) ? 1 : 0.35 }}>
                    {gybhLoadingFrame ? "⟳ Génération de la trame…" : "🎲 CRÉER LA TRAME"}
                  </button>
                ) : (
                  <button onClick={generateGybhAuto} disabled={!canGenerate}
                    style={{ ...S.btn("#8a5a2a"), letterSpacing: "0.18em", fontSize: "0.82rem", padding: "0.9rem 2.5rem", opacity: canGenerate ? 1 : 0.35 }}>
                    🎲 GÉNÉRER LE LIVRE
                  </button>
                )
              ) : classicSource.type === "upload" && advancedMode ? (
                <button onClick={generate} disabled={!canGenerate || !importText || analyzingImport}
                  style={{ ...S.btn(C.blue), letterSpacing: "0.22em", fontSize: "0.85rem", padding: "0.9rem 2.5rem", opacity: (canGenerate && importText && !analyzingImport) ? 1 : 0.35, cursor: (canGenerate && importText) ? "pointer" : "not-allowed" }}>
                  ➜ CONTINUER CE TEXTE
                </button>
              ) : (
                <button ref={generateBtnRef} onClick={() => canGenerate && generate()}
                  style={{ ...S.btn(classicSource.type === "known" ? "#3a5a8a" : C.gold), letterSpacing: "0.22em", fontSize: "0.85rem", padding: "0.9rem 2.5rem", minHeight: "3.2rem", minWidth: "16rem", lineHeight: "1.4", display: "inline-flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", whiteSpace: "nowrap", opacity: canGenerate ? 1 : 0.35, cursor: canGenerate ? "pointer" : "not-allowed", transition: "box-shadow 0.3s ease", boxShadow: generatePulse ? `0 0 0 4px ${C.gold}66, 0 0 20px ${C.gold}44` : "none" }}>
                  {classicSource.type === "known" ? `📚 ${t.generateBtn}` : t.generateBtn}
                </button>
              )}
              {advancedMode && !(classicSource.type === "upload" && bookMode === "classic") && (
                <>
                  <input ref={projectFileRef} type="file" accept=".atelier" style={{ display: "none" }}
                    onChange={e => { loadProject(e.target.files[0]); e.target.value = ""; }} />
                  <button onClick={() => projectFileRef.current?.click()}
                    style={{ ...S.btn("#5a4a38"), fontSize: "0.78rem", padding: "0.9rem 1.5rem", letterSpacing: "0.1em" }}>
                    📂 Ouvrir un projet
                  </button>
                </>
              )}
            </div>
            {!canGenerate && bookMode === "classic" && classicSource.type !== "upload" && (
              <div style={{ fontSize: "0.65rem", color: "#7a6a50", fontStyle: "italic", textAlign: "center" }}>
                {[genres.length === 0 && "genre", !duration && "longueur", !narrator && "point de vue narratif"].filter(Boolean).join(", ")} manquant{([genres.length === 0, !duration, !narrator].filter(Boolean).length > 1) ? "s" : ""}
              </div>
            )}
          </div>

          {error && <p style={{ color: "#e06060", textAlign: "center", fontStyle: "italic", marginTop: "1rem" }}>{error}</p>}
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ width: "100%", maxWidth: 660 }}>
          {parts.length > 0 && (
            <div style={{ background: C.card, border: "1px solid #2a2520", borderTop: `2px solid ${C.gold}55`, padding: "2rem 1.75rem", lineHeight: 1.95, fontSize: "1.05rem", color: C.text, marginBottom: "1.5rem" }}>
              {fullText.split("\n\n").map((p, i) =>
                p.trim() === "— ✦ —"
                  ? <div key={i} style={{ textAlign: "center", color: C.gold, opacity: .3, margin: "1.5rem 0", letterSpacing: ".5em" }}>✦ ✦ ✦</div>
                  : p.trim() ? <p key={i} style={{ margin: "0 0 1.3rem" }}>{p}</p> : null
              )}
            </div>
          )}
          <Spinner msg={loadingMsg} />
        </div>
      )}

      {/* ── BUILDING BOOK ── */}
      {buildingBook && (
        <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>📚</div>
          <Spinner msg={t.preparingBook} />
        </div>
      )}

      {/* ── STORY ── */}
      {!loading && !buildingBook && parts.length > 0 && (
        <div style={{ width: "100%", maxWidth: 660, animation: "fadein 0.5s ease" }}>

          {/* Title editor */}
          {ended && (
            <div style={{ marginBottom: "1.2rem", background: C.card, border: "1px solid #2a2218", borderRadius: 4, padding: "0.85rem 1.25rem" }}>
              <div style={{ ...S.label, textAlign: "center", marginBottom: "0.6rem" }}>{t.bookTitleLabel}</div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", maxWidth: 480, margin: "0 auto" }}>
                <input value={bookTitle} onChange={e => setBookTitle(e.target.value)}
                  placeholder={t.titlePh}
                  style={{ ...S.input, minHeight: "unset", height: "38px", resize: "none", flex: 1, fontSize: "1rem", color: C.text }} />
                {bookTitle && <button onClick={() => setBookTitle("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#5a4a3a", fontSize: "0.8rem" }}>✕</button>}
              </div>
            </div>
          )}

          {/* ── Chips de langue (mode avancé, histoire terminée) ── */}
          {advancedMode && ended && Object.keys(translations).length > 0 && (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ color: "#4a3a28", fontSize: "0.6rem", letterSpacing: "0.15em" }}>🌐</span>
              <button onClick={() => setActiveLang(null)}
                style={{ ...S.chip(activeLang === null), fontSize: "0.65rem", padding: "0.2rem 0.6rem" }}>
                {LANG_LABELS[choices?.language || language] || "Original"}
              </button>
              {Object.keys(translations).map(lang => (
                <button key={lang} onClick={() => setActiveLang(lang)}
                  style={{ ...S.chip(activeLang === lang), fontSize: "0.65rem", padding: "0.2rem 0.6rem" }}>
                  {LANG_LABELS[lang] || lang}
                </button>
              ))}
            </div>
          )}

          {/* Titre traduit si actif */}
          {activeLang && translations[activeLang]?.title && (
            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              <span style={{ color: "#7a6a50", fontSize: "0.72rem", fontStyle: "italic" }}>
                {translations[activeLang].title}
              </span>
            </div>
          )}


          {/* ── Sommaire flottant ── */}
          {chapters.length > 1 && (
            <div style={{
              position: "fixed", top: "5rem", left: "max(0.5rem, calc(50% - 480px - 11rem))",
              width: tocCollapsed ? "2.2rem" : "9.5rem", zIndex: 80,
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 6, padding: tocCollapsed ? "0.5rem" : "0.6rem 0.7rem",
              boxShadow: `0 4px 20px rgba(0,0,0,${C.isDark ? 0.5 : 0.15})`,
              maxHeight: "70vh", overflowY: "auto",
              fontFamily: "Georgia, serif",
              transition: "width 0.2s ease",
              overflow: "hidden",
            }}>
              {/* Bouton toggle collapse */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: tocCollapsed ? "center" : "space-between", marginBottom: tocCollapsed ? 0 : "0.5rem" }}>
                {!tocCollapsed && <div style={{ fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, opacity: 0.7 }}>Sommaire</div>}
                <button onClick={() => setTocCollapsed(v => !v)}
                  title={tocCollapsed ? "Afficher le sommaire" : "Réduire le sommaire"}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: C.gold, opacity: 0.7, padding: "0 0.1rem", fontSize: "0.85rem", lineHeight: 1, display: "flex", flexDirection: "column", gap: "0.18rem", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
                  <span style={{ display: "block", width: "0.9rem", height: "0.12rem", background: C.gold, borderRadius: 1 }} />
                  <span style={{ display: "block", width: "0.9rem", height: "0.12rem", background: C.gold, borderRadius: 1 }} />
                  <span style={{ display: "block", width: "0.9rem", height: "0.12rem", background: C.gold, borderRadius: 1 }} />
                </button>
              </div>
              {/* Contenu — masqué si collapsed */}
              {!tocCollapsed && (<>
                {chapters.map((ch, ci) => {
                  const romanArr = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
                  const num = romanArr[ci] || String(ci + 1);
                  const customTitle = ch.title?.replace(/^Chapitre\s+[IVXLCDM]+\s*[—–-]?\s*/i, "").trim();
                  return (
                    <div key={ci}
                      onClick={() => document.getElementById(`bp-chap-${ci}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      style={{ cursor: "pointer", padding: "0.25rem 0.3rem", borderRadius: 3, marginBottom: "0.1rem", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = `${C.gold}18`}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: "0.62rem", color: C.gold, display: "block", letterSpacing: "0.05em" }}>Chapitre {num}</span>
                      {customTitle && <span style={{ fontSize: "0.58rem", color: C.muted, display: "block", lineHeight: 1.3, marginTop: "0.05rem" }}>{customTitle}</span>}
                    </div>
                  );
                })}
                <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "0.4rem", paddingTop: "0.4rem" }}>
                  <div
                    onClick={() => document.getElementById("bp-end")?.scrollIntoView({ behavior: "smooth", block: "end" })}
                    style={{ cursor: "pointer", padding: "0.25rem 0.3rem", borderRadius: 3, transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.gold}18`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: "0.58rem", color: C.muted, fontStyle: "italic" }}>↓ fin du texte</span>
                  </div>
                </div>
              </>)}
            </div>
          )}

          {/* ── Carnet de bord ── */}
          {(characters.length > 0 || locations.length > 0 || extractingCarnet) && (
            <div style={{ marginBottom: "1rem" }}>
              <button onClick={() => setShowCarnet(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, padding: "0.4rem 0.75rem", cursor: "pointer", fontSize: "0.72rem", letterSpacing: "0.08em", fontFamily: "Georgia, serif", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                {extractingCarnet ? "⟳" : "📋"} Carnet de bord
                <span style={{ opacity: 0.5, fontSize: "0.65rem" }}>
                  {extractingCarnet ? " analyse en cours…" : ` ${characters.length} personnage${characters.length > 1 ? "s" : ""} · ${locations.length} lieu${locations.length > 1 ? "x" : ""}`}
                </span>
                <span style={{ marginLeft: "auto", opacity: 0.4, fontSize: "0.7rem" }}>{showCarnet ? "▲" : "▼"}</span>
              </button>

              {showCarnet && (() => {
                const ROLES = ["protagoniste", "secondaire", "antagoniste", "mentionné"];
                const LOC_TYPES = ["ville", "bâtiment", "pays", "région", "autre"];
                // editingCarnet : { type: "char"|"loc", id: string } | null
                return (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderTop: `2px solid ${C.gold}44`, borderRadius: "0 0 4px 4px", padding: "1rem 1.25rem", marginTop: "-1px" }}>

                  {/* Personnages */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, opacity: 0.7 }}>Personnages</div>
                    <button onClick={() => {
                      const newId = `char_${Date.now()}_${Math.random().toString(36).slice(2,5)}`;
                      setCharacters(prev => [...prev, { id: newId, name: "Nouveau personnage", role: "secondaire", birthYear: null, birthYearEstimated: false, description: "", lastChapter: currentChapter }]);
                      setEditingCarnet({ type: "char", id: newId });
                    }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, padding: "0.15rem 0.5rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "Georgia, serif" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                      + personnage
                    </button>
                  </div>
                  {characters.length > 0 && (<>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
                      {characters.map(ch => {
                        let narrativeYear = null;
                        for (let i = currentChapter; i >= 0; i--) {
                          if (chapters[i]?.narrativeYear) { narrativeYear = chapters[i].narrativeYear; break; }
                        }
                        const age = ch.birthYear != null && narrativeYear ? narrativeYear - ch.birthYear : null;
                        const isEditing = editingCarnet?.type === "char" && editingCarnet?.id === ch.id;
                        const updateChar = (field, val) => setCharacters(prev => prev.map(c => c.id === ch.id ? { ...c, [field]: val } : c));

                        return (
                          <div key={ch.id} style={{ background: `${C.panelBg}88`, borderRadius: 4, border: `1px solid ${isEditing ? C.gold + "88" : C.border}`, transition: "border-color 0.15s" }}>
                            {/* Header toujours visible */}
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.45rem 0.6rem", flexWrap: "wrap" }}>
                              {isEditing ? (
                                <input value={ch.name} onChange={e => updateChar("name", e.target.value)}
                                  style={{ flex: 1, minWidth: 120, background: `${C.panelBg}`, border: `1px solid ${C.gold}66`, borderRadius: 3, color: C.gold, fontSize: "0.8rem", fontWeight: "bold", padding: "0.1rem 0.4rem", fontFamily: "Georgia, serif" }} />
                              ) : (
                                <span style={{ color: C.gold, fontSize: "0.8rem", fontWeight: "bold", flex: 1 }}>{ch.name}</span>
                              )}
                              {isEditing ? (
                                <select value={ch.role} onChange={e => updateChar("role", e.target.value)}
                                  style={{ background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, fontSize: "0.62rem", padding: "0.1rem 0.3rem" }}>
                                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                              ) : (
                                <span style={{ fontSize: "0.62rem", color: C.muted, background: `${C.gold}18`, borderRadius: 3, padding: "0.05rem 0.35rem" }}>{ch.role}</span>
                              )}
                              {age != null && !isEditing && <span style={{ fontSize: "0.62rem", color: C.muted }}>{age} ans{ch.birthYearEstimated ? " ≈" : ""}{narrativeYear ? ` (${narrativeYear})` : ""}</span>}
                              {isEditing && (
                                <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.62rem", color: C.muted }}>
                                  Né(e) en
                                  <input type="number" value={ch.birthYear ?? ""} onChange={e => updateChar("birthYear", e.target.value ? parseInt(e.target.value) : null)}
                                    style={{ width: 60, background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 3, color: C.text, fontSize: "0.62rem", padding: "0.1rem 0.3rem" }} />
                                  <input type="checkbox" checked={!!ch.birthYearEstimated} onChange={e => updateChar("birthYearEstimated", e.target.checked)} style={{ margin: 0 }} />
                                  <span title="Année approximative">≈</span>
                                </label>
                              )}
                              {/* Boutons édition / fermer / supprimer */}
                              <button onClick={() => setEditingCarnet(isEditing ? null : { type: "char", id: ch.id })}
                                title={isEditing ? "Fermer" : "Modifier"}
                                style={{ background: "transparent", border: "none", color: isEditing ? C.gold : C.muted, cursor: "pointer", fontSize: "0.7rem", opacity: isEditing ? 1 : 0.5, padding: "0.1rem 0.2rem", flexShrink: 0 }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={e => { if (!isEditing) e.currentTarget.style.opacity = "0.5"; }}>
                                {isEditing ? "✓" : "✎"}
                              </button>
                              <button onClick={() => { setCharacters(prev => prev.filter(c => c.id !== ch.id)); if (isEditing) setEditingCarnet(null); }}
                                title="Supprimer" style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: "0.7rem", opacity: 0.5, padding: "0.1rem 0.2rem", flexShrink: 0 }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}>✕</button>
                            </div>

                            {/* Description — lecture ou édition */}
                            {isEditing ? (
                              <div style={{ padding: "0 0.6rem 0.5rem" }}>
                                <textarea value={ch.description || ""} onChange={e => updateChar("description", e.target.value)} rows={3}
                                  placeholder="Description du personnage…"
                                  style={{ width: "100%", boxSizing: "border-box", background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 3, color: C.text, fontSize: "0.72rem", lineHeight: 1.4, padding: "0.3rem 0.4rem", resize: "vertical", fontFamily: "Georgia, serif" }} />
                              </div>
                            ) : ch.description ? (
                              <div style={{ fontSize: "0.72rem", color: C.text, opacity: 0.8, padding: "0 0.6rem 0.45rem", lineHeight: 1.4 }}>{ch.description}</div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </>)}

                  {/* Lieux */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, opacity: 0.7 }}>Lieux</div>
                    <button onClick={() => {
                      const newId = `loc_${Date.now()}_${Math.random().toString(36).slice(2,5)}`;
                      setLocations(prev => [...prev, { id: newId, name: "Nouveau lieu", type: "autre", description: "", lastChapter: currentChapter }]);
                      setEditingCarnet({ type: "loc", id: newId });
                    }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, padding: "0.15rem 0.5rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "Georgia, serif" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                      + lieu
                    </button>
                  </div>
                  {locations.length > 0 && (<>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      {locations.map(loc => {
                        const isEditingLoc = editingCarnet?.type === "loc" && editingCarnet?.id === loc.id;
                        const updateLoc = (field, val) => setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, [field]: val } : l));
                        return (
                          <div key={loc.id} style={{ background: `${C.panelBg}88`, border: `1px solid ${isEditingLoc ? C.gold + "88" : C.border}`, borderRadius: 4, transition: "border-color 0.15s" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.6rem", flexWrap: "wrap" }}>
                              {isEditingLoc ? (
                                <input value={loc.name} onChange={e => updateLoc("name", e.target.value)}
                                  style={{ flex: 1, minWidth: 100, background: C.panelBg, border: `1px solid ${C.gold}66`, borderRadius: 3, color: C.text, fontSize: "0.72rem", padding: "0.1rem 0.4rem", fontFamily: "Georgia, serif" }} />
                              ) : (
                                <span style={{ fontSize: "0.72rem", color: C.text, flex: 1 }}>{loc.name}</span>
                              )}
                              {isEditingLoc ? (
                                <select value={loc.type} onChange={e => updateLoc("type", e.target.value)}
                                  style={{ background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, fontSize: "0.62rem", padding: "0.1rem 0.3rem" }}>
                                  {LOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              ) : (
                                <span style={{ fontSize: "0.58rem", color: C.muted, opacity: 0.7 }}>({loc.type})</span>
                              )}
                              <button onClick={() => setEditingCarnet(isEditingLoc ? null : { type: "loc", id: loc.id })}
                                title={isEditingLoc ? "Fermer" : "Modifier"}
                                style={{ background: "transparent", border: "none", color: isEditingLoc ? C.gold : C.muted, cursor: "pointer", fontSize: "0.7rem", opacity: isEditingLoc ? 1 : 0.5, padding: "0.1rem 0.2rem" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={e => { if (!isEditingLoc) e.currentTarget.style.opacity = "0.5"; }}>
                                {isEditingLoc ? "✓" : "✎"}
                              </button>
                              <button onClick={() => { setLocations(prev => prev.filter(l => l.id !== loc.id)); if (isEditingLoc) setEditingCarnet(null); }}
                                title="Supprimer" style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: "0.65rem", opacity: 0.5, padding: "0 0.1rem" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}>✕</button>
                            </div>
                            {isEditingLoc && (
                              <div style={{ padding: "0 0.6rem 0.45rem" }}>
                                <input value={loc.description || ""} onChange={e => updateLoc("description", e.target.value)}
                                  placeholder="Description du lieu…"
                                  style={{ width: "100%", boxSizing: "border-box", background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 3, color: C.text, fontSize: "0.72rem", padding: "0.25rem 0.4rem", fontFamily: "Georgia, serif" }} />
                              </div>
                            )}
                            {!isEditingLoc && loc.description && (
                              <div style={{ fontSize: "0.68rem", color: C.text, opacity: 0.7, padding: "0 0.6rem 0.4rem", lineHeight: 1.4 }}>{loc.description}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>)}

                  {/* Bouton ré-analyser */}
                  <div style={{ marginTop: "0.9rem", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      disabled={extractingCarnet}
                      onClick={() => {
                        const currentParts = parts.filter(p => (p.chapterIdx ?? 0) === currentChapter);
                        if (currentParts.length) extractAndMergeCarnet(currentChapter, currentParts, choices?.language || language);
                      }}
                      style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, padding: "0.3rem 0.7rem", cursor: "pointer", fontSize: "0.68rem", fontFamily: "Georgia, serif" }}>
                      🔍 Ré-analyser le chapitre courant
                    </button>
                  </div>
                </div>
                );
              })()}
            </div>
          )}

          {/* Story text */}
          <div style={{ background: C.storyBg, border: `1px solid ${C.storyBorder}`, borderTop: `2px solid ${C.gold}55`, padding: "2rem 1.75rem", lineHeight: 1.95, fontSize: "1.05rem", color: C.text }}>
            {(activeLang && translations[activeLang]
              ? chapters.map((ch, ci) => ({ ...ch, chapterIdx: ci, parts: translations[activeLang].parts.filter(p => p.chapterIdx === ci) }))
              : partsByChapter
            ).map((chGroup, ci) => chGroup.parts.length > 0 && (
              <div key={ci} id={`bp-chap-${ci}`}>
                {(chapters.length > 1 || ci > 0) && (
                  <div style={{ textAlign: "center", margin: ci === 0 ? "0 0 1.8rem" : "2.5rem 0 1.8rem" }}>
                    <div style={{ color: C.gold, opacity: 0.2, letterSpacing: ".5em", fontSize: "0.75rem", marginBottom: "0.4rem" }}>✦ ✦ ✦</div>
                    {chapters.length > 1 && (
                      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", justifyContent: "center" }}>
                        {editingTitle === `ch-${ci}` ? (
                          <>
                            <input
                              value={chGroup.title.replace(/^Chapitre\s+[IVXLCDM]+\s*[—–-]?\s*/i, "")}
                              placeholder="Titre optionnel…"
                              onChange={e => {
                                const romanArr = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
                                const num = romanArr[ci] || String(ci + 1);
                                const custom = e.target.value.trim();
                                updateChapterTitle(ci, custom ? `Chapitre ${num} — ${custom}` : `Chapitre ${num}`);
                              }}
                              onBlur={() => setEditingTitle(false)} onKeyDown={e => e.key === "Enter" && setEditingTitle(false)} autoFocus
                              style={{ ...S.input, minHeight: "unset", height: "32px", resize: "none", textAlign: "center", fontSize: "0.82rem", color: C.gold, maxWidth: 220 }} />
                            <button onClick={() => setEditingTitle(false)} style={S.btn(C.green, "small")}>✓</button>
                          </>
                        ) : (
                          <>
                            <span style={{ color: C.gold, fontSize: "0.75rem", letterSpacing: "0.3em", opacity: 0.75 }}>
                              {"Chapitre " + (["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"][ci] || String(ci + 1))}
                              {(() => {
                                const custom = chGroup.title?.replace(/^Chapitre\s+[IVXLCDM]+\s*[—–-]?\s*/i, "").trim();
                                return custom ? <span style={{ letterSpacing: "0.1em", opacity: 0.85 }}> — {custom}</span> : null;
                              })()}
                            </span>
                            <button onClick={() => setEditingTitle(`ch-${ci}`)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7a6a50", fontSize: "0.65rem", opacity: 0.5 }}>✎</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {chGroup.parts.map((part, pi) => {
                  // compteur de paragraphes dans ce chapitre seulement
                  let paraChapterOffset = 0;
                  for (let gi = 0; gi < part.globalIdx; gi++) {
                    if ((parts[gi]?.chapterIdx ?? 0) === (part.chapterIdx ?? 0)) {
                      paraChapterOffset += parts[gi]?.text.split("\n\n").filter(p => p.trim() && p.trim() !== "— ✦ —").length || 0;
                    }
                  }
                  return (
                  <div key={pi} style={{ position: "relative" }}>
                    {pi > 0 && (
                      advancedMode && !activeLang ? (
                        <div
                          style={{ position: "relative", textAlign: "center", margin: "2rem 0", letterSpacing: ".5em" }}
                          onMouseEnter={e => e.currentTarget.querySelector(".chap-break-btn").style.opacity = "1"}
                          onMouseLeave={e => e.currentTarget.querySelector(".chap-break-btn").style.opacity = "0"}
                        >
                          <span style={{ color: C.gold, opacity: .3 }}>✦ ✦ ✦</span>
                          <button
                            className="chap-break-btn"
                            onClick={() => insertChapterBreak(part.globalIdx)}
                            title="Insérer une coupure de chapitre ici"
                            style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", opacity: 0, transition: "opacity 0.2s", background: C.inputBg, border: `1px solid ${C.gold}44`, borderRadius: 3, color: C.gold, fontSize: "0.55rem", padding: "0.2rem 0.5rem", cursor: "pointer", letterSpacing: "0.05em", whiteSpace: "nowrap" }}
                          >╌ fin de chapitre</button>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", color: C.gold, opacity: .3, margin: "2rem 0", letterSpacing: ".5em" }}>✦ ✦ ✦</div>
                      )
                    )}
                    {part.text.split("\n\n").map((para, i) => {
                      const key = `${part.globalIdx}-${i}`;
                      const isEditing = editingPart?.key === key;
                      const isRealPara = para.trim() && para.trim() !== "— ✦ —";
                      // numérotation chapitre.paragraphe (ex: 1.3)
                      const chapterNum = (part.chapterIdx ?? ci) + 1;
                      const localParaIdx = isRealPara ? (paraChapterOffset + part.text.split("\n\n").slice(0, i).filter(p => p.trim() && p.trim() !== "— ✦ —").length + 1) : null;
                      const paraLabel = localParaIdx !== null ? `${chapterNum}.${localParaIdx}` : null;
                      if (para.trim() === "— ✦ —") return (
                        <div key={i} style={{ textAlign: "center", color: C.gold, opacity: .3, margin: "2rem 0", letterSpacing: ".5em" }}>✦ ✦ ✦</div>
                      );
                      if (!para.trim()) return null;
                      return isEditing ? (
                        <div key={i} style={{ marginBottom: "1.3rem" }}>
                          <RichTextEditor
                            html={editingPart.html}
                            text={editingPart.text}
                            C={C} S={S}
                            onChange={(newHtml) => {
                              const tmp = document.createElement("div");
                              tmp.innerHTML = newHtml;
                              const plainText = tmp.innerText || tmp.textContent || "";
                              setEditingPart(prev => ({ ...prev, html: newHtml, text: plainText }));
                            }}
                            style={{ width: "100%", background: C.inputBg, border: `1px solid ${C.gold}55`, borderRadius: 3, padding: "0.6rem 0.75rem", color: C.text, fontSize: "1rem", lineHeight: 1.9, fontFamily: "Georgia, serif", boxSizing: "border-box", minHeight: "2rem" }}
                          />
                          {/* Mini inclure / exclure */}
                          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem" }}>
                            <input type="text" placeholder="+ inclure…" value={editingPart.include || ""}
                              onChange={e => setEditingPart(prev => ({ ...prev, include: e.target.value }))}
                              style={{ flex: 1, background: C.inputBg, border: "1px solid #2a3a2a", borderRadius: 3, padding: "0.25rem 0.5rem", color: "#9ac8a8", fontSize: "0.65rem" }} />
                            <input type="text" placeholder="− exclure…" value={editingPart.exclude || ""}
                              onChange={e => setEditingPart(prev => ({ ...prev, exclude: e.target.value }))}
                              style={{ flex: 1, background: C.inputBg, border: "1px solid #3a2a2a", borderRadius: 3, padding: "0.25rem 0.5rem", color: "#c89898", fontSize: "0.65rem" }} />
                          </div>
                          {/* Actions */}
                          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
                            {/* Régénérer */}
                            <button disabled={editingPart.working} onClick={async () => {
                              setEditingPart(prev => ({ ...prev, working: true }));
                              const langInstr = langInstructions[choices?.language || "french"] || "Écris en français.";
                              const fullText = parts.map(p => p.text).join("\n\n");
                              const parasBefore = parts.slice(0, part.globalIdx).map(p => p.text).join("\n\n")
                                + "\n\n" + part.text.split("\n\n").slice(0, i).join("\n\n");
                              const parasAfter = part.text.split("\n\n").slice(i + 1).join("\n\n")
                                + "\n\n" + parts.slice(part.globalIdx + 1).map(p => p.text).join("\n\n");
                              const incl = editingPart.include?.trim() ? `\nÉléments à inclure : ${editingPart.include.trim()}` : "";
                              const excl = editingPart.exclude?.trim() ? `\nÉléments à éviter : ${editingPart.exclude.trim()}` : "";
                              const prompt = `${langInstr}\nTu réécris UN SEUL paragraphe d'une histoire en conservant la cohérence avec le contexte.\n\nCONTEXTE AVANT :\n${parasBefore.slice(-1500) || "(début de l'histoire)"}\n\nPARAGRAPHE ACTUEL (à réécrire) :\n${para}\n\nCONTEXTE APRÈS :\n${parasAfter.slice(0, 800) || "(fin de l'histoire)"}${incl}${excl}\n\nRécris ce paragraphe en une version différente, cohérente avec ce qui précède et ce qui suit. Réponds UNIQUEMENT avec le paragraphe réécrit, sans titre ni commentaire.`;
                              try {
                                const result = await callClaude([{ role: "user", content: prompt }], 600, 30000, 1);
                                setEditingPart(prev => ({ ...prev, text: result.trim(), html: null, working: false }));
                              } catch(e) { setEditingPart(prev => ({ ...prev, working: false })); }
                            }} style={{ ...S.btn("#3a4a3a", "small"), fontSize: "0.65rem", opacity: editingPart.working ? 0.5 : 1 }}>
                              {editingPart.working ? "⟳" : "↺ Régénérer"}
                            </button>
                            {/* Étendre */}
                            <button disabled={editingPart.working} onClick={async () => {
                              setEditingPart(prev => ({ ...prev, working: true }));
                              const langInstr = langInstructions[choices?.language || "french"] || "Écris en français.";
                              const parasBefore = parts.slice(0, part.globalIdx).map(p => p.text).join("\n\n")
                                + "\n\n" + part.text.split("\n\n").slice(0, i).join("\n\n");
                              const parasAfter = part.text.split("\n\n").slice(i + 1).join("\n\n")
                                + "\n\n" + parts.slice(part.globalIdx + 1).map(p => p.text).join("\n\n");
                              const incl = editingPart.include?.trim() ? `\nÉléments à développer : ${editingPart.include.trim()}` : "";
                              const excl = editingPart.exclude?.trim() ? `\nÉléments à éviter : ${editingPart.exclude.trim()}` : "";
                              const targetWords = editingPart.extendWords || 150;
                              const prompt = `${langInstr}\nTu étends UN paragraphe d'une histoire en ajoutant des détails, des sensations ou des dialogues, sans perdre la cohérence narrative.\n\nCONTEXTE AVANT :\n${parasBefore.slice(-1500) || "(début de l'histoire)"}\n\nPARAGRAPHE À ÉTENDRE :\n${editingPart.text}\n\nCONTEXTE APRÈS :\n${parasAfter.slice(0, 800) || "(fin de l'histoire)"}${incl}${excl}\n\nÉcris une VERSION ÉTENDUE d'environ ${targetWords} mots, cohérente avec le contexte. Réponds UNIQUEMENT avec le paragraphe étendu, sans titre ni commentaire.`;
                              const maxTok = Math.round(targetWords * 1.6) + 100;
                              try {
                                const result = await callClaude([{ role: "user", content: prompt }], maxTok, 30000, 1);
                                setEditingPart(prev => ({ ...prev, text: result.trim(), html: null, working: false }));
                              } catch(e) { setEditingPart(prev => ({ ...prev, working: false })); }
                            }} style={{ ...S.btn("#2a3a4a", "small"), fontSize: "0.65rem", opacity: editingPart.working ? 0.5 : 1 }}>
                              {editingPart.working ? "⟳" : "⤢ Étendre"}
                            </button>
                            {/* Curseur longueur extension */}
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <input type="range" min="50" max="600" step="50"
                                value={editingPart.extendWords || 150}
                                onChange={e => setEditingPart(prev => ({ ...prev, extendWords: Number(e.target.value) }))}
                                style={{ width: "80px", accentColor: C.blue, cursor: "pointer" }} />
                              <span style={{ color: "#4a6a8a", fontSize: "0.6rem", whiteSpace: "nowrap" }}>{editingPart.extendWords || 150} mots</span>
                            </div>
                            <div style={{ flex: 1 }} />
                            <button onClick={() => setEditingPart(null)}
                              style={{ ...S.btn("#3a3028", "small"), fontSize: "0.65rem" }}>✕</button>
                            <button onClick={() => {
                              setParts(prev => prev.map((p, gi) => {
                                if (gi !== part.globalIdx) return p;
                                const paras = p.text.split("\n\n");
                                paras[i] = editingPart.text;
                                const newText = paras.join("\n\n");
                                // Reconstruire le HTML complet de la part si édition rich text
                                let newHtml = p.html || null;
                                if (editingPart.html) {
                                  // Remplacer juste le paragraphe édité dans le HTML
                                  newHtml = editingPart.html;
                                }
                                return { ...p, text: newText, html: newHtml };
                              }));
                              setEditingPart(null);
                              addLog("info", "EDIT", `✓ §${i+1} partie ${part.globalIdx + 1} modifié`);
                            }} style={{ ...S.btn(C.gold, "small"), fontSize: "0.65rem" }}>✓ OK</button>
                          </div>
                        </div>
                      ) : (
                        <div key={i} style={{ position: "relative", marginBottom: "1.3rem" }}>
                          {advancedMode && paraLabel !== null && !activeLang && (
                            chatInjectRef ? (
                              <span
                                onClick={() => chatInjectRef.current?.(`§${paraLabel}`)}
                                title={`Cliquer pour insérer §${paraLabel} dans le chat`}
                                style={{ position: "absolute", left: "-1.4rem", top: "-0.1rem", fontSize: "0.5rem", color: "#5a4838", fontFamily: "monospace", letterSpacing: 0, lineHeight: 1, cursor: "pointer", padding: "0.1rem 0.2rem", borderRadius: 2, transition: "color 0.15s, background 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.color = "#c9a96e"; e.currentTarget.style.background = "rgba(201,169,110,0.12)"; }}
                                onMouseLeave={e => { e.currentTarget.style.color = "#5a4838"; e.currentTarget.style.background = "transparent"; }}
                              >§{paraLabel}</span>
                            ) : (
                              <span style={{ position: "absolute", left: "-1.4rem", top: "-0.1rem", fontSize: "0.5rem", color: "#3a3028", fontFamily: "monospace", letterSpacing: 0, userSelect: "none", lineHeight: 1 }}>
                                §{paraLabel}
                              </span>
                            )
                          )}
                          <p
                            data-para-ref={paraLabel ? `§${paraLabel}` : undefined}
                            onClick={() => !activeLang && advancedMode && setEditingPart({ key, globalIdx: part.globalIdx, paraIdx: i, text: para, extendWords: 150 })}
                            title={activeLang ? "" : advancedMode ? "Cliquer pour éditer ce paragraphe" : "Activez le mode avancé pour éditer"}
                            style={{ margin: 0, cursor: activeLang ? "default" : advancedMode ? "text" : "default", borderRadius: 2, transition: "background 0.15s", padding: "0.1rem 0.2rem", marginLeft: "-0.2rem" }}
                            onMouseEnter={e => { if (!activeLang && advancedMode) e.currentTarget.style.background = "rgba(201,169,110,0.05)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >{para}</p>
                        </div>
                      );
                    })}
                  </div>
                  );
                })}
              </div>
            ))}
            <div id="bp-end" />
          </div>

          <p style={{ textAlign: "center", color: C.muted, fontSize: "0.73rem", fontStyle: "italic", marginTop: "0.65rem" }}>
            {t.chapCount(chapters.length)} · {t.partCount(parts.length)} · {t.wordCount(approxWords)}{ended && ` · ${t.storyEnded}`}{activeLang && ` · 🌐 ${LANG_LABELS[activeLang]}`}
          </p>

          {error && <p style={{ color: "#e06060", textAlign: "center", fontStyle: "italic", marginTop: "0.5rem" }}>{error}</p>}

          {/* ── Continuation controls ── */}
          {!ended && (
            <div style={{ background: C.card, border: "1px solid #2a2520", borderRadius: 4, padding: "1.1rem 1.25rem", marginTop: "1.25rem" }}>

              {/* Advanced NSFW toggle — visible at all times during generation */}
              {advancedMode && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem", paddingBottom: "0.65rem", borderBottom: "1px solid #2a2520" }}>
                  {nsfwEnabled ? (
                    <Toggle on={nextNsfw} onChange={setNextNsfw} label={t.adultLabel} color="#c94040" />
                  ) : (
                    <div onClick={() => setShowNsfwModal(true)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
                      <div style={{ width: 32, height: 18, borderRadius: 9, background: C.inputBorder, border: `1px solid ${C.border}`, position: "relative", flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: 2, left: 2, width: 12, height: 12, borderRadius: "50%", background: C.muted }} />
                      </div>
                      <span style={{ color: C.muted, fontSize: "0.75rem", fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>{t.adultLabel}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Word count slider */}
              <div style={{ marginTop: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ ...S.label, marginBottom: 0 }}>{t.lengthLabel}</span>
                  <span style={{ color: C.gold, fontSize: "0.82rem" }}>
                    ~{nextWords >= 1000 ? `${(nextWords / 1000).toFixed(nextWords % 1000 === 0 ? 0 : 1)}k` : nextWords} mots
                  </span>
                </div>
                <input type="range" className="word-slider" min={500} max={5000} step={250} value={nextWords}
                  onChange={e => setNextWords(Number(e.target.value))}
                  style={{ background: `linear-gradient(to right,${C.gold} ${((nextWords - 500) / 4500) * 100}%,#3a3328 ${((nextWords - 500) / 4500) * 100}%)` }} />
                <div style={{ position: "relative", height: "1.2rem", marginTop: "0.25rem" }}>
                  {[500, 1000, 2000, 3500, 5000].map(v => (
                    <span key={v} onClick={() => setNextWords(v)}
                      style={{
                        position: "absolute",
                        left: `${((v - 500) / 4500) * 100}%`,
                        transform: "translateX(-50%)",
                        fontSize: "0.58rem",
                        color: Math.abs(nextWords - v) < 200 ? C.gold : "#3a3228",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}>
                      {v >= 1000 ? `${v / 1000}k` : v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chapter suggestion */}
              {chapterSuggestion === "suggest" && (
                <div style={{ marginTop: "0.85rem", padding: "0.75rem 1rem", background: C.card, border: `1px solid ${C.blue}55`, borderRadius: 4, display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ color: C.blue, fontSize: "0.75rem", fontStyle: "italic", flex: 1 }}>{t.chapSuggest}</span>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button onClick={() => { setChapterSuggestion(null); advancedMode ? generateAxes(false, null, true) : generateSuite(false, null, true, null); }} style={S.btn(C.blue, "small")}>{t.closeAndNew}</button>
                    <button onClick={() => setChapterSuggestion(null)} style={{ ...S.btn("#555", "small"), fontSize: "0.68rem" }}>{t.ignore}</button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1rem" }}>
                <button onClick={() => advancedMode ? generateAxes(false, null, false) : generateSuite(false, null, false, null)} style={S.btn(C.gold, "small")} disabled={loadingAxes}>{t.continueBtn}</button>
                {advancedMode && (
                  <>
                    <button onClick={() => generateAxes(false, null, true)} style={S.btn(C.blue, "small")} disabled={loadingAxes}>↓ Générer fin de chapitre</button>
                    <button onClick={() => setShowEndingPicker(v => !v)} style={S.btn("#8a6a4a", "small")} disabled={loadingAxes}>↓ Générer fin du livre</button>
                    <button onClick={() => { closeCurrentChapter && closeCurrentChapter(); }} style={S.btn("#4a6a4a", "small")} disabled={loadingAxes} title="Clore ce chapitre et ouvrir le suivant sans générer de texte">✦ Clore chapitre</button>
                    <button onClick={() => { setEnded(true); if (!bookTitle) setBookTitle(buildGenreStr(choices?.genres || [])); addLog("info","GEN","✦ Livre clos"); }} style={S.btn("#6a4a2a", "small")} disabled={loadingAxes} title="Terminer le livre sans générer de texte de fin">✦ Clore le livre</button>
                  </>
                )}
                {!advancedMode && (
                  <button onClick={() => setShowEndingPicker(v => !v)} style={S.btn("#e0a060", "small")} disabled={loadingAxes}>{t.endStoryBtn}</button>
                )}
                <button onClick={() => {
                  const last = parts[parts.length - 1];
                  setParts(prev => prev.slice(0, -1));
                  if (lastAxes) {
                    // Restaurer les axes et directives du cycle précédent
                    setNextInclude(lastAxes.include || "");
                    setNextExclude(lastAxes.exclude || "");
                    setAxes(lastAxes.axes);
                    setPendingAction(lastAxes.pendingAction || { isFinal: false, finalEnding: null, closeChapter: false });
                    setSelectedAxis(null);
                  } else {
                    // Pas d'axes mémorisés : repartir sur inclure/exclure de la dernière partie
                    if (last?.include) setNextInclude(last.include);
                    if (last?.exclude) setNextExclude(last.exclude);
                    if (advancedMode) generateAxes(false, null, false);
                    else generateSuite(false, null, false, null);
                  }
                }} style={S.btn("#9a8a70", "small")} disabled={loadingAxes}>{t.regenBtn}</button>
                {advancedMode && (
                  <button onClick={() => setShowRewriteModal(true)} style={{ ...S.btn("#7a6aaa", "small") }} disabled={loadingAxes} title="Réécrire tout le texte dans un autre style">
                    ✍ Changer de style
                  </button>
                )}
              </div>

              {/* Loading axes */}
              {loadingAxes && (
                <div style={{ textAlign: "center", padding: "1.2rem 0 0.5rem" }}>
                  <style>{`@keyframes pulse{0%,100%{transform:scale(.8);opacity:.3}50%{transform:scale(1.2);opacity:1}}`}</style>
                  <p style={{ color: C.gold, fontStyle: "italic", fontSize: "0.82rem", marginBottom: "0.7rem", opacity: 0.8 }}>✦ Génération des axes narratifs…</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: `pulse 1.2s ease ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}

              {/* Axes picker */}
              {axes && pendingAction && (
                <div style={{ marginTop: "1.1rem", background: C.bg, border: `1px solid ${C.gold}44`, borderRadius: 6, padding: "1.1rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.gold}88,transparent)` }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "0.9rem" }}>
                    <div style={{ ...S.label, fontSize: "0.62rem", marginBottom: 0 }}>✦ CHOISISSEZ UN AXE NARRATIF ✦</div>
                    <button onClick={() => { setSelectedAxis(null); generateAxes(pendingAction.isFinal, pendingAction.finalEnding, pendingAction.closeChapter); }}
                      style={{ ...S.btn(C.muted, "small"), fontSize: "0.65rem", padding: "0.25rem 0.6rem" }}>↺ Nouveaux axes</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: advancedMode ? "1fr 1fr" : "1fr", gap: "0.65rem", marginBottom: "1rem" }}>
                    {axes.map((ax, i) => (
                      <div key={i} onClick={() => setSelectedAxis(i)}
                        style={{ border: selectedAxis === i ? `2px solid ${C.gold}` : "1px solid #3a3328", borderRadius: 5, padding: "0.85rem", cursor: "pointer", background: selectedAxis === i ? "rgba(201,169,110,0.08)" : "transparent", transition: "all 0.2s", position: "relative" }}>
                        <div style={{ color: selectedAxis === i ? "#e8d5a8" : "#9a8a70", fontSize: "0.78rem", fontFamily: "Georgia, serif", fontWeight: "bold", letterSpacing: "0.04em", marginBottom: "0.45rem", lineHeight: 1.3 }}>
                          {selectedAxis === i && <span style={{ color: C.gold, marginRight: "0.3rem" }}>✦</span>}{ax.title}
                        </div>
                        <div style={{ color: selectedAxis === i ? "#b8a880" : "#5a5040", fontSize: "0.73rem", lineHeight: 1.6, fontStyle: "italic" }}>{ax.description}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mode avancé : ignorer les axes */}
                  {advancedMode && (
                    <div style={{ borderTop: "1px solid #2a2520", paddingTop: "0.85rem", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Toggle on={ignoreAxes} onChange={v => { setIgnoreAxes(v); if(v) setSelectedAxis(null); }} label="Ignorer les axes — écriture libre" color="#9a8a70" />
                    </div>
                  )}

                  {/* Advanced: custom zone */}
                  {advancedMode && (
                    <div style={{ position: "relative", marginBottom: "1rem", borderTop: "1px solid #2a2520", paddingTop: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <div style={S.label}>{t.customNext}</div>
                      </div>
                      <CustomZone include={nextInclude} exclude={nextExclude} setInclude={setNextInclude} setExclude={setNextExclude} />
                    </div>
                  )}

                  <div style={{ textAlign: "center" }}>
                    <button
                      onClick={() => {
                        const axis = (!ignoreAxes && selectedAxis !== null) ? axes[selectedAxis].description : null;
                        generateSuite(pendingAction.isFinal, pendingAction.finalEnding, pendingAction.closeChapter, axis);
                      }}
                      disabled={!ignoreAxes && selectedAxis === null}
                      style={{ ...S.btn(C.gold, "small"), opacity: (!ignoreAxes && selectedAxis === null) ? 0.35 : 1, cursor: (!ignoreAxes && selectedAxis === null) ? "not-allowed" : "pointer", letterSpacing: "0.18em" }}>
                      {ignoreAxes ? "✦ Écrire librement" : selectedAxis !== null ? `✦ Suivre cet axe` : "← Choisissez un axe"}
                    </button>
                    <button onClick={() => { setAxes(null); setPendingAction(null); setSelectedAxis(null); setIgnoreAxes(false); }}
                      style={{ ...S.btn("#555", "small"), marginLeft: "0.5rem", fontSize: "0.68rem" }}>Annuler</button>
                  </div>
                </div>
              )}

              {/* New chapter after closing */}
              {chapters[currentChapter]?.closed && (
                <div style={{ marginTop: "0.85rem", textAlign: "center", padding: "0.75rem", background: C.card, border: `1px solid ${C.green}55`, borderRadius: 4 }}>
                  <p style={{ color: C.green, fontSize: "0.75rem", fontStyle: "italic", marginBottom: "0.6rem" }}>✦ {chapters[currentChapter].title} clos</p>
                  <button onClick={openNewChapter} style={S.btn(C.green, "small")}>{t.openChap(chapters.length === 1 ? "II" : romanNum(chapters.length))}</button>
                </div>
              )}

              {/* Ending picker */}
              {showEndingPicker && (
                <div style={{ marginTop: "1rem", padding: "1rem", background: C.bg, border: `1px solid ${C.gold}33`, borderRadius: 4 }}>
                  <div style={{ ...S.label, textAlign: "center", marginBottom: "0.7rem" }}>{t.endingType}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25rem", marginBottom: "0.75rem" }}>
                    {t.endings.map(e => <button key={e.v} onClick={() => setSelectedEnding(e.v)} style={S.chip(selectedEnding === e.v)}>{e.l}</button>)}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <button onClick={() => { if (selectedEnding) { setShowEndingPicker(false); advancedMode ? generateAxes(true, selectedEnding, false) : generateSuite(true, selectedEnding, false, null); } }}
                      disabled={!selectedEnding}
                      style={{ ...S.btn("#e0a060", "small"), opacity: selectedEnding ? 1 : 0.4, cursor: selectedEnding ? "pointer" : "not-allowed" }}>
                      {t.confirmEnd}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {ended && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
              {/* Réouvrir le livre */}
              <button onClick={() => {
                  setEnded(false);
                  addLog("info", "GEN", "✦ Livre réouvert — génération possible");
                }}
                style={{ ...S.btn("#6a8a6a", "small") }}
                title="Réouvrir le livre pour continuer à écrire">
                ↺ Réouvrir le livre
              </button>
              <button onClick={() => {
                  const last = parts[parts.length - 1];
                  setParts(prev => prev.slice(0, -1));
                  setEnded(false);
                  if (lastAxes) {
                    setNextInclude(lastAxes.include || "");
                    setNextExclude(lastAxes.exclude || "");
                    setAxes(lastAxes.axes);
                    setPendingAction(lastAxes.pendingAction || { isFinal: true, finalEnding: selectedEnding, closeChapter: false });
                    setSelectedAxis(null);
                  } else {
                    if (last?.include) setNextInclude(last.include);
                    if (last?.exclude) setNextExclude(last.exclude);
                    setShowEndingPicker(true);
                  }
                }} style={S.btn("#9a8a70", "small")}>{t.regenEnd}</button>
              {advancedMode && (
                <button onClick={() => setShowRewriteModal(true)} style={S.btn("#7a6aaa", "small")} title="Réécrire toute l'histoire dans un autre style">
                  ✍ Changer de style
                </button>
              )}
            </div>
          )}

          {/* ── REWRITE STYLE MODAL ── */}
          {showRewriteModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
              <div style={{ background: "#1a1710", border: `1px solid #7a6aaa`, borderRadius: 8, padding: "1.75rem", maxWidth: 480, width: "100%", position: "relative", boxShadow: "0 0 40px #7a6aaa33" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#7a6aaa88,#9a8acc,#7a6aaa88,transparent)", borderRadius: "8px 8px 0 0" }} />
                <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
                  <div style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>✍</div>
                  <div style={{ color: "#9a8acc", fontSize: "0.65rem", letterSpacing: "0.3em" }}>RÉÉCRITURE STYLISTIQUE</div>
                  <p style={{ color: "#7a6a90", fontSize: "0.75rem", fontStyle: "italic", marginTop: "0.5rem", lineHeight: 1.6 }}>
                    Toute l'histoire sera réécrite en conservant l'intrigue mais en adoptant le style choisi.
                  </p>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ ...S.label, color: "#9a8acc", marginBottom: "0.5rem" }}>✦ Choisir le style cible</div>
                  <div style={{ position: "relative" }}>
                    <select value={rewriteTargetStyle} onChange={e => setRewriteTargetStyle(e.target.value)}
                      style={{ ...S.input, minHeight: "unset", height: "40px", resize: "none", appearance: "none", WebkitAppearance: "none", paddingRight: "2rem", cursor: "pointer", color: rewriteTargetStyle ? "#d4c8b0" : "#5a4a6a", border: "1px solid #4a3a7a" }}>
                      <option value="">— Sélectionner un auteur —</option>
                      {AUTHORS.map(group => (
                        <optgroup key={group.group} label={`── ${group.group} ──`}>
                          {group.authors.map(author => (
                            <option key={author} value={author}>À la manière de {author}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <span style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "#9a8acc", pointerEvents: "none", fontSize: "0.7rem" }}>▾</span>
                  </div>
                  {rewriteTargetStyle && (
                    <p style={{ color: "#6a5a8a", fontSize: "0.7rem", fontStyle: "italic", marginTop: "0.4rem", lineHeight: 1.5 }}>
                      ✦ <span style={{ color: "#9a8acc" }}>{rewriteTargetStyle}</span> — {(AUTHOR_STYLES[rewriteTargetStyle] || "").slice(0, 120)}…
                    </p>
                  )}
                </div>

                {choices?.writingStyle && (
                  <p style={{ color: "#5a4a6a", fontSize: "0.7rem", fontStyle: "italic", marginBottom: "0.85rem" }}>
                    Style actuel : <span style={{ color: "#7a6a9a" }}>{choices.writingStyle}</span>
                  </p>
                )}

                <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center" }}>
                  <button onClick={rewriteInStyle} disabled={!rewriteTargetStyle}
                    style={{ ...S.btn("#7a6aaa", "small"), opacity: rewriteTargetStyle ? 1 : 0.4, cursor: rewriteTargetStyle ? "pointer" : "not-allowed", letterSpacing: "0.12em" }}>
                    ✍ Réécrire maintenant
                  </button>
                  <button onClick={() => { setShowRewriteModal(false); setRewriteTargetStyle(""); }}
                    style={S.btn("#555", "small")}>Annuler</button>
                </div>
              </div>
            </div>
          )}

          {/* ── REWRITING SPINNER OVERLAY ── */}
          {rewritingStyle && (
            <div style={{ position: "fixed", inset: 0, background: `rgba(0,0,0,0.88)`, zIndex: 99, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
              <style>{`@keyframes pulse{0%,100%{transform:scale(.8);opacity:.3}50%{transform:scale(1.2);opacity:1}}`}</style>
              <div style={{ fontSize: "2rem" }}>✍</div>
              <p style={{ color: "#9a8acc", fontStyle: "italic", fontSize: "0.9rem", letterSpacing: "0.1em" }}>Réécriture stylistique en cours…</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#7a6aaa", animation: `pulse 1.2s ease ${i*0.2}s infinite` }} />)}
              </div>
              <p style={{ color: "#5a4a6a", fontSize: "0.72rem", fontStyle: "italic", maxWidth: 300, textAlign: "center" }}>Cette opération peut prendre quelques minutes selon la longueur du texte.</p>
            </div>
          )}

          {/* ── BOOK PANEL ── */}
          {ended && (
            <div style={{ background: C.card, border: `2px solid ${C.green}44`, borderRadius: 6, padding: "1.5rem 1.25rem", marginTop: "1.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${C.green}55,${C.green},${C.green}55,transparent)` }} />
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>📚</div>
                {advancedMode && <div style={{ color: C.green, fontSize: "0.6rem", letterSpacing: "0.35em", opacity: 0.85 }}>{t.illustrateTitle}</div>}
              </div>

              {advancedMode ? (
                /* Mode avancé : éditeur complet */
                <>
                  <p style={{ color: C.muted, fontSize: "0.78rem", textAlign: "center", fontStyle: "italic", lineHeight: 1.6, marginBottom: "1.2rem" }}>
                    {t.illustrateDesc}
                  </p>
                  <div style={{ marginBottom: "1rem", maxWidth: 280, margin: "0 auto 1rem" }}>
                    <div style={{ ...S.label, textAlign: "center" }}>{t.authorLabel}</div>
                    <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder={t.authorPh}
                      style={{ ...S.input, minHeight: "unset", height: "36px", resize: "none", textAlign: "center" }} />
                  </div>
                  <div style={{ textAlign: "center", display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={buildBook} style={{ ...S.btn(C.green), letterSpacing: "0.15em", fontSize: "0.82rem", padding: "0.85rem 2rem" }}>
                      {t.openEditor}
                    </button>
                    {book && (
                      <button onClick={() => setShowBook(true)} style={S.btn(C.gold, "small")}>{t.viewBook}</button>
                    )}
                  </div>

                  {/* ── Séparateur traduction ── */}
                  <div style={{ borderTop: `1px solid ${C.border}`, marginTop: "1.2rem", paddingTop: "1rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "0.7rem" }}>
                      <span style={{ color: C.muted, fontSize: "0.6rem", letterSpacing: "0.3em" }}>🌐 TRADUCTION LITTÉRAIRE</span>
                    </div>

                    {/* Chips des traductions existantes */}
                    {Object.keys(translations).length > 0 && (
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "0.7rem" }}>
                        <button onClick={() => setActiveLang(null)}
                          style={{ ...S.chip(activeLang === null), fontSize: "0.65rem" }}>
                          {LANG_LABELS[choices?.language || language] || "Original"}
                        </button>
                        {Object.keys(translations).map(lang => (
                          <button key={lang} onClick={() => setActiveLang(lang)}
                            style={{ ...S.chip(activeLang === lang), fontSize: "0.65rem" }}>
                            {LANG_LABELS[lang] || lang}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Barre de progression traduction */}
                    {translating && (
                      <div style={{ marginBottom: "0.7rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                          <span style={{ color: C.muted, fontSize: "0.65rem", fontStyle: "italic" }}>
                            ⟳ Traduction en cours… {translateProgress}%
                          </span>
                        </div>
                        <div style={{ height: "3px", background: C.border, borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${translateProgress}%`, background: C.green, borderRadius: 2, transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                    )}

                    {/* Panneau sélection langue */}
                    {showTranslatePanel && !translating && (
                      <div style={{ background: C.panelBg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "0.9rem 1rem", marginBottom: "0.7rem" }}>
                        <div style={{ ...S.label, marginBottom: "0.6rem" }}>Traduire vers :</div>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.7rem" }}>
                          {Object.entries(LANG_LABELS)
                            .filter(([k]) => k !== (choices?.language || language))
                            .map(([k, label]) => (
                              <button key={k}
                                onClick={() => setTranslateTargetLang(k)}
                                style={{ ...S.chip(translateTargetLang === k), fontSize: "0.65rem" }}>
                                {label}{translations[k] ? " ✓" : ""}
                              </button>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          <button
                            onClick={() => translateBook(translateTargetLang)}
                            disabled={!translateTargetLang}
                            style={{ ...S.btn(C.green, "small"), opacity: translateTargetLang ? 1 : 0.4 }}>
                            {translations[translateTargetLang] ? "🌐 Basculer" : "🌐 Traduire"}
                          </button>
                          <button onClick={() => { setShowTranslatePanel(false); setTranslateTargetLang(""); }}
                            style={S.btn("#555", "small")}>Annuler</button>
                        </div>
                      </div>
                    )}

                    {/* Bouton ouvrir panneau */}
                    {!showTranslatePanel && !translating && (
                      <div style={{ textAlign: "center" }}>
                        <button
                          onClick={() => setShowTranslatePanel(true)}
                          style={{ ...S.btn("#3a6a5a", "small"), fontSize: "0.7rem" }}>
                          🌐 {Object.keys(translations).length > 0 ? "Ajouter une langue" : "Traduire le livre"}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Mode simple : voir en HTML + télécharger directement */
                <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => openBookHtml()}
                    style={{ ...S.btn(C.green, "small") }}>
                    📖 Voir le livre
                  </button>
                  <button onClick={save} disabled={saving || !ended}
                    style={{ ...S.btn("#c9a96e", "small"), opacity: (saving || !ended) ? 0.5 : 1 }}>
                    {saving ? t.preparing : "📄 PDF"}
                  </button>
                  <button onClick={() => downloadEpub(null, null, {})} disabled={savingEpub || !ended}
                    style={{ ...S.btn(C.blue, "small"), opacity: (savingEpub || !ended) ? 0.4 : 1 }}>
                    {savingEpub ? "…" : "📖 EPUB"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── SAVE ── mode avancé uniquement */}
          {advancedMode && (
          <div style={{ background: C.card, border: `1px solid ${ended ? "#3a4a2a" : C.border}`, borderRadius: 4, padding: "1.1rem 1.25rem", marginTop: "1.25rem", position: "relative", overflow: "hidden" }}>
            <div style={S.label}>{t.saveLabel}</div>

            {/* Bouton .txt toujours accessible, au-dessus de l'overlay */}
            {parts.length > 0 && (
              <button onClick={downloadTxt}
                style={{ position: "absolute", top: "0.6rem", right: "0.75rem", zIndex: 11, background: "none", border: `1px solid #3a3028`, cursor: "pointer", color: "#5a4a38", fontSize: "0.6rem", letterSpacing: "0.12em", fontFamily: "Georgia, serif", padding: "0.2rem 0.6rem", borderRadius: 2 }}
                title="Sauvegarde texte brut — disponible à tout moment">
                📄 .txt
              </button>
            )}

            {!ended && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,9,8,0.82)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                <p style={{ color: C.muted, fontSize: "0.82rem", fontStyle: "italic", textAlign: "center", padding: "0 1.5rem" }}>{t.saveLocked}</p>
              </div>
            )}

            {/* EPUB */}
            <div style={{ borderBottom: "1px solid #2a2520", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <div style={{ ...S.label, color: C.blue, textAlign: "center" }}>📖 EPUB</div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => downloadEpub(book?.coverDataUrl, book?.backCoverDataUrl, book?.images || {})}
                  disabled={savingEpub || !ended || !book}
                  style={{ ...S.btn(C.blue, "small"), opacity: (savingEpub || !ended || !book) ? 0.4 : 1, cursor: (!ended || !book) ? "not-allowed" : "pointer" }}>
                  {savingEpub ? t.generatingEpub : t.withIllus}
                </button>
                <button onClick={() => downloadEpub(null, null, {})} disabled={savingEpub || !ended}
                  style={{ ...S.btn(C.blue, "small"), opacity: (savingEpub || !ended) ? 0.4 : 1 }}>
                  {savingEpub ? "…" : t.textOnly}
                </button>
              </div>
              {!book && ended && <p style={{ color: "#5a7a8a", fontSize: "0.7rem", textAlign: "center", fontStyle: "italic", marginTop: "0.5rem" }}>{t.epubHint}</p>}
            </div>
            {/* PDF / Word */}
            <div style={{ ...S.label, textAlign: "center" }}>📄 PDF / Word</div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "0.9rem", flexWrap: "wrap" }}>
              {["pdf", "pdf-illus", "word"].map(f => (
                <button key={f} onClick={() => setSaveFormat(f)} style={S.chip(saveFormat === f)}>
                  {f === "pdf" ? "📄 PDF" : f === "pdf-illus" ? "🎨 PDF illustré" : "📝 Word"}
                </button>
              ))}
            </div>
            {saveFormat === "pdf-illus" && !(bookImages?.coverDataUrl || book?.coverDataUrl || bookImages?.backCoverDataUrl || book?.backCoverDataUrl || Object.keys(bookImages?.images || book?.images || {}).length > 0) && (
              <p style={{ color: C.muted, fontSize: "0.68rem", textAlign: "center", fontStyle: "italic", marginBottom: "0.6rem", opacity: 0.7 }}>
                Aucune illustration ajoutée — le PDF sera identique au PDF standard.
              </p>
            )}
            <div style={{ textAlign: "center" }}>
              <button onClick={save} disabled={saving || !ended} style={{ ...S.btn(C.green, "small"), opacity: (saving || !ended) ? 0.5 : 1 }}>
                {saving ? t.preparing : t.dlBtn}
              </button>
            </div>

            {saveLink && <p style={{ color: C.green, textAlign: "center", fontSize: "0.78rem", marginTop: "0.7rem", fontStyle: "italic" }}>{saveLink}</p>}
          </div>
          )}

          <div style={{ textAlign: "center", marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={reset} style={{ ...S.btn("#555", "small"), fontSize: "0.73rem" }}>{t.newStory}</button>
            {advancedMode && parts.length > 0 && (<>
              <button onClick={saveProject} style={{ ...S.btn(C.gold, "small"), fontSize: "0.73rem" }}>
                💾 Sauvegarder le projet
              </button>
            </>)}
          </div>
          <p style={{ textAlign: "center", color: C.gold, opacity: .15, letterSpacing: ".5em", marginTop: "1.5rem", paddingBottom: "2.5rem" }}>✦ ✦ ✦</p>
        </div>
      )}
      {/* ── HTML BOOK MODAL (mode simple) ── */}
      {htmlModalContent && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#09080a", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1rem", background: "#0f0e0a", borderBottom: "1px solid #2a2520", flexShrink: 0 }}>
            <span style={{ color: C.gold, fontSize: "0.65rem", letterSpacing: "0.3em", opacity: 0.7 }}>✦ APERÇU DU LIVRE ✦</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  const blob = new Blob([htmlModalContent], { type: "text/html;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  const title = bookTitle || buildGenreStr(choices?.genres || []) || "histoire";
                  a.href = url; a.download = `${title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s\-_]/g,"").trim()}.html`;
                  document.body.appendChild(a); a.click(); document.body.removeChild(a);
                  setTimeout(() => URL.revokeObjectURL(url), 3000);
                }}
                style={{ ...S.btn(C.blue, "small"), fontSize: "0.68rem" }}>
                ⬇ Télécharger HTML
              </button>
              <button onClick={() => setHtmlModalContent(null)} style={{ ...S.btn("#555", "small"), fontSize: "0.68rem" }}>✕ Fermer</button>
            </div>
          </div>
          <iframe
            srcDoc={htmlModalContent}
            style={{ flex: 1, border: "none", width: "100%", background: "#09080a" }}
            title="Aperçu du livre"
          />
        </div>
      )}

      <DebugPanel advancedMode={advancedMode} onAdvancedToggle={handleAdvancedToggle} themeMode={themeMode} setThemeMode={setThemeMode} onShowHelp={() => setShowAdvancedHelp(true)} chatProps={{
        parts, chapters, choices, genres, writingStyle, language, advancedMode,
        setAdvancedMode, setNextInclude, setNextExclude, setAxes, setPendingAction,
        bookTitle, narrator, setWritingStyle, generateSuite, generateAxes, generate,
        setGenres, setNarrator, setLanguage, setDuration, setClassicSource,
        classicSource, searchClassicSource,
        setInitInclude, setInitExclude,
        generateBtnRef, setGeneratePulse,
        importText,
        axes, selectedAxis, setSelectedAxis, lastAxes,
        nextWords, setNextWords,
        bookMode, setBookMode,
        ended, setEnded,
        showEndingPicker, setShowEndingPicker,
        chapterSuggestion, setChapterSuggestion,
        currentChapter, setCurrentChapter,
        showRewriteModal, setShowRewriteModal,
        rewriteTargetStyle, setRewriteTargetStyle,
        showTranslatePanel, setShowTranslatePanel,
        translateTargetLang, setTranslateTargetLang,
        translateBook, saveProject, closeCurrentChapter,
        movePart: (idx, dir) => setParts(prev => { const np = [...prev]; const t = idx + dir; if (t < 0 || t >= np.length) return np; [np[idx], np[t]] = [np[t], np[idx]]; return np; }),
        updateLastPart: (newText) => setParts(prev => prev.map((p, i) => i === prev.length - 1 ? { ...p, text: newText } : p)),
        extendLastParagraph, extendParagraph, rewriteParagraph, chatInjectRef,
        nsfwEnabled, triggerNsfwModal: () => setShowNsfwModal(true), onIndexBlocks: indexAllBlocks, indexingBlocks, blocksCount: blocks.length, blocksSummarized: blocks.filter(b => b.summary && !b.summaryIsChapter).length, onChatbotWarn: () => setShowChatbotWarn(true),
        nextNsfw, setNextNsfw,
        setBookTitle,
        duration, setDuration, blocks
      }} />
    </div>
    </ThemeContext.Provider>
  );
}
