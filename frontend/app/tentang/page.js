import {
  Satellite,
  TreeDeciduous,
  BarChart3,
  Filter,
  Search,
  MapPin,
  Database,
  Monitor,
  Server,
  Layers,
} from 'lucide-react';

export const metadata = {
  title: 'Tentang Sistem — WebGIS Sawit',
  description: 'Informasi tentang Sistem Informasi Geografis Berbasis Web untuk Pemetaan Perkebunan Kelapa Sawit di Palangka Raya.',
};

const FEATURES = [
  {
    icon: Satellite,
    title: 'Pemetaan Digital',
    desc: 'Digitasi titik-titik pohon kelapa sawit menggunakan citra satelit beresolusi tinggi untuk menghasilkan data spasial yang akurat dan terukur.',
  },
  {
    icon: TreeDeciduous,
    title: 'Klasifikasi Kondisi Pohon',
    desc: 'Setiap pohon diklasifikasikan ke dalam lima kategori kondisi—sehat, kecil, kuning, tidak terawat, dan mati—sehingga pemilik lahan dapat mengidentifikasi pohon mana yang memerlukan perhatian khusus.',
  },
  {
    icon: BarChart3,
    title: 'Statistik Real-Time',
    desc: 'Panel ringkasan menampilkan jumlah pohon per kategori kondisi serta luas blok perkebunan secara real-time, memudahkan pengambilan keputusan berbasis data.',
  },
  {
    icon: Filter,
    title: 'Filter Interaktif',
    desc: 'Pengguna dapat memfilter tampilan peta berdasarkan kondisi pohon sehingga analisis visual dapat difokuskan pada aspek tertentu yang diminati.',
  },
  {
    icon: Search,
    title: 'Pencarian Cepat',
    desc: 'Fitur pencarian memungkinkan pengguna menemukan pohon tertentu berdasarkan nomor identifikasi dan langsung diarahkan ke lokasinya pada peta.',
  },
  {
    icon: MapPin,
    title: 'Informasi Detail Pohon',
    desc: 'Setiap titik pohon dapat diklik untuk melihat informasi lengkap termasuk ID pohon, kondisi, tingkat kepercayaan klasifikasi, serta catatan deskriptif yang dapat diedit.',
  },
];

const TECH_STACK = [
  { icon: Monitor, name: 'Next.js 14', role: 'Frontend framework dengan App Router untuk rendering halaman yang cepat dan SEO-friendly.' },
  { icon: Layers, name: 'Leaflet.js', role: 'Library peta interaktif open-source untuk visualisasi data geospasial di browser.' },
  { icon: Server, name: 'Express.js', role: 'Backend REST API yang menjembatani database spasial dengan frontend.' },
  { icon: Database, name: 'MySQL 8.0+', role: 'Database relasional dengan fitur spatial built-in (ST_AsGeoJSON, POINT, POLYGON).' },
];

