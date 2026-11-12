
import { supabase } from "./supabase.js";

const daftarDraft = document.getElementById("daftarDraft");
const pesan = document.getElementById("pesanDraft");

let userLogin = null;

// =====================================
// MEMERIKSA LOGIN
// =====================================

async function periksaLogin() {
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error || !user) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "login.html";
        return null;
    }

    return user;
}

// =====================================
// MENAMPILKAN DAFTAR DRAFT
// =====================================

async function tampilkanDraft() {
    daftarDraft.innerHTML =
        '<p class="draft-loading">Memuat daftar draft...</p>';

    try {
        userLogin = await periksaLogin();

        if (!userLogin) return;

        const { data, error } = await supabase
            .from("pengajuan")
            .select("id, jenis_surat, keperluan, tanggal_pengajuan")
            .eq("user_id", userLogin.id)
            .eq("is_draft", true)
            .order("tanggal_pengajuan", { ascending: false });

        if (error) throw error;

        daftarDraft.innerHTML = "";

        if (!data || data.length === 0) {
            daftarDraft.innerHTML = `
                <div class="draft-empty">
                    <div class="draft-empty-icon">📝</div>
                    <h3>Belum Ada Draft</h3>
                    <p>
                        Kamu belum menyimpan formulir pengajuan.
                        Silakan buat draft jika ingin melanjutkannya nanti.
                    </p>
                    <a href="pengajuan.html" class="auth-button">
                        Buat Pengajuan
                    </a>
                </div>
            `;
            return;
        }

        data.forEach((draft) => {
            const kartu = document.createElement("div");
            kartu.className = "draft-card";

            const judul = document.createElement("h3");
            judul.textContent =
                draft.jenis_surat || "Jenis surat belum dipilih";

            const status = document.createElement("span");
            status.className = "draft-status";
            status.textContent = "Draft";

            const keperluan = document.createElement("p");
            keperluan.textContent =
                draft.keperluan || "Keperluan belum diisi.";

            const tanggal = document.createElement("p");
            tanggal.className = "draft-date";
            tanggal.textContent =
                "Tanggal: " + (draft.tanggal_pengajuan || "-");

            const informasi = document.createElement("div");
            informasi.className = "draft-information";

            informasi.append(judul, status, keperluan, tanggal);

            const tombolAksi = document.createElement("div");
            tombolAksi.className = "draft-actions";

            const tombolLanjut = document.createElement("button");
            tombolLanjut.type = "button";
            tombolLanjut.className = "draft-continue";
            tombolLanjut.textContent = "Lanjutkan";
            tombolLanjut.addEventListener("click", () => {
                window.location.href =
                    `pengajuan.html?id=${encodeURIComponent(draft.id)}`;
            });

            const tombolHapus = document.createElement("button");
            tombolHapus.type = "button";
            tombolHapus.className = "draft-delete";
            tombolHapus.textContent = "Hapus";
            tombolHapus.addEventListener("click", () => {
                hapusDraft(draft.id, tombolHapus);
            });

            tombolAksi.append(tombolLanjut, tombolHapus);
            kartu.append(informasi, tombolAksi);

            daftarDraft.appendChild(kartu);
        });

    } catch (error) {
        console.error("Gagal memuat draft:", error);

        daftarDraft.innerHTML = `
            <p class="draft-error">
                Gagal memuat draft: ${escapeHTML(error.message)}
            </p>
        `;
    }
}

// =====================================
// MENGHAPUS DRAFT
// =====================================

async function hapusDraft(id, tombol) {
    const konfirmasi = confirm(
        "Apakah kamu yakin ingin menghapus draft ini?"
    );

    if (!konfirmasi) return;

    tombol.disabled = true;
    tombol.textContent = "Menghapus...";

    try {
        const { error } = await supabase
            .from("pengajuan")
            .delete()
            .eq("id", id)
            .eq("user_id", userLogin.id)
            .eq("is_draft", true);

        if (error) throw error;

        pesan.style.color = "green";
        pesan.textContent = "Draft berhasil dihapus.";

        await tampilkanDraft();

    } catch (error) {
        console.error("Gagal menghapus draft:", error);

        pesan.style.color = "red";
        pesan.textContent =
            "Draft gagal dihapus: " + error.message;

        tombol.disabled = false;
        tombol.textContent = "Hapus";
    }
}

// =====================================
// MENGAMANKAN PESAN ERROR
// =====================================

function escapeHTML(teks) {
    return String(teks).replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[karakter]);
}

// =====================================
// JALANKAN HALAMAN
// =====================================

tampilkanDraft();
