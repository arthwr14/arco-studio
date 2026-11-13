/* Arco Studio — interações do site (sem dependências) */
(function () {
  "use strict";

  // Número do WhatsApp do estúdio, só dígitos com DDI (ex.: "5511999998888").
  // Vazio = modo demonstração: os botões mostram a mensagem em vez de abrir o WhatsApp.
  var WA_NUMBER = "";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var brl = function (n) { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); };

  /* ---------- WhatsApp ---------- */
  var toast;
  function showDemo(msg) {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "wa-demo";
      toast.setAttribute("role", "dialog");
      toast.setAttribute("aria-modal", "true");
      toast.setAttribute("aria-label", "Prévia da mensagem de WhatsApp");
      toast.innerHTML =
        '<div class="wa-demo__box"><div class="wa-demo__head"><span class="wa-demo__av">A</span><div><b>Arco Studio</b><small>WhatsApp · demonstração</small></div>' +
        '<button type="button" class="wa-demo__x" aria-label="Fechar">×</button></div>' +
        '<div class="wa-demo__chat"><p class="wa-demo__msg"></p></div>' +
        '<p class="wa-demo__note">Num site de verdade, este botão abre o WhatsApp do estúdio com a mensagem acima já escrita. Aqui é só uma demonstração.</p>' +
        '<button type="button" class="btn btn--accent wa-demo__ok">Entendi</button></div>';
      document.body.appendChild(toast);
      toast.addEventListener("click", function (e) {
        if (e.target === toast || e.target.closest(".wa-demo__x, .wa-demo__ok")) closeDemo();
      });
    }
    $(".wa-demo__msg", toast).textContent = msg;
    toast.hidden = false;
    document.body.style.overflow = "hidden";
    $(".wa-demo__ok", toast).focus();
  }
  function closeDemo() { if (toast) { toast.hidden = true; document.body.style.overflow = ""; } }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDemo(); });

  function openWhatsApp(msg) {
    if (WA_NUMBER) window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    else showDemo(msg);
  }
  var DEFAULT_MSG = "Olá! Vim pelo site do Arco Studio e gostaria de agendar um horário.";
  $$("[data-wa]").forEach(function (el) {
    var msg = el.getAttribute("data-wa") || DEFAULT_MSG;
    if (WA_NUMBER) { el.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg); el.target = "_blank"; el.rel = "noopener"; }
    el.addEventListener("click", function (e) { if (!WA_NUMBER) { e.preventDefault(); showDemo(msg); } });
  });

  /* ---------- Header / menu ---------- */
  var header = $(".header");
  var onScroll = function () { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var menuBtn = $(".menu-btn");
  if (menuBtn) {
    var setMenu = function (open) {
      document.body.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    };
    menuBtn.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("menu-open") && !e.target.closest(".nav, .menu-btn")) setMenu(false);
    });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Tabs (preços) ---------- */
  $$("[role=tablist]").forEach(function (list) {
    var tabs = $$("[role=tab]", list);
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); history.replaceState(null, "", "#" + t.id.replace("tab-", "")); });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { var n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n); }
      });
    });
    var fromHash = location.hash && document.getElementById("tab-" + location.hash.slice(1));
    if (fromHash && tabs.indexOf(fromHash) > -1) select(fromHash);
  });

  /* ---------- Calculadora de laser ---------- */
  var calc = $("#laser-calc");
  if (calc) {
    var mode = "pacote";
    var SESSIONS = 6, DISCOUNT = 0.3;
    var out = $("#calc-out");
    var segBtns = $$(".seg button", calc);
    segBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.getAttribute("data-mode");
        segBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        render();
      });
    });
    $$("input[type=checkbox]", calc).forEach(function (c) { c.addEventListener("change", render); });

    function render() {
      var sel = $$("input[type=checkbox]:checked", calc).map(function (c) {
        return { name: c.getAttribute("data-name"), price: Number(c.value) };
      });
      var sum = sel.reduce(function (a, s) { return a + s.price; }, 0);
      var comboOff = sel.length >= 3 ? 0.1 : 0; // 10% a mais a partir de 3 áreas
      var html, msg;
      if (!sel.length) {
        out.innerHTML = '<p class="empty">Marque uma ou mais áreas para ver o valor da sessão e do pacote.</p>';
        $("#calc-btn").setAttribute("data-msg", "Olá! Quero saber mais sobre depilação a laser no Arco Studio.");
        return;
      }
      var names = sel.map(function (s) { return s.name; }).join(", ");
      if (mode === "sessao") {
        var one = Math.round(sum * (1 - comboOff));
        html = sel.map(function (s) { return '<div class="row"><span>' + s.name + '</span><b>' + brl(s.price) + "</b></div>"; }).join("") +
          (comboOff ? '<div class="row"><span>Combo 3+ áreas</span><b>−10%</b></div>' : "") +
          '<div class="total"><small>Sessão avulsa</small><strong>' + brl(one) + "</strong><small>por sessão</small></div>";
        msg = "Olá! Quero agendar uma sessão avulsa de laser: " + names + " (" + brl(one) + ").";
      } else {
        var full = sum * SESSIONS;
        var pack = Math.round(full * (1 - DISCOUNT) * (1 - comboOff));
        html = sel.map(function (s) { return '<div class="row"><span>' + s.name + '</span><b>' + brl(s.price) + "/sessão</b></div>"; }).join("") +
          '<div class="row"><span>Pacote 6 sessões</span><b>−30%</b></div>' +
          (comboOff ? '<div class="row"><span>Combo 3+ áreas</span><b>−10%</b></div>' : "") +
          '<div class="total"><small>De <s>' + brl(full) + "</s> por</small><strong>" + brl(pack) + "</strong><small>ou 6x de " + brl(Math.ceil(pack / 6)) + " sem juros</small></div>";
        msg = "Olá! Tenho interesse no pacote de 6 sessões de laser: " + names + " (" + brl(pack) + "). Posso agendar a avaliação gratuita?";
      }
      out.innerHTML = html;
      $("#calc-btn").setAttribute("data-msg", msg);
    }
    $("#calc-btn").addEventListener("click", function (e) { e.preventDefault(); openWhatsApp(this.getAttribute("data-msg")); });
    render();
  }

  /* ---------- Galeria: filtros + lightbox ---------- */
  var gallery = $(".gallery");
  if (gallery) {
    var chips = $$(".chip");
    var figs = $$("figure", gallery);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var f = c.getAttribute("data-filter");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        figs.forEach(function (fig) { fig.hidden = f !== "all" && fig.getAttribute("data-cat") !== f; });
      });
    });
    var lb = $(".lightbox"), lbImg = $("img", lb), lbCap = $("p", lb), cur = 0, lastFocus;
    var visible = function () { return figs.filter(function (f) { return !f.hidden; }); };
    function show(i) {
      var v = visible(); cur = (i + v.length) % v.length;
      var img = $("img", v[cur]);
      lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = $("figcaption", v[cur]).textContent;
    }
    function close() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    figs.forEach(function (f) {
      $("button", f).addEventListener("click", function () {
        lastFocus = this; show(visible().indexOf(f)); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lb-close", lb).focus();
      });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(cur - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
  }

  /* ---------- Horário de funcionamento ---------- */
  var hours = $("[data-hours]");
  if (hours) {
    // 0 = domingo ... 6 = sábado; [abre, fecha] em horas
    var H = { 0: null, 1: null, 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 17] };
    var now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var row = $('[data-day~="' + d + '"]', hours); if (row) row.classList.add("today");
    var badge = $(".open-badge");
    if (badge) {
      var open = H[d] && h >= H[d][0] && h < H[d][1];
      badge.textContent = open ? "Aberto agora · até " + H[d][1] + "h" : "Fechado agora";
      badge.classList.toggle("closed", !open);
    }
  }

  /* ---------- Formulário de agendamento ---------- */
  var form = $("#booking");
  if (form) {
    var dateIn = $("#f-data", form);
    var t = new Date(); t.setDate(t.getDate() + 1);
    dateIn.min = t.toISOString().slice(0, 10);
    var preset = new URLSearchParams(location.search).get("servico");
    if (preset) $$("#f-serv option", form).forEach(function (o) { if (o.value === preset) o.selected = true; });

    var phone = $("#f-tel", form);
    phone.addEventListener("input", function () {
      var v = phone.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 6) phone.value = "(" + v.slice(0, 2) + ") " + v.slice(2, v.length - 4) + "-" + v.slice(-4);
      else if (v.length > 2) phone.value = "(" + v.slice(0, 2) + ") " + v.slice(2);
      else phone.value = v;
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", form).forEach(function (inp) {
        var f = inp.closest(".field");
        var bad = !inp.value.trim() || (inp === phone && inp.value.replace(/\D/g, "").length < 10) ||
          (inp === dateIn && dateIn.value && dateIn.value < dateIn.min);
        f.classList.toggle("invalid", bad);
        if (bad && ok) { inp.focus(); ok = false; }
      });
      if (!ok) return;
      var per = $("input[name=periodo]:checked", form);
      var dt = dateIn.value.split("-").reverse().join("/");
      var msg = "Olá! Meu nome é " + $("#f-nome", form).value.trim() + ".\n" +
        "Gostaria de agendar: " + $("#f-serv", form).value + "\n" +
        "Data preferida: " + dt + (per ? " (" + per.value + ")" : "") +
        ($("#f-obs", form).value.trim() ? "\nObs.: " + $("#f-obs", form).value.trim() : "");
      openWhatsApp(msg);
    });
    $$("[required]", form).forEach(function (inp) {
      inp.addEventListener("input", function () { inp.closest(".field").classList.remove("invalid"); });
    });
  }

  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
