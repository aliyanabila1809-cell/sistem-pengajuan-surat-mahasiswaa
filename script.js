
// Tombol pada halaman utama
const startButton = document.getElementById("startButton");
const loginButton = document.getElementById("loginButton");

if (startButton) {
    startButton.addEventListener("click", function () {
        window.location.href = "login.html";
    });
}

if (loginButton) {
    loginButton.addEventListener("click", function () {
        window.location.href = "login.html";
    });
}

// Form login sementara
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        alert("Tampilan login berhasil digunakan. Sistem akun akan dihubungkan ke database pada tahap berikutnya.");
    });
}

// Form registrasi sementara
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const password = document.getElementById("passwordRegister").value;

        if (password.length < 8) {
            alert("Password minimal harus 8 karakter.");
            return;
        }

        alert("Form registrasi berhasil diisi. Penyimpanan akun akan dihubungkan ke database pada tahap berikutnya.");
    });
}

