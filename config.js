window.APP_CONFIG = {
  SUPABASE_URL: "https://ikyppjffwcbiwvhjtaxi.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlreXBwamZmd2NiaXd2aGp0YXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MDAxMzIsImV4cCI6MjEwMzE3NjEzMn0.DiVpdV-ZjjXGoFUff2QryatNkbvRHMQVYfsSdY66_Yk",
  APP_NAME: "Absensi UNAI"
};

/* Compatibility fix khusus halaman Admin: menyediakan QRCode.toDataURL()
   tanpa mengubah halaman absensi karyawan. */
(function () {
  if (!/\/admin\//.test(location.pathname)) return;

  document.write('<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\\/script>');

  var QRCodeJs = window.QRCode;
  if (!QRCodeJs) return;

  var QRCodeCompat = {
    toDataURL: function (text, options) {
      options = options || {};
      return new Promise(function (resolve, reject) {
        try {
          var holder = document.createElement('div');
          holder.style.position = 'fixed';
          holder.style.left = '-10000px';
          holder.style.top = '-10000px';
          document.body.appendChild(holder);

          var level = QRCodeJs.CorrectLevel && QRCodeJs.CorrectLevel.M;
          new QRCodeJs(holder, {
            text: String(text || ''),
            width: Number(options.width || 240),
            height: Number(options.width || 240),
            correctLevel: level
          });

          setTimeout(function () {
            try {
              var canvas = holder.querySelector('canvas');
              var image = holder.querySelector('img');
              var dataUrl = canvas ? canvas.toDataURL('image/png') : (image && image.src);
              holder.remove();
              if (dataUrl) resolve(dataUrl);
              else reject(new Error('QR tidak berhasil dirender.'));
            } catch (err) {
              holder.remove();
              reject(err);
            }
          }, 30);
        } catch (err) {
          reject(err);
        }
      });
    }
  };

  try {
    Object.defineProperty(window, 'QRCode', {
      configurable: true,
      get: function () { return QRCodeCompat; },
      set: function () {}
    });
  } catch (_) {
    window.QRCode = QRCodeCompat;
  }
})();
