function removeEmpty(strings) {
  return strings.filter(
    function (string) { return string !== ""; });
}

module.exports = removeEmpty;
