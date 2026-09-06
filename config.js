window.APP_CONFIG = {
  SUPABASE_URL: "https://ikyppjffwcbiwvhjtaxi.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlreXBwamZmd2NiaXd2aGp0YXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MDAxMzIsImV4cCI6MjEwMzE3NjEzMn0.DiVpdV-ZjjXGoFUff2QryatNkbvRHMQVYfsSdY66_Yk",
  APP_NAME: "Absensi UNAI"
};

/* Admin QR compatibility patch.
   Only runs on /admin/ and does not change employee attendance behavior. */
(function(){
  if (!/\/admin\//.test(location.pathname)) return;

  window.addEventListener('DOMContentLoaded', function(){
    var makeOld = document.getElementById('makeCommonQr');
    var downloadOld = document.getElementById('downloadCommonQr');
    if (!makeOld || !downloadOld) return;

    var makeBtn = makeOld.cloneNode(true);
    var downloadBtn = downloadOld.cloneNode(true);
    makeOld.replaceWith(makeBtn);
    downloadOld.replaceWith(downloadBtn);

    var qrDataUrl = '';
    var productionUrl = 'https://1943003-code.github.io/absensi-klinik-unai/';

    function setStatus(text, ok){
      var e = document.getElementById('commonQrStatus');
      if (!e) return;
      e.textContent = text;
      e.className = 'status ' + (ok ? 'ok' : 'err');
    }

    function loadQrLibrary(){
      return new Promise(function(resolve, reject){
        if (window.QRCode && typeof window.QRCode === 'function') {
          resolve();
          return;
        }
        var existing = document.getElementById('qr-codejs-fallback');
        if (existing) {
          existing.addEventListener('load', resolve, {once:true});
          existing.addEventListener('error', function(){ reject(new Error('Library QR gagal dimuat.')); }, {once:true});
          return;
        }
        var s = document.createElement('script');
        s.id = 'qr-codejs-fallback';
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        s.onload = resolve;
        s.onerror = function(){ reject(new Error('Library QR gagal dimuat.')); };
        document.head.appendChild(s);
      });
    }

    makeBtn.addEventListener('click', async function(){
      var box = document.getElementById('commonQr');
      var urlBox = document.getElementById('commonQrUrl');
      if (urlBox) urlBox.textContent = productionUrl;
      if (!box) return;
      box.innerHTML = '';
      qrDataUrl = '';
      makeBtn.disabled = true;
      setStatus('Membuat QR Umum...', true);

      try {
        await loadQrLibrary();
        if (!window.QRCode || typeof window.QRCode !== 'function') {
          throw new Error('Generator QR tidak tersedia.');
        }

        new window.QRCode(box, {
          text: productionUrl,
          width: 240,
          height: 240,
          correctLevel: window.QRCode.CorrectLevel.M
        });

        await new Promise(function(r){ setTimeout(r, 150); });
        var canvas = box.querySelector('canvas');
        var img = box.querySelector('img');
        if (canvas && typeof canvas.toDataURL === 'function') {
          qrDataUrl = canvas.toDataURL('image/png');
        } else if (img && img.src) {
          qrDataUrl = img.src;
        }
        if (!qrDataUrl) throw new Error('QR tidak dapat dikonversi ke PNG.');

        setStatus('QR Umum berhasil dibuat. Siap dipakai dan didownload.', true);
      } catch (e) {
        setStatus('QR gagal dibuat: ' + (e && e.message ? e.message : String(e)), false);
      } finally {
        makeBtn.disabled = false;
      }
    });

    downloadBtn.addEventListener('click', function(){
      if (!qrDataUrl) {
        alert('Klik Buat QR Umum terlebih dahulu.');
        return;
      }
      var a = document.createElement('a');
      a.download = 'QR-UMUM-ABSENSI.png';
      a.href = qrDataUrl;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  });
})();
