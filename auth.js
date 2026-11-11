
import { supabase } from "./supabase.js";

// =====================================
// REGISTRASI MAHASISWA
// =====================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nama = document.getElementById("nama").value.trim();
        const nim = document.getElementById("nim").value.trim();
        const email = document.getElementById("emailRegister").value.trim();
        const password = document.getElementById("passwordRegister").value;

        if (!nama || !nim || !email || !password) {
            alert("Semua data wajib diisi.");
            return;
        }

        if (password.length < 8) {
            alert("Password minimal 8 karakter.");
            return;
        }

        const submitButton = registerForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Memproses...";

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        nama: nama,
                        nim: nim
                    }
                }
            });

            if (error) throw error;

            alert(
                "Registrasi berhasil dikirim. Periksa email kamu jika Supabase meminta verifikasi."
            );

            registerForm.reset();

        } catch (error) {
            alert("Registrasi gagal: " + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Daftar Sekarang";
        }
    });
}

// =====================================
// LOGIN MAHASISWA
// =====================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Memproses...";

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

if (profileError) {
    alert("Gagal mengambil data akun: " + profileError.message);
    return;
}

alert("Login berhasil!");

if (profile.role === "admin") {
    window.location.href = "admin.html";
} else {
    window.location.href = "dashboard.html";
}

        } catch (error) {
            alert("Login gagal: " + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Masuk";
        }
    });
}

