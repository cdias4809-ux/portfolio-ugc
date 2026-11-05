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

  // On ne garde jamais de référence DOM en cache : le framework de la page
  // (React) peut remplacer entièrement le nœud #avis-ugc / <section> par un
  // nouveau nœud (plutôt que de le modifier en place) lors d'un nouveau
  // rendu. Une référence mise en cache deviendrait alors un nœud orphelin,
  // invisible, et tout ce qu'on y écrirait n'apparaîtrait jamais à l'écran.
  // On re-cherche donc les éléments à chaque fois.
  function getEls() {
    var r = document.getElementById("avis-ugc");
    return { root: r, sec: r && r.closest("section"), nav: document.getElementById("nav-avis") };
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
    + "#avis-ugc .au-av{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--au-gold);color:#0d1b2a;font-weight:700;font-size:18px;overflow:hidden}"
    + "#avis-ugc .au-av img{width:100%;height:100%;object-fit:cover}"
    + "#avis-ugc .au-who strong{display:block;color:var(--au-gold-soft);font-family:var(--display,'Bodoni Moda',serif);font-size:1.3rem;font-weight:700;line-height:1.15;margin-bottom:2px;overflow-wrap:anywhere}"
    + "#avis-ugc .au-who small{display:block;font-size:14px;opacity:.8;overflow-wrap:anywhere}"
    + "#avis-ugc .au-cta{align-self:center;text-decoration:none;font-weight:600;color:var(--au-gold);border:1.5px solid var(--au-gold);border-radius:999px;padding:13px 22px}"
    + "#avis-ugc .au-cta:hover{background:var(--au-gold);color:#0d1b2a}";

  var styled = false;
  var lastAvis = null; // dernier avis affichés avec succès (pour auto-réparation)
  function draw(list) {
    if (!list || !list.length) return;
    lastAvis = list;
    var els = getEls();
    if (!els.root) return; // la section a été retirée du DOM, rien à faire
    if (!styled) {
      var style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      styled = true;
    }
    var cards = list.slice(0, MAX).map(function (a) {
      var nom = (a.prenom + " " + a.nom).trim();
      var sub = [nom, a.poste].filter(Boolean).join(" · ");
      var avatar = a.photo
        ? '<img src="' + esc(a.photo) + '" alt="" referrerpolicy="no-referrer">'
        : esc((a.marque || "?").charAt(0).toUpperCase());
      return '<article class="au-card">' + stars(Number(a.note)) +
        "<p>" + esc(a.texte) + "</p>" +
        '<div class="au-who"><div class="au-av" aria-hidden="true">' + avatar + "</div>" +
        "<div><strong>" + esc(a.marque) + "</strong><small>" + esc(sub) + "</small></div></div></article>";
    }).join("");

    els.root.innerHTML = '<div class="au-wrap">' +
      '<div class="au-grid">' + cards + "</div>" +
      '<a class="au-cta" href="' + esc(LIEN_AVIS) + '">Laisser un avis</a></div>';
    // Affiche la section du portfolio (cachée tant qu'il n'y a aucun avis).
    if (els.sec) els.sec.style.display = "";
    // Affiche aussi le lien "Avis" du menu.
    if (els.nav) els.nav.style.display = "";
  }

  // Auto-réparation : le site est généré par un framework (React) qui, peu
  // après le chargement, se re-rend parfois à partir du HTML d'origine
  // (requête interne vers la page elle-même). Cette re-render peut écraser
  // ce qu'on vient d'injecter (section remise en display:none, avis
  // effacés) même si notre script a parfaitement fonctionné. On surveille
  // donc la zone des avis et on la redessine instantanément si quelque
  // chose d'externe l'efface.
  function estEffacee() {
    if (!lastAvis || !lastAvis.length) return false;
    var els = getEls();
    if (!els.root || !els.root.innerHTML) return true;
    if (els.sec && els.sec.style.display === "none") return true;
    if (els.nav && els.nav.style.display === "none") return true;
    return false;
  }
  try {
    // On surveille tout le document (pas juste la section avis) : si le
    // framework remplace carrément le nœud de la section par un nouveau
    // (plutôt que de le modifier en place), observer uniquement l'ancien
    // nœud ne verrait plus rien passer. document.body, lui, ne disparaît
    // jamais.
    var mo = new MutationObserver(function () {
      if (estEffacee()) draw(lastAvis);
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
  } catch (e) { /* MutationObserver indisponible : tant pis */ }

  // Affiche tout de suite les derniers avis connus, puis met à jour.
  var hadCache = false;
  try {
    var cache = JSON.parse(localStorage.getItem("avis-cache") || "null");
    if (cache && cache.length) { hadCache = true; draw(cache); }
  } catch (e) { /* pas de cache : tant pis */ }

  function hide() {
    var els = getEls();
    if (els.root) els.root.innerHTML = "";
    if (els.sec) els.sec.style.display = "none";
    if (els.nav) els.nav.style.display = "none";
  }

  function load(isRetry) {
    // "no-store" évite qu'une réponse mise en cache par le navigateur
    // ou un intermédiaire réseau ne serve une version périmée/vide.
    return fetch(ENDPOINT, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok || !j.avis) throw new Error("réponse invalide");
        if (j.avis.length) {
          try { localStorage.setItem("avis-cache", JSON.stringify(j.avis)); } catch (e) {}
          draw(j.avis);
          return;
        }
        // La réponse dit "aucun avis". Si on affichait déjà des avis en
        // cache, on ne les efface jamais sur la base d'une simple réponse
        // vide : c'est presque toujours un aléa passager côté Google
        // (script qui se "réveille"), pas une vraie suppression des avis.
        // On garde l'affichage en cache et on retente plus tard.
        if (hadCache) {
          if (!isRetry) setTimeout(function () { load(true); }, 1800);
          return;
        }
        hide();
      })
      .catch(function () {
        // Échec réseau/parsing : on garde ce qui est déjà affiché
        // (cache ou rien) plutôt que de risquer de tout effacer.
        if (hadCache && !isRetry) {
          setTimeout(function () { load(true); }, 1800);
        }
      });
  }

  load(false);
})();
