/*
 * Avis des marques sur le portfolio.
 * Section "Avis" du portfolio : la section reste cachée tant qu'aucun avis n'est publié.
 */
(function () {
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbyOyDAZeFGSjh0CzhCXcHSB524W2DO-CY9vxh0EKY6koS2APwQKe5GgvIgfYyRP9BTF7w/exec";   // même URL que dans la page /avis
  var LIEN_AVIS = "/avis";            // page où laisser un avis
  var MAX = 6;                        // nombre d'avis affichés

  var root = document.getElementById("avis-ugc");
  if (!root || ENDPOINT.indexOf("http") !== 0) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function stars(n) {
    var o = "";
    for (var i = 1; i <= 5; i++) o += i <= n ? "★" : '<span class="au-off">★</span>';
    return '<div class="au-stars" role="img" aria-label="' + n + ' sur 5">' + o + "</div>";
  }

  var css = ""
    + "#avis-ugc{--au-gold:#c6a15b;--au-gold-soft:#e0c484;--au-ink:#f8f5ee;--au-text:#b4c1d0;--au-card:#112236;--au-line:#1a2f4a;color:var(--au-text);font-family:inherit}"
    + "#avis-ugc .au-wrap{display:flex;flex-direction:column;gap:24px}"
    + "#avis-ugc .au-title{margin:0;color:var(--au-ink);font-family:var(--display,'Bodoni Moda',serif);font-weight:700;font-size:clamp(1.7rem,4.5vw,2.4rem);line-height:1.05}"
    + "#avis-ugc .au-title span{color:var(--au-gold)}"
    + "#avis-ugc .au-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,290px),1fr));gap:16px}"
    + "#avis-ugc .au-card{background:var(--au-card);border:1px solid rgba(198,161,91,.35);border-bottom:3px solid var(--au-gold);border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:14px;min-width:0}"
    + "#avis-ugc .au-card p{margin:0;line-height:1.55;overflow-wrap:anywhere}"
    + "#avis-ugc .au-stars{color:var(--au-gold);letter-spacing:2px;font-size:18px;line-height:1}"
    + "#avis-ugc .au-off{color:var(--au-line)}"
    + "#avis-ugc .au-who{display:flex;gap:12px;align-items:center;margin-top:auto;min-width:0}"
    + "#avis-ugc .au-av{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--au-gold);color:#0d1b2a;font-weight:700;font-size:18px}"
    + "#avis-ugc .au-who strong{display:block;color:var(--au-gold-soft);font-family:var(--display,'Bodoni Moda',serif);font-size:1.3rem;font-weight:700;line-height:1.15;margin-bottom:2px;overflow-wrap:anywhere}"
    + "#avis-ugc .au-who small{display:block;font-size:14px;opacity:.8;overflow-wrap:anywhere}"
    + "#avis-ugc .au-cta{align-self:center;text-decoration:none;font-weight:600;color:var(--au-gold);border:1.5px solid var(--au-gold);border-radius:999px;padding:13px 22px}"
    + "#avis-ugc .au-cta:hover{background:var(--au-gold);color:#0d1b2a}";

  fetch(ENDPOINT)
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j || !j.ok || !j.avis || !j.avis.length) return;
      var style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);

      var cards = j.avis.slice(0, MAX).map(function (a) {
        var nom = (a.prenom + " " + a.nom).trim();
        var sub = [nom, a.poste].filter(Boolean).join(" · ");
        return '<article class="au-card">' + stars(Number(a.note)) +
          "<p>" + esc(a.texte) + "</p>" +
          '<div class="au-who"><div class="au-av" aria-hidden="true">' + esc((a.marque || "?").charAt(0).toUpperCase()) + "</div>" +
          "<div><strong>" + esc(a.marque) + "</strong><small>" + esc(sub) + "</small></div></div></article>";
      }).join("");

      root.innerHTML = '<div class="au-wrap">' +
        '<div class="au-grid">' + cards + "</div>" +
        '<a class="au-cta" href="' + esc(LIEN_AVIS) + '">Laisser mon avis</a></div>';
      // Affiche la section du portfolio (cachée tant qu'il n'y a aucun avis).
      var sec = root.closest("section");
      if (sec) sec.style.display = "";
      // Affiche aussi le lien "Avis" du menu.
      var nl = document.getElementById("nav-avis");
      if (nl) nl.style.display = "";
    })
    .catch(function () { /* rien ne s'affiche si le relais ne répond pas */ });
})();
