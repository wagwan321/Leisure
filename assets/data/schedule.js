/* Weekly schedule data — the single place to edit class times (moves into the CMS later, brief §15/§18).
   Source: the timetable as last published by the club. Facilities and coaches are to be confirmed.
   sessions: [day, "HH:MM", optional age label]
   group: "adults" | "kids"     facility: "studio" | "performance" | "pool" | "courts" | "outdoor" */
window.TLC_SCHEDULE = {
  classes: [
    // Adults
    { id: "aerobics", name: { en: "Aerobics", ar: "إيروبكس", fr: "Aérobic" }, group: "adults", facility: "studio",
      sessions: [["mon", "09:00"], ["wed", "09:00"], ["fri", "09:00"], ["fri", "19:00"]] },
    { id: "oriental", name: { en: "Oriental dance", ar: "رقص شرقي", fr: "Danse orientale" }, group: "adults", facility: "studio",
      sessions: [["mon", "10:00"], ["wed", "10:00"], ["tue", "19:00"], ["thu", "19:00"]] },
    { id: "pilates", name: { en: "Mat Pilates", ar: "بيلاتس على البساط", fr: "Pilates au sol" }, group: "adults", facility: "studio",
      sessions: [["mon", "18:00"]] },
    { id: "hyrox", name: { en: "HYROX", ar: "HYROX", fr: "HYROX" }, group: "adults", facility: "performance",
      sessions: [["tue", "08:00"], ["thu", "08:00"]] },
    { id: "run-adults", name: { en: "Run Club", ar: "نادي الجري", fr: "Run Club" }, group: "adults", facility: "outdoor",
      sessions: [["wed", "19:00"], ["thu", "19:00"], ["sat", "07:00"]] },
    { id: "kickboxing", name: { en: "Kickboxing", ar: "كيك بوكسينغ", fr: "Kickboxing" }, group: "adults", facility: "studio",
      sessions: [["wed", "19:00"]] },
    { id: "aqua", name: { en: "Aqua Gym", ar: "أكوا جيم", fr: "Aquagym" }, group: "adults", facility: "pool",
      sessions: [["wed", "19:00"], ["thu", "10:00"]] },
    { id: "yoga", name: { en: "Yoga", ar: "يوغا", fr: "Yoga" }, group: "adults", facility: "studio",
      sessions: [["mon", "20:00"], ["wed", "20:00"]] },
    { id: "boxing", name: { en: "Boxing", ar: "ملاكمة", fr: "Boxe" }, group: "adults", facility: "studio",
      sessions: [["tue", "20:00"], ["thu", "20:00"]] },
    { id: "bodycombat", name: { en: "Body Combat", ar: "بودي كومبات", fr: "Body Combat" }, group: "adults", facility: "studio",
      sessions: [["fri", "20:00"]] },
    { id: "grit", name: { en: "Grit Sessions", ar: "حصص Grit", fr: "Grit Sessions" }, group: "adults", facility: "performance",
      sessions: [["mon", "19:00"]] },
    { id: "calisthenics", name: { en: "Calisthenics", ar: "كاليسثنكس", fr: "Callisthénie" }, group: "adults", facility: "performance",
      sessions: [["fri", "19:00"]] },

    // Kids (under 16)
    { id: "breakdance", name: { en: "Breakdance", ar: "بريك دانس", fr: "Breakdance" }, group: "kids", facility: "studio",
      sessions: [["sat", "09:00"]] },
    { id: "latino", name: { en: "Latino dance", ar: "رقص لاتيني", fr: "Danse latino" }, group: "kids", facility: "studio",
      sessions: [["sat", "10:00"]] },
    { id: "kids-fitness", name: { en: "Kids' fitness", ar: "لياقة الأطفال", fr: "Fitness enfants" }, group: "kids", facility: "studio",
      sessions: [["sat", "11:00"]] },
    { id: "taekwondo", name: { en: "Taekwondo", ar: "تايكواندو", fr: "Taekwondo" }, group: "kids", facility: "studio",
      sessions: [["tue", "16:15", "4–6"], ["fri", "16:15", "4–6"], ["tue", "17:00", "6–8"], ["fri", "17:00", "6–8"], ["tue", "18:00", "8+"], ["fri", "18:00", "8+"]] },
    { id: "hiphop", name: { en: "Hip Hop", ar: "هيب هوب", fr: "Hip-hop" }, group: "kids", facility: "studio",
      sessions: [["wed", "17:00"]] },
    { id: "gymnastics", name: { en: "Gymnastics", ar: "جمباز", fr: "Gymnastique" }, group: "kids", facility: "studio",
      sessions: [["thu", "17:00", "<8"], ["thu", "18:00", "<16"]] },
    { id: "kickboxing-kids", name: { en: "Kickboxing", ar: "كيك بوكسينغ", fr: "Kickboxing" }, group: "kids", facility: "studio",
      sessions: [["wed", "18:00"]] },
    { id: "basketball", name: { en: "Basketball", ar: "كرة السلة", fr: "Basket-ball" }, group: "kids", facility: "courts",
      sessions: [["thu", "17:00", "6–8"], ["thu", "18:00", "8+"]] },
    { id: "football", name: { en: "Football", ar: "كرة القدم", fr: "Football" }, group: "kids", facility: "courts",
      sessions: [["fri", "17:00", "6–8"], ["fri", "18:00", "8+"]] },
    { id: "run-kids", name: { en: "Run Club", ar: "نادي الجري", fr: "Run Club" }, group: "kids", facility: "outdoor",
      sessions: [["wed", "18:00"], ["sat", "08:00"]] }
  ]
};
