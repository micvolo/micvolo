function main() {
    if (!!document.querySelector('.panel.right.is-home')) {
        document.querySelector('.panel.left')?.classList.add('is-home')
    } else {
        document.querySelector('.panel.left')?.classList.remove('is-home')
    }

    const left = document.querySelector(".panel.left");
    const contacts = document.querySelector(".contact-wrapper");
    if (left) {
        left.onclick = (e) => {
            const t = (e.target)?.classList;
            if (location.pathname !== '/') {
                if (t?.contains("panel") && t?.contains("left")) {
                    swup.navigate("/", { animation: "home", animate: true });
                }
            }
            if (contacts.classList.contains('open')) {
                if (t?.contains("panel") && t?.contains("left")) {
                    contacts.classList.remove('open')
                }
            }
        };
    }
}
main();
const setup = () => {
    document.addEventListener('swup:page:view', () => {
        main();
    })
}
if (window.swup) {
    setup()
} else {
    document.addEventListener('swup:enable', setup)
}
onload = () => {
    document.documentElement.classList.add('load')
}