/* Renders the ambassador directory from ambassadors.js.
   Works for both index.html (Hebrew) and en.html (English), based on <html lang>.
   You don't need to edit this file to add ambassadors — edit ambassadors.js. */
(function () {
  var EN = (document.documentElement.lang || "").indexOf("en") === 0;
  var T = EN ? {
    all: "All regions", count: function (n) { return n === 1 ? "1 ambassador" : n + " ambassadors"; },
    empty: "No ambassador matches your search. Try a nearby city or choose “All regions”.",
    wa: "💬 WhatsApp", call: "📞 Call", other: "Other",
    msg: function (n) { return "Hi " + n + ", I'd like to hear about DeviceControl"; }
  } : {
    all: "כל האזורים", count: function (n) { return n === 1 ? "שגריר אחד" : n + " שגרירים"; },
    empty: "לא נמצא שגריר שמתאים לחיפוש. נסו עיר קרובה או בחרו \"כל האזורים\".",
    wa: "💬 וואטסאפ", call: "📞 חיוג", other: "אחר",
    msg: function (n) { return "שלום " + n + ", אשמח לשמוע על DeviceControl"; }
  };
  var PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';

  var regions = (window.REGIONS || []).map(function (r) {
    return typeof r === "string" ? { he: r, en: r } : r;
  });
  function regionName(he) {
    for (var i = 0; i < regions.length; i++) if (regions[i].he === he) return EN ? (regions[i].en || he) : he;
    return he;
  }
  var all = (window.AMBASSADORS || []).filter(function (a) { return a && a.active !== false && a.name && a.phone; })
    .map(function (a) {
      var region = a.region || T.other;
      return {
        name: (EN && a.name_en) || a.name,
        city: (EN && a.city_en) || a.city || "",
        note: (EN ? a.note_en : a.note) || "",
        phone: a.phone, region: region, regionLabel: regionName(region),
        search: [a.name, a.name_en, a.city, a.city_en, region, regionName(region)].join(" ").toLowerCase()
      };
    });
  var order = regions.map(function (r) { return r.he; });
  all.forEach(function (a) { if (order.indexOf(a.region) < 0) order.push(a.region); });

  var state = { region: "", q: "" };
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function digits(p) { return String(p).replace(/\D/g, ""); }
  function intl(p) { var d = digits(p); return d.charAt(0) === "0" ? "972" + d.slice(1) : d; }
  function initials(n) { var w = String(n).trim().split(/\s+/); return (w[0] || "").charAt(0) + (w[1] ? w[1].charAt(0) : ""); }

  function card(a) {
    return '<article class="amb">' +
      '<div class="amb-top"><span class="avatar" aria-hidden="true">' + esc(initials(a.name)) + '</span><div>' +
      '<b>' + esc(a.name) + '</b><span class="amb-loc">' + PIN + esc(a.city || a.regionLabel) + '</span></div></div>' +
      (a.note ? '<div class="amb-note">' + esc(a.note) + '</div>' : '') +
      '<div class="amb-phone"><bdi dir="ltr">' + esc(a.phone) + '</bdi></div>' +
      '<div class="amb-actions">' +
      '<a class="btn btn-wa" href="https://wa.me/' + intl(a.phone) + '?text=' + encodeURIComponent(T.msg(a.name)) + '" target="_blank" rel="noopener">' + T.wa + '</a>' +
      '<a class="btn btn-ghost" href="tel:' + digits(a.phone) + '">' + T.call + '</a>' +
      '</div></article>';
  }
  function chips() {
    var counts = {};
    all.forEach(function (a) { counts[a.region] = (counts[a.region] || 0) + 1; });
    var list = [{ k: "", t: T.all, n: all.length }].concat(order.filter(function (r) { return counts[r]; })
      .map(function (r) { return { k: r, t: regionName(r), n: counts[r] }; }));
    $("amb-chips").innerHTML = list.map(function (c) {
      return '<button type="button" class="chip" data-r="' + esc(c.k) + '" aria-pressed="' + (state.region === c.k) + '">' +
        esc(c.t) + '<small>' + c.n + '</small></button>';
    }).join("");
  }
  function render() {
    var q = state.q.trim().toLowerCase(), qd = digits(q);
    var shown = all.filter(function (a) {
      if (state.region && a.region !== state.region) return false;
      if (!q) return true;
      return a.search.indexOf(q) >= 0 || (qd.length >= 3 && digits(a.phone).indexOf(qd) >= 0);
    });
    if (!shown.length) { $("amb-list").innerHTML = '<div class="amb-empty">' + T.empty + '</div>'; return; }
    $("amb-list").innerHTML = order.map(function (r) {
      var g = shown.filter(function (a) { return a.region === r; })
        .sort(function (x, y) { return String(x.city).localeCompare(String(y.city), EN ? "en" : "he"); });
      if (!g.length) return "";
      return '<div class="region-block"><h3 class="region-title"><span class="pin">' + PIN + '</span>' + esc(regionName(r)) +
        ' <small>' + T.count(g.length) + '</small></h3><div class="amb-grid">' + g.map(card).join("") + '</div></div>';
    }).join("");
  }
  $("amb-chips").addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    state.region = b.getAttribute("data-r"); chips(); render();
  });
  $("amb-q").addEventListener("input", function (e) { state.q = e.target.value; render(); });
  chips(); render();
})();
