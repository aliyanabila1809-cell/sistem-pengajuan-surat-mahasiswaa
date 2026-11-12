
import { supabase } from "./supabase.js";

// =====================================
// PENGATURAN FORMULIR
// =====================================

const tanggalInput = document.getElementById("tanggalPengajuan");
const form = document.getElementById("pengajuanForm");
const pesan = document.getElementById("pesanPengajuan");
const tombol = document.getElementById("submitPengajuan");
const tombolDraft = document.getElementById("simpanDraft");
const fileInput = document.getElementById("dokumenPendukung");

const NAMA_BUCKET = "dokumen-pengajuan";
const MAKSIMAL_FILE = 5 * 1024 * 1024;

const parameterURL = new URLSearchParams(window.location.search);
let draftId = parameterURL.get("id");

tanggalInput.value = new Date().toLocaleDateString("en-CA");

// =====================================
// MENGAMBIL USER LOGIN
// =====================================

async function ambilUser() {
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error || !user) {
        alert("Silakan login terlebih dahulu.");
        window.location.href = "login.html";
        throw new Error("Pengguna belum login.");
    }

    return user;
}

// =====================================
// MENGAMBIL DATA FORMULIR
// =====================================

function ambilDataFormulir() {
    return {
        jenis_surat: document.getElementById("jenisSurat").value,
        keperluan: document.getElementById("keperluan").value,
        tanggal_pengajuan: tanggalInput.value || null
    };
}

// =====================================
// VALIDASI DOKUMEN
// =====================================

function validasiFile(file) {
    if (!file) return;

    const formatDiizinkan = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    if (!formatDiizinkan.includes(file.type)) {
        throw new Error("Format dokumen harus PDF, JPG, atau PNG.");
    }

    if (file.size > MAKSIMAL_FILE) {
        throw new Error("Ukuran dokumen maksimal 5 MB.");
    }
}

// =====================================
// UPLOAD DOKUMEN
// =====================================

async function uploadDokumen(user, idPengajuan, file) {
    if (!file) return;

    validasiFile(file);

    const namaAman = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
    );

    const lokasiFile =
        `${user.id}/${idPengajuan}/${Date.now()}_${namaAman}`;

    const { error: uploadError } = await supabase.storage
        .from(NAMA_BUCKET)
        .upload(lokasiFile, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (uploadError) {
        throw new Error(
            "Dokumen gagal diunggah: " + uploadError.message
        );
    }

    const { error: dokumenError } = await supabase
        .from("dokumen")
        .insert({
            pengajuan_id: idPengajuan,
            nama_file: file.name,
            lokasi_file: lokasiFile,
            tanggal_upload: new Date().toISOString()
        });

    if (dokumenError) {
        throw new Error(
            "Dokumen terunggah, tetapi informasinya gagal disimpan: " +
            dokumenError.message
        );
    }
}

// =====================================
// MENYIMPAN ATAU MEMPERBARUI DRAFT
// =====================================

async function simpanDraft() {
    pesan.textContent = "";
    tombolDraft.disabled = true;
    tombolDraft.textContent = "Menyimpan Draft...";

    try {
        const user = await ambilUser();
        const dataForm = ambilDataFormulir();
        const file = fileInput.files[0];

        if (
            !dataForm.jenis_surat &&
            !dataForm.keperluan &&
            !file
        ) {
            throw new Error(
                "Isi setidaknya satu bagian formulir sebelum menyimpan draft."
            );
        }

        validasiFile(file);

        const dataDraft = {
            user_id: user.id,
            jenis_surat: dataForm.jenis_surat,
            keperluan: dataForm.keperluan,
            tanggal_pengajuan: dataForm.tanggal_pengajuan,
            status: "Menunggu",
            keterangan: "",
            is_draft: true
        };

        let pengajuan;
        let error;

        if (draftId) {
            const hasil = await supabase
                .from("pengajuan")
                .update(dataDraft)
                .eq("id", draftId)
                .eq("user_id", user.id)
                .eq("is_draft", true)
                .select("id")
                .single();

            pengajuan = hasil.data;
            error = hasil.error;
        } else {
            const hasil = await supabase
                .from("pengajuan")
                .insert(dataDraft)
                .select("id")
                .single();

            pengajuan = hasil.data;
            error = hasil.error;
        }

        if (error) throw error;

        draftId = pengajuan.id;

        // Upload dokumen jika mahasiswa melampirkan file
        if (file) {
            tombolDraft.textContent = "Mengunggah Dokumen...";
            await uploadDokumen(user, pengajuan.id, file);
            fileInput.value = "";
        }

        // Menyimpan ID draft pada URL
        const url = new URL(window.location.href);
        url.searchParams.set("id", draftId);
        window.history.replaceState({}, "", url);

        pesan.style.color = "green";
        pesan.textContent =
            "Draft berhasil disimpan! Kamu bisa melanjutkannya nanti.";

    } catch (error) {
        console.error("Kesalahan menyimpan draft:", error);
        pesan.style.color = "red";
        pesan.textContent = "Draft gagal disimpan: " + error.message;

    } finally {
        tombolDraft.disabled = false;
        tombolDraft.textContent = "Simpan sebagai Draft";
    }
}

