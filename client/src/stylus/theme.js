module.exports = function () {
  return function (style) {
    style.define("$darkTheme", process.env.NODE_ENV === "production");
  };
};
