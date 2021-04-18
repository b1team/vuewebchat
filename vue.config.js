module.exports = {
	transpileDependencies: ["vuetify"],
	devServer: { port: 8000, proxy: "http://0.0.0.0/" },
};
