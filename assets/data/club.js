/* Opening hours and the Leisure Island season — the one place to edit them.
   The "Open now" lines and the island countdown update themselves from this.
   Times are Lebanon time (Asia/Beirut). Hours as last published — to confirm with the club. */
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
    opens: null,           // e.g. "2027-05-15" — when set, Leisure Island shows a countdown
    closes: null,          // e.g. "2027-09-20"
    hours: ["10:00", "20:00"]
  }
};
