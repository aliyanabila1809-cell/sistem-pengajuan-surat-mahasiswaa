

import { supabase } from "./supabase.js";

// =====================================
// MENGAMBIL ELEMEN HTML
// =====================================

const tabelPengajuan = document.getElementById("tabelPengajuan");
const totalPengajuan = document.getElementById("totalPengajuan");
const jumlahMenunggu = document.getElementById("jumlahMenunggu");
const jumlahDiproses = document.getElementById("jumlahDiproses");
const jumlahDisetujui = document.getElementById("jumlahDisetujui");
const jumlahDitolak = document.getElementById("jumlahDitolak");

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

const detailModal = document.getElementById("detailModal");
const detailPengajuan = document.getElementById("detailPengajuan");
const updateStatusForm = document.getElementById("updateStatusForm");

const downloadPDF = document.getElementById("downloadPDF");

let semuaPengajuan = [];
let pengajuanTerpilih = null;

// =====================================
// MEMERIKSA AKUN ADMIN
// =====================================

async function periksaAdmin() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "login.html";
        return false;
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.role !== "admin") {
        alert("Akses ditolak. Halaman ini khusus admin.");
        window.location.href = "dashboard.html";
        return false;
    }

    return true;
}

// =====================================
// PENGAMANAN TEKS DARI DATABASE
// =====================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// =====================================
// FORMAT TANGGAL INDONESIA
// =====================================

function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const hasil = new Date(tanggal);

    if (Number.isNaN(hasil.getTime())) {
        return escapeHTML(tanggal);
    }

    return hasil.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// =====================================
// KELAS STATUS
// =====================================

function kelasStatus(status) {
    const daftarStatus = {
        "Menunggu": "menunggu",
        "Sedang Diproses": "diproses",
        "Disetujui": "disetujui",
        "Ditolak": "ditolak"
    };

    return daftarStatus[status] || "lainnya";
}

// =====================================
// MENGAMBIL DATA PENGAJUAN
// =====================================

