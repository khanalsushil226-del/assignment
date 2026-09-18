const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const showPasswordButton = document.getElementById("showPassword");
const loginMessage = document.getElementById("loginMessage");
const roleInput = document.getElementById("role");
const usernameInput = document.getElementById("username");

showPasswordButton.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    showPasswordButton.textContent = isPassword ? "Hide Password" : "Show Password";
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const role = roleInput.value;
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    loginMessage.textContent = "";
    loginMessage.style.color = "";

    if (!role) {
        loginMessage.textContent = "Please select your role.";
        loginMessage.style.color = "#dc3545";
        return;
    }

    if (!username || !password) {
        loginMessage.textContent = "Please fill in all fields.";
        loginMessage.style.color = "#dc3545";
        return;
    }

    if (password.length < 6) {
        loginMessage.textContent = "Password must contain at least 6 characters.";
        loginMessage.style.color = "#dc3545";
        return;
    }

    loginMessage.textContent = `Demo login successful as ${role}.`;
    loginMessage.style.color = "#056c24";
});

const forgotPasswordLink = document.querySelector(".forgot-password");

forgotPasswordLink.addEventListener("click", (event) => {
    event.preventDefault();

    loginMessage.textContent = "Password recovery will be available soon.";
    loginMessage.style.color = "#056c24";
});