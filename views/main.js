document.addEventListener("click", (e) => {

    const targetElement = e.target.closest("a") || e.target.closest("div") || e.target;
    const targetText = (targetElement.innerText || "").trim();

    const link = e.target.closest("a");
    const href = link ? link.getAttribute("href") : "";

    if (href === "/cennik" || targetText === "Cennik") {
        const isEbok = window.location.pathname.toLowerCase().includes("ebok");
        e.preventDefault();
        window.location.href = isEbok ? "ebok-cennik.html" : "cennik-gosc.html";
        return;
    }
    if (href === "/komunikaty" || targetText === "Aktualności / Komunikaty") {
        const isEbok = window.location.pathname.toLowerCase().includes("ebok");
        e.preventDefault();
        window.location.href = isEbok ? "ebok-komunikaty.html" : "komunikaty-gosc.html";
        return;
    }
    if (href === "/logowanie" || href === "/login" || targetText === "Zaloguj się") {
        e.preventDefault();
        window.location.href = "login.html";
        return;
    }
    if (href === "/") {
        e.preventDefault();
        window.location.href = "index.html";
        return;
    }

    if (targetText.includes("Odczyt Licznika")) {
        e.preventDefault();
        window.location.href = "ebok-odczyt.html";
        return;
    }
    if (targetText.includes("Historia Zużycia i Rachunków") || targetText.includes("Historia Zużycia")) {
        e.preventDefault();
        window.location.href = "ebok-historia.html";
        return;
    }
    if (targetText.includes("e-Faktury i Płatności")) {
        e.preventDefault();
        window.location.href = "ebok-faktury.html";
        return;
    }
    if (targetText.includes("Zgłaszanie Awarii")) {
        e.preventDefault();
        window.location.href = "ebok-awarie.html";
        return;
    }
    if (targetText.includes("Archiwum Awarii")) {
        e.preventDefault();
        window.location.href = "ebok-archiwum.html";
        return;
    }
    if (targetText.includes("Program Lojalnościowy")) {
        e.preventDefault();
        window.location.href = "ebok-lojalnosc.html";
        return;
    }
    if (targetText === "Dashboard") {
        e.preventDefault();
        window.location.href = "ebok.html";
        return;
    }
    if (targetText === "Wyloguj") {
        e.preventDefault();
        alert("Wylogowano z systemu.");
        window.location.href = "index.html";
        return;
    }

    if (targetText.includes("e-BOK dla mieszkańców") || 
        targetText.includes("Panel administratora") || 
        targetText.includes("Panel technika") ||
        targetText.includes("Bilansowanie wody") || 
        targetText.includes("Automatyczne faktury")) {
        e.preventDefault();
        window.location.href = "login.html";
        return;
    }
    if (targetText.includes("Mapa interaktywna")) {
        e.preventDefault();
        window.location.href = "komunikaty-gosc.html";
        return;
    }
}, true); 

if (!localStorage.getItem('cenaWoda')) localStorage.setItem('cenaWoda', '5.50');
if (!localStorage.getItem('cenaScieki')) localStorage.setItem('cenaScieki', '6.20');

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname.toLowerCase();

    if (path.includes('login.html')) {
        const btnLogin = document.getElementById('btn-login-submit');
        const selectRole = document.getElementById('roleMock');

        if (btnLogin) {
            btnLogin.addEventListener('click', (e) => {
                e.preventDefault();
                const rola = selectRole ? selectRole.value : 'mieszkaniec';

                if (rola === 'admin') {
                    alert('Logowanie pomyślne. Witamy w panelu Administratora!');
                    window.location.href = "admin.html";
                } else if (rola === 'technik') {
                    alert('Logowanie pomyślne. Witamy w panelu Technika!');
                    window.location.href = "technik.html";
                } else {
                    alert('Logowanie pomyślne. Witamy w e-BOK Mieszkańca!');
                    window.location.href = "ebok.html";
                }
            });
        }
    }

    if (path.includes('index.html') || path.endsWith('/') || path.includes('cennik-gosc.html')) {
        const cWoda = document.getElementById('cena-woda-index') || document.getElementById('w1');
        const cScieki = document.getElementById('cena-scieki-index') || document.getElementById('w2');
        if (cWoda) cWoda.innerText = localStorage.getItem('cenaWoda');
        if (cScieki) cScieki.innerText = localStorage.getItem('cenaScieki');
    }
});