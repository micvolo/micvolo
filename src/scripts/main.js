function main() {
    if (!!document.querySelector('.panel.right.is-home')) {
        document.querySelector('.panel.left').classList.add('is-home')
    } else {
        document.querySelector('.panel.left').classList.remove('is-home')
    }

    const left = document.querySelector(".panel.left");
    left.onclick = (e) => {
        const t = (e.target)?.classList;
        if (t?.contains("panel") && t?.contains("left")) {
            swup.navigate("/", { animation: "home", animate: true });
        }
    };

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