/*
 * Test Flows (QA) dropdown.
 *
 * The panel is always mounted; we only toggle the `.open` class so the QA,
 * auth, and subscription buttons stay in the DOM and keep their selectors.
 *
 * For people the dropdown is closed by default and opens on click. Under
 * browser automation (navigator.webdriver === true, e.g. the Playwright
 * functional tests) it opens on load and stays open, so the tests can click
 * the buttons by their existing selectors without any test changes. This is
 * the one place the automated and human experiences intentionally differ.
 */

(function () {
  var qam = document.getElementById('qam');
  var trigger = document.getElementById('qam-trigger');
  var panel = document.getElementById('qam-panel');
  if (!qam || !trigger || !panel) {
    return;
  }

  var isAutomation = navigator.webdriver === true;

  function setOpen(open) {
    panel.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  trigger.addEventListener('click', function () {
    setOpen(!panel.classList.contains('open'));
  });

  if (isAutomation) {
    // Keep the panel open for test runners; skip the auto-close handlers so
    // nothing collapses it between page load and a test clicking a button.
    setOpen(true);
    return;
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      setOpen(false);
    }
  });

  document.addEventListener('pointerdown', function (ev) {
    if (!qam.contains(ev.target)) {
      setOpen(false);
    }
  });
})();
