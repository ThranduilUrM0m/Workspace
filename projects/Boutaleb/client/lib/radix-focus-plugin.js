module.exports = function ({ addUtilities }) {
  addUtilities({
    '.radix-focus': {
      '@apply outline-none ring-2 ring-offset-2 ring-blue-500': {},
    },
  });
};
