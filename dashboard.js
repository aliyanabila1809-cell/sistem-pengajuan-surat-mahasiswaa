import { supabase } from "./supabase.js";

// Periksa apakah mahasiswa sudah login
async function loadDashboard() {
    const { data: { user }, error: sessionError } =
        await supabase.auth.getUser();

    if (sessionError || !user) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "login.html";
        return;
    }

    // Ambil data profil mahasiswa dari tabel profiles
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("nama, nim, email")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Gagal mengambil profil:", error.message);
        alert("Data profil tidak berhasil dimuat: " + error.message);
        return;
    }

    // Tampilkan data mahasiswa
    document.getElementById("namaMahasiswa").textContent =
        profile.nama || "Mahasiswa";

    document.getElementById("profileNama").textContent =
        profile.nama || "-";

    document.getElementById("profileNim").textContent =
        profile.nim || "-";

    document.getElementById("profileEmail").textContent =
        profile.email || user.email || "-";
}

// Jalankan saat halaman dibuka
loadDashboard();

// Fungsi logout
const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", async function () {
    const yakin = confirm("Apakah kamu yakin ingin keluar?");

    if (!yakin) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Gagal keluar: " + error.message);
        return;
    }

    window.location.href = "login.html";
});
