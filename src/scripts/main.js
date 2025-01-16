import { navigate } from "astro:transitions/client";

// LEFT PANEL
document.querySelector(".panel.left").onclick = e => {
    const t = e.target?.classList;
    if (t?.contains("panel") && t?.contains("left")) {
        if (
            location.pathname !== "/" &&
            !document.documentElement.classList.contains("transition")
        ) {
            navigate("/");
        }
    }
};

// MENU
const contactButton = document.querySelector("#contact-button");
const contact = document.querySelector("#contact");
contactButton.onclick = (e) => {
    e.preventDefault();
    contact.classList.toggle("open");
};

// NAVIGATION
let toggleOpen = false;
let toHome = false;
document.addEventListener('astro:before-preparation', (e) => {
    const original = e.loader;
    document.documentElement.classList.add('transition');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    e.loader = async () => {
        await original();
        const hasContent = !!document.querySelector('.panel.right.open');
        const hasContentNew = !!e.newDocument.querySelector('.panel.right.open');
        toggleOpen = hasContent !== hasContentNew;
        if (toggleOpen) {
            e.newDocument.querySelector('.panel.right').classList.toggle('open');
            toHome = !hasContentNew;
            if (toHome && window.matchMedia("(max-width: 64rem)").matches) {
                document.querySelector('.panel.left').classList.toggle('open');
                await new Promise((r) => setTimeout(r, 800));
            }
        }
    }
});
document.addEventListener('astro:page-load', () => {
    const right = document.querySelector(".panel.right");
    const left = document.querySelector(".panel.left");
    if (toggleOpen) {
        right.classList.toggle('open')
        if (!toHome && window.matchMedia("(max-width: 64rem)").matches) {
            left.classList.toggle('open')
        }
    }

    // interrupt navigation if same page
    document.querySelectorAll('a').forEach(el => {
        el.onclick = (e) => {
            const href = el.href.replace(/\/+$/, '');
            const current = window.location.href.replace(/\/+$/, '');
            if (href === current || document.documentElement.classList.contains('transition')) {
                e.preventDefault();
            }
        }
    })
});