export const linkedinConnectionScrapper = (usersProfile) => {
  const MutationObserver =
    window.MutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver;

  var observer = new MutationObserver((mutations, observer) => {
    // fired when a mutation occurs
    if (mutations)
      usersProfile = [
        ...document.querySelectorAll("#main ul li[id^='ember']"),
      ].map(
        (user) =>
          user.querySelector("[data-control-name=connection_profile]").href
      );
  });

  observer.observe(document.querySelector("#main ul"), {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true,
  });

  return usersProfile;
};
