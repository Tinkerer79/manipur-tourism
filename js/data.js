/* ==========================================================================
   Sana Leibak — Discover Manipur
   Knowledge base: destinations, food, festivals, experiences, stays,
   transport and practical essentials. All coordinates are real-world
   locations; content is curated for accuracy.
   ========================================================================== */

'use strict';

const KB = {};

/* ---------------------------------- Destinations ------------------------- */

KB.destinations = [
  {
    id: 'loktak',
    name: 'Loktak Lake & Sendra',
    district: 'Bishnupur',
    sector: 'south',
    coords: [24.533, 93.779],
    cat: ['lake', 'nature'],
    interests: ['lakes', 'nature', 'photography', 'birding', 'sunset', 'boating'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 4,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'The great floating lake of Manipur, scattered with phumdis — rings of vegetation that drift across the water.',
    desc: 'Loktak is the largest freshwater lake in North East India and the lifeline of Manipur — its fish, its vegetables and its legends all begin here. The lake is best known for its phumdis, floating islands of soil and reed that range from rafts of weed to masses thick enough to carry huts. From the Sendra viewpoint the water opens out like a chart of green constellations, and at dawn fishing canoes move between them through low mist. Hire a boat, drift past the fisherfolk setting their circular catches, and stay for a sunset that turns the whole lake to hammered gold.',
    highlights: ['Sendra island viewpoint over the phumdis', 'Sunrise boat rides through drifting mist', 'Fisherfolk of the IthaiMaibi villages and their circular traps', 'Sunset from the lake causeway'],
    tips: 'Boats are best hired before 6 am for the mist, or after 4 pm for the light. Carry a light windcheater — the lake is cooler and breezier than Imphal.',
    entry: 'Free · boat hire charged locally',
    aliases: ['lok tak', 'sendra', 'floating lake', 'phumdi']
  },
  {
    id: 'keibul-lamjao',
    name: 'Keibul Lamjao National Park',
    district: 'Bishnupur',
    sector: 'south',
    coords: [24.497, 93.795],
    cat: ['wildlife', 'nature'],
    interests: ['wildlife', 'nature', 'birding', 'photography'],
    bestMonths: [11, 12, 1, 2, 3],
    durationHrs: 3,
    cost: '₹₹',
    difficulty: 'easy',
    blurb: "The world's only floating national park — last home of the dancing sangai deer, seen on dawn safaris by boat.",
    desc: 'Keibul Lamjao is a marvel with no parallel on Earth: a national park that floats. Its 40 sq km of phumdis rise and sink with Loktak’s water, and on this buoyant ground lives the sangai — Manipur’s state animal, a brow-antlered deer so light-footed it seems to dance on the floating sedge. Fewer than 300 survive, all here. Dawn boat safaris glide along the park’s edge while rangers watch the open meadows; hog deer, waterfowl and if you are lucky, a herd of sangai stepping out of the mist.',
    highlights: ['Dawn boat safari for the sangai', 'One of the rarest deer on Earth, found nowhere else', 'Migratory waterfowl in winter', 'Watchtowers over the floating meadows'],
    tips: 'Book the forest department boat safari the evening before; sightings are best from November to March at first light. Stay silent, wear muted colours.',
    entry: 'Park & boat safari fee at the range office',
    aliases: ['sangai', 'floating national park', 'keibul']
  },
  {
    id: 'karang',
    name: 'Karang Floating Homestays',
    district: 'Bishnupur',
    sector: 'south',
    coords: [24.480, 93.827],
    cat: ['village', 'stay'],
    interests: ['lakes', 'culture', 'food', 'photography', 'slow-travel'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 12,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'Sleep on the lake itself — family-run huts on floating phumdis, with starlight, fish dinners and dawn birdsong.',
    desc: 'At Karang, the lake stops being something you look at and becomes somewhere you live. Families here host guests in simple huts built on the phumdis, reachable only by boat. Evenings are for eromba and fresh nga-thongba on the verandah, for the kind of darkness broken only by lanterns and stars; mornings for coffee as the mist lifts off the water and the paddles of the first canoes dip past. It is the most memorable night you can spend in Manipur.',
    highlights: ['Overnight huts on floating phumdis', 'Home-cooked lake fish dinners', 'Dawn canoe rides and bird song', 'Village walk on the islet paths'],
    tips: 'Book through the community homestay network in advance; carry cash, a torch and warm layers — nights on the water are cold.',
    entry: 'Homestay rates per night',
    aliases: ['floating homestay', 'thanga', 'phumdi homestay']
  },
  {
    id: 'ina-moirang',
    name: 'INA Memorial, Moirang',
    district: 'Bishnupur',
    sector: 'south',
    coords: [24.535, 93.786],
    cat: ['heritage', 'museum'],
    interests: ['heritage', 'history', 'culture'],
    bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    durationHrs: 1.5,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'Where the Indian National Army hoisted the tricolour in 1944 — a museum of the freedom struggle beside Loktak.',
    desc: 'The quiet town of Moirang holds one of the most stirring addresses in Indian history. In April 1944, Colonel Shaukat Malik of the Indian National Army raised the tricolour here for the first time on Indian soil. The INA Memorial museum retells that campaign with photographs, letters, uniforms and personal effects of the soldiers who marched through Manipur, along with relics of Moirang’s own ancient Meitei kingdom — home of the Thangjing deity and the origin of the Khamba-Thoibi legend.',
    highlights: ['First tricolour hoisting on Indian soil, April 1944', 'INA campaign museum and letters', 'Ancient Moirang Kangjeibung polo ground nearby', 'Khamba-Thoibi legends of Moirang'],
    tips: 'Pairs naturally with a Loktak boat ride — the lake is 15 minutes away. Museum closes early afternoon; go before lunch.',
    entry: 'Nominal museum fee',
    aliases: ['ina', 'moirang', 'netaji']
  },
  {
    id: 'kangla',
    name: 'Kangla Fort',
    district: 'Imphal West',
    sector: 'city',
    coords: [24.812, 93.937],
    cat: ['heritage'],
    interests: ['heritage', 'history', 'photography', 'culture'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 2.5,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'The sacred heart of the Meitei kingdom — 2,000 years of coronations, shrines and cream-coloured ramparts on the Imphal river.',
    desc: 'Every Manipuri story begins at Kangla. On the banks of the Imphal river, this was the seat of the Ningthouja kings for nearly two millennia — coronation ground, temple court and royal citadel at once. Within its ramparts stand the twin Kangla Sha dragon shrines, the Govindajee-linked royal temples, the site of the ancient coronation hall, and quiet lawns where British-era barracks now stand guard over Meitei sacred sites. Walk it slowly; the ground remembers.',
    highlights: ['Twin Kangla Sha dragon guardian shrines', 'Royal coronation grounds and temples', 'Museum of the Manipur kingdom', 'Riverside rampart walk at golden hour'],
    tips: 'Entry is ticketed and the fort closes by late afternoon. Hire the light-gauge electric cart if short on time; the grounds are large.',
    entry: 'Nominal entry ticket',
    aliases: ['kangla fort', 'kangla sha']
  },
  {
    id: 'ima-keithel',
    name: "Ima Keithel — Mothers' Market",
    district: 'Imphal West',
    sector: 'city',
    coords: [24.801, 93.943],
    cat: ['market', 'culture'],
    interests: ['food', 'markets', 'culture', 'photography', 'crafts'],
    bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    durationHrs: 2,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'Asia’s largest all-women market — 4,000 imas running the stalls of Imphal for five centuries.',
    desc: 'Run entirely by women since the 16th century, Ima Keithel is the beating commercial heart of Manipur and one of the most striking markets anywhere in Asia. Row upon row of imas — mothers — sell handloom shawls, kauna reed baskets, black pottery, local herbs, dried fish, ngari and vegetables under one great shed. Come at dawn for the freshest produce and the best breakfast stalls; come at dusk when the lamps come on and the bargaining is in full voice. It is a market, but it is also a masterclass in who holds Manipur together.',
    highlights: ['5,000 women traders, a 500-year tradition', 'Handloom shawls and Wangkhei weaves', 'Breakfast stalls of eromba, singju and keli chana', 'Kauna reed craft and Longpi pottery'],
    tips: 'Photography inside is politely tolerated but ask before portraits. Mornings (6–9 am) are most atmospheric; Sunday the sheds rest.',
    entry: 'Free',
    aliases: ['ima market', 'mothers market', 'khwairamband bazar', 'ima keithel']
  },
  {
    id: 'govindajee',
    name: 'Shree Shree Govindajee Temple',
    district: 'Imphal West',
    sector: 'city',
    coords: [24.810, 93.944],
    cat: ['sacred', 'heritage'],
    interests: ['spiritual', 'heritage', 'culture', 'photography'],
    bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    durationHrs: 1,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'The twin-domed royal temple beside Kangla, home of Ras Leela — Manipur’s devotional dance theatre.',
    desc: 'Consecrated in 1846, Govindajee is the principal Vaishnavite temple of Manipur, its gold domes rising beside the old palace walls. The deity of Govinda was installed by the Rajas themselves, and the temple remains the stage for Ras Leela — the classical dance of Krishna devotion that Manipur gave to the world. On festival evenings the courtyard glows with oil lamps and pung drummers; on ordinary evenings it is simply serene, all white walls and marigold and low chant.',
    highlights: ['Twin golden domes of the royal temple', 'Ras Leela performances on festival nights', 'Evening aarti with pung drumming', 'Adjacent shrines of Balarama and Jagannath'],
    tips: 'Shoes off, shoulders covered. Ask the pujaris about upcoming Ras Leela dates — performances are announced locally.',
    entry: 'Free',
    aliases: ['govinda temple', 'ras leela', 'govindaji']
  },
  {
    id: 'state-museum',
    name: 'Manipur State Museum',
    district: 'Imphal West',
    sector: 'city',
    coords: [24.818, 93.941],
    cat: ['museum'],
    interests: ['heritage', 'history', 'culture'],
    bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    durationHrs: 1.5,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'Royal regalia, natural history and hill-tribe halls — the fastest way to understand Manipur before you explore it.',
    desc: 'A compact, well-kept museum that does exactly what a good state museum should: it gives you Manipur in an afternoon. Galleries of royal dress and courtly objects, ethnographic halls of the Naga and Kuki-Zo tribes, a natural history wing with the sangai, and an open-air pavilion of traditional house types from the hills and valley. Come here on your first day and everything you meet afterwards — a shawl, a drum, a festival — will make more sense.',
    highlights: ['Royal regalia of the Manipur court', 'Naga and Kuki-Zo ethnography halls', 'The sangai in the natural history wing', 'Open-air traditional house pavilion'],
    tips: 'Closed Mondays and second Saturdays. Photographs allowed in most halls; the labels are worth reading in full.',
    entry: 'Nominal ticket',
    aliases: ['museum']
  },
  {
    id: 'polo-ground',
    name: 'Mapal Kangjeibung — the Oldest Polo Ground',
    district: 'Imphal West',
    sector: 'city',
    coords: [24.795, 93.938],
    cat: ['heritage'],
    interests: ['heritage', 'sport', 'culture'],
    bestMonths: [11, 12, 1, 2],
    durationHrs: 1,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'Where polo was born — Sagol Kangjei has been played on this ground since before the sport had a name.',
    desc: 'The world learned polo at Imphal. Sagol Kangjei — "horse and stick" — was played by Meitei cavalry long before British tea planters carried it to Calcutta and the world, and Mapal Kangjeibung is among the oldest living polo grounds on the planet. On winter weekends ponies still thunder here in local tournaments, bareback riders leaning low, crowds on the embankments. The stone marker at the edge claims the ground for history; the riders claim it for joy.',
    highlights: ['Birthplace of modern polo', 'Winter pony tournaments and local derbies', 'Polo temple of deity Ibudhou Thangjing', 'Modern State Polo Ground nearby for international games'],
    tips: 'Tournament dates cluster in November–February; ask locally or time your visit around the Sangai Festival polo matches.',
    entry: 'Free',
    aliases: ['polo', 'sagol kangjei', 'mapal kangjeibung']
  },
  {
    id: 'birtikendrajit',
    name: 'Bir Tikendrajit Park & Shaheed Minar',
    district: 'Imphal West',
    sector: 'city',
    coords: [24.806, 93.942],
    cat: ['heritage'],
    interests: ['heritage', 'history'],
    bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    durationHrs: 1,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'Memorial to the lion of Manipur, the prince hanged by the British in 1891 rather than bend the knee.',
    desc: 'At the head of Imphal’s busiest crossroads stands the memorial to Bir Tikendrajit, the heroic prince of Manipur executed by the British after the Anglo-Manipuri War of 1891 — the only Indian prince hanged for the crime of refusing to surrender his kingdom. The Shaheed Minar rises over a small, thoughtfully kept park; the flame at its top burns for all who fell. It is Imphal’s most meaningful ten minutes, right in the middle of town.',
    highlights: ['Martyrs’ memorial of 1891', 'Statue of Bir Tikendrajit', 'Central location beside the bazar quarter'],
    tips: 'Combine with Ima Keithel and Kangla on a central Imphal walking day.',
    entry: 'Free',
    aliases: ['shaheed minar', 'tikendrajit']
  },
  {
    id: 'red-hill',
    name: 'Maibam Lokpa Ching (Red Hill)',
    district: 'Imphal West',
    sector: 'south',
    coords: [24.740, 93.889],
    cat: ['heritage', 'viewpoint'],
    interests: ['heritage', 'history', 'photography', 'nature'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 1.5,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'A low red hill where one of the war’s fiercest battles was fought — now home to a moving India-Japan peace memorial.',
    desc: 'In 1944 the slopes of Red Hill saw some of the bitterest fighting of the Imphal campaign. Today a white stupa and the India-Japan Peace Memorial stand on the ridge, raised jointly by veterans of both armies — a place where former enemies built something together. The hilltop looks south over the valley and the road to Loktak, and the quiet up here, with flags lifting in the wind, is the kind that asks you to stay a while.',
    highlights: ['India-Japan Peace Memorial and stupa', 'Panoramic look over the southern valley', 'WWII history of the Imphal campaign'],
    tips: 'On the Tiddim Road toward Loktak — an easy stop on any southern day. Memorial days in March draw visitors from Japan.',
    entry: 'Free',
    aliases: ['red hill', 'japan memorial', 'maibam lokpa ching']
  },
  {
    id: 'sadu-chiru',
    name: 'Leimaram (Sadu Chiru) Waterfall',
    district: 'Bishnupur',
    sector: 'south',
    coords: [24.676, 93.864],
    cat: ['waterfall', 'nature'],
    interests: ['nature', 'photography', 'picnic'],
    bestMonths: [10, 11, 12, 1],
    durationHrs: 2,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'A three-thread waterfall sliding off a mossy cliff in the Bishnupur hills — Manipur’s favourite monsoon picnic.',
    desc: 'The Sadu stream drops in bright ribbons over a hanging cliff at Leimaram, pooling in shallow boulders where families spread lunch on cool stone. A short paved climb takes you to the upper cascade viewpoint; the grove below stays green through the driest months. It is an easy, cheerful stop — best after the rains when the fall is full and the air smells of wet bamboo.',
    highlights: ['Triple cascade over a fern-covered cliff', 'Boulder pools and picnic groves', 'Short forest walk to the upper viewpoint'],
    tips: 'Rocks are slippery after rain — wear grippy sandals. Weekends are busy with picnic groups; weekday mornings are quiet.',
    entry: 'Nominal parking fee',
    aliases: ['sadu chiru', 'leimaram', 'waterfall', 'sadu ching']
  },
  {
    id: 'phayeng',
    name: 'Phayeng — Carbon-Positive Village',
    district: 'Imphal West',
    sector: 'south',
    coords: [24.718, 93.837],
    cat: ['village', 'nature'],
    interests: ['villages', 'nature', 'crafts', 'slow-travel'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 2,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'India’s first carbon-positive settlement — a Chakpa Meitei village of fish ponds, community forests and bamboo craft.',
    desc: 'Phayeng earned national fame the quiet way: by planting and protecting its community forest until the village absorbed more carbon than it emitted. Walk its lanes of fish ponds and loom houses, see the bamboo drip-irrigation and biogas systems, and sit with the village committee that manages the forest like a family inheritance. It is rural tourism done seriously, and an encouraging half-day from Imphal.',
    highlights: ['India’s first certified carbon-positive village', 'Community-managed forest trails', 'Chakpa Meitei looms and bamboo craft', 'Homestay lunch on request'],
    tips: 'Visit with a local guide arranged in advance — the story is in the details. Mondays the community hall may be closed.',
    entry: 'Free · guided walk by donation',
    aliases: ['carbon positive', 'phayeng village']
  },
  {
    id: 'langthabal',
    name: 'Langthabal Historic Precinct',
    district: 'Imphal West',
    sector: 'south',
    coords: [24.775, 93.925],
    cat: ['heritage', 'viewpoint'],
    interests: ['heritage', 'history', 'photography'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 1,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'A low ridge of old palace sites, temples and avenues of bottle palms looking south to the hills.',
    desc: 'Langthabal was a royal seat before Imphal grew up around it — a ridge crowned with the remnants of a palace complex, temples and the elegant avenue of bottle palms planted two centuries ago. Little is staged here, which is the charm: grassy courts, a working sanamahi shrine, students on the lawns and a long view toward the western hills. An easy, poetic stop on the Tiddim road.',
    highlights: ['Ruined palace precinct on a palm-lined ridge', 'Working Lai shrine of the precinct', 'Long views over the southern valley'],
    tips: 'Pairs with Red Hill and the Loktak road. Carry nothing you will regret — shade is limited at midday.',
    entry: 'Free',
    aliases: ['langthabal manung', 'langthabal palace']
  },
  {
    id: 'khonghampat',
    name: 'Khonghampat Orchidarium',
    district: 'Imphal East',
    sector: 'north',
    coords: [24.884, 93.926],
    cat: ['nature', 'botany'],
    interests: ['botany', 'nature', 'photography'],
    bestMonths: [3, 4, 5],
    durationHrs: 1.5,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'A forest of over a hundred orchid species — and in April, the pink flood of the foetida orchid in bloom.',
    desc: 'Twelve kilometres north of Imphal, the forest department’s orchidarium shelters more than 110 orchid species of the region under open shade houses. In April the foetida orchids break out in waves of pink and the nurseries are at their best; the rest of the year the walk through shade netting and misting pipes is a soothing green interlude. Pick up saplings and teas at the small counter; the staff will happily tell you what blooms when.',
    highlights: ['110+ native orchid species', 'April bloom of the foetida orchid', 'Forest department nursery sales'],
    tips: 'April is peak bloom but busiest; March and May are nearly as good and quieter. Combine with a northbound drive toward Saikul or Mao.',
    entry: 'Nominal ticket',
    aliases: ['orchidarium', 'orchid', 'khonghampat']
  },
  {
    id: 'andro',
    name: 'Andro Heritage Village',
    district: 'Imphal East',
    sector: 'east',
    coords: [24.963, 94.071],
    cat: ['village', 'crafts'],
    interests: ['villages', 'crafts', 'culture', 'spiritual'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 3,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'The Chakpa potters’ village where clay is still shaped by hand, and the sacred fire of Sanamahi never goes out.',
    desc: 'Andro keeps old things alive. The Chakpa households here throw pottery without a wheel, exactly as their grandmothers did — clay vessels believed to carry the blessing of the household fire. The village museum of fireplace stones, the Sanamahi temple and the ancient well said never to run dry make Andro an unhurried half-day of living heritage, 25 minutes east of Imphal.',
    highlights: ['Wheel-less pottery shaped entirely by hand', 'Sanamahi temple and the undying sacred fire', 'Chakpa cultural museum of hearth-stones', 'Village weavers and rice-beer hearths (cultural exhibit)'],
    tips: 'Pottery is sold straight from family courtyards — go in the morning when the kilns open. Carry small notes.',
    entry: 'Free',
    aliases: ['andro village', 'pottery village', 'andro']
  },
  {
    id: 'kaina',
    name: 'Kaina Sacred Hill',
    district: 'Imphal East',
    sector: 'east',
    coords: [24.938, 94.121],
    cat: ['sacred', 'viewpoint'],
    interests: ['spiritual', 'nature', 'photography'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 2,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'The hill shrine where a vision of Govinda appeared to a sleeping king — 29 km of forest road and stone steps east of Imphal.',
    desc: 'Kaina is where Manipur’s devotion climbs a hill. The shrine marks the spot where Maharaja Bhagyachandra, fleeing Burmese armies in the 18th century, dreamt of the deity Govinda and was told to carve him from a jackfruit tree. The image in Imphal’s Govindajee temple is that very carving, and Kaina remains the vision’s home. The road out is wooded and winding; the steps are short; the view over the eastern valley is reward enough for the climb.',
    highlights: ['The jackfruit-wood deity legend of Bhagyachandra', 'Ridge-top shrine and prayer hall', 'Forest drive through Imphal East'],
    tips: 'Mondays and festival days draw devotees from the city. Carry water; the last flight of steps is steep in the sun.',
    entry: 'Free',
    aliases: ['kaina hill', 'kaina temple']
  },
  {
    id: 'sekta',
    name: 'Sekta Archaeological Mound',
    district: 'Imphal East',
    sector: 'east',
    coords: [24.850, 93.968],
    cat: ['heritage'],
    interests: ['heritage', 'history'],
    bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    durationHrs: 1,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'An excavated burial mound rewriting what we know of the valley’s second century — urns, ornaments and open trenches.',
    desc: 'Most travellers drive past Sekta without knowing it is one of the most important archaeology sites in North East India. Excavations here uncovered urn burials, beads, bronze and iron ornaments from a settled community over 1,800 years old — evidence of a sophisticated valley culture long before the medieval kingdom. The trenches are open, the finds partly displayed in the site shed, and the ASI board tells the story. An hour, well spent.',
    highlights: ['Urn-burial excavation trenches, open to visitors', '2nd-century CE ornaments and pottery', 'A quiet site with the village for company'],
    tips: 'The site shed keeps odd hours; combine with Andro, which is nearby, and ask at the shed for the site keeper.',
    entry: 'Free',
    aliases: ['sekta mound', 'sekta keithel']
  },
  {
    id: 'khongjom',
    name: 'Khongjom War Memorial',
    district: 'Thoubal',
    sector: 'east',
    coords: [24.964, 93.982],
    cat: ['heritage'],
    interests: ['heritage', 'history', 'photography'],
    bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    durationHrs: 1.5,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'The last stand of 1891 — a hilltop memorial where Major Paona Brajabashi and his men chose honour over surrender.',
    desc: 'On the slopes of Kheba Ching at Khongjom, a handful of Manipuri soldiers under Major Paona Brajabashi held the line against a far larger British force in April 1891, and died to a man. The memorial on the hill — a soaring column with a wish-fulfilling lamp, the Paona statue below — is now the emotional centre of Manipuri remembrance. Every April 23 the hill fills with pilgrims; the rest of the year it belongs to the wind and the long valley view.',
    highlights: ['Hilltop column and eternal lamp', 'Statue of Major Paona Brajabashi', 'April 23 remembrance ceremonies'],
    tips: 'En route to Moreh or Kakching on NH-102 — a natural stop. The climb is short; late afternoon light is beautiful.',
    entry: 'Free',
    aliases: ['paona', 'khongjom', 'kheba ching']
  },
  {
    id: 'kakching-garden',
    name: 'Kakching Garden & Uyok Ching',
    district: 'Kakching',
    sector: 'east',
    coords: [24.502, 93.984],
    cat: ['park', 'viewpoint'],
    interests: ['nature', 'photography', 'picnic', 'family'],
    bestMonths: [10, 11, 12, 1, 2],
    durationHrs: 2.5,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'Terraced flower gardens climbing a hill at Kakching, with a hilltop Buddha, winding paths and valley views.',
    desc: 'Kakching does manicured with a hill town’s charm: stepped gardens of seasonal blooms rise up Uyok Ching, stone paths loop past gazebos, and at the top a seated Buddha looks over the paddy gold of the southern valley. Local families come for the flower seasons and the clean air; the adjoining groves hide small shrines and picnic lawns. It is the gentlest possible day out, 45 minutes from Imphal.',
    highlights: ['Terraced seasonal flower gardens', 'Hilltop Buddha with valley panoramas', 'Shaded picnic lawns and walking loops'],
    tips: 'Flower beds peak November–February. The steps are many but shallow; take the lower loop if skipping the summit.',
    entry: 'Nominal ticket',
    aliases: ['kakching garden', 'uyok ching']
  },
  {
    id: 'tengnoupal',
    name: 'Tengnoupal Viewpoint',
    district: 'Chandel',
    sector: 'east',
    coords: [24.303, 94.236],
    cat: ['viewpoint'],
    interests: ['nature', 'photography', 'roadtrip'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 1,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'The high shoulder of NH-102 where the road to Myanmar breaks out of the hills into a sweep of river valleys.',
    desc: 'Every road east funnels through Tengnoupal, and at the crest the hill country suddenly opens — ridges running in blue ranks toward the Chindwin basin, the road zigzagging below. There is a small market hamlet, tea stalls, and the old war-road atmosphere of a stage-post between Manipur and Myanmar. Stop, breathe, take the photograph everyone takes; it deserves the fame.',
    highlights: ['Classic panorama over the eastern hill ranges', 'Historic Imphal–Myanmar road stage post', 'Tea stalls and village market'],
    tips: 'Mornings are clearest; afternoons cloud over. Continue to Moreh below or return to Imphal for the night.',
    entry: 'Free',
    aliases: ['tengnoupal', 'viewpoint']
  },
  {
    id: 'moreh',
    name: 'Moreh Border Town & Market',
    district: 'Chandel',
    sector: 'east',
    coords: [24.244, 94.297],
    cat: ['border', 'market'],
    interests: ['markets', 'culture', 'roadtrip', 'photography'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 5,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'India’s frontier bazaar on the Myanmar gate — three currencies, four cuisines and the last tea stall of the subcontinent.',
    desc: 'Moreh is what border towns do best: everything at once. The Friendship Gate marks the line with Myanmar; the market streets behind it trade electronics, shawls, cosmetics and quinine-tonic gossip in Meiteilon, Tamil, Nepali, Kuki-Zo and Burmese. Breakfast here can be paratha and mohinga in the same lane. The drive from Imphal — through Khongjom, Pallel and Tengnoupal — is half the experience, 110 km of ridge road that ends at a gate between worlds.',
    highlights: ['India–Myanmar Friendship Gate', 'Cross-border market lanes', 'Border-town food culture (Burmese, Tamil, Kuki-Zo, Meitei)', 'The dramatic NH-102 hill drive'],
    tips: 'A day trip from Imphal works (8–9 hours round trip). Carry ID for checkpoints and return before dusk. Foreign nationals: check visa/permit rules before crossing.',
    entry: 'Free',
    aliases: ['moreh market', 'myanmar border', 'friendship gate']
  },
  {
    id: 'ukhrul',
    name: 'Ukhrul Town & Tangkhul Homestays',
    district: 'Ukhrul',
    sector: 'northeast',
    coords: [25.046, 94.362],
    cat: ['hill', 'village'],
    interests: ['villages', 'nature', 'culture', 'trekking', 'crafts'],
    bestMonths: [3, 4, 5, 10, 11, 12],
    durationHrs: 24,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'The Tangkhul heartland at 4,700 ft — pine avenues, stone-paved villages, black pottery and the road to Shirui.',
    desc: 'Ukhrul, the homeland of the Tangkhul Naga, sits high on a ridge of pine and wind — a district town that still feels like a large village of stone paths, church bells and terrace gardens. Homestays welcome you into Tangkhul kitchens of smoked pork and millet; the lanes lead to the Longpi black-pottery workshops and the road onward to Shirui Kashong. Mornings here begin with mist in the deodars and end with the best night skies in the state.',
    highlights: ['Tangkhul village homestays and kitchens', 'Longpi black-stone pottery (made without the wheel)', 'Khangkhui limestone caves nearby', 'Cold, star-dense hill nights'],
    tips: 'Carry cash — hills have sparse ATMs — and book homestays ahead. The Imphal road crosses 90 km of ridge driving: leave by 8 am.',
    entry: 'Homestay rates',
    aliases: ['ukhrul town', 'hunphun', 'tangkhul']
  },
  {
    id: 'shirui',
    name: 'Shirui Kashong Peak',
    district: 'Ukhrul',
    sector: 'northeast',
    coords: [25.070, 94.400],
    cat: ['trek', 'botany'],
    interests: ['trekking', 'botany', 'nature', 'photography', 'adventure'],
    bestMonths: [5, 10, 11],
    durationHrs: 6,
    cost: '₹',
    difficulty: 'moderate',
    blurb: 'The sacred ridge that blooms with the Shirui lily each May — found nowhere else on Earth.',
    desc: 'Shirui Kashong rises over Ukhrul like a green cathedral, and every May its summit meadows flower with Lilium mackliniae — the Shirui lily, delicate, pale-pink and endemic to this single ridge. The Tangkhul hold the peak sacred; trekkers hold it dear. The trail climbs through oak and rhododendron, opens onto grassy shoulders wreathed in cloud, and the lily, when you find it, seems to glow from within. Outside May the ridge is still a superb day walk.',
    highlights: ['The endemic Shirui lily in bloom (May)', 'Sacred Tangkhul ridge with cliff shrines', 'Panoramas over the Chindwin basin', 'Shirui Lily Festival at its foot'],
    tips: 'Hire a local guide — trails fork and the mist arrives fast. May combines the lily with the festival; October gives the clearest skies.',
    entry: 'Free · guide fee',
    aliases: ['shirui kashong', 'shirui lily', 'sirui', 'lilium mackliniae']
  },
  {
    id: 'khangkhui',
    name: 'Khangkhui Limestone Caves',
    district: 'Ukhrul',
    sector: 'northeast',
    coords: [25.000, 94.400],
    cat: ['cave', 'adventure'],
    interests: ['adventure', 'nature', 'photography'],
    bestMonths: [10, 11, 12, 1, 2, 3, 4],
    durationHrs: 2,
    cost: '₹',
    difficulty: 'moderate',
    blurb: 'Big limestone chambers under a Tangkhul hillside — stalactites, bats and a war-time story in the cool dark.',
    desc: 'Ten kilometres from Ukhrul, the limestone of Khangkhui hill hides a family of large caves — vaulted chambers, flowstone curtains and colonies of bats, with local memory holding that villagers sheltered here during the 1944 fighting. Bring a torch with real beam, a local guide and steady shoes; the main gallery goes back far enough that your footsteps echo. It is the most accessible serious caving in Manipur.',
    highlights: ['Vaulted limestone galleries and flowstone', 'Bat colonies in the inner chambers', 'Wartime shelter stories from 1944'],
    tips: 'Never enter without a local guide; carry two light sources. Avoid after heavy rain.',
    entry: 'Free · guide fee',
    aliases: ['khangkhui cave', 'caves', 'khangkhui mangsor']
  },
  {
    id: 'kachai',
    name: 'Kachai Lemon Village',
    district: 'Ukhrul',
    sector: 'northeast',
    coords: [25.150, 94.260],
    cat: ['village', 'botany'],
    interests: ['villages', 'food', 'botany', 'agro'],
    bestMonths: [11, 12, 1],
    durationHrs: 2,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'Home of the GI-tagged Kachai lemon — orchard lanes and a January harvest festival in the Ukhrul hills.',
    desc: 'The village of Kachai grows a lemon so distinctive it carries a national GI tag — thin-skinned, intensely aromatic, squeezed over everything in the Tangkhul hills. In January the Kachai Lemon Festival fills the orchards with stalls, contests and folk song. Visit out of season and the village is still worth the detour: composting orchards, honey producers, and unhurried Tangkhul hospitality.',
    highlights: ['GI-tagged Kachai lemon orchards', 'Kachai Lemon Festival (January)', 'Village honey and citrus products'],
    tips: 'Harvest months are November–January; ask your Ukhrul homestay to arrange the trip. Roads are narrow — go in daylight.',
    entry: 'Free',
    aliases: ['kachai lemon', 'kachai village']
  },
  {
    id: 'dzukou',
    name: 'Dzükou Valley',
    district: 'Senapati',
    sector: 'north',
    coords: [25.568, 94.085],
    cat: ['trek', 'nature'],
    interests: ['trekking', 'nature', 'botany', 'adventure', 'photography', 'camping'],
    bestMonths: [6, 7, 8, 9, 10],
    durationHrs: 30,
    cost: '₹₹',
    difficulty: 'hard',
    blurb: 'The valley of flowers of the North East — a rolling alpine bowl where the endemic Dzükou lily blooms in the monsoon.',
    desc: 'Straddling the Manipur–Nagaland border at 2,450 m, Dzükou is a broad bowl of wind-combed grass, streams and seasonal flowers, ringed by ridges. In the rains the endemic Dzükou lily dots the valley in pink and white; in autumn the grass turns champagne and the skies go very far. Treks typically run two days with a night at the valley rest house or in tents. It is the signature trek of the region — earned, not given, with a stiff climb and changeable weather.',
    highlights: ['Endemic Dzükou lily in the monsoon', 'Rolling alpine valley and ridge camps', 'Streams, pools and wildflower meadows', 'Two-day classic trek from the NH-2 highway'],
    tips: 'Go with a registered guide; carry full rain layers and a sleeping bag even in summer. Register at the base village and start early.',
    entry: 'Trek registration & valley fee',
    aliases: ['dzuko', 'dzukou valley', 'valley of flowers', 'dzükou']
  },
  {
    id: 'mao-gate',
    name: 'Mao Gate & the Naga Hills Road',
    district: 'Senapati',
    sector: 'north',
    coords: [25.538, 94.181],
    cat: ['village', 'viewpoint'],
    interests: ['roadtrip', 'culture', 'nature', 'photography'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 2,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'The green gate of the Naga hills on NH-2 — Mao villages, stone monoliths and the coolest air in the state.',
    desc: 'The road north from Imphal climbs through Senapati district into Mao country, terraced and pine-dark, ending at the historic gate on the Nagaland border. The Mao villages keep stone monoliths, feast houses and orchards of peach and plum; the air has an Alpine snap even in October. This is driving country — stop often, eat at the wayside stalls, and let the hills do what they do.',
    highlights: ['Historic border gate on NH-2', 'Mao village monoliths and feast houses', 'Seasonal peach and plum orchards', 'The dramatic climb out of the valley'],
    tips: 'The Imphal–Mao run is 107 km; combine with Dzükou access points or Khonghampat on the way out. Carry a light jacket year-round.',
    entry: 'Free',
    aliases: ['mao gate', 'mao', 'nagaland border']
  },
  {
    id: 'saikul-ecopark',
    name: 'Selloi Langmai Ecological Park',
    district: 'Kangpokpi',
    sector: 'north',
    coords: [25.240, 93.950],
    cat: ['park', 'nature'],
    interests: ['nature', 'family', 'picnic', 'botany'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    durationHrs: 2.5,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'A serene eco-park of streams and stone lawns at Saikul — the green doorway to the northern hills.',
    desc: 'Where the Imphal valley climbs into Kangpokpi, the Selloi Langmai eco-park spreads along a clean stream — stone lawns, swinging bridges, groves of native trees and families out for the day. It is a simple, well-loved place, and its position makes it the natural lunch stop on any northern run toward Saikul, Koubru or Mao.',
    highlights: ['Riverside lawns and stone paving', 'Swinging bridges and grove walks', 'Local Kuki-Zo and Nepali food stalls nearby'],
    tips: 'Weekends fill with picnic groups; weekdays are tranquil. Combine with Khonghampat on the drive.',
    entry: 'Nominal ticket',
    aliases: ['saikul', 'selloi langmai', 'eco park']
  },
  {
    id: 'tamenglong',
    name: 'Tamenglong — Land of Hornbills',
    district: 'Tamenglong',
    sector: 'northwest',
    coords: [24.983, 93.509],
    cat: ['hill', 'village'],
    interests: ['nature', 'villages', 'botany', 'agro'],
    bestMonths: [10, 11, 12],
    durationHrs: 24,
    cost: '₹',
    difficulty: 'easy',
    blurb: 'Ridges of rainforest, hornbill country and the orange capital of Manipur, deep in the state’s wild west.',
    desc: 'Tamenglong district is the green furnace of Manipur — deep rainforest gorges, the Barak river country, orchids and hornbills, and ridge-top villages of the Rongmei and Zeme. The town itself is the orange capital of the state, and its December Orange Festival fills the streets with fruit, dance and wrestling. Come for the wildness and the warmth; the roads are long but every turn pays.',
    highlights: ['Orange Festival in December', 'Hornbill and orchid rainforest drives', 'Rongmei and Zeme village culture', 'Gateways to Barak falls and Zeilad lake'],
    tips: 'The 140 km drive from Imphal takes 5–6 hours — stay a night rather than rushing. Fuel up in Imphal; hill stations are sparse.',
    entry: 'Free',
    aliases: ['tamenglong town', 'orange festival', 'ramtinkhong']
  },
  {
    id: 'tharon-cave',
    name: 'Tharon Cave',
    district: 'Tamenglong',
    sector: 'northwest',
    coords: [24.861, 93.561],
    cat: ['cave', 'adventure'],
    interests: ['adventure', 'history', 'nature'],
    bestMonths: [10, 11, 12, 1, 2, 3, 4],
    durationHrs: 3,
    cost: '₹',
    difficulty: 'moderate',
    blurb: 'A 655-metre limestone labyrinth mapped and quartered — five exits, ancient burials and a cool under-hill hush.',
    desc: 'Tharon is the grandest cave in Manipur: 655 m of mapped passages in five arms, with a carved map board at the entrance and the confidence of a site long studied. Excavations found Hoabinhian-era artifacts and burial remains. The chambers run cool and utterly dark; a guide with a lantern turns the walk into pure atmosphere. Shoes with grip and a spare torch are non-negotiable.',
    highlights: ['655 m of mapped limestone passages', 'Five exits and a carved entrance map', 'Ancient artifacts from early excavations'],
    tips: 'Local guides are arranged in Tharon village. Do not enter in the rains — the lower arms can flood.',
    entry: 'Free · guide fee',
    aliases: ['tharon', 'tharon cave', 'cave']
  },
  {
    id: 'barak-falls',
    name: 'Barak Waterfalls',
    district: 'Tamenglong',
    sector: 'northwest',
    coords: [24.838, 93.475],
    cat: ['waterfall', 'nature'],
    interests: ['nature', 'photography', 'picnic', 'adventure'],
    bestMonths: [10, 11, 12],
    durationHrs: 2,
    cost: '₹',
    difficulty: 'moderate',
    blurb: 'The young Barak river throws itself seven times through a forest gorge — the seven sisters of Manipur’s wild west.',
    desc: 'Before it becomes the great river of the Cachar plains, the Barak is a mountain stream, and at Tamenglong it descends in a chain of seven falls through bamboo and Bauhinia forest. The walk in is part of the pleasure — village paths, butterflies, the sound arriving before the sight. In late October the falls are full and the forest washed clean; a swimsuit and a change of clothes turn the stop into an afternoon.',
    highlights: ['Seven cascades of the upper Barak', 'Bamboo forest walk to the falls', 'Natural plunge pools'],
    tips: 'Best October–December. Trails are slippery in the monsoon; go with a village guide.',
    entry: 'Free',
    aliases: ['barak waterfall', 'barak river', 'seven sisters falls']
  },
  {
    id: 'zeilad',
    name: 'Zeilad Lake & Sanctuary',
    district: 'Tamenglong',
    sector: 'northwest',
    coords: [24.931, 93.423],
    cat: ['lake', 'wildlife'],
    interests: ['nature', 'wildlife', 'birding', 'photography'],
    bestMonths: [11, 12, 1, 2],
    durationHrs: 3,
    cost: '₹',
    difficulty: 'moderate',
    blurb: 'A high, secretive lake ringed by rainforest, famous for pythons, waterfowl and legends of the crest.',
    desc: 'Zeilad sits at the top of Tamenglong’s forested ridges — a dark oval of water that changes with the sky and keeps its distances. The sanctuary around it shelters hoolock gibbon, slow loris, python and a winter crowd of waterfowl; Zeme villages on the shore tell of lake spirits that take offence at noise. The road in is rough and the visit feels earned: birds, silence, and a lake that seems to watch back.',
    highlights: ['Rainforest lake with python and waterfowl', 'Hoolock gibbon and slow loris habitat', 'Zeme village legends of the crest'],
    tips: 'Access is by rough hill road — a 4x4 or high-clearance vehicle and a local guide are strongly advised. Mornings for birds.',
    entry: 'Free',
    aliases: ['zeilad lake', 'zeilad sanctuary']
  }
];

/* ---------------------------------- Food --------------------------------- */

KB.foods = [
  { id: 'eromba', name: 'Eromba', veg: 'veg-opt', spice: 'hot', blurb: 'Boiled potatoes and greens mashed fierce with chilli and ngari — the everyday fire of Manipur.', where: 'Ima Keithel stalls · home kitchens · festival feasts', aliases: ['eromba'] },
  { id: 'chak-hao-kheer', name: 'Chak-hao Kheer', veg: 'veg', spice: 'mild', blurb: 'Pudding of Manipur’s famous scented black rice (GI-tagged), slow-cooked with coconut and cardamom.', where: 'Feasts · sweet shops in Thangal Bazar · festival tables', aliases: ['black rice', 'chak hao', 'kheer', 'chakhao'] },
  { id: 'singju', name: 'Singju', veg: 'veg-opt', spice: 'medium', blurb: 'Manipur’s brilliant salad — shredded cabbage, lotus stem, coriander leaf and roasted besan, tossed with chilli.', where: 'Ima Keithel · street carts across Imphal', aliases: ['singju', 'salad'] },
  { id: 'nga-thongba', name: 'Nga-thongba', veg: 'nonveg', spice: 'medium', blurb: 'The classic fish curry of the valley — river fish simmered with herbs, ngari and potato.', where: 'Home kitchens · Loktak homestays · city eateries', aliases: ['fish curry', 'nga thongba'] },
  { id: 'chamthong', name: 'Chamthong (Kangshoi)', veg: 'veg-opt', spice: 'mild', blurb: 'A bubbling seasonal vegetable stew — light, herby, finished with a whisper of ngari.', where: 'Everywhere; the comfort soup of the state', aliases: ['kangshoi', 'stew', 'chamthong'] },
  { id: 'morok-metpa', name: 'Morok Metpa', veg: 'veg', spice: 'hot', blurb: 'Chilli chutney pounded with ngari and herbs — the side dish that rules the table.', where: 'Every meal, everywhere', aliases: ['chutney', 'morok metpa'] },
  { id: 'ooti', name: 'Ooti', veg: 'veg', spice: 'mild', blurb: 'Comfort rice porridge of the Maram tradition — ash-treated, soothing, a breakfast of old Manipur.', where: 'Hill households · festival mornings', aliases: ['ooti', 'porridge'] },
  { id: 'paknam', name: 'Paknam', veg: 'veg-opt', spice: 'medium', blurb: 'A savoury cake of besan, vegetables and ngari, wrapped in banana leaf and steamed.', where: 'Breakfast stalls · Ima Keithel', aliases: ['paknam'] },
  { id: 'hawaijar', name: 'Hawaijar Toomba', veg: 'veg', spice: 'hot', blurb: 'Fermented soybean stewed with chilli and herbs — the bold, umami heartbeat of hill cooking.', where: 'Hill kitchens · Ukhrul and Tamenglong homes', aliases: ['hawaijar', 'soybean', 'toomba'] },
  { id: 'sana-thongba', name: 'Sana Thongba', veg: 'veg', spice: 'mild', blurb: 'Paneer-style milk curry with green peas — the gentle richness of feast days.', where: 'Wedding and festival feasts · city restaurants', aliases: ['sana thongba', 'paneer'] },
  { id: 'keli-chana', name: 'Keli Chana', veg: 'veg', spice: 'medium', blurb: 'Imphal’s beloved street snack — spiced chickpeas with lotus, ginger and crunch.', where: 'Street carts citywide · evening markets', aliases: ['keli chana', 'chana', 'street food'] },
  { id: 'alu-kangmet', name: 'Alu Kangmet', veg: 'veg', spice: 'hot', blurb: 'Potatoes mashed by hand with chilli and ngari — two ingredients, total conviction.', where: 'Home tables everywhere', aliases: ['alu kangmet'] },
  { id: 'kachai-lemon', name: 'Kachai Lemon & Hill Honey', veg: 'veg', spice: 'mild', blurb: 'GI-tagged hill lemon and forest honey — the cleanest tastes of the Ukhrul uplands.', where: 'Ukhrul villages · Kachai festival (January)', aliases: ['lemon', 'honey', 'kachai'] },
  { id: 'hathei', name: 'Sirarakhong Hathei Chilli', veg: 'veg', spice: 'hot', blurb: 'The GI-tagged hathei chilli of Sirarakhong village — a festival (August) and a flavour in its own right.', where: 'Ukhrul district · Sirarakhong Hathei Festival', aliases: ['hathei', 'chilli', 'sirarakhong'] },
  { id: 'tamenglong-orange', name: 'Tamenglong Orange', veg: 'veg', spice: 'mild', blurb: 'The state’s most famous fruit — GI-tagged mandarins celebrated each December at the Orange Festival.', where: 'Tamenglong · Orange Festival (December)', aliases: ['orange', 'orange festival'] }
];

/* ---------------------------------- Festivals ---------------------------- */

KB.festivals = [
  { id: 'yaoshang', name: 'Yaoshang', months: [2, 3], window: 'Five days around the full moon of Lamta (Feb–Mar)', place: 'Valley-wide · Thabal Chongba in every leirak', blurb: 'Manipur’s Holi — five days of colour, but the soul is Thabal Chongba, the moonlight circle dance of the lanes.', desc: 'Yaoshang dresses the valley in colour for five days, but its heart is softer than Holi elsewhere: Thabal Chongba, the moonlight dance, where young people link hands in circles in the lanes and drummers keep time under the stars. Mornings are for the little ones and their pichkari raids; the burning of the Yaoshang thatch opens the festival.', aliases: ['holi', 'thabal chongba'] },
  { id: 'lui-ngai-ni', name: 'Lui-Ngai-Ni', months: [2], window: 'February 15', place: 'Rotating hill host (Ukhrul, Senapati, Tamenglong, Chandel)', blurb: 'The seed-sowing festival of the Naga communities — drums, dance and the ritual blessing of the fields.', desc: 'Lui-Ngai-Ni opens the farming year for the Naga communities of Manipur. Hosted in turn by the hill districts, it gathers dancers and drum troupes from across the ranges — Tangkhul, Mao, Maram, Rongmei, Zeme, Liangmai and more — for a day of regalia, ritual sowing and community feast. One of the great gatherings of the hills.', aliases: ['lui ngai ni', 'seed sowing'] },
  { id: 'cheiraoba', name: 'Cheiraoba', months: [4], window: 'First day of Sajibu (mid-April)', place: 'Valley and hills alike', blurb: 'Meitei New Year — house cleaning, feast, and the ritual climb of the sacred hills.', desc: 'Cheiraoba turns the calendar. Houses are scoured, offerings made to the household deities, and the family sits to the new-year feast. Afternoon belongs to Cheiraoba’s best custom: the whole town walks uphill, climbing the nearest sacred hill to see the year in from above.', aliases: ['new year', 'sajibu'] },
  { id: 'lai-haraoba', name: 'Lai Haraoba', months: [4, 5, 6], window: 'Season of the Umang Lai (Apr–Jun)', place: 'Sacred groves across the valley', blurb: 'The pleasing of the gods — Manipur’s oldest ritual, two weeks of song, dance and the maibi’s trance.', desc: 'Lai Haraoba, "the merrymaking of the gods", is the living root of Meitei culture — ritual festivals held at the sacred groves where each Umang Lai is honoured. The maibis (priestesses) dance the creation, the laibou re-enacts the making of the world, and whole villages turn out in their best. Every grove keeps its own date across the season.', aliases: ['lai haraoba', 'maibi', 'umang lai'] },
  { id: 'shirui-lily-festival', name: 'Shirui Lily Festival', months: [5], window: 'Mid-to-late May (dates announced by the state)', place: 'Ukhrul', blurb: 'A hillside festival beneath the blooming of the lily that grows nowhere else — trekking, music and Tangkhul hospitality.', desc: 'When the Shirui lily blooms, Ukhrul throws its festival. Days bring guided treks up Shirui Kashong, folk rock evenings, kune craft and food lanes; evenings cool into community song. It is the best single reason to be in the hills in May.', aliases: ['shirui festival', 'lily festival'] },
  { id: 'heikru-hidongba', name: 'Heikru Hidongba', months: [9], window: 'Around September (Sajibu–Thawan calendar date)', place: 'Sagolband Bijoy Govinda canal, Imphal', blurb: 'The royal boat race — long naga-dragon craft, a thousand-year course, and the offering of amla.', desc: 'Heikru Hidongba is one of India’s oldest boat races, run on a canal cut by the kings of Manipur. Crews of nearly a hundred paddle long ceremonial craft in a blaze of drums; the ritual offering of amla fruit opens the day. The banks fill hours early — claim a spot under an umbrella.', aliases: ['boat race', 'heikru'] },
  { id: 'mera-houchongba', name: 'Mera Houchongba', months: [10], window: 'Around October (Mera month)', place: 'Kangla, Imphal', blurb: 'The festival of valley–hill kinship — offerings exchanged at Kangla between the people of the hills and the valley.', desc: 'Mera Houchongba is the state’s oldest ceremony of unity: since the time of the kings, representatives of the hill communities and the valley meet at Kangla to exchange gifts and pledges of brotherhood. Traditional games, dances and the great assembly make it a day of real feeling, not pageantry alone.', aliases: ['mera', 'houchongba'] },
  { id: 'ningol-chakouba', name: 'Ningol Chakouba', months: [10, 11], window: 'Late Oct / Nov (Hiyangei day, lunar calendar)', place: 'Every family table', blurb: 'The festival of daughters — married women return home to their parental feast, and the market fills with gifts.', desc: 'Ningol Chakouba is the most tender day in the Manipuri year: married women (ningol) are invited back to their childhood homes (chakouba — invitation to a feast) and are honoured with a feast laid on by their brothers and parents. The days before are a beautiful chaos of shopping; Ima Keithel is at its most joyous.', aliases: ['ningol chakouba'] },
  { id: 'kut', name: 'Kut (Chavang Kut)', months: [11], window: 'November 1', place: 'Rotating host town; celebrated across the Kuki-Zo hills', blurb: 'The post-harvest festival of the Kuki-Zo communities — dance competitions, Miss Kut, and thanksgiving feasts.', desc: 'Kut is the great autumn thanksgiving of the Kuki-Zo communities, marking harvest’s end. The state-level celebration rotates between hill towns and draws troupes in full festival dress — bamboo dance, choral song, traditional games and the famous Miss Kut pageant. Colourful, competitive, and full of pride.', aliases: ['chavang kut', 'kut festival'] },
  { id: 'sangai-festival', name: 'Sangai Festival', months: [11], window: 'November 21–30', place: 'Imphal (multiple venues)', blurb: 'The state’s grand cultural festival, named for the dancing deer — ten days of everything Manipur is.', desc: 'Sangai Festival is Manipur’s showcase: ten days when the whole state arrives in Imphal. Folk troupes from every community, polo on the historic ground, Ras Leela nights, film, craft bazaars, food courts and the hill districts in their regalia. If you can time one visit to Manipur, time it to this.', aliases: ['sangai', 'state festival'] },
  { id: 'gaan-ngai', name: 'Gaan-Ngai', months: [12, 1], window: 'Dec–Jan (13th day of Wakching, lunar)', place: 'Tamenglong, Noney, Jiribam and Kabui valley villages', blurb: 'The fire festival of the Zeliangrong — bonfires, the sendren dance and five days of the year’s biggest feast.', desc: 'Gaan-Ngai closes and opens the year for the Zeliangrong communities with fire: new-fire rituals, great bonfires, the long sendren dance lines and nights of song. Village celebrations are the truest experience — Tamenglong’s are legendary.', aliases: ['gaan ngai', 'fire festival'] },
  { id: 'chumpha', name: 'Chumpha', months: [12], window: 'December (after harvest)', place: 'Ukhrul district', blurb: 'The Tangkhul harvest festival — a week of family visits, feasting and the joyful procession of the women.', desc: 'Chumpha is the Tangkhul thanksgiving after the harvest — seven days when the fields rest. The closing day belongs to the women, who come out in procession in full dress with gifts, and the village feasts till the drums tire.', aliases: ['chumpha festival'] }
];

/* ---------------------------------- Experiences -------------------------- */

KB.experiences = [
  { id: 'sangai-safari', name: 'Dawn Boat Safari for the Sangai', destId: 'keibul-lamjao', blurb: 'Slip onto the water before sunrise and watch for the dancing deer on the floating meadows.', interests: ['wildlife', 'nature'], months: [11, 12, 1, 2, 3], aliases: ['sangai', 'safari', 'deer'] },
  { id: 'phumdi-night', name: 'A Night on a Floating Homestay', destId: 'karang', blurb: 'Lanterns, lake fish dinner and the loudest silence you have ever heard — sleep on the phumdis.', interests: ['slow-travel', 'culture', 'lakes'], months: [10, 11, 12, 1, 2, 3], aliases: ['floating homestay', 'night on the lake'] },
  { id: 'ima-dawn', name: 'Ima Keithel Dawn Walk', destId: 'ima-keithel', blurb: 'Follow the market women in at 5:30 am, then breakfast on eromba and keli chana where the traders eat.', interests: ['food', 'markets', 'culture'], months: [1,2,3,4,5,6,7,8,9,10,11,12], aliases: ['dawn market', 'breakfast'] },
  { id: 'polo-watch', name: 'Watch Polo Where It Was Born', destId: 'polo-ground', blurb: 'Winter ponies on the oldest ground in the world — no stands, no tickets, just thunder.', interests: ['sport', 'culture'], months: [11, 12, 1, 2], aliases: ['polo match', 'pony'] },
  { id: 'rasleela', name: 'Ras Leela by Lamplight', destId: 'govindajee', blurb: 'The classical devotional dance of Manipur performed on festival nights — stillness, grace and drums.', interests: ['culture', 'spiritual'], months: [1,2,3,4,5,6,7,8,9,10,11,12], aliases: ['ras leela', 'dance'] },
  { id: 'thangta', name: 'Thang-Ta & Pung Cholom Evening', destId: 'state-museum', blurb: 'The sword-and-spear martial dance and the thundering drum dance — Manipur’s fire on a stage.', interests: ['culture', 'sport'], months: [11], aliases: ['thang ta', 'martial', 'pung cholom', 'drum'] },
  { id: 'dzukou-trek', name: 'The Dzükou Crossing', destId: 'dzukou', blurb: 'Two days up the ridge, a night in the valley of lilies, and the long grass sea at dawn.', interests: ['trekking', 'adventure', 'botany'], months: [6, 7, 8, 9, 10], aliases: ['dzukou trek', 'trek'] },
  { id: 'tharon-explore', name: 'Into Tharon’s Dark', destId: 'tharon-cave', blurb: 'Six hundred metres under the Tamenglong hills with a lantern and a local guide.', interests: ['adventure'], months: [10, 11, 12, 1, 2, 3, 4], aliases: ['caving', 'tharon'] },
  { id: 'longpi-craft', name: 'Longpi Black Pottery & Kauna Craft', destId: 'ukhrul', blurb: 'Shape stone-black serpentine clay with Tangkhul potters; weave a kauna reed mat in the valley.', interests: ['crafts', 'villages'], months: [10, 11, 12, 1, 2, 3], aliases: ['pottery', 'craft', 'kauna', 'longpi'] },
  { id: 'andro-pottery', name: 'Wheel-less Pottery at Andro', destId: 'andro', blurb: 'Sit at the Chakpa hearth and learn the oldest pottery technique in the valley.', interests: ['crafts', 'culture'], months: [10, 11, 12, 1, 2, 3], aliases: ['andro pottery'] },
  { id: 'weaving', name: 'Loom Day in Wangkhei', destId: 'ima-keithel', blurb: 'Wangkhei phee and Moirangphee are woven here — spend a morning at the loom with the weavers.', interests: ['crafts', 'culture', 'markets'], months: [1,2,3,4,5,6,7,8,9,10,11,12], aliases: ['weaving', 'loom', 'wangkhei phee'] },
  { id: 'redhill-sun', name: 'Red Hill at Golden Hour', destId: 'red-hill', blurb: 'Read the 1944 story on the ridge, then watch the sun go down over the road to Loktak.', interests: ['heritage', 'photography'], months: [10, 11, 12, 1, 2, 3], aliases: ['red hill sunset'] }
];

/* ---------------------------------- Stays -------------------------------- */

KB.stays = [
  { id: 'stay-floating', name: 'Floating Phumdi Homestays', where: 'Karang & Thanga islets, Loktak', price: '₹1.2k–3.5k / night', best: ['lakes', 'slow-travel', 'food'], blurb: 'Family huts on the water; dinners of lake fish, mornings of mist. Book a few days ahead through the community network.', aliases: ['floating homestay', 'karang', 'thanga'] },
  { id: 'stay-city', name: 'Imphal City Hotels', where: 'Thangal Bazar · Paona Bazar · North AOC belts', price: '₹1.5k–6k / night', best: ['markets', 'heritage', 'food'], blurb: 'The practical base — walk to Ima Keithel and Kangla; day trips radiate in every direction from here.', aliases: ['hotel imphal', 'city hotel'] },
  { id: 'stay-ukhrul', name: 'Tangkhul Village Homestays', where: 'Ukhrul town & surrounding villages', price: '₹1k–2.2k / night', best: ['villages', 'trekking', 'culture'], blurb: 'Wood-floored Tangkhul homes, smoked pork and millet tea, guides who know every ridge to Shirui.', aliases: ['ukhrul homestay', 'tangkhul homestay'] },
  { id: 'stay-dzukou', name: 'Dzükou Valley Camps', where: 'Valley rest house & ridge tents', price: '₹1k–1.8k / night (with guide)', best: ['trekking', 'adventure', 'botany'], blurb: 'Basic and unforgettable — book the rest house early or carry tents; nights drop near zero even in season.', aliases: ['dzukou camp', 'valley rest house'] },
  { id: 'stay-tamenglong', name: 'Community Eco-Stays', where: 'Tamenglong & Noney villages', price: '₹0.8k–1.6k / night', best: ['nature', 'villages', 'slow-travel'], blurb: 'Simple rooms with the village’s best cooks; the Orange Festival weekend fills fast in December.', aliases: ['eco stay', 'tamenglong homestay'] },
  { id: 'stay-mao', name: 'Mao & Senapati Homestays', where: 'Mao Gate, Senapati, Saikul', price: '₹1k–2k / night', best: ['nature', 'roadtrip', 'agro'], blurb: 'Orchard homestays on the NH-2 climb — the coldest, cleanest sleep in the state.', aliases: ['mao homestay', 'senapati homestay'] },
  { id: 'stay-moreh', name: 'Moreh Transit Hotels', where: 'Moreh town', price: '₹0.8k–2k / night', best: ['markets', 'roadtrip'], blurb: 'Functional rooms for border-day trips; most visitors return to Imphal the same evening.', aliases: ['moreh hotel'] }
];

/* ---------------------------------- Reach & transport -------------------- */

KB.transport = {
  air: {
    title: 'By Air',
    body: 'Bir Tikendrajit International Airport (IMF) sits 8 km south of central Imphal. Direct flights link Imphal with Delhi, Kolkata, Guwahati and Agartala daily, with more routes added in season. Prepaid taxis and auto-stands meet every arrival.'
  },
  rail: {
    title: 'By Rail',
    body: 'The railway is still reaching Imphal: Jiribam, 225 km west, is the working railhead with road connections onward, and the new broad-gauge line into the Imphal valley is under construction. Until it opens, most rail travellers come via Dimapur (Nagaland) or Guwahati and continue by road.'
  },
  road: {
    title: 'By Road',
    body: 'NH-2 climbs in from Dimapur and Kohima (215 km; 6–8 h, mountain driving). NH-37 connects west through Jiribam toward Silchar (225 km). NH-102 runs south-east 110 km to Moreh on the Myanmar border. Buses and shared cabs run all three corridors from Imphal’s Inter State Bus Terminus.'
  },
  local: {
    title: 'Getting Around',
    body: 'Imphal moves on shared autos and the metered-auto stands at Paona and Thangal Bazar; day-hire cabs (₹2.5k–4k in the valley, more for hill runs) are the standard for touring, arranged through stands and your hotel. Shared tempos cover the district towns, and scooter rentals are easy in the city. Hill roads mean early starts — plan to be rolling by 8 am.'
  }
};

/* ---------------------------------- Practical ---------------------------- */

KB.essentials = [
  { id: 'permit', icon: '🛂', title: 'Inner Line Permit', body: 'Indian citizens need an Inner Line Permit (ILP) to enter Manipur — apply on the official state ILP portal before travel, keep the printout and a photo ID handy; checkpoints are routine on the highways. Foreign nationals register at immigration on arrival and should check current rules for areas near the border before travelling east or north.' },
  { id: 'money', icon: '💳', title: 'Money & Cards', body: 'ATMs and UPI are reliable across Imphal and the valley towns, but thin out fast in the hills — carry cash before leaving the city. Card acceptance is patchy outside hotels; small notes do better in markets than big ones.' },
  { id: 'network', icon: '📶', title: 'Connectivity', body: 'Jio and Airtel give solid 4G/5G across the Imphal valley. In the hills the signal comes and goes with the ridges — download offline maps before a hill drive, and tell your homestay your route.' },
  { id: 'health', icon: '🩺', title: 'Health & Comfort', body: 'The valley sits at ~790 m — no altitude worries. Carry a basic kit: motion-sickness tablets for the hill roads, rehydration salts, a mosquito repellent for lake evenings, and any prescriptions from home. Good pharmacies cluster in Imphal city.' },
  { id: 'etiquette', icon: '🙏', title: 'Etiquette That Matters', body: 'Take shoes off before temples and homes. Ask before photographing people — and accept a polite no. Dress modestly in villages; Sundays are quiet, church-centred days in the hills. Alcohol is legally restricted in Manipur — don’t assume availability, and never buy informally.' },
  { id: 'safety', icon: '🧭', title: 'Safe & Sensible', body: 'Check the latest official advisory before travelling, as conditions in some districts can change. Keep to daylight for hill drives, use registered guides for treks and caves, carry your ILP and ID, and save the national emergency number: 112 (police, fire, medical).' },
  { id: 'sustain', icon: '🌱', title: 'Travel Light on the Lake', body: 'Loktak’s phumdis are a living ecosystem — never step, litter or anchor carelessly on them. Refill bottles, take plastics back to town, choose homestays and local guides, and buy crafts straight from makers like Andro’s potters and Ukhrul’s Longpi workshops.' }
];

KB.emergency = [
  { label: 'National Emergency Line', num: '112' },
  { label: 'Ambulance', num: '108' },
  { label: 'Fire', num: '101' },
  { label: 'Women Helpline', num: '1091' },
  { label: 'Child Helpline', num: '1098' }
];

/* ---------------------------------- Seasons & climate -------------------- */

KB.climate = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  valleyTemp: [[8, 21], [10, 23], [14, 27], [17, 29], [19, 29], [21, 30], [21, 30], [21, 30], [20, 29], [16, 27], [11, 24], [8, 22]],
  hillAdjust: -4,
  rain: ['dry', 'dry', 'dry', 'light', 'light', 'monsoon', 'monsoon', 'monsoon', 'monsoon', 'easing', 'dry', 'dry']
};

/* ---------------------------------- Interest catalogue ------------------- */

KB.interests = [
  { id: 'lakes', label: 'Lakes & rivers', icon: '🌊' },
  { id: 'trekking', label: 'Treks & ridges', icon: '🥾' },
  { id: 'wildlife', label: 'Wildlife & birds', icon: '🦌' },
  { id: 'heritage', label: 'History & forts', icon: '🏰' },
  { id: 'culture', label: 'Festivals & dance', icon: '🎭' },
  { id: 'food', label: 'Food & markets', icon: '🍲' },
  { id: 'crafts', label: 'Crafts & looms', icon: '🧵' },
  { id: 'spiritual', label: 'Temples & shrines', icon: '🛕' },
  { id: 'adventure', label: 'Caves & adventure', icon: '🧗' },
  { id: 'photography', label: 'Photography', icon: '📷' },
  { id: 'botany', label: 'Lilies & orchids', icon: '🌸' },
  { id: 'villages', label: 'Village life', icon: '🏡' }
];

KB.paceOptions = [
  { id: 'relaxed', label: 'Relaxed', hint: '2 stops a day, long mornings' },
  { id: 'balanced', label: 'Balanced', hint: '3 stops a day, unhurried rhythm' },
  { id: 'packed', label: 'Packed', hint: '4 stops a day, see it all' }
];

KB.budgetOptions = [
  { id: 'lean', label: 'Lean', hint: 'Homestays & street food', perDay: 2000 },
  { id: 'comfort', label: 'Comfort', hint: 'Good hotels & cabs', perDay: 4000 },
  { id: 'premium', label: 'Premium', hint: 'Best rooms & private car', perDay: 7500 }
];

/* Sector geography used by the itinerary planner */
KB.sectors = {
  city:       { label: 'Imphal city', speed: 25 },
  south:      { label: 'Loktak & the south', speed: 40 },
  east:       { label: 'Thoubal–Moreh corridor', speed: 40 },
  northeast:  { label: 'Ukhrul hills', speed: 32 },
  north:      { label: 'Senapati & the NH-2 hills', speed: 32 },
  northwest:  { label: 'Tamenglong forests', speed: 24 }
};

/* Drive-time factor: road distance ≈ straight-line × this */
KB.roadFactor = 1.35;

/* Distances from Imphal to gateway cities (km, road) — used in chat & reach panels */
KB.gatewayDistances = [
  { from: 'Delhi', km: '≈2,400 km by road · fly instead (≈3 h)' },
  { from: 'Kolkata', km: '≈1,550 km by road · fly instead (≈1 h 20 m)' },
  { from: 'Guwahati', km: '≈500 km by road (2 days) · fly (≈1 h)' },
  { from: 'Dimapur (Nagaland)', km: '≈215 km by road on NH-2 (6–8 h)' },
  { from: 'Agartala', km: 'fly (≈50 m) or the long southern road' },
  { from: 'Moreh (Myanmar border)', km: '≈110 km by road on NH-102 (3–4 h)' }
];

/* Persona labels for the trip quiz */
KB.personas = [
  { min: 0, title: 'The Valley Drifter', line: 'You like markets, lake mornings and long unhurried meals — the classic Imphal-to-Loktak rhythm.' },
  { min: 3, title: 'The Heritage Storyteller', line: 'Forts, legends and 1944 — you travel to understand a place, not just to see it.' },
  { min: 6, title: 'The Ridge Walker', line: 'You earn your views — the hills, the lilies and the long grass sea are calling.' },
  { min: 9, title: 'The Whole-of-Manipur Soul', line: 'You want everything — the deer, the drums, the looms and the borders. A grand tour it is.' }
];
