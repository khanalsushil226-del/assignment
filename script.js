const loginForm = document.getElementById("loginForm");
const role = document.getElementById("role");
const username = document.getElementById("username");
const password = document.getElementById("password");
const showPassword = document.getElementById("showPassword");
const loginMessage = document.getElementById("loginMessage");

showPassword.addEventListener("click", () => {
    const isPasswordHidden = password.type === "password";

    password.type = isPasswordHidden ? "text" : "password";

    showPassword.textContent = isPasswordHidden
        ? "Hide Password"
        : "Show Password";
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedRole = role.value;
    const enteredUsername = username.value.trim();
    const enteredPassword = password.value;

    loginMessage.textContent = "";
    loginMessage.style.color = "";

    if (!selectedRole || !enteredUsername || !enteredPassword) {
        loginMessage.textContent = "Please fill in all fields.";
        loginMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5001/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: enteredUsername,
                password: enteredPassword
            })
        });

        const result = await response.json();

        if (!response.ok) {
            loginMessage.textContent = result.message;
            loginMessage.style.color = "red";
            return;
        }

        if (result.user.role !== selectedRole) {
            loginMessage.textContent = "The selected role does not match your account.";
            loginMessage.style.color = "red";
            return;
        }

        localStorage.setItem("username", result.user.username);
        localStorage.setItem("email", result.user.email);
        localStorage.setItem("role", result.user.role);
        localStorage.setItem("userId", result.user.id);

        loginMessage.textContent = result.message;
        loginMessage.style.color = "green";

        window.location.assign("dashboard.html");

    } catch (error) {
        loginMessage.textContent = "Unable to connect to the server.";
        loginMessage.style.color = "red";
    }
});