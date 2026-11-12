
const templates = [
    {
        nama: "Surat Keterangan Aktif Kuliah",
        deskripsi: "Contoh format keterangan status mahasiswa aktif.",
        icon: "fa-user-graduate",
        isi: `
            <h2>CONTOH SURAT KETERANGAN AKTIF KULIAH</h2>
            <p>Nomor: ....................................</p>
            <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
            <p>Nama: ....................................</p>
            <p>NIM: ....................................</p>
            <p>Program Studi: ....................................</p>
            <p>Fakultas: ....................................</p>
            <p>Adalah benar mahasiswa aktif pada Universitas Negeri Medan.</p>
            <p>Demikian contoh surat ini dibuat untuk keperluan administrasi.</p>
            <br><br>
            <p>Pejabat yang berwenang,</p>
            <br><br><br>
            <p>....................................</p>
        `
    },
    {
        nama: "Surat Pengantar Penelitian",
        deskripsi: "Contoh format surat pengantar untuk kegiatan penelitian.",
        icon: "fa-magnifying-glass",
        isi: `
            <h2>CONTOH SURAT PENGANTAR PENELITIAN</h2>
            <p>Nomor: ....................................</p>
            <p>Perihal: Permohonan Izin Penelitian</p>
            <p>Kepada Yth.</p>
            <p>....................................</p>
            <p>Dengan hormat,</p>
            <p>Melalui contoh surat ini, mahasiswa berikut bermaksud
            melaksanakan kegiatan penelitian untuk keperluan akademik.</p>
            <p>Nama: ....................................</p>
            <p>NIM: ....................................</p>
            <p>Program Studi: ....................................</p>
            <p>Judul Penelitian: ....................................</p>
            <p>Demikian disampaikan untuk menjadi perhatian.</p>
            <br><br>
            <p>Pejabat yang berwenang,</p>
            <br><br><br>
            <p>....................................</p>
        `
    },
    {
        nama: "Surat Keterangan Beasiswa",
        deskripsi: "Contoh format keterangan untuk keperluan beasiswa.",
        icon: "fa-award",
        isi: `
            <h2>CONTOH SURAT KETERANGAN BEASISWA</h2>
            <p>Nomor: ....................................</p>
            <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
            <p>Nama: ....................................</p>
            <p>NIM: ....................................</p>
            <p>Program Studi: ....................................</p>
            <p>Fakultas: ....................................</p>
            <p>Surat ini merupakan contoh format keterangan untuk
            keperluan administrasi beasiswa.</p>
            <br><br>
            <p>Pejabat yang berwenang,</p>
            <br><br><br>
            <p>....................................</p>
        `
    },
    {
        nama: "Surat Pengantar PKL",
        deskripsi: "Contoh format pengantar praktik kerja lapangan.",
        icon: "fa-briefcase",
        isi: `
            <h2>CONTOH SURAT PENGANTAR PKL</h2>
            <p>Nomor: ....................................</p>
            <p>Perihal: Pengantar Praktik Kerja Lapangan</p>
            <p>Kepada Yth.</p>
            <p>....................................</p>
            <p>Dengan hormat,</p>
            <p>Melalui contoh surat ini, kami memperkenalkan mahasiswa:</p>
            <p>Nama: ....................................</p>
            <p>NIM: ....................................</p>
            <p>Program Studi: ....................................</p>
            <p>Untuk melaksanakan kegiatan Praktik Kerja Lapangan (PKL).</p>
            <br><br>
            <p>Pejabat yang berwenang,</p>
            <br><br><br>
            <p>....................................</p>
        `
    },
    {
        nama: "Surat Keterangan Berkelakuan Baik",
        deskripsi: "Contoh format keterangan untuk keperluan administrasi.",
        icon: "fa-file-circle-check",
        isi: `
            <h2>CONTOH SURAT KETERANGAN BERKELAKUAN BAIK</h2>
            <p>Nomor: ....................................</p>
            <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
            <p>Nama: ....................................</p>
            <p>NIM: ....................................</p>
            <p>Program Studi: ....................................</p>
            <p>Fakultas: ....................................</p>
            <p>Surat ini merupakan contoh format referensi administrasi.</p>
            <br><br>
            <p>Pejabat yang berwenang,</p>
            <br><br><br>
            <p>....................................</p>
        `
    }
];

const daftar = document.getElementById("daftarTemplate");
const modal = document.getElementById("modalTemplate");
const isi = document.getElementById("isiTemplate");

let templateAktif = null;

templates.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "template-card";

    card.innerHTML = `
        <div class="template-icon">
            <i class="fas ${item.icon}"></i>
        </div>
        <h3>${item.nama}</h3>
        <p>${item.deskripsi}</p>
        <button class="template-view" data-index="${index}">
            <i class="fas fa-eye"></i> Lihat Contoh
        </button>
    `;

    daftar.appendChild(card);
});

daftar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-index]");
    if (!button) return;

    templateAktif = templates[Number(button.dataset.index)];

    isi.innerHTML = `
        <div class="contoh-surat">
            <h3>UNIVERSITAS NEGERI MEDAN</h3>
            <p>CONTOH FORMAT — BUKAN DOKUMEN RESMI</p>
            <hr>
            ${templateAktif.isi}
        </div>
    `;

    modal.classList.add("active");
});

document.getElementById("tutupModal").addEventListener("click", () => {
    modal.classList.remove("active");
});

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.remove("active");
    }
});

document.getElementById("cetakTemplate").addEventListener("click", () => {
    if (!templateAktif) return;

    const isiCetak = isi.innerHTML;
    const jendela = window.open("", "_blank");

    if (!jendela) {
        alert("Izinkan pop-up pada browser untuk mencetak.");
        return;
    }

    jendela.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${templateAktif.nama}</title>
            <style>
                body {
                    font-family: "Times New Roman", serif;
                    padding: 40px;
                    color: black;
                    line-height: 1.6;
                }
                h2, h3, p { text-align: center; }
                .contoh-surat p { text-align: left; }
                .contoh-surat > p:first-of-type {
                    text-align: center;
                    font-weight: bold;
                }
                @media print {
                    body { padding: 20px; }
                }
            </style>
        </head>
        <body>${isiCetak}</body>
        </html>
    `);

    jendela.document.close();
    jendela.focus();
    jendela.print();
});
