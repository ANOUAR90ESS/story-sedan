import { Idea } from "../types";

export const PRESET_IDEAS: Idea[] = [
  {
    id: "egypt-sci-fi-fr",
    title: "L'Égypte Cosmique : L'Empire qui a Conquis les Étoiles !",
    hook: "Et si la véritable raison pour laquelle les pyramides de Gizeh sont alignées avec la ceinture d'Orion n'était pas rituelle, mais les coordonnées d'un empire stellaire caché ?",
    rareAngle: "Une réimagination technologique où les obélisques servaient d'antennes d'énergie ionique et les pyramides de propulseurs spatiaux thermo-nucléaires.",
    visualStyle: "Cinematic retro-futuristic Egyptian high-technology, gold-plated giant starships flying over the pyramids, glowing cyan hieroglyphic matrices, dark sand dunes under a dual sun starscape.",
    fullScript: `[Intro] Les pyramides de Gizeh ne sont pas des tombeaux. Ce sont des conduits émetteurs reliés à d'immenses astronefs dorés. [Act I] La découverte fortuite d'un code enfoui au sein de la chambre de la reine révèle des plans d'un vaisseau alimenté par le quartz de Gizeh. [Crisis] Le réveil inattendu d'un signal de détresse vieux de 4000 ans vers le système d'Orion provoque l'activation d'une IA divine qui isole l'orbite terrestre. [Climax] Le déchiffrement de la stèle d'or d'Abydos pour inverser la barrière énergétique et ouvrir le grand portail orbital de Thot. [Legacy] L'humanité comprend enfin son destin galactique : nous devons lever les yeux vers le ciel et rejoindre la flotte éternelle du désert.`,
    structure: {
      hook_narration: "Depuis des millénaires, les pyramides d’Égypte dominent l'horizon de Gizeh. Mais si l'explication officielle n'était qu'un mensonge pour masquer la vérité ?",
      act1: "La découverte fortuite d'un code enfoui au sein de la chambre de la reine révèle des plans d'astonef alimentés par le quartz de Gizeh. L'Égypte s'avère être la plateforme d'un programme d'exploration spatiale antique.",
      crisis: "Le réveil inattendu d'un signal de détresse vieux de 4000 ans vers le système d'Orion provoque l'activation d'une IA divine protectrice qui isole toute l'orbite terrestre de la Terre.",
      climax: "Le déchiffrement de la stèle d'or d'Abydos pour reprogrammer la barrière énergétique orbitale et forcer l'ouverture du grand portail intersidéral de Thot.",
      legacy: "L'humanité comprend enfin son destin galactique : l'Égypte n'était pas qu'une civilisation de sable, mais la première escale de notre voyage vers l'éternité."
    },
    visuals: [
      "Vaisseau spatial pyramidal géant doré et noir survolant le Nil au crépuscule.",
      "Un prêtre d'Anubis portant un casque holographique projetant des constellations stellaires.",
      "L'intérieur de la chambre du Roi s'enflammant d'une lumière néon bleue piézoélectrique.",
      "Une porte des étoiles active au milieu du temple d'Abydos."
    ],
    historicalFacts: [
      "L'alignement ultra-précis des pyramides de Gizeh avec la ceinture d'Orion fascine les astronomes contemporains.",
      "Le quartz rose enfermé dans la Chambre du Roi possède de fortes propriétés piézoélectriques conductrices.",
      "Les obélisques de granite d'une seule pièce de plus de 1000 tonnes remettent en question nos théories de logistique mécanique primitive."
    ],
    metadata: {
      category: "Empires & Civilizations",
      duration: "20-40 min",
      style: "Cinematic",
      language: "FR",
      timestamp: 1779369000000
    },
    scenes: [
      {
        id: "egypt_scene_1",
        locked: false,
        timestamp: "00:00",
        durationSeconds: 8,
        description: "Introductory tracking shot of Gizeh Pyramids at dusk.",
        narration: "Depuis des millénaires, les pyramides d’Égypte dominent l'horizon de Gizeh. Mais si l'explication officielle n'était qu'un mensonge pour masquer la vérité ?",
        visualPrompt: "Cinematic ultra-detailed wide shot of the Giza pyramids at twilight, glowing cyan lines tracing the edges of the ancient structures, realistic golden hour light, photorealistic sand textures.",
        motionType: "slow_drift",
        imageUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "egypt_scene_2",
        locked: false,
        timestamp: "00:08",
        durationSeconds: 8,
        description: "Golden Egyptian Starship reveal.",
        narration: "En réalité, ces colosses de pierre ne sont pas des tombeaux. Ce sont des conduits émetteurs reliés à d'immenses astronefs recouverts d'or pur, voguant entre les étoiles.",
        visualPrompt: "Colossal triangular golden spaceship with ancient Egyptian markings hovering in orbit above the Earth, shining thrusters emitting soft blue plasma, stellar background, hyper-detailed.",
        motionType: "push_in",
        imageUrl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "egypt_scene_3",
        locked: false,
        timestamp: "00:16",
        durationSeconds: 8,
        description: "Inner chamber ritual with quantum technology.",
        narration: "Dans le secret de la Grande Pyramide, les pharaons utilisaient des chambres à résonance piézoélectrique pour synchroniser leur conscience avec de lointaines colonies galactiques.",
        visualPrompt: "An ancient Egyptian high priest with a glowing blue holographic visor looking over complex digital solar system charts inside a quartz-walled chamber, mystical volumetric lighting, dramatic shadows.",
        motionType: "pan_horizontal",
        imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "egypt_scene_4",
        locked: false,
        timestamp: "00:24",
        durationSeconds: 8,
        description: "Space portal activation at Abydos.",
        narration: "Le temple d'Abydos abritait un portail dimensionnel, une porte stellaire menant directement aux systèmes d'Orion et de Sirius.",
        visualPrompt: "A massive stargate active inside a sandstone temple, swirling blue quantum portal energy, hieroglyphics lit up with white light, dust particles in air, cinematic wide angle.",
        motionType: "zoom_in",
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "egypt_scene_5",
        locked: false,
        timestamp: "00:32",
        durationSeconds: 9,
        description: "Egyptian Fleet cruising deep space.",
        narration: "Le leur programme spatial ultra-avancé a permis à la plus ancienne superpuissance de la Terre de coloniser des dizaines de mondes habitables.",
        visualPrompt: "A fleets of ancient Egyptian design starships, sleek obelisk and pyramid-shaped gold and black vessels, traveling through a colorful vibrant deep space nebula.",
        motionType: "slow_drift",
        imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "egypt_scene_6",
        locked: false,
        timestamp: "00:41",
        durationSeconds: 10,
        description: "Legacy of the star gods.",
        narration: "Aujourd’hui, le signal s’est réveillé. L’heure est venue pour l'humanité de lever les yeux vers le ciel, et de retrouver ses créateurs.",
        visualPrompt: "A wide low angle shot of a modern human astronaut looking up at a giant ancient Egyptian golden crown floating in orbital space, deep space background, epic sense of scale.",
        motionType: "zoom_out",
        imageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  },
  {
    id: "space-collapse-en",
    title: "EARTH HAS COLLAPSED: Humanity's Final, Desperate Odyssey Into the Void",
    hook: "As the last ecosystem on Earth withered into toxic ash, humanity didn't build shelters—we built steel arks. This is the classified recovery of the Exodus fleet logs.",
    rareAngle: "A clinical, documentative look through raw recovered flight telemetry and crew status files inside silent generation spacecraft.",
    visualStyle: "Gritty grainy 35mm documentary footage, flickering CRT screens, industrial realistic spaceship interiors, massive metallic hulls silhouetted against cold Nebulae.",
    fullScript: `[Intro] The sirens did not blare when Earth died. It was a silent suffocation. In 2088, the Exodus fleet left the planet. [Act I] For three long generations, human DNA lived inside rotating aluminum cylinders. Space was a metal cage designed to protect our fading memory of grass. [Crisis] A sudden high-speed micro-meteorite rupture in the primary farming vault of Ark-4 leaves the entire colony with only twelve days of breathable air. [Climax] Diverting power from gravity grids, the survivors initiate a blind slipstream jump towards Kepler-452b to avoid absolute extinction. [Legacy] Landing on damp coastlines beneath twin stars, we realize we are no longer Terran. We are children of the steel void.`,
    structure: {
      hook_narration: "The sirens didn't scream when the end came. It was a silent evaporation of atmosphere. On May 12th, the Exodus fleet fired its thrusters, casting Earth into a distant, burning marble.",
      act1: "For three generations, humanity lived inside rotation cylinders, recycling water, air, and memories. Space was not an adventure; it was a cold cage designed to keep our species from going extinct.",
      crisis: "A sudden micrometeorite storm ruptures the main agricultural dome of Ark-4, destroying 80% of the colony's oxygen-generating algae, forcing a brutal ethical choice regarding life support rationing.",
      climax: "The discovery of a pristine Kepler exoplanet already emitting a low-frequency repeating radio beacon, revealing we were either targeted or followed by something ancient.",
      legacy: "Humanity steps onto a new soil, leaving our old home as a ghost story. We are no longer children of Earth; we are the nomads of deep space, forever shaped by our time in the dark."
    },
    visuals: [
      "Colossal industrial space station drifting past a lightless grey Earth.",
      "Green CRT monitors glowing in a dark, narrow spacecraft hallway.",
      "Inside a spinning agricultural compartment with artificial violet sunshine.",
      "Lander module plummeting through alien cyan clouds."
    ],
    historicalFacts: [
      "The mathematical model of generational starships was first established by Soviet space visionary Konstantin Tsiolkovsky.",
      "Algae bio-reactors are actively used under deep-sea naval vessels and on the ISS to recycle carbon dioxide into life-sustaining oxygen.",
      "Voyager 1 traveled at 17 kilometers per second but would need over forty thousand years to traverse to the nearest star cluster."
    ],
    metadata: {
      category: "Space History & Tech",
      duration: "20-40 min",
      style: "Documentary",
      language: "EN",
      timestamp: 1779369100000
    },
    scenes: [
      {
        id: "space_scene_1",
        locked: false,
        timestamp: "00:00",
        durationSeconds: 8,
        description: "The decay of orbital Earth.",
        narration: "This is all that is left of our cradle. Carbon-choked, silent, and cold. A monument to the failure of twenty-first-century politics.",
        visualPrompt: "A grainy 35mm documentary style shot of a dark, dead Earth covered in gray clouds, viewed from a high orbit space station window with scuffs and reflection on glass, old video camcorder noise.",
        motionType: "slow_drift",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "space_scene_2",
        locked: false,
        timestamp: "00:08",
        durationSeconds: 8,
        description: "Launch of generation arks.",
        narration: "Our escape was not with a bang, but with a silent, iron resolve. Colossal generation arks fired their fusion thrusters, bound for systems unknown.",
        visualPrompt: "A massive modular metal spaceship with huge solar sails and industrial scaffolding firing a blue fusion drive, drifting away from Earth, realistic NASA documentary style footage, high contrast.",
        motionType: "push_in",
        imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "space_scene_3",
        locked: false,
        timestamp: "00:16",
        durationSeconds: 8,
        description: "Hydroponic life on generation ships.",
        narration: "For eighty years, life was sustained inside rotating steel cylinders. Algae farms became our artificial lungs, and dim heat-lamps our sun.",
        visualPrompt: "A vast circular interior of an orbital spacecraft colony, rows of glowing pink and green LED agricultural hydroponics, a worker in a simple utility uniform inspecting crops under a warm mist.",
        motionType: "pan_horizontal",
        imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "space_scene_4",
        locked: false,
        timestamp: "00:24",
        durationSeconds: 8,
        description: "Micrometeorite collision impact log.",
        narration: "In the depth of the void, there are no minor errors. A single grain of cosmic dust at high speed could end a thousand lives in a fraction of a second.",
        visualPrompt: "Flickering emergency red security footage of a breached spacecraft hull, cold air escaping, yellow sparks flying inside a dark metallic corridor filled with warning panels.",
        motionType: "action_shake",
        imageUrl: "https://images.unsplash.com/photo-1518364538800-6bcb3f25da49?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "space_scene_5",
        locked: false,
        timestamp: "00:32",
        durationSeconds: 9,
        description: "Approaching Kepler alien planet.",
        narration: "And then, after nearly a century of silence, a signal arrived. It came from a pristine, ocean-covered exoplanet. Empty, yet calling out.",
        visualPrompt: "A breathtaking wide shot of a deep blue exoplanet with binary rings, viewed from a spacecraft's navigation console, glowing radar displays and data streams framing the alien world.",
        motionType: "zoom_in",
        imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "space_scene_6",
        locked: false,
        timestamp: "00:41",
        durationSeconds: 10,
        description: "Landing of colony drop pods.",
        narration: "We did not conquer space. We merely survived it. Today, the nomads of Earth find their new home. Real air. Real grass. A second chance.",
        visualPrompt: "A dramatic shot of retro-futuristic landing modules descending through the atmosphere of a beautiful sky-blue alien planet with double suns, casting long epic shadows over a pristine coastline.",
        motionType: "zoom_out",
        imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  },
  {
    id: "atlantis-sci-fi-ar",
    title: "صدمة التاريخ: حضارة الأتلانتس المفقودة لم تغرق... بل غادرت كوكب الأرض!",
    hook: "ماذا لو لم تكن «أتلانتس» مجرد أسطورة يونانية قديمة كتبها أفلاطون، بل كانت في الواقع محطة فضائية عملاقة هبطت على محيطاتنا، وعندما حلت الكارثة، لم تغرق إلى قاع البحر... بل عادت إلى موطنها الأصلي في النجوم؟",
    rareAngle: "منظور علمي يدمج نصوص تسيمايوس وكريتياس مع فيزياء الطاقة الكهرومغناطيسية، حيث يُعاد تصور المعادن الأسطورية مثل الأوريشالكوم كوقود نووي بارد سمح للمدينة الدائرية بالتحليق خارج الغلاف الجوي.",
    visualStyle: "Epic colossal ancient high-tech rings of Atlantis hovering over a massive ocean vortex, golden orichalcum metal textures glowing with blue plasma, ancient statues integrated with advanced quantum emitters.",
    fullScript: `[مدخل] في أعماق المحيط الأطلسي، خلف أعمدة هرقل، تروي الأساطير قصة قارة غرقت في ليلة واحدة. لكن الألواح الطينية المشفرة لا تتحدث عن غرق... بل عن صعود عظيم نحو السماء. [الفصل الأول] تأسست أتلانتس على حلقات دائرية من المعدن والماء، ليس كمدينة، بل كمحرك جاذبية ضخم مصمم لثني الزمكان والتواصل مع الكواكب البعيدة. [أزمة] تذبذب مفاجئ في بلورات الطاقة المركزية يهدد بتدمير قلب الأرض الكهرومغناطيسي، مما يجبر قادة أتلانتس على اتخاذ قرار حاسم بفصل جزرهم الطائرة عن القشرة الأرضية. [الذروة] لحظة إقلاع أتلانتس، حيث ارتفعت الحلقات الدائرية الضخمة من المياه محدثة تسونامي عالمي هائل غمر الشواطئ، بينما اختفت المدينة بوميض من النور خلف السحب. [الأثر] الآثار التي تركوها وراءهم في مصر وسومر ليست سوى رسائل مشفرة لنا، لنفهم أن أصلنا ليس هنا، بل في حضن الكون الفسيح.`,
    structure: {
      hook_narration: "في أعماق المحيط الأطلسي، خلف أعمدة هرقل، تروي الأساطير قصة قارة غرقت في ليلة واحدة. لكن الألواح الطينية المشفرة لا تتحدث عن غرق... بل عن صعود عظيم نحو السماء.",
      act1: "تأسست أتلانتس على حلقات دائرية من المعدن والماء، ليس كمدينة، بل كمحرك جاذبية ضخم مصمم لثني الزمكان والتواصل مع الكواكب البعيدة.",
      crisis: "تذبذب مفاجئ في بلورات الطاقة المركزية يهدد بتدمير قلب الأرض الكهرومغناطيسي، مما يجبر قادة أتلانتس على اتخاذ قرار حاسم بفصل جزرهم الطائرة عن القشرة الأرضية.",
      climax: "لحظة إقلاع أتلانتس، حيث ارتفعت الحلقات الدائرية الضخمة من المياه محدثة تسونامي عالمي هائل غمر الشواطئ، بينما اختفت المدينة بوميض من النور خلف السحب.",
      legacy: "الآثار التي تركوها وراءهم في مصر وسومر ليست سوى رسائل مشفرة لنا، لنفهم أن أصلنا ليس هنا، بل في حضن الكون الفسيح."
    },
    visuals: [
      "حلقات مدينة أتلانتس الدائرية العملاقة وهي ترتفع تدريجياً من المحيط محدثة شلالات وموجات عملاقة.",
      "معبد إغريقي قديم مصنوع من معدن ذهبي غريب يرسل شعاعاً ضوئياً أزرقاً ساطعاً نحو الفضاء الخارجي.",
      "علماء قدماء بملابس حريرية يراقبون مصفوفات هولوجرامية تظهر خريطة مجرة درب التبانة.",
      "سفن فضائية دائرية ذهبية تهبط بين الأهرامات والمعابد وسط عواصف رعدية مهيبة."
    ],
    historicalFacts: [
      "وصف أفلاطون لأتلانتس يذكر معدن 'الأوريشالكوم' المتوهج، وهو معدن ذو بريق ناري يعتقد البعض بأنه خليط نحاسي متقدم أو مادة فائقة التوصيل.",
      "هناك تشابه مذهل وغير مبرر في الهندسة الفلكية بين حضارات تفصل بينها محيطات شاسعة مثل المايا ومصر القديمة وسومر.",
      "عثر الغواصون في بحر المانش وجزر البهاما على تكوينات صخرية هندسية عملاقة مثل طريق بيميني، تثير الجدل حول وجود مدن غارقة متقدمة."
    ],
    metadata: {
      category: "Empires & Civilizations",
      duration: "20-40 min",
      style: "Epic Narrated",
      language: "AR",
      timestamp: 1779369200000
    },
    scenes: [
      {
        id: "atlantis_scene_1",
        locked: false,
        timestamp: "00:00",
        durationSeconds: 8,
        description: "Ancient Atlantis visual outline.",
        narration: "كتب الفيلسوف أفلاطون عن حضارة عظيمة بلغت أوج قوتها، ثم غرقت فجأة في محيط من الغموض. ولكن ماذا لو كانت أتلانتس عاصمة فضائية حطت على كوكبنا ؟",
        visualPrompt: "colossal concentric circle city of Atlantis in a deep pristine ocean, spectacular ancient architecture integrated with glowing sci-fi elements, golden and white marble towers, aerial epic wide angle.",
        motionType: "slow_drift",
        imageUrl: "https://images.unsplash.com/photo-1545672913-447a28460af9?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "atlantis_scene_2",
        locked: false,
        timestamp: "00:08",
        durationSeconds: 8,
        description: "Orichalcum core generator.",
        narration: "الألواح الطينية المشفرة تتحدث عن معدن الأوريشالكوم الناري كقلب نابض للتكنولوجيا الأتلانتية. إنه وقود مضاد للجاذبية سمح لها بالتحليق العظيم.",
        visualPrompt: "Close up of an ancient temple altar centering a glowing copper-gold crystal core emitting high energy blue plasma arcs, ancient priests in white robes kneeling around it in awe.",
        motionType: "push_in",
        imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "atlantis_scene_3",
        locked: false,
        timestamp: "00:16",
        durationSeconds: 8,
        description: "Gravity stabilizer failure.",
        narration: "وعند حدوث الانهيار الكوني لقلب الجاذبية الأرضي، اتخذ قادتها قراراً جريئاً: فصل أتلانتس عن الأرض والعودة إلى موطنها الأصلي بين النجوم.",
        visualPrompt: "Inside an epic control hall, ancient columns of Atlantis cracking as a gigantic red holographic warning wave activates, ancient scientists working on glowing stone interfaces with golden buttons.",
        motionType: "action_shake",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "atlantis_scene_4",
        locked: false,
        timestamp: "00:24",
        durationSeconds: 8,
        description: "The ascension of Atlantis city.",
        narration: "الحلقات الهائلة ارتفعت مسببةً أمواجاً وتسونامي عالمي جرف الحضارات، بينما صعدت المدينة بحلقاتها إلى طبقات الغلاف الجوي العليا.",
        visualPrompt: "The massive city rings of Atlantis ascending vertically into a dark cloud storm, huge ocean waves crashing below, bright energy fields forming around the flying ancient metropolis, epic scale.",
        motionType: "zoom_out",
        imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "atlantis_scene_5",
        locked: false,
        timestamp: "00:32",
        durationSeconds: 9,
        description: "Atlantis in deep orbit.",
        narration: "الآن يدرك الباحثون أن الآثار المشتركة بين مصر والمايا ليست مجرد صدفة هندسية، بل هي رسالة قديمة من مسافري الكواكب.",
        visualPrompt: "The circular city-ship of Atlantis orbiting Earth alongside the moon, ancient sculptures visible on its golden outer ring, sun rays reflecting on the metallic structure, space background.",
        motionType: "slow_drift",
        imageUrl: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "atlantis_scene_6",
        locked: false,
        timestamp: "00:41",
        durationSeconds: 10,
        description: "Call to the stars.",
        narration: "نحن لسنا بمفردنا. وأتلانتس لم تمت قط... إنها تنتظرنا هناك، في حضن الكون.",
        visualPrompt: "An ancient stone astronomical telescope on a high pyramid top pointing directly to a glowing bright star in the deep night sky, cinematic lens flare, high contrast starry vault.",
        motionType: "zoom_in",
        imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  }
];
