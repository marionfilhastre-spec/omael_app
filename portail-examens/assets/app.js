/* ==========================================================
   Examens ZESE – Espace enseignants
   En-tête, pied de page et interactions communes.
   Chaque page déclare <body data-page="..."> pour activer
   le bon onglet de navigation.
   ========================================================== */
(function () {
  "use strict";

  // Racine du site, déduite de l'emplacement de ce script (fonctionne aussi pour la page 404).
  var BASE = (document.currentScript && document.currentScript.src || "").replace(/assets\/app\.js.*$/, "");

  var CONTACT_EMAIL = "examens.zese@lycee-chateaubriand.eu";

  var NAV = [
    { id: "accueil", href: "index.html", label: "Accueil" },
    { id: "mission", href: "mission.html", label: "Ma mission" },
    { id: "deplacement", href: "deplacement.html", label: "Mon déplacement" },
    { id: "indemnites", href: "indemnites.html", label: "Mes indemnités" },
    { id: "ressources", href: "ressources.html", label: "Mes ressources" },
    { id: "faq", href: "faq.html", label: "FAQ" }
  ];

  function icon(name, cls) {
    return '<svg class="icon' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="' + BASE + 'assets/icons.svg#' + name + '"></use></svg>';
  }

  var LOGO =
    '<svg class="brand-logo" viewBox="0 0 48 48" aria-hidden="true">' +
    '<path d="M8 30c2-6 1-10 6-13 4-2 6-7 11-7 3 0 5 3 9 2 4-1 7 2 7 6 0 3-3 4-3 8 0 3 3 5 1 8-2 3-6 1-8 4-1 2 0 5-3 6-2 0-3-3-5-3-3 0-5 3-8 1-3-2 1-5-1-8-2-2-7-1-6-4z" fill="#1f45e0"/>' +
    '<path d="M4 34c6 2 12 0 16-4" stroke="#d61f3c" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
    '<g fill="#fff"><circle cx="24" cy="15" r="1.4"/><circle cx="30" cy="17" r="1.4"/><circle cx="33" cy="23" r="1.4"/><circle cx="30" cy="29" r="1.4"/><circle cx="24" cy="31" r="1.4"/><circle cx="18" cy="23" r="1.4"/><circle cx="19" cy="17" r="1.4"/></g>' +
    '<circle cx="40" cy="10" r="3" fill="#d61f3c"/><circle cx="6" cy="16" r="2.2" fill="#d61f3c"/>' +
    "</svg>";

  var page = document.body.getAttribute("data-page") || "";

  /* ---------- Header ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    var links = NAV.map(function (n) {
      return '<li><a href="' + BASE + n.href + '"' + (n.id === page ? ' aria-current="page"' : "") + ">" + n.label + "</a></li>";
    }).join("");
    header.className = "site-header";
    header.innerHTML =
      '<div class="container header-inner">' +
      '<a class="brand" href="' + BASE + 'index.html" aria-label="Examens ZESE – accueil">' + LOGO +
      '<span class="brand-text"><strong>Examens ZESE</strong><small>Zone Europe du Sud-Est</small></span></a>' +
      '<span class="brand-tag">Espace enseignants</span>' +
      '<button class="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Ouvrir le menu">' + icon("menu") + "</button>" +
      '<nav class="main-nav" id="main-nav" aria-label="Navigation principale"><ul>' + links + "</ul></nav>" +
      '<div class="lang-switch" role="group" aria-label="Langue">' +
      '<button type="button" aria-pressed="true" lang="fr">FR</button>' +
      '<button type="button" aria-pressed="false" lang="en" data-en>EN</button></div>' +
      "</div>";

    var toggle = header.querySelector(".nav-toggle");
    var nav = header.querySelector(".main-nav");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    header.querySelector("[data-en]").addEventListener("click", function () {
      toast("The English version is coming soon. / La version anglaise est en préparation.");
    });
  }

  /* ---------- Footer ---------- */
  var footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="container footer-inner">' +
      '<div class="rf"><span class="rf-flag" aria-hidden="true"><span style="background:#000091"></span><span style="background:#fff;border-top:1px solid #eee;border-bottom:1px solid #eee"></span><span style="background:#e1000f"></span></span>' +
      '<span class="rf-text">République<br>Française<em>Liberté<br>Égalité<br>Fraternité</em></span></div>' +
      '<ul class="footer-links">' +
      '<li><a href="' + BASE + 'mentions-legales.html">Mentions légales</a></li>' +
      '<li><a href="' + BASE + 'accessibilite.html">Accessibilité</a></li>' +
      '<li><a href="mailto:' + CONTACT_EMAIL + '">Contact</a></li></ul>' +
      '<div class="footer-brand"><span>Examens ZESE – Espace enseignants<br>Zone Europe du Sud-Est</span>' + LOGO + "</div>" +
      "</div>";
  }

  /* ---------- Toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 3500);
  }

  // Liens vers des documents pas encore déposés : on prévient au lieu d'ouvrir un lien mort.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href="#a-venir"]');
    if (a) {
      e.preventDefault();
      toast("Ce document sera mis en ligne prochainement.");
    }
  });

  /* ---------- FAQ: open the question targeted by the URL hash, and search ---------- */
  function openHash() {
    if (!location.hash) return;
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.tagName === "DETAILS") {
      target.open = true;
      target.scrollIntoView({ block: "center" });
    }
  }
  openHash();
  window.addEventListener("hashchange", openHash);

  var search = document.getElementById("faq-search");
  if (search) {
    var items = document.querySelectorAll(".accordion details");
    var groups = document.querySelectorAll("[data-faq-group]");
    var empty = document.querySelector(".faq-empty");
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    search.addEventListener("input", function () {
      var q = norm(search.value.trim());
      var shown = 0;
      Array.prototype.forEach.call(items, function (d) {
        var match = !q || norm(d.textContent).indexOf(q) !== -1;
        d.hidden = !match;
        if (match) shown++;
        if (q && match) d.open = true;
      });
      Array.prototype.forEach.call(groups, function (g) {
        g.hidden = !g.querySelector("details:not([hidden])");
      });
      empty.style.display = shown ? "none" : "block";
    });
  }
})();
