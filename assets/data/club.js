/* Opening hours and the Leisure Island season — the one place to edit them.
   The "Open now" lines and the island countdown update themselves from this.
   Times are Lebanon time (Asia/Beirut). Source: the club's affiliation 2027 flyer. */
window.TLC_CLUB = {
  timezone: "Asia/Beirut",
  indoor: {
    mon: ["07:30", "22:00"],
    tue: ["07:30", "22:00"],
    wed: ["07:30", "22:00"],
    thu: ["07:30", "22:00"],
    fri: ["07:30", "22:00"],
    sat: ["07:30", "21:00"],
    sun: null              // closed
  },
  island: {
    opens: "2027-05-16",   // Leisure Island season (affiliation 2027 flyer): 16 May to 20 September
    closes: "2027-09-20",
    hours: ["10:00", "20:00"]
  }
};
