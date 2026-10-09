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
    { id: "accueil", href: "index.html", label: "Accueil", icon: "home" },
    { id: "convocation", href: "convocation.html", label: "Convocation<br>et absences", icon: "mail" },
    { id: "deplacement", href: "deplacement.html", label: "Oraux avec<br>déplacement", icon: "plane" },
    { id: "indemnites", href: "indemnites.html", label: "Frais, per diem<br>et indemnités", icon: "coins" },
    { id: "second-groupe", href: "second-groupe.html", label: "Second groupe<br>(oraux en visio)", icon: "monitor" },
    { id: "ressources", href: "ressources.html", label: "Documents et liens", icon: "folder" },
    { id: "faq", href: "faq.html", label: "FAQ", icon: "help" }
  ];

  var QUICK = [
    { href: "indemnites.html#etat-de-frais", label: "État de frais", icon: "file" },
    { href: "convocation.html#absence", label: "Absence", icon: "alert" },
    { href: "second-groupe.html", label: "Second groupe", icon: "monitor" },
    { href: "faq.html", label: "FAQ", icon: "help" }
  ];

  // Portail principal (établissements et coordination).
  var PORTAIL_URL = "https://portail-examens-zese.netlify.app/";

  function icon(name, cls) {
    return '<svg class="icon' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="' + BASE + 'assets/icons.svg#' + name + '"></use></svg>';
  }

  var page = document.body.getAttribute("data-page") || "";

  // Raccourci d'écriture dans les pages : <i data-icon="plane"></i> devient l'icône SVG.
  Array.prototype.forEach.call(document.querySelectorAll("i[data-icon]"), function (el) {
    el.outerHTML = icon(el.getAttribute("data-icon"), el.className);
  });

  /* ---------- Barre latérale + barre du haut ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    var links = NAV.map(function (n) {
      return '<li><a href="' + BASE + n.href + '"' + (n.id === page ? ' aria-current="page"' : "") + ">" +
        icon(n.icon) + "<span>" + n.label + "</span></a></li>";
    }).join("");
    var quick = QUICK.map(function (q) {
      return '<li><a href="' + BASE + q.href + '" title="' + q.label + '">' + icon(q.icon) + "<span>" + q.label + "</span></a></li>";
    }).join("");
    header.className = "site-header";
    header.innerHTML =
      '<aside class="sidebar" id="sidebar">' +
      '<a class="brand" href="' + BASE + 'index.html" aria-label="Examens ZESE – accueil">' +
      '<span class="brand-text"><strong>Examens ZESE</strong><small>Zone Europe du Sud-Est</small></span></a>' +
      '<p class="side-space">Espace enseignants</p>' +
      '<nav class="side-nav" aria-label="Navigation principale"><ul>' + links +
      '<li><a href="mailto:' + CONTACT_EMAIL + '">' + icon("mail") + "<span>Nous contacter</span></a></li>" +
      "</ul></nav>" +
      "</aside>" +
      '<div class="side-backdrop" hidden></div>' +
      '<div class="topbar">' +
      '<button class="nav-toggle" aria-expanded="false" aria-controls="sidebar" aria-label="Ouvrir le menu">' + icon("menu") + "</button>" +
      '<a class="topbar-brand" href="' + BASE + 'index.html"><strong>Examens ZESE</strong></a>' +
      '<ul class="quick-links">' + quick + "</ul>" +
      '<form class="top-search" role="search" action="' + BASE + 'faq.html">' + icon("search") +
      '<label for="top-q" class="sr-only">Rechercher</label>' +
      '<input id="top-q" name="q" type="search" placeholder="Rechercher une information…" autocomplete="off"></form>' +
      '<div class="lang-switch" role="group" aria-label="Langue">' +
      '<button type="button" aria-pressed="true" lang="fr">FR</button>' +
      '<button type="button" aria-pressed="false" lang="en" data-en>EN</button></div>' +
      '<a class="btn-portail" href="' + PORTAIL_URL + '" target="_blank" rel="noopener" aria-label="Portail établissements (nouvel onglet)" title="Portail établissements">' + icon("landmark") + "<span>Portail établissements</span>" + icon("external") + "</a>" +
      "</div>";

    var toggle = header.querySelector(".nav-toggle");
    var sidebar = header.querySelector(".sidebar");
    var backdrop = header.querySelector(".side-backdrop");
    function setMenu(open) {
      sidebar.classList.toggle("open", open);
      backdrop.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    }
    toggle.addEventListener("click", function () { setMenu(!sidebar.classList.contains("open")); });
    backdrop.addEventListener("click", function () { setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    header.querySelector("[data-en]").addEventListener("click", function () {
      toast("The English version is coming soon. / La version anglaise est en préparation.");
    });

    // Sur la page FAQ, la recherche du haut filtre directement les questions.
    header.querySelector(".top-search").addEventListener("submit", function (e) {
      var faqInput = document.getElementById("faq-search");
      if (!faqInput) return;
      e.preventDefault();
      faqInput.value = document.getElementById("top-q").value;
      faqInput.dispatchEvent(new Event("input"));
      faqInput.scrollIntoView({ block: "center" });
    });
  }

  /* ---------- Pied de page ---------- */
  var footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="container footer-inner">' +
      "<span>Examens ZESE – Espace enseignants · Zone Europe du Sud-Est</span>" +
      '<ul class="footer-links">' +
      '<li><a href="' + BASE + 'mentions-legales.html">Mentions légales</a></li>' +
      '<li><a href="' + BASE + 'accessibilite.html">Accessibilité</a></li>' +
      '<li><a href="mailto:' + CONTACT_EMAIL + '">Contact</a></li></ul>' +
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
    var q0 = new URLSearchParams(location.search).get("q");
    if (q0) {
      search.value = q0;
      document.getElementById("top-q").value = q0;
      search.dispatchEvent(new Event("input"));
    }
  }
})();
