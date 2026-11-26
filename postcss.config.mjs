// PostCSS memproses CSS kita. Di sini kita aktifkan Tailwind + Autoprefixer
// (menambah prefix browser otomatis, mis. -webkit-).
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
