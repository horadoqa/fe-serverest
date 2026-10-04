/**
 * ServeRest Auth
 * Login + Cadastro
 */

const API_URL = "https://serverest.dev";

let currentMode = "login";


// =========================
// ELEMENTOS
// =========================

const form = document.getElementById("authForm");

const tabs = document.querySelectorAll(".tab");

const nameField = document.getElementById("nameField");
const adminField = document.getElementById("adminField");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const adminInput = document.getElementById("administrador");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const passwordToggle = document.getElementById("passwordToggle");
const eyeIcon = document.getElementById("eyeIcon");

const submitButton = document.getElementById("submitButton");
const submitText = document.getElementById("submitText");

const alertBox = document.getElementById("alert");

const formKicker = document.getElementById("formKicker");
const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");

const technicalLabel = document.getElementById("technicalLabel");


// =========================
// ALTERAR LOGIN / CADASTRO
// =========================

tabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        const mode = tab.dataset.mode;

        if (mode === currentMode) {
            return;
        }

        setMode(mode);

    });

});


function setMode(mode) {

    currentMode = mode;

    tabs.forEach((tab) => {

        tab.classList.toggle(
            "active",
            tab.dataset.mode === mode
        );

    });


    clearFormErrors();
    hideAlert();


    if (mode === "register") {

        nameField.hidden = false;
        adminField.hidden = false;

        formKicker.textContent = "CREATE ACCOUNT";

        formTitle.textContent = "Crie sua conta.";

        formDescription.textContent =
            "Cadastre-se para acessar o ambiente de testes.";

        submitText.textContent = "Criar conta";

        technicalLabel.textContent =
            "AUTH / REGISTER";

        passwordInput.autocomplete =
            "new-password";

    } else {

        nameField.hidden = true;
        adminField.hidden = true;

        formKicker.textContent =
            "WELCOME BACK";

        formTitle.textContent =
            "Entre na sua conta.";

        formDescription.textContent =
            "Acesse o ambiente de testes do ServeRest.";

        submitText.textContent =
            "Entrar";

        technicalLabel.textContent =
            "AUTH / LOGIN";

        passwordInput.autocomplete =
            "current-password";
    }

}


// =========================
// MOSTRAR / ESCONDER SENHA
// =========================

passwordToggle.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    eyeIcon.textContent =
        isPassword ? "HIDE" : "SHOW";

    passwordToggle.setAttribute(
        "aria-label",
        isPassword
            ? "Ocultar senha"
            : "Mostrar senha"
    );

});


// =========================
// SUBMIT
// =========================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    hideAlert();

    if (!validateForm()) {
        return;
    }

    setLoading(true);

    try {

        if (currentMode === "login") {

            await login();

        } else {

            await register();

        }

    } catch (error) {

        console.error(error);

        showAlert(
            error.message ||
            "Não foi possível completar a operação.",
            "error"
        );

    } finally {

        setLoading(false);

    }

});


// =========================
// LOGIN
// =========================

async function login() {
    const payload = {
        email: emailInput.value.trim(),
        password: passwordInput.value
    };

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await parseResponse(response);

    if (!response.ok) {
        throw new Error(
            data.message || "E-mail ou senha inválidos."
        );
    }

    // Salva o token retornado pela API
    localStorage.setItem(
        "serverest_token",
        data.authorization
    );

    // Salva informações básicas do usuário
    localStorage.setItem(
        "serverest_user",
        JSON.stringify({
            email: payload.email
        })
    );

    showAlert(
        "Autenticação realizada com sucesso.",
        "success"
    );

    submitText.textContent = "Acesso autorizado";

    // Redireciona para o Home
    // setTimeout(() => {
    //     window.location.href = "https://front.serverest.dev/home";
    // }, 500);

    window.location.href = "https://front.serverest.dev/home";
}


// =========================
// CADASTRO
// =========================

