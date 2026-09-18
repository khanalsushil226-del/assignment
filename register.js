const registerForm = document.getElementById("registerForm");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");
const showRegisterPassword = document.getElementById("showRegisterPassword");
const registerMessage = document.getElementById("registerMessage");

showRegisterPassword.addEventListener("click", () => {
    const isPassword = registerPassword.type === "password";

    registerPassword.type = isPassword ? "text" : "password";
    confirmPassword.type = isPassword ? "text" : "password";

    showRegisterPassword.textContent = isPassword ? "Hide Password" : "Show Password";
});

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const role = document.getElementById("registerRole").value;
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = registerPassword.value;
    const confirm = confirmPassword.value;

    registerMessage.textContent = "";
    registerMessage.style.color = "";

    if (!role || !username || !email || !password || !confirm) {
        registerMessage.textContent = "Please fill in all fields.";
        registerMessage.style.color = "#dc3545";
        return;
    }

    if (username.length < 3) {
        registerMessage.textContent = "Username must contain at least 3 characters.";
        registerMessage.style.color = "#dc3545";
        return;
    }

    if (password.length < 6) {
        registerMessage.textContent = "Password must contain at least 6 characters.";
        registerMessage.style.color = "#dc3545";
        return;
    }

    if (password !== confirm) {
        registerMessage.textContent = "Passwords do not match.";
        registerMessage.style.color = "#dc3545";
        return;
    }

    registerMessage.textContent = `Demo registration successful as ${role}.`;
    registerMessage.style.color = "#056c24";
});