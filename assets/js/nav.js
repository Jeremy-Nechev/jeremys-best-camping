/* Header navigation: mobile panel + dropdown menus */
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('primary-nav');
  var menus = [].slice.call(document.querySelectorAll('.has-menu'));
  var mobile = function () { return window.matchMedia('(max-width: 820px)').matches; };

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.querySelector('.menu-label').textContent = open ? 'Menu' : 'Close';
    });
  }

  function close(except) {
    menus.forEach(function (m) {
      if (m === except) return;
      m.setAttribute('data-open', 'false');
      m.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
    });
  }

  menus.forEach(function (m) {
    var btn = m.querySelector('.nav-link');

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = m.getAttribute('data-open') === 'true';
      close(m);
      m.setAttribute('data-open', String(!open));
      btn.setAttribute('aria-expanded', String(!open));
    });

    m.addEventListener('mouseenter', function () {
      if (mobile()) return;
      close(m);
      m.setAttribute('data-open', 'true');
      btn.setAttribute('aria-expanded', 'true');
    });

    m.addEventListener('mouseleave', function () {
      if (mobile()) return;
      m.setAttribute('data-open', 'false');
      btn.setAttribute('aria-expanded', 'false');
    });

    m.addEventListener('focusout', function (e) {
      if (mobile()) return;
      if (!m.contains(e.relatedTarget)) {
        m.setAttribute('data-open', 'false');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-menu')) close(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close(null);
  });
})();