export default function TentangPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-8 lg:py-16">
        {/* Hero */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <Satellite size={14} />
            Analisis Spasial — Kelompok 8
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Tentang Sistem WebGIS
            <br />
            <span className="text-emerald-600">Kelapa Sawit</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600" style={{ textAlign: 'justify' }}>
            Sistem Informasi Geografis Berbasis Web (WebGIS) ini dikembangkan sebagai solusi digital
            untuk memvisualisasikan dan menganalisis sebaran pohon kelapa sawit di wilayah Palangka Raya,
            Kalimantan Tengah. Dengan memanfaatkan teknologi pemetaan modern, sistem ini memungkinkan
            pemilik lahan, pengelola kebun, dan pemeriksa lapangan untuk memantau kondisi perkebunan
            secara efisien tanpa harus melakukan inspeksi fisik ke seluruh area kebun.
          </p>
        </header>

        {/* Kebermanfaatan */}
        <section className="mb-14">
          <h2 className="mb-2 text-center text-xl font-bold text-gray-900">Kebermanfaatan Sistem</h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-gray-500">
            Berikut adalah manfaat utama yang diberikan oleh sistem WebGIS Kelapa Sawit kepada para pemangku kepentingan.
          </p>

          <div className="space-y-4">
            {[
              'Pemilik lahan dapat mengetahui secara visual dan terperinci kondisi setiap pohon sawit di lahannya—apakah pohon tersebut dalam kondisi sehat, masih kecil dan dalam tahap pertumbuhan, menunjukkan gejala menguning, tidak terawat, atau bahkan sudah mati—tanpa perlu turun langsung ke lapangan.',
              'Pengelola kebun dapat menggunakan data statistik agregat yang disediakan sistem untuk merencanakan kegiatan perawatan, pemupukan, atau penggantian pohon secara lebih terarah dan efisien, sehingga mengurangi biaya operasional yang tidak perlu.',
              'Pemeriksa lapangan dapat melakukan validasi data kondisi pohon secara cepat dengan mencocokkan informasi di peta digital dengan kondisi aktual di lapangan, serta menambahkan catatan deskriptif pada setiap titik pohon sebagai dokumentasi temuan.',
              'Pihak manajemen dapat memanfaatkan fitur filter dan pencarian untuk menganalisis pola persebaran pohon bermasalah, mengidentifikasi area-area yang memerlukan intervensi segera, dan mengoptimalkan alokasi sumber daya perawatan kebun.',
              'Secara keseluruhan, sistem ini mendukung prinsip pertanian presisi (precision agriculture) di mana setiap keputusan pengelolaan kebun didasarkan pada data spasial yang akurat, bukan sekadar estimasi atau pengamatan kasar.',
            ].map((text, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-gray-700" style={{ textAlign: 'justify' }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Fitur Utama */}
        <section className="mb-14">
          <h2 className="mb-2 text-center text-xl font-bold text-gray-900">Fitur Utama</h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-gray-500">
            Fitur-fitur yang tersedia untuk mendukung analisis dan monitoring perkebunan kelapa sawit.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                  <Icon size={20} />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-xs leading-relaxed text-gray-600" style={{ textAlign: 'justify' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-14">
          <h2 className="mb-2 text-center text-xl font-bold text-gray-900">Arsitektur Teknologi</h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-gray-500">
            Teknologi yang digunakan dalam pengembangan sistem ini.
          </p>

          {/* Architecture diagram */}
          <div className="mb-8 flex items-center justify-center gap-3 text-xs font-medium text-gray-600">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">Browser</div>
            <span className="text-gray-400">⇄</span>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700">Next.js + Leaflet</div>
            <span className="text-gray-400">⇄</span>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700">Express.js API</div>
            <span className="text-gray-400">⇄</span>
            <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-purple-700">MySQL 8.0+</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {TECH_STACK.map(({ icon: Icon, name, role }) => (
              <div key={name} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
                  <p className="text-xs leading-relaxed text-gray-600" style={{ textAlign: 'justify' }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Info */}
        <section className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Data Perkebunan</h2>
          <p className="mb-4 text-sm leading-relaxed text-gray-600" style={{ textAlign: 'justify' }}>
            Data spasial yang digunakan dalam sistem ini diperoleh melalui proses digitasi pada citra satelit
            wilayah Palangka Raya. Dataset mencakup satu blok perkebunan kelapa sawit beserta 250 titik
            pohon yang telah diklasifikasikan berdasarkan kondisi visualnya.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-white p-3 ring-1 ring-gray-200">
              <div className="text-2xl font-bold text-emerald-600">250</div>
              <div className="text-xs text-gray-500">Titik Pohon</div>
            </div>
            <div className="rounded-lg bg-white p-3 ring-1 ring-gray-200">
              <div className="text-2xl font-bold text-emerald-600">5</div>
              <div className="text-xs text-gray-500">Kondisi</div>
            </div>
            <div className="rounded-lg bg-white p-3 ring-1 ring-gray-200">
              <div className="text-2xl font-bold text-emerald-600">8.5</div>
              <div className="text-xs text-gray-500">Hektar Luas</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          Tugas Besar Analisis Spasial · Kelompok 8 · Palangka Raya, Kalimantan Tengah
        </footer>
      </div>
    </div>
  );
}
