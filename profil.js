
import { supabase } from "./supabase.js";

const form = document.getElementById("profilForm");
const namaInput = document.getElementById("namaProfil");
const nimInput = document.getElementById("nimProfil");
const emailInput = document.getElementById("emailProfil");
const pesan = document.getElementById("pesanProfil");
const tombol = document.getElementById("simpanProfil");

let userId = null;

// Mengambil data profil mahasiswa
async function loadProfil() {
    try {
        const { data: { user }, error: userError } =
            await supabase.auth.getUser();

        if (userError || !user) {
            alert("Silakan login terlebih dahulu.");
            window.location.href = "login.html";
            return;
        }

        userId = user.id;
        emailInput.value = user.email || "";

        const { data, error } = await supabase
            .from("profiles")
            .select("nama, nim, email")
            .eq("id", user.id)
            .single();

        if (error) {
            throw error;
        }

        namaInput.value = data.nama || "";
        nimInput.value = data.nim || "";
        emailInput.value = data.email || user.email || "";

    } catch (error) {
        console.error("Gagal mengambil profil:", error);

        pesan.style.color = "red";
        pesan.textContent =
            "Data profil gagal dimuat: " + error.message;
    }
}

// Menyimpan perubahan profil
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!userId) return;

    tombol.disabled = true;
    tombol.textContent = "Menyimpan...";
    pesan.textContent = "";

    try {
        const nama = namaInput.value.trim();
        const nim = nimInput.value.trim();

        if (!nama || !nim) {
            throw new Error("Nama dan NIM wajib diisi.");
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                nama: nama,
                nim: nim
            })
            .eq("id", userId);

        if (error) {
            throw error;
        }

        pesan.style.color = "green";
        pesan.textContent = "Profil berhasil diperbarui.";

    } catch (error) {
        console.error("Gagal memperbarui profil:", error);

        pesan.style.color = "red";
        pesan.textContent =
            "Gagal menyimpan perubahan: " + error.message;

    } finally {
        tombol.disabled = false;
        tombol.textContent = "Simpan Perubahan";
    }
});

loadProfil();