// =====================================
// MEMUAT DRAFT UNTUK DIEDIT
// =====================================

async function muatDraft() {
    if (!draftId) return;

    try {
        const user = await ambilUser();

        const { data, error } = await supabase
            .from("pengajuan")
            .select("*")
            .eq("id", draftId)
            .eq("user_id", user.id)
            .eq("is_draft", true)
            .single();

        if (error) throw error;

        document.getElementById("jenisSurat").value =
            data.jenis_surat || "";

        document.getElementById("keperluan").value =
            data.keperluan || "";

        tanggalInput.value =
            data.tanggal_pengajuan || "";

        document.getElementById("judulForm").textContent =
            "Lanjutkan Draft Pengajuan";

        pesan.style.color = "#047857";
        pesan.textContent =
            "Draft berhasil dimuat. Silakan lanjutkan pengisian.";

    } catch (error) {
        console.error("Kesalahan memuat draft:", error);

        pesan.style.color = "red";
        pesan.textContent =
            "Draft tidak dapat dimuat: " + error.message;
    }
}

// =====================================
// KIRIM PENGAJUAN
// =====================================

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    pesan.textContent = "";
    tombol.disabled = true;
    tombolDraft.disabled = true;
    tombol.textContent = "Mengirim...";

    try {
        const user = await ambilUser();

        const dataForm = ambilDataFormulir();
        const file = fileInput.files[0];

        validasiFile(file);

        const dataPengajuan = {
            user_id: user.id,
            jenis_surat: dataForm.jenis_surat,
            keperluan: dataForm.keperluan,
            tanggal_pengajuan: dataForm.tanggal_pengajuan,
            status: "Menunggu",
            keterangan: "",
            is_draft: false
        };

        let pengajuan;
        let error;

        if (draftId) {
            const hasil = await supabase
                .from("pengajuan")
                .update(dataPengajuan)
                .eq("id", draftId)
                .eq("user_id", user.id)
                .eq("is_draft", true)
                .select("id")
                .single();

            pengajuan = hasil.data;
            error = hasil.error;

        } else {
            const hasil = await supabase
                .from("pengajuan")
                .insert(dataPengajuan)
                .select("id")
                .single();

            pengajuan = hasil.data;
            error = hasil.error;
        }

        if (error) throw error;

        if (file) {
            tombol.textContent = "Mengunggah Dokumen...";
            await uploadDokumen(user, pengajuan.id, file);
        }

        pesan.style.color = "green";
        pesan.textContent =
            "Pengajuan berhasil dikirim dan masuk ke admin!";

        form.reset();
        draftId = null;

        tanggalInput.value =
            new Date().toLocaleDateString("en-CA");

        window.history.replaceState(
            {},
            "",
            window.location.pathname
        );

        document.getElementById("judulForm").textContent =
            "Formulir Pengajuan Surat";

    } catch (error) {
        console.error("Kesalahan pengajuan:", error);

        pesan.style.color = "red";
        pesan.textContent =
            "Pengajuan gagal: " + error.message;

    } finally {
        tombol.disabled = false;
        tombolDraft.disabled = false;
        tombol.textContent = "Kirim Pengajuan";
    }
});

// =====================================
// TOMBOL SIMPAN DRAFT
// =====================================

tombolDraft.addEventListener("click", simpanDraft);

// =====================================
// JALANKAN SAAT HALAMAN DIBUKA
// =====================================

muatDraft();