async function ambilPengajuan() {
    tabelPengajuan.innerHTML = `
        <tr>
            <td colspan="7">Memuat data pengajuan...</td>
        </tr>
    `;

    const { data, error } = await supabase
        .from("pengajuan")
        .select(`
            id,
            user_id,
            jenis_surat,
            keperluan,
            tanggal_pengajuan,
            status,
            keterangan,
            profiles (
                nama,
                nim,
                email
            )
        `)
        .order("tanggal_pengajuan", { ascending: false });

    if (error) {
        tabelPengajuan.innerHTML = `
            <tr>
                <td colspan="7">
                    Gagal mengambil data:
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
        return;
    }

    semuaPengajuan = data || [];

    tampilkanStatistik();
    tampilkanTabel();
}

// =====================================
// STATISTIK PENGAJUAN
// =====================================

function tampilkanStatistik() {
    totalPengajuan.textContent = semuaPengajuan.length;

    jumlahMenunggu.textContent = semuaPengajuan.filter(
        item => item.status === "Menunggu"
    ).length;

    jumlahDiproses.textContent = semuaPengajuan.filter(
        item => item.status === "Sedang Diproses"
    ).length;

    jumlahDisetujui.textContent = semuaPengajuan.filter(
        item => item.status === "Disetujui"
    ).length;

    jumlahDitolak.textContent = semuaPengajuan.filter(
        item => item.status === "Ditolak"
    ).length;
}

// =====================================
// MENAMPILKAN TABEL PENGAJUAN
// =====================================

function tampilkanTabel() {
    const kataKunci = searchInput.value.trim().toLowerCase();
    const statusDipilih = filterStatus.value;

    const hasilFilter = semuaPengajuan.filter(item => {
        const nama = String(
            item.profiles?.nama || ""
        ).toLowerCase();

        const nim = String(
            item.profiles?.nim || ""
        ).toLowerCase();

        const cocokPencarian =
            nama.includes(kataKunci) ||
            nim.includes(kataKunci);

        const cocokStatus =
            !statusDipilih || item.status === statusDipilih;

        return cocokPencarian && cocokStatus;
    });

    if (hasilFilter.length === 0) {
        tabelPengajuan.innerHTML = `
            <tr>
                <td colspan="7">
                    Belum ada pengajuan yang sesuai.
                </td>
            </tr>
        `;
        return;
    }

    tabelPengajuan.innerHTML = hasilFilter.map((item, index) => `
        <tr>
            <td>${index + 1}</td>

            <td>
                ${escapeHTML(item.profiles?.nama || "-")}
            </td>

            <td>
                ${escapeHTML(item.profiles?.nim || "-")}
            </td>

            <td>
                ${escapeHTML(item.jenis_surat || "-")}
            </td>

            <td>
                ${formatTanggal(item.tanggal_pengajuan)}
            </td>

            <td>
                <span class="status-badge status-${kelasStatus(item.status)}">
                    ${escapeHTML(item.status || "Belum ada status")}
                </span>
            </td>

            <td>
                <button
                    class="btn-login"
                    data-detail-id="${escapeHTML(item.id)}"
                    type="button"
                >
                    Detail
                </button>
            </td>
        </tr>
    `).join("");
}

// =====================================
// MENAMPILKAN DOKUMEN MAHASISWA
// =====================================

async function tampilkanDokumen(pengajuanId) {
    let bagianDokumen = document.getElementById("bagianDokumen");

    if (!bagianDokumen) {
        bagianDokumen = document.createElement("div");
        bagianDokumen.id = "bagianDokumen";
        bagianDokumen.className = "detail-dokumen";
        detailPengajuan.appendChild(bagianDokumen);
    }

    bagianDokumen.innerHTML = `
        <h3>Dokumen Persyaratan</h3>
        <p class="dokumen-loading">Memuat dokumen...</p>
    `;

    try {
        const { data: dokumen, error } = await supabase
            .from("dokumen")
            .select("id, nama_file, lokasi_file, tanggal_upload")
            .eq("pengajuan_id", pengajuanId)
            .order("tanggal_upload", { ascending: false });

        if (error) throw error;

        if (!dokumen || dokumen.length === 0) {
            bagianDokumen.innerHTML = `
                <h3>Dokumen Persyaratan</h3>
                <p class="dokumen-kosong">
                    Mahasiswa belum melampirkan dokumen.
                </p>
            `;
            return;
        }

        bagianDokumen.innerHTML = `
            <h3>Dokumen Persyaratan</h3>
            <div id="daftarDokumenAdmin"></div>
        `;

        const daftarDokumen =
            bagianDokumen.querySelector("#daftarDokumenAdmin");

        for (const item of dokumen) {
            const baris = document.createElement("div");
            baris.className = "dokumen-admin-item";

            const nama = document.createElement("span");
            nama.className = "dokumen-admin-nama";
            nama.textContent = item.nama_file || "Dokumen mahasiswa";

            const tombol = document.createElement("button");
            tombol.type = "button";
            tombol.className = "dokumen-download-button";
            tombol.textContent = "Download";

            tombol.addEventListener("click", async () => {
                try {
                    tombol.disabled = true;
                    tombol.textContent = "Menyiapkan...";

                    const { data, error: downloadError } =
                        await supabase.storage
                            .from("dokumen-pengajuan")
                            .createSignedUrl(
                                item.lokasi_file,
                                60,
                                { download: item.nama_file }
                            );

                    if (downloadError) throw downloadError;

                    const link = document.createElement("a");
                    link.href = data.signedUrl;
                    link.download = item.nama_file;

                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                } catch (error) {
                    console.error("Gagal mengunduh dokumen:", error);

                    alert(
                        "Dokumen gagal diunduh: " + error.message
                    );

                } finally {
                    tombol.disabled = false;
                    tombol.textContent = "Download";
                }
            });

            baris.appendChild(nama);
            baris.appendChild(tombol);

            daftarDokumen.appendChild(baris);
        }

    } catch (error) {
        console.error("Gagal mengambil dokumen:", error);

        bagianDokumen.innerHTML = `
            <h3>Dokumen Persyaratan</h3>
            <p class="dokumen-error">
                Gagal memuat dokumen:
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}

// =====================================
// MEMBUKA DETAIL PENGAJUAN
// =====================================

async function bukaDetail(id) {
    const item = semuaPengajuan.find(
        data => String(data.id) === String(id)
    );

    if (!item) return;

    pengajuanTerpilih = item;

    detailPengajuan.innerHTML = `
        <p>
            <strong>Nama:</strong>
            ${escapeHTML(item.profiles?.nama || "-")}
        </p>

        <p>
            <strong>NIM:</strong>
            ${escapeHTML(item.profiles?.nim || "-")}
        </p>

        <p>
            <strong>Email:</strong>
            ${escapeHTML(item.profiles?.email || "-")}
        </p>

        <p>
            <strong>Jenis Surat:</strong>
            ${escapeHTML(item.jenis_surat || "-")}
        </p>

        <p>
            <strong>Tanggal:</strong>
            ${formatTanggal(item.tanggal_pengajuan)}
        </p>

        <p>
            <strong>Keperluan:</strong>
            ${escapeHTML(item.keperluan || "-")}
        </p>
    `;

    document.getElementById("statusBaru").value = item.status;

    document.getElementById("keteranganBaru").value =
        item.keterangan || "";

    detailModal.classList.add("active");

    // Memuat dokumen mahasiswa
    await tampilkanDokumen(id);
}

// =====================================
// MENYIMPAN PERUBAHAN STATUS
// =====================================

updateStatusForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!pengajuanTerpilih) return;

    const status = document.getElementById("statusBaru").value;

    const keterangan =
        document.getElementById("keteranganBaru").value;

    const tombol = updateStatusForm.querySelector(
        "button[type='submit']"
    );

    tombol.disabled = true;
    tombol.textContent = "Menyimpan...";

    try {
        const { error } = await supabase
            .from("pengajuan")
            .update({
                status: status,
                keterangan: keterangan
            })
            .eq("id", pengajuanTerpilih.id);

        if (error) throw error;

        alert("Status pengajuan berhasil diperbarui!");

        detailModal.classList.remove("active");
        pengajuanTerpilih = null;

        await ambilPengajuan();

    } catch (error) {
        alert(
            "Gagal memperbarui pengajuan: " + error.message
        );

    } finally {
        tombol.disabled = false;
        tombol.textContent = "Simpan Perubahan";
    }
});

