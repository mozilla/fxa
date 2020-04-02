function normalizeEmail(originalEmail) {
  return originalEmail.toLowerCase();
}

function emailsMatch(firstEmail, secondEmail) {
  // This has traditionally been our comparison method
  return firstEmail.toLowerCase() === secondEmail.toLowerCase();

  // Down the road we should switch to something like this
  // that allows comparison with better unicode support
  // https://github.com/mozilla/fxa/pull/4736#discussion_r402647434
  //
  // return (
  //   firstEmail.localeCompare(secondEmail, undefined, {
  //     // We use 'accent' instead of 'base' here to ensure a character with
  //     // an accent is not considered the same as that character without one
  //     sensitivity: 'accent',
  //   }) === 0
  // );
}

module.exports = {
  normalizeEmail,
  emailsMatch,
};
