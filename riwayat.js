
import { supabase } from "./supabase.js";

// Mengambil elemen HTML
const daftarRiwayat = document.getElementById("daftarRiwayat");
const pesanRiwayat = document.getElementById("pesanRiwayat");

const notificationButton =
    document.getElementById("notificationButton");

const notificationCount =
    document.getElementById("notificationCount");

const notificationList =
    document.getElementById("notificationList");

const notificationItems =
    document.getElementById("notificationItems");

let userLogin = null;


// ======================================
// 1. MEMERIKSA LOGIN MAHASISWA
// ======================================

async function periksaLogin() {

    const { data: { user }, error } =
        await supabase.auth.getUser();

    if (error || !user) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "login.html";
        return false;
    }

    userLogin = user;
    return true;
}


// ======================================
// 2. FORMAT TANGGAL
// ======================================

function formatTanggal(tanggal) {

    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}


// ======================================
// 3. MEMUAT RIWAYAT PENGAJUAN
// ======================================

async function loadRiwayat() {

    try {

        const { data, error } = await supabase
            .from("pengajuan")
            .select(`
                jenis_surat,
                keperluan,
                tanggal_pengajuan,
                status,
                keterangan
            `)
            .eq("user_id", userLogin.id)
            .order("tanggal_pengajuan", {
                ascending: false
            });

        if (error) throw error;

        pesanRiwayat.textContent = "";

        // Jika belum ada pengajuan
        if (!data || data.length === 0) {

            daftarRiwayat.innerHTML = `
                <tr>
                    <td colspan="6">
                        Belum ada pengajuan surat.
                    </td>
                </tr>
            `;

            return;
        }

        daftarRiwayat.innerHTML = "";

        data.forEach((item, index) => {

            const status = item.status || "Menunggu";

            // Menentukan warna status
            const statusClass = {
                "Menunggu": "status-menunggu",
                "Sedang Diproses": "status-diproses",
                "Disetujui": "status-disetujui",
                "Ditolak": "status-ditolak"
            }[status] || "status-lainnya";

            const baris = document.createElement("tr");

            const nilai = [
                index + 1,
                item.jenis_surat || "-",
                item.keperluan || "-",
                formatTanggal(item.tanggal_pengajuan),
                status,
                item.keterangan || "-"
            ];

            nilai.forEach((isi, kolomIndex) => {

                const cell = document.createElement("td");

                // Kolom status menggunakan badge
                if (kolomIndex === 4) {

                    const badge = document.createElement("span");

                    badge.className =
                        `status-badge ${statusClass}`;

                    badge.textContent = status;

                    cell.appendChild(badge);

                } else {

                    cell.textContent = isi;

                }

                baris.appendChild(cell);

            });

            daftarRiwayat.appendChild(baris);

        });

    } catch (error) {

        console.error("Gagal memuat riwayat:", error);

        pesanRiwayat.textContent =
            "Gagal memuat riwayat: " + error.message;

        pesanRiwayat.style.color = "red";

        daftarRiwayat.innerHTML = `
            <tr>
                <td colspan="6">
                    Data tidak dapat ditampilkan.
                </td>
            </tr>
        `;
    }
}


// ======================================
// 4. MEMUAT NOTIFIKASI
// ======================================

async function loadNotifikasi() {

    try {

        const { data, error } = await supabase
            .from("notifikasi")
            .select(`
                id,
                judul,
                pesan,
                dibaca,
                created_at
            `)
            .eq("user_id", userLogin.id)
            .order("created_at", {
                ascending: false
            });

        if (error) throw error;

        // Menghitung notifikasi yang belum dibaca
        const belumDibaca = data.filter(
            item => !item.dibaca
        );

        notificationCount.textContent =
            belumDibaca.length;

        notificationItems.innerHTML = "";

        // Jika belum ada notifikasi
        if (data.length === 0) {

            notificationItems.textContent =
                "Belum ada notifikasi.";

            return;
        }

        // Menampilkan setiap notifikasi
        data.forEach(item => {

            const kotak = document.createElement("div");

            kotak.className = "notification-item";

            if (!item.dibaca) {
                kotak.classList.add("unread");
            }

            const judul = document.createElement("strong");
            judul.textContent = item.judul;

            const pesan = document.createElement("p");
            pesan.textContent = item.pesan;

            const tanggal = document.createElement("small");

            tanggal.textContent =
                new Date(item.created_at).toLocaleString("id-ID");

            kotak.append(judul, pesan, tanggal);

            // Tombol tandai sudah dibaca
            if (!item.dibaca) {

                const tombol = document.createElement("button");

                tombol.type = "button";
                tombol.textContent = "Tandai sudah dibaca";

                tombol.addEventListener("click", async () => {

                    tombol.disabled = true;

                    const { error: updateError } = await supabase
                        .from("notifikasi")
                        .update({ dibaca: true })
                        .eq("id", item.id)
                        .eq("user_id", userLogin.id);

                    if (updateError) {

                        alert(
                            "Gagal memperbarui notifikasi: " +
                            updateError.message
                        );

                        tombol.disabled = false;
                        return;
                    }

                    // Memuat ulang notifikasi
                    await loadNotifikasi();

                });

                kotak.appendChild(tombol);
            }

            notificationItems.appendChild(kotak);

        });

    } catch (error) {

        console.error("Gagal memuat notifikasi:", error);

        notificationItems.textContent =
            "Notifikasi tidak dapat dimuat: " +
            error.message;

    }
}


// ======================================
// 5. MEMBUKA DAN MENUTUP NOTIFIKASI
// ======================================

notificationButton.addEventListener("click", () => {

    notificationList.classList.toggle("show");

});


// ======================================
// 6. MENJALANKAN HALAMAN
// ======================================

async function mulai() {

    const berhasilLogin = await periksaLogin();

    if (!berhasilLogin) return;

    await Promise.all([
        loadRiwayat(),
        loadNotifikasi()
    ]);

}

mulai();