// =====================================
// TOMBOL DETAIL
// =====================================

tabelPengajuan.addEventListener("click", function(event) {
    const tombol = event.target.closest("[data-detail-id]");

    if (tombol) {
        bukaDetail(tombol.dataset.detailId);
    }
});

// =====================================
// PENCARIAN DAN FILTER
// =====================================

searchInput.addEventListener("input", tampilkanTabel);

filterStatus.addEventListener("change", tampilkanTabel);

// =====================================
// MENUTUP MODAL
// =====================================

document.getElementById("closeModal").addEventListener("click", () => {
    detailModal.classList.remove("active");
});

detailModal.addEventListener("click", event => {
    if (event.target === detailModal) {
        detailModal.classList.remove("active");
    }
});

// =====================================
// DOWNLOAD LAPORAN PENGAJUAN PDF
// =====================================

downloadPDF?.addEventListener("click", async () => {
    try {
        downloadPDF.disabled = true;
        downloadPDF.textContent = "Menyiapkan PDF...";

        const { data, error } = await supabase
            .from("pengajuan")
            .select(`
                id,
                jenis_surat,
                tanggal_pengajuan,
                status,
                profiles (
                    nama,
                    nim
                )
            `)
            .order("tanggal_pengajuan", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            alert(
                "Belum ada data pengajuan untuk dibuat menjadi laporan."
            );
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error(
                "Library PDF belum berhasil dimuat. Periksa koneksi internet."
            );
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("landscape");

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");

        doc.text(
            "LAPORAN PENGAJUAN SURAT MAHASISWA",
            148,
            18,
            { align: "center" }
        );

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.text(
            "Sistem Pengajuan Surat Mahasiswa",
            148,
            25,
            { align: "center" }
        );

        doc.text(
            "Tanggal Cetak: " +
            new Date().toLocaleDateString("id-ID"),
            14,
            35
        );

        const rows = data.map((item, index) => [
            index + 1,
            item.profiles?.nama || "-",
            item.profiles?.nim || "-",
            item.jenis_surat || "-",
            item.tanggal_pengajuan
                ? new Date(item.tanggal_pengajuan)
                    .toLocaleDateString("id-ID")
                : "-",
            item.status || "-"
        ]);

        doc.autoTable({
            startY: 42,

            head: [[
                "No.",
                "Nama Mahasiswa",
                "NIM",
                "Jenis Surat",
                "Tanggal Pengajuan",
                "Status"
            ]],

            body: rows,

            theme: "grid",

            styles: {
                fontSize: 9,
                cellPadding: 3
            },

            headStyles: {
                fillColor: [36, 59, 117],
                textColor: 255,
                halign: "center"
            },

            columnStyles: {
                0: { halign: "center" },
                2: { halign: "center" },
                4: { halign: "center" },
                5: { halign: "center" }
            }
        });

        doc.save(
            "Laporan-Pengajuan-Surat-Mahasiswa.pdf"
        );

    } catch (error) {
        console.error("Gagal membuat PDF:", error);

        alert(
            "Gagal membuat laporan PDF: " + error.message
        );

    } finally {
        downloadPDF.disabled = false;
        downloadPDF.textContent = "Download Laporan PDF";
    }
});

// =====================================
// LOGOUT ADMIN
// =====================================

document.getElementById("logoutButton").addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Gagal logout: " + error.message);
        return;
    }

    window.location.href = "login.html";
});

// =====================================
// MENJALANKAN HALAMAN ADMIN
// =====================================

const bolehMasuk = await periksaAdmin();

if (bolehMasuk) {
    await ambilPengajuan();
}
