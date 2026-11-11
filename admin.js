
import { supabase } from "./supabase.js";

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

let semuaPengajuan = [];
let pengajuanTerpilih = null;

// Memeriksa akun admin
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

// Mengambil data pengajuan
async function ambilPengajuan() {
    tabelPengajuan.innerHTML = `
        <tr><td colspan="7">Memuat data pengajuan...</td></tr>
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
                    Gagal mengambil data: ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
        return;
    }

    semuaPengajuan = data || [];

    tampilkanStatistik();
    tampilkanTabel();
}

// Statistik pengajuan
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

// Pengamanan teks dari database
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Mengubah status menjadi kelas CSS
function kelasStatus(status) {
    const daftarStatus = {
        "Menunggu": "menunggu",
        "Sedang Diproses": "diproses",
        "Disetujui": "disetujui",
        "Ditolak": "ditolak"
    };

    return daftarStatus[status] || "lainnya";
}

// Format tanggal Indonesia
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

// Menampilkan tabel
function tampilkanTabel() {
    const kataKunci = searchInput.value.trim().toLowerCase();
    const statusDipilih = filterStatus.value;

    const hasilFilter = semuaPengajuan.filter(item => {
        const nama = String(item.profiles?.nama || "").toLowerCase();
        const nim = String(item.profiles?.nim || "").toLowerCase();

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

            <td>${escapeHTML(item.profiles?.nama || "-")}</td>

            <td>${escapeHTML(item.profiles?.nim || "-")}</td>

            <td>${escapeHTML(item.jenis_surat || "-")}</td>

            <td>${formatTanggal(item.tanggal_pengajuan)}</td>

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

// Membuka detail pengajuan
function bukaDetail(id) {
    const item = semuaPengajuan.find(
        data => String(data.id) === String(id)
    );

    if (!item) return;

    pengajuanTerpilih = item;

    detailPengajuan.innerHTML = `
        <p><strong>Nama:</strong> ${escapeHTML(item.profiles?.nama || "-")}</p>
        <p><strong>NIM:</strong> ${escapeHTML(item.profiles?.nim || "-")}</p>
        <p><strong>Email:</strong> ${escapeHTML(item.profiles?.email || "-")}</p>
        <p><strong>Jenis Surat:</strong> ${escapeHTML(item.jenis_surat || "-")}</p>
        <p><strong>Tanggal:</strong> ${formatTanggal(item.tanggal_pengajuan)}</p>
        <p><strong>Keperluan:</strong> ${escapeHTML(item.keperluan || "-")}</p>
    `;

    document.getElementById("statusBaru").value = item.status;
    document.getElementById("keteranganBaru").value =
        item.keterangan || "";

    detailModal.classList.add("active");
}

// Menyimpan perubahan status
updateStatusForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!pengajuanTerpilih) return;

    const status = document.getElementById("statusBaru").value;
    const keterangan = document.getElementById("keteranganBaru").value;

    const tombol = updateStatusForm.querySelector(
        "button[type='submit']"
    );

    tombol.disabled = true;
    tombol.textContent = "Menyimpan...";

    const { error } = await supabase
        .from("pengajuan")
        .update({
            status: status,
            keterangan: keterangan
        })
        .eq("id", pengajuanTerpilih.id);

    tombol.disabled = false;
    tombol.textContent = "Simpan Perubahan";

    if (error) {
        alert("Gagal memperbarui pengajuan: " + error.message);
        return;
    }

    alert("Status pengajuan berhasil diperbarui!");

    detailModal.classList.remove("active");
    pengajuanTerpilih = null;

    await ambilPengajuan();
});

// Tombol detail
tabelPengajuan.addEventListener("click", function(event) {
    const tombol = event.target.closest("[data-detail-id]");

    if (tombol) {
        bukaDetail(tombol.dataset.detailId);
    }
});

// Pencarian dan filter
searchInput.addEventListener("input", tampilkanTabel);
filterStatus.addEventListener("change", tampilkanTabel);

// Tutup modal
document.getElementById("closeModal").addEventListener("click", () => {
    detailModal.classList.remove("active");
});

detailModal.addEventListener("click", event => {
    if (event.target === detailModal) {
        detailModal.classList.remove("active");
    }
});

// Logout
document.getElementById("logoutButton").addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Gagal logout: " + error.message);
        return;
    }

    window.location.href = "login.html";
});

// Menjalankan halaman admin
const bolehMasuk = await periksaAdmin();

if (bolehMasuk) {
    await ambilPengajuan();
}

