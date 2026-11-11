
import { supabase } from "./supabase.js";

// Mengatur tanggal pengajuan secara otomatis
const tanggalInput = document.getElementById("tanggalPengajuan");
tanggalInput.value = new Date().toISOString().split("T")[0];

// Memeriksa login dan mengirim pengajuan
const form = document.getElementById("pengajuanForm");
const pesan = document.getElementById("pesanPengajuan");
const tombol = document.getElementById("submitPengajuan");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    pesan.textContent = "";
    tombol.disabled = true;
    tombol.textContent = "Mengirim...";

    try {
        // Memeriksa pengguna yang sedang login
        const { data: { user }, error: userError } =
            await supabase.auth.getUser();

        if (userError || !user) {
            alert("Silakan login terlebih dahulu.");
            window.location.href = "login.html";
            return;
        }

        // Mengambil data formulir
        const jenisSurat = document.getElementById("jenisSurat").value;
        const keperluan = document.getElementById("keperluan").value;
        const tanggalPengajuan = tanggalInput.value;

        // Menyimpan data ke tabel pengajuan
        const { error } = await supabase
            .from("pengajuan")
            .insert({
                user_id: user.id,
                jenis_surat: jenisSurat,
                keperluan: keperluan,
                tanggal_pengajuan: tanggalPengajuan,
                status: "Menunggu",
                keterangan: ""
            });

        if (error) {
            throw error;
        }

        pesan.style.color = "green";
        pesan.textContent =
            "Pengajuan berhasil dikirim! Data sudah tersimpan.";

        form.reset();
        tanggalInput.value = new Date().toISOString().split("T")[0];

    } catch (error) {
        console.error("Kesalahan pengajuan:", error);

        pesan.style.color = "red";
        pesan.textContent =
            "Pengajuan gagal: " + error.message;

    } finally {
        tombol.disabled = false;
        tombol.textContent = "Kirim Pengajuan";
    }
});