async function register() {

    const payload = {

        nome: nameInput.value.trim(),

        email: emailInput.value.trim(),

        password: passwordInput.value,

        administrador:
            adminInput.value

    };


    const response = await fetch(
        `${API_URL}/usuarios`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)
        }
    );


    const data =
        await parseResponse(response);


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Não foi possível criar a conta."
        );

    }


    showAlert(
        "Conta criada com sucesso. Agora faça seu login.",
        "success"
    );


    /*
     * Limpa o formulário
     */

    form.reset();


    /*
     * Volta para o login depois do cadastro
     */

    setTimeout(() => {

        setMode("login");

        emailInput.value =
            payload.email;

    }, 1200);

}


// =========================
// PARSE RESPONSE
// =========================

async function parseResponse(response) {

    try {

        return await response.json();

    } catch {

        return {};

    }

}


// =========================
// VALIDAÇÃO
// =========================

function validateForm() {

    let valid = true;

    clearFormErrors();


    // NOME

    if (currentMode === "register") {

        if (
            nameInput.value.trim().length < 2
        ) {

            setFieldError(
                nameField,
                nameError,
                "Informe seu nome."
            );

            valid = false;

        }

    }


    // EMAIL

    const email =
        emailInput.value.trim();

    if (!email) {

        setFieldError(
            emailInput.parentElement.parentElement,
            emailError,
            "Informe seu e-mail."
        );

        valid = false;

    } else if (!isValidEmail(email)) {

        setFieldError(
            emailInput.parentElement.parentElement,
            emailError,
            "Digite um e-mail válido."
        );

        valid = false;

    }


    // PASSWORD

    if (!passwordInput.value) {

        setFieldError(
            passwordInput.parentElement.parentElement,
            passwordError,
            "Informe sua senha."
        );

        valid = false;

    } else if (
        passwordInput.value.length < 6
    ) {

        setFieldError(
            passwordInput.parentElement.parentElement,
            passwordError,
            "A senha precisa ter pelo menos 6 caracteres."
        );

        valid = false;

    }


    return valid;

}


// =========================
// EMAIL
// =========================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}


// =========================
// ERROS
// =========================

function setFieldError(
    field,
    errorElement,
    message
) {

    field.classList.add("invalid");

    errorElement.textContent =
        message;

}


function clearFormErrors() {

    document
        .querySelectorAll(".field")
        .forEach((field) => {
            field.classList.remove(
                "invalid",
                "valid"
            );
        });


    nameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";

}


// =========================
// ALERT
// =========================

function showAlert(
    message,
    type = "success"
) {

    alertBox.textContent =
        message;

    alertBox.className =
        `alert show ${type}`;

}


function hideAlert() {

    alertBox.textContent = "";

    alertBox.className =
        "alert";

}


// =========================
// LOADING
// =========================

function setLoading(isLoading) {

    submitButton.disabled =
        isLoading;

    submitButton.classList.toggle(
        "loading",
        isLoading
    );


    if (isLoading) {

        submitText.textContent =
            currentMode === "login"
                ? "Autenticando"
                : "Criando conta";

    } else {

        submitText.textContent =
            currentMode === "login"
                ? "Entrar"
                : "Criar conta";

    }

}


// =========================
// FEEDBACK EM TEMPO REAL
// =========================

emailInput.addEventListener(
    "blur",
    () => {

        if (
            emailInput.value &&
            isValidEmail(emailInput.value.trim())
        ) {

            emailInput.parentElement.parentElement
                .classList.remove("invalid");

            emailInput.parentElement.parentElement
                .classList.add("valid");

            emailError.textContent = "";

        }

    }
);


passwordInput.addEventListener(
    "input",
    () => {

        if (
            passwordInput.value.length >= 6
        ) {

            passwordInput.parentElement.parentElement
                .classList.remove("invalid");

            passwordInput.parentElement.parentElement
                .classList.add("valid");

            passwordError.textContent = "";

        }

    }
);
