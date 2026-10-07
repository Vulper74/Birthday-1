// Sav sadržaj aplikacije na jednom mestu. Menjaš tekst ovde, ostalo se samo prilagodi.

const PODACI = {
  ime: "Mihailo",

  uvod: ["Srećan rođendan", "ljubavi,", "sa malim zakašnjenjem."],

  zajednoOd: "2025-11-16",

  // Podrazumevano odbrojavanje (po beogradskom vremenu). Ona može da ga promeni u aplikaciji.
  sledeceVidjenje: "2026-10-18T21:00:00+02:00",
  odbrojavanjeOd: "2026-10-11T18:00:00+02:00",

  // Prvi je uvek njegov grad (maslinasta tačka), drugi njen (neon roze).
  gradovi: [
    { ime: "Dablin", lat: 53.3498, lon: -6.2603, tz: "Europe/Dublin", ko: "Mihailo" },
    { ime: "Beograd", lat: 44.8125, lon: 20.4612, tz: "Europe/Belgrade", ko: "ti" },
  ],

  // Tvoje poruke, tačno kako si ih napisao. Gde se završava samo srcima, aplikacija sama menja broj srca (1–3).
  poruke: [
    "Dobro jutro ljubavi moja❤️",
    "Dobro jutro srećo moja ❤️",
    "Dobro jutro srecice moja najdivnija ❤️",
    "Dobro jutro lepoto moja❤️❤️❤️",
    "Dobro jutro srecice moja najsladja❤️",
    "Dobro jutro ljubavi❤️",
    "Dobro jutro ljubavi moja predivna❤️🫠",
    "Dobro jutro ljubavi moja najvoljenija❤️❤️❤️",
    "Dobro jutro srce moje malo❤️",
    "Dobro jutro ljubavi moja najsladja❤️",
    "Dobro jutro ljubavi ❤️‍🔥",
    "Dobro jutro lepotice moja najomiljenija❤️❤️❤️",
    "Dobro jutro sreco moja predivna❤️",
    "Dobro jutro spavalice moja divna❤️🥰",
    "Dobro jutro sreco moja najomiljenija❤️❤️",
    "Dobro jutro ljubavi moja najdraža❤️",
    "Dobro jutro srce moje❤️",
    "Dobro jutro moje omiljeno stvorenje❤️",
    "Dobro jutro ljubavi moja najveca!❤️",
    "Dobro jutro mojoj najdivnijoj devojci ❤️",
    "Dobro jutro lepoto❤️",
  ],

  // Skrivena iznenađenja
  tajne: {
    // 7 brzih dodira na broj dana
    sedamDodira: "Je l opet gledaš Djokovića??",

    // Dugo držanje na tvojoj tački na karti: svaki put sledeća činjenica, ukrug.
    // Prva rečenica je naslov, ostatak ide sitnije ispod.
    dugoDrzanje: [
      "Nisu ni krtice ni pacovi. Najbliži rođaci su im bodljikavo prase i zamorče.",
      "Na srpskom se zovu golo slepo kuče. Iako nisu kučići. A nisu ni sasvim slepi, samo jako loše vide. Ali jesu goli.",
      "Žive jako dugo. Mogu da dožive i preko 30 godina, oko 10 puta duže od drugih glodara te veličine. Za razliku od skoro svih sisara, rizik da uginu skoro da ne raste kako stare.",
      "Skoro nikad ne dobijaju rak. Jedan od razloga je gust oblik hijaluronana, šećera u njihovom tkivu, koji izgleda sprečava ćelije da se zbijaju i prave tumore.",
      "Mogu 18 minuta bez kiseonika. Telo im tada pređe na sagorevanje fruktoze, trik koji se obično viđa kod biljaka.",
      "Ne osećaju neke vrste bola. Kiselina i ljutina čili papričica (kapsaicin) im uopšte ne smetaju.",
      "Kolonija im radi kao košnica. Razmnožava se samo kraljica, a ostali su radnici i vojnici. Kad postane kraljica, kičma joj se izduži da bi mogla da nosi više mladunaca.",
      "Svaka kolonija ima svoj akcenat. Cvrkuću na dijalektu svoje kolonije, a izgleda da ga određuje kraljica. Mladunci odgajeni u drugoj koloniji nauče njen dijalekat.",
      "Zubi su im ispred usana. Tako mogu da kopaju zubima, a da im zemlja ne ulazi u usta. Oko 25% mišića im je u vilici, a dva donja prednja zuba mogu da pomeraju odvojeno.",
      "Jedva su toplokrvni. Ne mogu dobro da održavaju telesnu temperaturu, pa se zbijaju jedni uz druge ili prelaze u toplije ili hladnije tunele.",
      "Unazad trče jednako brzo kao unapred. To im pomaže u uskim tunelima.",
    ],
  },
};
