const options = {
   animateHistoryBrowsing: true,
   plugins: [
      new SwupScrollPlugin({
         animateScroll: false,
      }),
      new SwupHeadPlugin()
   ]
};
const swup = new Swup(options);
